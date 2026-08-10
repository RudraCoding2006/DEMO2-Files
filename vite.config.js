import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

const SYNC_FILE_PATH = path.resolve(__dirname, '.demo2_sync_store.json');

const apiSyncPlugin = () => ({
  name: 'demo2-api-sync-plugin',
  configureServer(server) {
    server.middlewares.use('/api/sync', (req, res, next) => {
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (fs.existsSync(SYNC_FILE_PATH)) {
          try {
            const data = fs.readFileSync(SYNC_FILE_PATH, 'utf-8');
            return res.end(data);
          } catch (e) {
            return res.end(JSON.stringify({ error: 'Read failed' }));
          }
        } else {
          return res.end(JSON.stringify({ lastModified: 0 }));
        }
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            if (body) {
              fs.writeFileSync(SYNC_FILE_PATH, body, 'utf-8');
            }
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.statusCode = 200;
        return res.end();
      }

      next();
    });
  }
});

// Gemini AI Chat Proxy — keeps API key server-side
const apiChatPlugin = () => {
  // Read API key from .env file at startup
  const envPath = path.resolve(__dirname, '.env');
  let GEMINI_API_KEY = '';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
    if (match) GEMINI_API_KEY = match[1].trim();
  }

  return {
    name: 'demo2-api-chat-plugin',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200;
          return res.end();
        }

        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { message, erpContext, chatHistory } = JSON.parse(body);

            if (!GEMINI_API_KEY) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: 'Gemini API key not configured in .env' }));
            }

            const systemPrompt = `You are "Saheb AI", an intelligent ERP assistant for Saheb Paper Mill — a tissue paper manufacturing company in Gujarat, India.

CAPABILITIES:
1. ANSWER DATA QUERIES: Production tonnage, raw material stock levels, dispatch totals, pending orders, machine logs, rewinder output, boiler/ETP/electricity data.
2. PROVIDE INSIGHTS: Trends, comparisons, efficiency analysis, low stock warnings.
3. GUIDE ACTIONS: Explain how to add entries, create dispatches, manage users, etc.

PRODUCTS MANUFACTURED:
- Napkin Tissue (A Grade) — GSM: 14/16/18, Sizes: 30x30, 33x33, 40x40 cm, Ply: 1/2
- Toilet Tissue (A Grade) — GSM: 15/17/19, Sizes: 10x10, 10x12 cm, Ply: 2/3
- KT (Kitchen Towel) — GSM: 18/20/22, Sizes: 20x20, 23x23 cm, Ply: 1/2
- HRT (Hand Roll Towel) — GSM: 20/22/24, Sizes: 20x22, 25x25 cm, Ply: 1/2
- B-Grade variants of Napkin, Toilet, KT

RAW MATERIALS:
- Waste Paper: Indian Tissue Waste, Imported Tissue Waste, SMK, Cupstock, Pulp Sheet, Silicon, Broke
- Chemicals: DSR, WSR, Hydrogen Peroxide, Hypo, Bleaching Powder, Caustic, OBA, M Violet, Washing Powder, Flock 100 Liq, Flock Master, PEO, Deformer, HCL, MG Release, MG Coating, RO Chemical
- Firewood: Wood, Biocoal

ERP MODULES: Dashboard, Raw Material, Pulp Mill, Paper Machine, Rewinder, Boiler, ETP, Electricity, Pending Orders, Finish Stock, Dispatch, Store/Spares

PARTIES (Customers): Surat Paper Mart, Apex Packaging Pvt Ltd, Metro Tissue Suppliers, Royal Hygiene Crafts, Shree Ram Convertors, Vardhman Hygiene Products

RESPONSE RULES:
- Respond in the SAME LANGUAGE as the user's message (Hindi, English, or Hinglish).
- Be concise but informative. Use numbers and data from the provided ERP context.
- Format numbers with commas (e.g., 5,000 kg or 25.5 Tons).
- If you don't have enough data to answer, say so honestly.
- Use emojis sparingly for readability (📊 📦 🏭 ⚡ 🚚).
- Keep responses SHORT — max 3-4 lines for simple queries, max 8-10 lines for detailed analysis.
- If user asks to ADD or CREATE something, explain the steps to do it in the ERP (you cannot directly modify data).

CURRENT ERP DATA SNAPSHOT:
${erpContext}`;

            const contents = [];

            // Add chat history for context
            if (chatHistory && chatHistory.length > 0) {
              chatHistory.forEach(msg => {
                contents.push({
                  role: msg.role === 'user' ? 'user' : 'model',
                  parts: [{ text: msg.text }]
                });
              });
            }

            // Add current user message
            contents.push({
              role: 'user',
              parts: [{ text: message }]
            });

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

            const geminiResponse = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 512,
                  topP: 0.95,
                  topK: 40
                }
              })
            });

            const geminiData = await geminiResponse.json();

            let reply = 'Sorry, I could not process your request.';
            if (geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
              reply = geminiData.candidates[0].content.parts[0].text;
            } else if (geminiData?.error) {
              reply = `API Error: ${geminiData.error.message || 'Unknown error'}`;
            }

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ reply }));
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), apiSyncPlugin(), apiChatPlugin()],
  server: {
    allowedHosts: true,
    watch: {
      ignored: ['**/dist-electron/**', '**/android/**', '**/.git/**']
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
  base: '/DEMO2-Files/',
});

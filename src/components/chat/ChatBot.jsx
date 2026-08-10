import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Trash2, Maximize2, Minimize2, BarChart3, Boxes, Truck, ClipboardList, HelpCircle, CheckCircle2 } from 'lucide-react';
import { RAW_MATERIALS, PRODUCTS } from '../../data/masterData';
import { store } from '../../data/storage';

const buildERPContext = (state) => {
  const today = state.selectedDate || new Date().toISOString().split('T')[0];

  // Production summary
  const machineLogs = state.machineLogs || {};
  const todayLog = machineLogs[today] || { rolls: [] };
  const todayRolls = todayLog.rolls || [];
  const todayProductionKg = todayRolls.reduce((s, r) => s + Number(r.weightKg || 0), 0);

  // All-time production
  const allDates = Object.keys(machineLogs);
  let totalProductionKg = 0;
  let totalRollsCount = 0;
  allDates.forEach(d => {
    const rolls = machineLogs[d]?.rolls || [];
    totalRollsCount += rolls.length;
    totalProductionKg += rolls.reduce((s, r) => s + Number(r.weightKg || 0), 0);
  });

  // Raw material stocks
  const stocks = state.rawMaterialStocks || {};
  const stockSummary = RAW_MATERIALS.map(m => `${m.name}: ${Number(stocks[m.id] || 0).toLocaleString()} ${m.unit}`).join('\n');

  // Dispatch summary
  const dispatches = state.dispatches || [];
  const todayDispatches = dispatches.filter(d => d.date === today);
  const totalDispatchKg = dispatches.reduce((s, d) => s + Number(d.quantityKg || 0), 0);
  const todayDispatchKg = todayDispatches.reduce((s, d) => s + Number(d.quantityKg || 0), 0);

  // Pending orders
  const pendingOrders = (state.pendingOrders || []).filter(o => o.status === 'pending');

  // Rewinder reels
  const reels = state.rewinderReels || [];
  const todayReels = reels.filter(r => r.date === today);

  return `Selected Date: ${today}
--- TODAY'S PRODUCTION (${today}) ---
Jumbo Rolls Produced Today: ${todayRolls.length}
Today's Production: ${(todayProductionKg / 1000).toFixed(2)} Tons (${todayProductionKg.toLocaleString()} kg)
Today's Dispatched: ${(todayDispatchKg / 1000).toFixed(2)} Tons (${todayDispatchKg.toLocaleString()} kg) — ${todayDispatches.length} receipts
Today's Rewinder Reels: ${todayReels.length}

--- ALL-TIME SUMMARY ---
Total Production (All Time): ${(totalProductionKg / 1000).toFixed(2)} Tons — ${totalRollsCount} rolls across ${allDates.length} days
Total Dispatched (All Time): ${(totalDispatchKg / 1000).toFixed(2)} Tons — ${dispatches.length} receipts
Pending Orders: ${pendingOrders.length} orders pending
Total Rewinder Reels (All Time): ${reels.length}

--- RAW MATERIAL STOCK LEVELS ---
${stockSummary}

--- RECENT DISPATCHES (Last 5) ---
${dispatches.slice(0, 5).map(d => `${d.date} | ${d.party} | ${d.productName} | ${Number(d.quantityKg || 0).toLocaleString()} kg`).join('\n') || 'No dispatches yet'}

--- PENDING ORDERS ---
${pendingOrders.slice(0, 5).map(o => `${o.partyName || o.party} | ${o.productName} | ${Number(o.quantityKg || 0).toLocaleString()} kg | Status: ${o.status}`).join('\n') || 'No pending orders'}`;
};

const CHAT_HISTORY_KEY = 'SAHEB_PAPER_CHAT_HISTORY_LIVE_V1';

const loadSavedMessages = () => {
  try {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp || Date.now())
        }));
      }
    }
  } catch (e) {}
  return [
    {
      id: 'welcome',
      role: 'assistant',
      text: '🏭 Namaste! Main **Saheb AI** hoon — aapka dynamic ERP assistant.\n\nAap pooch sakte ho ya direct stock add kar sakte ho! 😊',
      timestamp: new Date()
    }
  ];
};

export const ChatBot = ({ state }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [messages, setMessages] = useState(loadSavedMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Permanently save chat history to localStorage on update
  useEffect(() => {
    try {
      if (messages && messages.length > 0) {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      }
    } catch (e) {}
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Interactive Action Handler: Stock Inward Addition via Chatbot
  const processStockAction = (queryText) => {
    const q = queryText.toLowerCase().trim();

    // Step A: If waiting for quantity after material was previously selected
    if (pendingAction && pendingAction.type === 'ADD_INWARD_QTY') {
      const numMatch = q.match(/(\d+(?:\.\d+)?)\s*(ton|tons|t|kg|kilo|kilograms|ltr|liters)?/i);
      if (numMatch) {
        let qty = parseFloat(numMatch[1]);
        const unitStr = (numMatch[2] || '').toLowerCase();
        if (unitStr.startsWith('ton') || unitStr === 't') {
          qty = qty * 1000;
        }

        if (qty > 0) {
          const item = pendingAction.item;
          store.addInwardEntry({
            itemId: item.id,
            itemName: item.name,
            category: item.category,
            unit: item.unit || 'kg',
            quantity: qty,
            supplierName: 'Chatbot Direct Entry',
            remarks: 'Added via Saheb AI Chatbot'
          });

          setPendingAction(null);
          return `✅ **Stock Added Successfully!**\n• Material: **${item.name}**\n• Added Quantity: **${qty.toLocaleString()} ${item.unit || 'kg'}** (${(qty / 1000).toFixed(2)} Tons)\n• Status: **Saved to DEMO2 ERP & Real-Time Synced** 📱💻`;
        }
      }
      return `⚠️ Please enter a valid number for quantity in kg or Tons (e.g. **5000 kg** or **5 Ton**).`;
    }

    // Step B: If waiting for material selection
    if (pendingAction && pendingAction.type === 'ADD_INWARD_MATERIAL') {
      const matchedItem = RAW_MATERIALS.find(m => 
        q.includes(m.name.toLowerCase()) || 
        q.includes(m.id.toLowerCase()) ||
        m.name.toLowerCase().split(' ').some(word => word.length > 2 && q.includes(word))
      );

      if (matchedItem) {
        setPendingAction({ type: 'ADD_INWARD_QTY', item: matchedItem });
        return `📦 Great! How much quantity (in kg or Tons) of **${matchedItem.name}** would you like to add?\n*(e.g., type "5000 kg" or "5 Ton")*`;
      }
    }

    // Helper: Find best matching material from RAW_MATERIALS
    const findMaterial = (str) => {
      const s = str.toLowerCase();
      // Exact or partial name match
      let match = RAW_MATERIALS.find(m => s.includes(m.name.toLowerCase()));
      if (match) return match;

      // Common aliases & short forms
      if (s.includes('indian')) return RAW_MATERIALS.find(m => m.id === 'rm-wp-1');
      if (s.includes('imported')) return RAW_MATERIALS.find(m => m.id === 'rm-wp-2');
      if (s.includes('smk')) return RAW_MATERIALS.find(m => m.id === 'rm-wp-3');
      if (s.includes('cupstock') || s.includes('cup')) return RAW_MATERIALS.find(m => m.id === 'rm-wp-4');
      if (s.includes('pulp')) return RAW_MATERIALS.find(m => m.id === 'rm-wp-5');
      if (s.includes('silicon')) return RAW_MATERIALS.find(m => m.id === 'rm-wp-6');
      if (s.includes('broke')) return RAW_MATERIALS.find(m => m.id === 'rm-wp-7');
      if (s.includes('dsr')) return RAW_MATERIALS.find(m => m.id === 'rm-ch-1');
      if (s.includes('wsr')) return RAW_MATERIALS.find(m => m.id === 'rm-ch-2');
      if (s.includes('wood') || s.includes('firewood')) return RAW_MATERIALS.find(m => m.id === 'rm-fw-1');
      if (s.includes('biocoal')) return RAW_MATERIALS.find(m => m.id === 'rm-fw-2');
      if (s.includes('caustic')) return RAW_MATERIALS.find(m => m.id === 'rm-ch-6');

      return RAW_MATERIALS.find(m => m.name.toLowerCase().split(' ').some(w => w.length > 2 && s.includes(w)));
    };

    // Step C: Check if current query is an intent to add stock/material
    const isAddIntent = q.match(/add|inward|plus|\+|jo[dḍ]o|stock add|material add|daalo|entry|register/);
    if (isAddIntent) {
      const matchedItem = findMaterial(q);
      const numMatch = q.match(/(\d+(?:\.\d+)?)\s*(ton|tons|t|kg|kilo|kilograms|ltr|liters)?/i);

      if (matchedItem && numMatch) {
        let qty = parseFloat(numMatch[1]);
        const unitStr = (numMatch[2] || '').toLowerCase();
        if (unitStr.startsWith('ton') || unitStr === 't') {
          qty = qty * 1000;
        }

        if (qty > 0) {
          store.addInwardEntry({
            itemId: matchedItem.id,
            itemName: matchedItem.name,
            category: matchedItem.category,
            unit: matchedItem.unit || 'kg',
            quantity: qty,
            supplierName: 'Chatbot Direct Entry',
            remarks: 'Added via Saheb AI Chatbot'
          });

          return `✅ **Stock Added Successfully!**\n• Material: **${matchedItem.name}**\n• Added Quantity: **${qty.toLocaleString()} ${matchedItem.unit || 'kg'}** (${(qty / 1000).toFixed(2)} Tons)\n• Status: **Saved to DEMO2 ERP & Real-Time Synced** 📱💻`;
        }
      }

      if (matchedItem && !numMatch) {
        setPendingAction({ type: 'ADD_INWARD_QTY', item: matchedItem });
        return `📦 How much quantity (in kg or Tons) of **${matchedItem.name}** would you like to add?\n*(e.g., type "5000 kg" or "5 Ton")*`;
      }

      if (!matchedItem) {
        setPendingAction({ type: 'ADD_INWARD_MATERIAL' });
        return `📦 Which raw material would you like to add?\n\n**Popular Options:**\n• **Indian Tissue Waste**\n• **SMK**\n• **Cupstock**\n• **DSR / WSR**\n• **Wood**`;
      }
    }

    return null; // Not an action query
  };

  // Smart offline fallback engine — answers ERP queries without API
  const getOfflineReply = (query) => {
    const q = query.toLowerCase();
    const today = state.selectedDate || new Date().toISOString().split('T')[0];
    const machineLogs = state.machineLogs || {};
    const todayLog = machineLogs[today] || { rolls: [] };
    const todayRolls = todayLog.rolls || [];
    const todayProductionKg = todayRolls.reduce((s, r) => s + Number(r.weightKg || 0), 0);
    const allDates = Object.keys(machineLogs);
    let totalProductionKg = 0;
    let totalRollsCount = 0;
    allDates.forEach(d => {
      const rolls = machineLogs[d]?.rolls || [];
      totalRollsCount += rolls.length;
      totalProductionKg += rolls.reduce((s, r) => s + Number(r.weightKg || 0), 0);
    });
    const stocks = state.rawMaterialStocks || {};
    const dispatches = state.dispatches || [];
    const todayDispatches = dispatches.filter(d => d.date === today);
    const totalDispatchKg = dispatches.reduce((s, d) => s + Number(d.quantityKg || 0), 0);
    const todayDispatchKg = todayDispatches.reduce((s, d) => s + Number(d.quantityKg || 0), 0);
    const pendingOrders = (state.pendingOrders || []).filter(o => o.status === 'pending');
    const reels = state.rewinderReels || [];

    // Production queries
    if (q.match(/production|utpadan|kitna.*ban|hua.*production|output|tonnage|ton/)) {
      if (q.match(/today|aaj|abhi/)) {
        return `📊 **Aaj ki Production (${today}):**\n• Jumbo Rolls: **${todayRolls.length}**\n• Total Weight: **${(todayProductionKg / 1000).toFixed(2)} Tons** (${todayProductionKg.toLocaleString()} kg)`;
      }
      return `📊 **Production Summary:**\n• **Aaj (${today}):** ${(todayProductionKg / 1000).toFixed(2)} Tons — ${todayRolls.length} rolls\n• **All Time:** ${(totalProductionKg / 1000).toFixed(2)} Tons — ${totalRollsCount} rolls across ${allDates.length} days`;
    }

    // Stock / Material queries
    if (q.match(/stock|material|maal|inventory|raw material|waste paper|chemical|firewood/)) {
      const wastePaper = RAW_MATERIALS.filter(m => m.category === 'waste_paper');
      const chemicals = RAW_MATERIALS.filter(m => m.category === 'chemical');
      const firewood = RAW_MATERIALS.filter(m => m.category === 'firewood');
      const wpTotal = wastePaper.reduce((s, m) => s + Number(stocks[m.id] || 0), 0);
      const chTotal = chemicals.reduce((s, m) => s + Number(stocks[m.id] || 0), 0);
      const fwTotal = firewood.reduce((s, m) => s + Number(stocks[m.id] || 0), 0);

      if (q.match(/waste paper|kagaz|wp/)) {
        const details = wastePaper.map(m => `• ${m.name}: **${Number(stocks[m.id] || 0).toLocaleString()} kg**`).join('\n');
        return `📦 **Waste Paper Stock:**\n${details}\n\n**Total:** ${wpTotal.toLocaleString()} kg (${(wpTotal / 1000).toFixed(2)} Tons)`;
      }
      if (q.match(/chemical|dsr|wsr|caustic/)) {
        const details = chemicals.map(m => `• ${m.name}: **${Number(stocks[m.id] || 0).toLocaleString()} ${m.unit}**`).join('\n');
        return `🧪 **Chemical Stock:**\n${details}\n\n**Total:** ${chTotal.toLocaleString()} kg`;
      }
      return `📦 **Raw Material Stock Summary:**\n• Waste Paper: **${(wpTotal / 1000).toFixed(2)} Tons** (${wpTotal.toLocaleString()} kg)\n• Chemicals: **${chTotal.toLocaleString()} kg**\n• Firewood: **${fwTotal.toLocaleString()} kg**\n\n**Grand Total:** ${((wpTotal + chTotal + fwTotal) / 1000).toFixed(2)} Tons`;
    }

    // Dispatch queries
    if (q.match(/dispatch|bhej|ship|delivery|gate pass|truck/)) {
      if (q.match(/today|aaj/)) {
        if (todayDispatches.length === 0) return `🚚 Aaj koi dispatch nahi hua (${today}).`;
        const details = todayDispatches.map(d => `• ${d.party} — ${d.productName} — **${Number(d.quantityKg || 0).toLocaleString()} kg**`).join('\n');
        return `🚚 **Aaj ke Dispatches (${today}):**\n${details}\n\n**Total:** ${(todayDispatchKg / 1000).toFixed(2)} Tons`;
      }
      const last5 = dispatches.slice(0, 5).map(d => `• ${d.date} | ${d.party} | ${d.productName} | **${Number(d.quantityKg || 0).toLocaleString()} kg**`).join('\n');
      return `🚚 **Dispatch Summary:**\n• **Aaj:** ${(todayDispatchKg / 1000).toFixed(2)} Tons — ${todayDispatches.length} receipts\n• **All Time:** ${(totalDispatchKg / 1000).toFixed(2)} Tons — ${dispatches.length} receipts\n\n**Last 5 Dispatches:**\n${last5}`;
    }

    // Pending orders
    if (q.match(/order|pending|bakaya/)) {
      if (pendingOrders.length === 0) return `📋 Koi pending order nahi hai!`;
      const details = pendingOrders.slice(0, 5).map(o => `• ${o.partyName || o.party} — ${o.productName} — **${Number(o.quantityKg || 0).toLocaleString()} kg**`).join('\n');
      return `📋 **Pending Orders:** ${pendingOrders.length}\n${details}`;
    }

    // Rewinder queries
    if (q.match(/rewinder|reel|cut|slit/)) {
      const todayReels = reels.filter(r => r.date === today);
      return `🌀 **Rewinder Summary:**\n• **Aaj:** ${todayReels.length} reels completed\n• **All Time:** ${reels.length} reels total`;
    }

    // Specific product queries (e.g. Napkin Tissue, Toilet Tissue, etc.)
    for (const prod of PRODUCTS) {
      if (q.includes(prod.name.toLowerCase()) || q.includes(prod.id.toLowerCase())) {
        const prodReels = reels.filter(r => r.productName === prod.name);
        const prodDisp = dispatches.filter(d => d.productName === prod.name);
        const prodKg = prodReels.reduce((s, r) => s + Number(r.weightKg || 0), 0);
        const dispKg = prodDisp.reduce((s, d) => s + Number(d.quantityKg || 0), 0);
        const netStockKg = Math.max(0, prodKg - dispKg);
        return `📋 **${prod.name} Stock Breakdown:**\n• Rewinder Produced: **${(prodKg / 1000).toFixed(2)} Tons** (${prodReels.length} reels)\n• Total Dispatched: **${(dispKg / 1000).toFixed(2)} Tons** (${prodDisp.length} receipts)\n• Net Available Inventory: **${(netStockKg / 1000).toFixed(2)} Tons** (${netStockKg.toLocaleString()} kg)`;
      }
    }

    // Greetings
    if (q.match(/^(hi|hello|hey|namaste|namaskar|kaise ho|kya hal)/)) {
      return `🏭 Namaste! Main **Saheb AI** hoon.\n\nAap pooch sakte ho:\n• "production today"\n• "stock check"\n• "dispatch list"\n• "napkin tissue"\n• "add 5000 kg Indian Tissue Waste"`;
    }

    // Default fallback
    return `🤖 Samajh nahi aaya! Try karo:\n• **"production today"** — aaj ka production\n• **"stock check"** — raw material stock\n• **"napkin tissue"** — product stock\n• **"add 5000 kg SMK"** — stock entry`;
  };

  const handleSendQuery = async (queryText) => {
    const text = (queryText || inputText).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputText('');

    // Check if this is an interactive stock action
    const actionResult = processStockAction(text);
    if (actionResult) {
      setMessages(prev => [...prev, {
        id: `ai-action-${Date.now()}`,
        role: 'assistant',
        text: actionResult,
        timestamp: new Date()
      }]);
      return;
    }

    setIsLoading(true);

    try {
      const erpContext = buildERPContext(state);
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.text }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          erpContext,
          chatHistory
        })
      });

      const data = await response.json();
      const replyText = data.reply || data.error || '';
      const isApiError = replyText.includes('API Error') || replyText.includes('exceeded') || replyText.includes('quota') || data.error;

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: isApiError ? getOfflineReply(text) : replyText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: getOfflineReply(text),
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  const clearChat = () => {
    const defaultMsg = [{
      id: 'welcome',
      role: 'assistant',
      text: '🏭 Chat cleared! Aap naya sawaal pooch sakte ho. Main ready hoon! 😊',
      timestamp: new Date()
    }];
    setMessages(defaultMsg);
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (e) {}
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ')
      .replace(/---/g, '<hr class="my-2 border-slate-200/50"/>');
  };

  const quickPills = [
    { label: '📊 Production Today', query: 'aaj kitna production hua?' },
    { label: '📦 Stock Check', query: 'raw material stock check karo' },
    { label: '🚚 Dispatches', query: 'aaj kitna dispatch hua?' },
    { label: '📋 Pending Orders', query: 'pending orders kitne hai?' }
  ];

  const chatUI = (
    <>
      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[9990] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-[#12162B] hover:bg-[#1a1f35] scale-105'
            : 'bg-[#cf8730] hover:bg-[#b87528] hover:scale-110 active:scale-95'
        }`}
        title={isOpen ? 'Close Chat' : 'Saheb AI Assistant'}
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-[#cf8730] opacity-20" style={{ animationDuration: '3s' }}></span>
        )}
      </button>

      {/* Dynamic Responsive Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-3 sm:right-6 z-[9989] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-300 animate-chatSlideUp ${
            isExpanded
              ? 'w-[calc(100vw-1.5rem)] sm:w-[600px] h-[75vh] max-h-[650px]'
              : 'w-[calc(100vw-1.5rem)] sm:w-[390px] h-[490px] max-h-[70vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#12162B] px-3.5 py-2.5 flex items-center justify-between shrink-0 select-none border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#cf8730] flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  Saheb AI
                  <span className="text-[9px] font-bold bg-[#cf8730]/30 text-amber-200 px-1.5 py-0.2 rounded">LIVE</span>
                </h3>
                <p className="text-[9px] text-slate-400 font-medium">ERP Assistant &bull; Real-Time Data</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              {/* Expand / Minimize Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              {/* Clear Chat */}
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto chat-scrollbar px-3.5 py-3 space-y-3 bg-[#FAFBFD] min-h-0 overflow-x-hidden">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                  msg.role === 'user' ? 'bg-[#cf8730]' : 'bg-[#12162B]'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5 text-white" />
                    : <Bot className="w-3.5 h-3.5 text-[#cf8730]" />
                  }
                </div>

                <div className={`max-w-[85%] sm:max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words overflow-hidden ${
                  msg.role === 'user'
                    ? 'bg-[#cf8730] text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-[#161B26] border border-slate-200/70 rounded-bl-xs shadow-xs'
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} className="break-words" />
                  <div className={`text-[9px] mt-1.5 ${msg.role === 'user' ? 'text-amber-100/70' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#12162B] flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-3.5 h-3.5 text-[#cf8730]" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-xs border border-slate-200/70 shadow-xs">
                  <div className="flex gap-2 items-center">
                    <Loader2 className="w-4 h-4 text-[#cf8730] animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Saheb AI processing ERP data...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Auto-Expanding Input Area */}
          <div className="shrink-0 px-3 py-2.5 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 bg-[#F8F9FC] rounded-xl px-3 py-1.5 border border-slate-200/80 focus-within:border-[#cf8730] focus-within:ring-2 focus-within:ring-[#cf8730]/10 transition-all">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Saheb AI anything..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-[#161B26] placeholder:text-slate-400 outline-none resize-none max-h-24 py-1"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendQuery()}
                disabled={!inputText.trim() || isLoading}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  inputText.trim() && !isLoading
                    ? 'bg-[#cf8730] text-white hover:bg-[#b87528] shadow-md active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-slate-400 text-center mt-1 font-medium">
              Saheb AI Dynamic Engine &bull; Auto-Sync Active
            </p>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(chatUI, document.body);
};

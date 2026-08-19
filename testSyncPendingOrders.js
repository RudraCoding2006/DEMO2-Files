import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://aiumviqikumkreduglbz.supabase.co';
const supabaseKey = 'sb_publishable_NRnkd7QGRCCSN1-ApWIW-w_-8IDM-SM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSync() {
  const localStorageFile = 'E:/ZZSAHED DEMO2/DEMO2 Files/.demo2_sync_store.json';
  if (!fs.existsSync(localStorageFile)) {
    console.log('No local storage file found');
    return;
  }
  
  const raw = fs.readFileSync(localStorageFile, 'utf8');
  const state = JSON.parse(raw);
  console.log('Pending orders count in state:', state.pendingOrders?.length);
  
  const ordersPayload = (state.pendingOrders || []).map(o => ({
    date: o.orderDate || o.date || state.selectedDate || '2026-08-18',
    party: o.party || 'Default Party',
    product_name: o.productName || 'Napkin Tissue',
    gsm: Number(o.gsm || 16),
    size: o.size || '30cm',
    ply: Number(o.ply || 1),
    quantity_kg: Number(o.quantityKg || 0),
    dispatched_kg: Number(o.dispatchedKg || 0),
    status: o.status === 'partial' || o.status === 'partially_dispatched' ? 'partial' : (o.status === 'fulfilled' ? 'fulfilled' : 'pending')
  }));

  console.log('Payload sample:', ordersPayload.slice(0, 3));

  const { data, error } = await supabase.from('pending_orders').insert(ordersPayload);
  if (error) {
    console.error('Supabase Insert Error:', error);
  } else {
    console.log('Successfully inserted pending orders to Supabase!', data);
  }
}

testSync();

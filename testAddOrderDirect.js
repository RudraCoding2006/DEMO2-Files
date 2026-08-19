import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aiumviqikumkreduglbz.supabase.co';
const supabaseKey = 'sb_publishable_NRnkd7QGRCCSN1-ApWIW-w_-8IDM-SM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewOrderInsert() {
  const newOrder = {
    id: 'PEND_ORDER20260819-002',
    date: '2026-08-19',
    party: 'Vardhman Hygiene Products',
    product_name: 'HRT',
    gsm: 18,
    size: '30cm',
    ply: 2,
    quantity_kg: 5000,
    dispatched_kg: 0,
    status: 'pending'
  };

  console.log('Inserting new order directly to Supabase pending_orders table...');
  const { data, error } = await supabase.from('pending_orders').upsert([newOrder], { onConflict: 'id' }).select();

  if (error) {
    console.error('❌ Supabase Upsert Error:', error);
  } else {
    console.log('✅ Supabase Upsert Returned Success! Inserted Data:\n', data);
  }
}

testNewOrderInsert();

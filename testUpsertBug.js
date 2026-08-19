import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aiumviqikumkreduglbz.supabase.co';
const supabaseKey = 'sb_publishable_NRnkd7QGRCCSN1-ApWIW-w_-8IDM-SM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpsert() {
  const item = {
    date: '2026-08-19',
    party: 'Test Party Live',
    product_name: 'HRT',
    gsm: 18,
    size: '30cm',
    ply: 2,
    quantity_kg: 1000,
    dispatched_kg: 0,
    status: 'pending'
  };

  console.log('Testing .upsert() without id or onConflict...');
  const { data: upsertData, error: upsertError } = await supabase.from('pending_orders').upsert([item]);
  if (upsertError) {
    console.error('Upsert Error:', upsertError);
  } else {
    console.log('Upsert Success:', upsertData);
  }

  console.log('Testing .insert() without id...');
  const { data: insertData, error: insertError } = await supabase.from('pending_orders').insert([item]);
  if (insertError) {
    console.error('Insert Error:', insertError);
  } else {
    console.log('Insert Success:', insertData);
  }
}

testUpsert();

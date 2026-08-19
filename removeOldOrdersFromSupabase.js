import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aiumviqikumkreduglbz.supabase.co';
const supabaseKey = 'sb_publishable_NRnkd7QGRCCSN1-ApWIW-w_-8IDM-SM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeOldIdOrders() {
  console.log('Fetching all rows from pending_orders table in Supabase...');
  const { data: allRows, error: fetchErr } = await supabase.from('pending_orders').select('id');

  if (fetchErr) {
    console.error('Fetch Error:', fetchErr);
    return;
  }

  console.log(`Total rows currently in Supabase pending_orders: ${allRows.length}`);

  const oldIdRows = allRows.filter(r => !r.id || !r.id.startsWith('PEND_ORDER'));
  console.log(`Old ID rows to delete: ${oldIdRows.length}`);

  if (oldIdRows.length > 0) {
    const oldIds = oldIdRows.map(r => r.id);
    const { error: deleteErr } = await supabase.from('pending_orders').delete().in('id', oldIds);
    if (deleteErr) {
      console.error('Delete Error:', deleteErr);
    } else {
      console.log(`✅ Successfully deleted ${oldIds.length} old ID rows!`);
    }
  } else {
    console.log('No old ID rows found. Table is already clean!');
  }

  const { data: cleanRows } = await supabase.from('pending_orders').select('id, party, product_name');
  console.log(`Current remaining rows (all start with PEND_ORDER): ${cleanRows.length}`);
}

removeOldIdOrders();

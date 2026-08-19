import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aiumviqikumkreduglbz.supabase.co';
const supabaseKey = 'sb_publishable_NRnkd7QGRCCSN1-ApWIW-w_-8IDM-SM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeOldOrders() {
  console.log('Purging all legacy ord- and ord-seed- records from Supabase...');

  // Query all rows where ID does NOT start with PEND_ORDER
  const { data: allRows, error } = await supabase.from('pending_orders').select('id');
  if (error) {
    console.error('Error fetching rows:', error);
    return;
  }

  const legacyRows = allRows.filter(r => !r.id || !r.id.startsWith('PEND_ORDER'));
  console.log(`Found ${legacyRows.length} legacy rows to purge out of ${allRows.length} total rows.`);

  if (legacyRows.length > 0) {
    const idsToDelete = legacyRows.map(r => r.id);
    const { error: delErr } = await supabase.from('pending_orders').delete().in('id', idsToDelete);
    if (delErr) {
      console.error('Purge error:', delErr);
    } else {
      console.log(`✅ Successfully purged all ${idsToDelete.length} legacy rows!`);
    }
  }

  const { data: remaining } = await supabase.from('pending_orders').select('id, party, date');
  console.log(`Current remaining clean rows in Supabase: ${remaining.length}`);
}

purgeOldOrders();

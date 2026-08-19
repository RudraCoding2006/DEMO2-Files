import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aiumviqikumkreduglbz.supabase.co';
const supabaseKey = 'sb_publishable_NRnkd7QGRCCSN1-ApWIW-w_-8IDM-SM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVardhmanOrder() {
  const { data, error } = await supabase
    .from('pending_orders')
    .select('*')
    .ilike('party', '%Vardhman%');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Query result for Vardhman in Supabase:', JSON.stringify(data, null, 2));
  }
}

checkVardhmanOrder();

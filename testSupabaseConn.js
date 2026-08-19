import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aiumviqikumkreduglbz.supabase.co';
const supabaseKey = 'sb_publishable_NRnkd7QGRCCSN1-ApWIW-w_-8IDM-SM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Connecting to Supabase at:', supabaseUrl);
  try {
    const { data, error } = await supabase.from('users').select('*').limit(5);
    if (error) {
      console.log('Supabase Response (Table might not exist yet):', error.message);
    } else {
      console.log('Successfully queried users table from Supabase:', data);
    }
  } catch (err) {
    console.error('Error connecting:', err);
  }
}

testConnection();

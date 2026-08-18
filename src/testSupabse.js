import { supabase } from './lib/supabaseClient'

async function testInsert() {
  const { data, error } = await supabase
    .from('test_items')
    .insert([{ name: 'Hello from my app' }])

  if (error) console.error('Error:', error)
  else console.log('Success:', data)
}

testInsert()
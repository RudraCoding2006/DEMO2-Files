import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aiumviqikumkreduglbz.supabase.co'
const supabaseKey = 'sb_publishable_NRnkd7QGRCCSN1-ApWIW-w_-8IDM-SM'

export const supabase = createClient(supabaseUrl, supabaseKey)
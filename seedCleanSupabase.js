import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aiumviqikumkreduglbz.supabase.co';
const supabaseKey = 'sb_publishable_NRnkd7QGRCCSN1-ApWIW-w_-8IDM-SM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCleanExactWithPendOrderIds() {
  console.log('Seeding PEND_ORDER2026MMDD-001 format IDs to Supabase pending_orders...');

  // Delete all existing rows
  await supabase.from('pending_orders').delete().neq('id', 'non-existent-id');

  const cleanOrders = [
    { id: 'PEND_ORDER20260609-001', date: '2026-06-09', party: 'Shree Ram Convertors', product_name: 'Toilet B Grade', gsm: 15, size: '10cm', ply: 2, quantity_kg: 5500, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260612-001', date: '2026-06-12', party: 'Maharashra Hygiene Pvt Ltd', product_name: 'Toilet Tissue', gsm: 15, size: '10cm', ply: 2, quantity_kg: 3500, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260615-001', date: '2026-06-15', party: 'Metro Tissue Suppliers', product_name: 'Napkin B Grade', gsm: 14, size: '30cm', ply: 1, quantity_kg: 6500, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260618-001', date: '2026-06-18', party: 'Vardhman Hygiene Products', product_name: 'Napkin Tissue', gsm: 14, size: '30cm', ply: 1, quantity_kg: 4500, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260621-001', date: '2026-06-21', party: 'Shree Ram Convertors', product_name: 'HRT', gsm: 20, size: '20cm', ply: 1, quantity_kg: 3500, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260624-001', date: '2026-06-24', party: 'Apex Packaging Pvt Ltd', product_name: 'Toilet Tissue', gsm: 15, size: '10cm', ply: 2, quantity_kg: 5000, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260627-001', date: '2026-06-27', party: 'Surat Paper Mart', product_name: 'KT', gsm: 18, size: '20cm', ply: 1, quantity_kg: 4000, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260630-001', date: '2026-06-30', party: 'Gujarat Tissue Products', product_name: 'Toilet B Grade', gsm: 15, size: '10cm', ply: 2, quantity_kg: 3000, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260703-001', date: '2026-07-03', party: 'Vardhman Hygiene Products', product_name: 'Napkin Tissue', gsm: 14, size: '30cm', ply: 1, quantity_kg: 4500, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260706-001', date: '2026-07-06', party: 'Metro Tissue Suppliers', product_name: 'Napkin B Grade', gsm: 14, size: '30cm', ply: 1, quantity_kg: 6500, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260709-001', date: '2026-07-09', party: 'Maharashra Hygiene Pvt Ltd', product_name: 'Napkin B Grade', gsm: 14, size: '30cm', ply: 1, quantity_kg: 5500, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260712-001', date: '2026-07-12', party: 'Apex Packaging Pvt Ltd', product_name: 'Toilet B Grade', gsm: 15, size: '10cm', ply: 2, quantity_kg: 4000, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260715-001', date: '2026-07-15', party: 'Gujarat Tissue Products', product_name: 'Toilet B Grade', gsm: 15, size: '10cm', ply: 2, quantity_kg: 3500, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260718-001', date: '2026-07-18', party: 'Shree Ram Convertors', product_name: 'HRT', gsm: 20, size: '20cm', ply: 1, quantity_kg: 4500, dispatched_kg: 0, status: 'partial' },
    { id: 'PEND_ORDER20260808-001', date: '2026-08-08', party: 'Royal Hygiene Crafts', product_name: 'Toilet Tissue', gsm: 18, size: '30cm', ply: 1, quantity_kg: 500, dispatched_kg: 0, status: 'pending' },
    { id: 'PEND_ORDER20260818-001', date: '2026-08-18', party: 'Vardhman Hygiene Products', product_name: 'HRT', gsm: 18, size: '30cm', ply: 2, quantity_kg: 2000, dispatched_kg: 0, status: 'pending' },
    { id: 'PEND_ORDER20260819-001', date: '2026-08-19', party: 'Surat Paper Mart', product_name: 'Napkin Tissue', gsm: 16, size: '30cm', ply: 2, quantity_kg: 3000, dispatched_kg: 0, status: 'pending' }
  ];

  const { error } = await supabase.from('pending_orders').upsert(cleanOrders, { onConflict: 'id' });
  if (error) {
    console.error('Error inserting PEND_ORDER2026MMDD-001 orders:', error);
  } else {
    const { data: check } = await supabase.from('pending_orders').select('*');
    console.log(`✅ Table updated with PEND_ORDER2026MMDD-001 IDs! Current row count: ${check?.length}`);
  }
}

seedCleanExactWithPendOrderIds();

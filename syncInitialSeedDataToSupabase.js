import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_USERS,
  INITIAL_PENDING_ORDERS,
  INITIAL_REWINDER_REELS,
  INITIAL_DISPATCHES,
  INITIAL_STORE_ITEMS,
  INITIAL_PULP_MILL_FORMULAS,
  INITIAL_BOILER_LOGS,
  INITIAL_ETP_LOGS,
  INITIAL_ELECTRICITY_LOGS,
  INITIAL_AUDIT_LOGS
} from './src/data/initialSeedData.js';

const supabaseUrl = 'https://aiumviqikumkreduglbz.supabase.co';
const supabaseKey = 'sb_publishable_NRnkd7QGRCCSN1-ApWIW-w_-8IDM-SM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncAllCleanData() {
  console.log('Starting Clean Master Sync to Supabase...');

  // 1. Users
  const usersPayload = INITIAL_USERS.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    password: u.password,
    role: u.roleId || u.role,
    employee_id: u.workerId || u.employeeId || 'EMP-001',
    allowed_modules: u.allowedModules || ['dashboard'],
    is_read_only: Boolean(u.isReadOnly)
  }));
  const { error: errUsers } = await supabase.from('users').upsert(usersPayload, { onConflict: 'id' });
  if (errUsers) console.error('Users Sync Error:', errUsers);
  else console.log(`✓ Users synced (${usersPayload.length} rows)`);

  // 2. Pending Orders
  const ordersPayload = INITIAL_PENDING_ORDERS.map((o, idx) => ({
    id: o.id || `ord-seed-${idx}`,
    date: o.orderDate || o.date || '2026-08-18',
    party: o.party || 'Default Party',
    product_name: o.productName || 'Napkin Tissue',
    gsm: Number(o.gsm || 16),
    size: o.size || '30cm',
    ply: Number(o.ply || 1),
    quantity_kg: Number(o.quantityKg || 0),
    dispatched_kg: Number(o.dispatchedKg || 0),
    status: o.status === 'partial' || o.status === 'partially_dispatched' ? 'partial' : (o.status === 'fulfilled' ? 'fulfilled' : 'pending')
  }));
  const { error: errOrders } = await supabase.from('pending_orders').upsert(ordersPayload, { onConflict: 'id' });
  if (errOrders) console.error('Pending Orders Sync Error:', errOrders);
  else console.log(`✓ Pending Orders synced (${ordersPayload.length} rows)`);

  // 3. Rewinder Reels
  const reelsPayload = INITIAL_REWINDER_REELS.map((r, idx) => ({
    id: r.id || `reel-seed-${r.reelNo || idx}`,
    date: r.date || '2026-08-18',
    reel_no: r.reelNo,
    running_roll_no: r.runningRollNo || '',
    running_size: r.runningSize || '',
    product_name: r.productName || 'Napkin Tissue',
    gsm: Number(r.gsm || 16),
    size: r.size || '30cm',
    ply: Number(r.ply || 1),
    dia: Number(r.dia || 900),
    joint: Number(r.joint || 0),
    weight_kg: Number(r.weightKg || 0),
    broke_kg: Number(r.brokeKg || 0)
  }));
  const { error: errReels } = await supabase.from('rewinder_reels').upsert(reelsPayload, { onConflict: 'id' });
  if (errReels) console.error('Rewinder Reels Sync Error:', errReels);
  else console.log(`✓ Rewinder Reels synced (${reelsPayload.length} rows)`);

  // 4. Dispatches
  const dispatchesPayload = INITIAL_DISPATCHES.map((d, idx) => ({
    id: d.id || `disp-seed-${idx}`,
    dispatch_no: d.dispatchNo || `DSP-2026-${100 + idx}`,
    date: d.date || '2026-08-18',
    party: d.party || 'Default Party',
    vehicle_no: d.vehicleNo || 'GJ-05-BX-8821',
    product_name: d.productName || 'Napkin Tissue',
    quantity_kg: Number(d.quantityKg || 0),
    reels_count: Number(d.reelsCount || 1),
    order_id: d.orderId || null
  }));
  const { error: errDisp } = await supabase.from('dispatches').upsert(dispatchesPayload, { onConflict: 'id' });
  if (errDisp) console.error('Dispatches Sync Error:', errDisp);
  else console.log(`✓ Dispatches synced (${dispatchesPayload.length} rows)`);

  // 5. Store Items
  const storePayload = INITIAL_STORE_ITEMS.map((s, idx) => ({
    id: s.id || `st-seed-${idx}`,
    category: s.category || 'bearing',
    number: s.number || '',
    size: s.size || '',
    item_group: s.group || s.item_group || '',
    name: s.name || 'Store Item',
    pcs: Number(s.pcs || 0),
    use_for: s.useFor || s.use_for || ''
  }));
  const { error: errStore } = await supabase.from('store_items').upsert(storePayload, { onConflict: 'id' });
  if (errStore) console.error('Store Items Sync Error:', errStore);
  else console.log(`✓ Store Items synced (${storePayload.length} rows)`);

  // 6. Audit Logs
  const auditPayload = INITIAL_AUDIT_LOGS.map((a, idx) => ({
    id: a.id || `audit-seed-${idx}`,
    timestamp: a.timestamp || new Date().toISOString(),
    user_id: a.userId || 'usr-1',
    user_name: a.userName || 'Admin',
    role: a.roleName || 'admin',
    action: a.action || 'system_seed',
    module: 'system',
    details: a.details || ''
  }));
  const { error: errAudit } = await supabase.from('audit_logs').upsert(auditPayload, { onConflict: 'id' });
  if (errAudit) console.error('Audit Logs Sync Error:', errAudit);
  else console.log(`✓ Audit Logs synced (${auditPayload.length} rows)`);

  console.log('🎉 ALL CLEAN DATA POPULATED SUCCESSFULLY TO SUPABASE!');
}

syncAllCleanData();

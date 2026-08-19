import { supabase } from './supabaseClient';

/**
 * Supabase Data Adapter for Saheb Paper Mill ERP 13 Modules
 * Wraps each module in an isolated try-catch block so errors in one module never block others.
 */

export const syncStateToSupabase = async (state) => {
  if (!supabase) return;

  // 1. Sync Users
  try {
    if (state.users && state.users.length > 0) {
      const usersPayload = state.users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        password: u.password,
        role: u.roleId || u.role,
        employee_id: u.workerId || u.employeeId || u.employee_id || 'EMP-001',
        allowed_modules: u.allowedModules || u.allowed_modules || [],
        is_read_only: Boolean(u.isReadOnly || u.is_read_only)
      }));
      const { error } = await supabase.from('users').upsert(usersPayload, { onConflict: 'id' });
      if (error) console.error('Supabase Users Sync Error:', error.message);
    }
  } catch (err) {
    console.error('Users sync error:', err);
  }

  // 2. Sync Raw Materials
  try {
    if (state.rawMaterials) {
      const rmPayload = [];
      Object.entries(state.rawMaterials).forEach(([catKey, items]) => {
        if (Array.isArray(items)) {
          items.forEach((item, index) => {
            rmPayload.push({
              id: item.id || `rm-${catKey}-${index}-${item.date || 'today'}`,
              date: item.date || state.selectedDate || new Date().toISOString().split('T')[0],
              category: item.category || catKey,
              item_name: item.name || item.item_name || 'Raw Material Item',
              type: item.type || 'inward',
              quantity_kg: Number(item.quantityKg || item.quantity_kg || 0),
              vehicle_no: item.vehicleNo || item.vehicle_no || '',
              supplier_party: item.supplierParty || item.supplier_party || '',
              notes: item.notes || ''
            });
          });
        }
      });
      if (rmPayload.length > 0) {
        const { error } = await supabase.from('raw_materials').upsert(rmPayload, { onConflict: 'id' });
        if (error) console.error('Supabase Raw Materials Sync Error:', error.message);
      }
    }
  } catch (err) {
    console.error('Raw Materials sync error:', err);
  }

  // 3. Sync Pulp Mill Logs
  try {
    if (state.pulpMillLogs) {
      const pulpPayload = Object.entries(state.pulpMillLogs).map(([dt, log]) => ({
        id: `pulp-${dt}`,
        date: dt,
        waste_paper_kg: Number(log.wastePaperKg || 0),
        caustic_soda_kg: Number(log.causticSodaKg || 0),
        rosin_kg: Number(log.rosinKg || 0),
        alum_kg: Number(log.alumKg || 0),
        dyes_kg: Number(log.dyesKg || 0),
        starch_kg: Number(log.starchKg || 0),
        pac_kg: Number(log.pacKg || 0),
        water_ltr: Number(log.waterLtr || 0),
        power_units_kwh: Number(log.powerUnitsKwh || 0)
      }));
      if (pulpPayload.length > 0) {
        const { error } = await supabase.from('pulp_mill_logs').upsert(pulpPayload, { onConflict: 'date' });
        if (error) console.error('Supabase Pulp Mill Sync Error:', error.message);
      }
    }
  } catch (err) {
    console.error('Pulp Mill sync error:', err);
  }

  // 4. Sync Machine Logs
  try {
    if (state.machineLogs) {
      const machinePayload = Object.entries(state.machineLogs).map(([dt, log]) => ({
        id: `mach-${dt}`,
        date: dt,
        shift_a_operator: log.shiftAOperator || '',
        shift_b_operator: log.shiftBOperator || '',
        retention_agent_rate: Number(log.retentionAgentRate || 0),
        defoamer_rate: Number(log.defoamerRate || 0),
        biocide_rate: Number(log.biocideRate || 0)
      }));
      if (machinePayload.length > 0) {
        const { error } = await supabase.from('machine_logs').upsert(machinePayload, { onConflict: 'date' });
        if (error) console.error('Supabase Machine Logs Sync Error:', error.message);
      }
    }
  } catch (err) {
    console.error('Machine Logs sync error:', err);
  }

  // 5. Sync Rewinder Reels
  try {
    if (state.rewinderReels && state.rewinderReels.length > 0) {
      const reelsPayload = state.rewinderReels.map((r, idx) => ({
        id: r.id || `reel-${r.reelNo || idx}`,
        date: r.date || state.selectedDate || new Date().toISOString().split('T')[0],
        reel_no: r.reelNo || `RL-${idx}`,
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
      const { error } = await supabase.from('rewinder_reels').upsert(reelsPayload, { onConflict: 'id' });
      if (error) console.error('Supabase Rewinder Reels Sync Error:', error.message);
    }
  } catch (err) {
    console.error('Rewinder Reels sync error:', err);
  }

  // 6. Sync Boiler Logs
  try {
    if (state.boilerLogs) {
      const boilerPayload = Object.entries(state.boilerLogs).map(([dt, log]) => ({
        id: `boiler-${dt}`,
        date: dt,
        fuel_type: log.fuelType || 'Firewood',
        total_fuel_kg: Number(log.totalFuelKg || 0),
        water_consumption_ltr: Number(log.waterConsumptionLtr || 0),
        steam_generated_kg: Number(log.steamGeneratedKg || 0),
        running_hours: Number(log.runningHours || 24)
      }));
      if (boilerPayload.length > 0) {
        const { error } = await supabase.from('boiler_logs').upsert(boilerPayload, { onConflict: 'date' });
        if (error) console.error('Supabase Boiler Logs Sync Error:', error.message);
      }
    }
  } catch (err) {
    console.error('Boiler Logs sync error:', err);
  }

  // 7. Sync ETP Logs
  try {
    if (state.etpLogs) {
      const etpPayload = Object.entries(state.etpLogs).map(([dt, log]) => ({
        id: `etp-${dt}`,
        date: dt,
        flock_100_liq_ltr: Number(log.flock100LiqLtr || 0),
        flock_master_kg: Number(log.flockMasterKg || 0),
        treated_water_ltr: Number(log.treatedWaterLtr || 0)
      }));
      if (etpPayload.length > 0) {
        const { error } = await supabase.from('etp_logs').upsert(etpPayload, { onConflict: 'date' });
        if (error) console.error('Supabase ETP Logs Sync Error:', error.message);
      }
    }
  } catch (err) {
    console.error('ETP Logs sync error:', err);
  }

  // 8. Sync Electricity Logs
  try {
    if (state.electricityLogs) {
      const elecPayload = Object.entries(state.electricityLogs).map(([dt, log]) => ({
        id: `elec-${dt}`,
        date: dt,
        daily_units_kwh: Number(log.dailyUnitsKwh || 0),
        unit_per_ton: Number(log.unitPerTon || 0)
      }));
      if (elecPayload.length > 0) {
        const { error } = await supabase.from('electricity_logs').upsert(elecPayload, { onConflict: 'date' });
        if (error) console.error('Supabase Electricity Logs Sync Error:', error.message);
      }
    }
  } catch (err) {
    console.error('Electricity Logs sync error:', err);
  }

  // 9. Sync Pending Orders (PRIORITY MODULE!)
  try {
    if (state.pendingOrders && state.pendingOrders.length > 0) {
      const ordersPayload = state.pendingOrders.map((o, idx) => {
        const orderDate = o.orderDate || o.date || state.selectedDate || new Date().toISOString().split('T')[0];
        const dateTag = (orderDate || '').replace(/-/g, '') || '20260819';
        let cleanId = o.id;
        if (!cleanId || !cleanId.startsWith('PEND_ORDER')) {
          cleanId = `PEND_ORDER${dateTag}-001`;
        }
        return {
          id: cleanId,
          date: orderDate,
          party: o.party || 'Default Party',
          product_name: o.productName || 'Napkin Tissue',
          gsm: Number(o.gsm || 16),
          size: o.size || '30cm',
          ply: Number(o.ply || 1),
          quantity_kg: Number(o.quantityKg || 0),
          dispatched_kg: Number(o.dispatchedKg || 0),
          status: o.status === 'partial' || o.status === 'partially_dispatched' ? 'partial' : (o.status === 'fulfilled' ? 'fulfilled' : 'pending')
        };
      });
      const { data, error } = await supabase.from('pending_orders').upsert(ordersPayload, { onConflict: 'id' }).select();
      if (error) {
        console.error('❌ Supabase Pending Orders Sync Error:', error.message);
      } else {
        console.log(`✅ Supabase Pending Orders Synced (${ordersPayload.length} rows)`);
      }
    }
  } catch (err) {
    console.error('Pending Orders sync error:', err);
  }

  // 10. Sync Dispatches
  try {
    if (state.dispatches && state.dispatches.length > 0) {
      const dispatchesPayload = state.dispatches.map((d, idx) => ({
        id: d.id || `disp-${d.dispatchNo || idx}`,
        dispatch_no: d.dispatchNo || `DSP-${idx}`,
        date: d.date || state.selectedDate || new Date().toISOString().split('T')[0],
        party: d.party || 'Default Party',
        vehicle_no: d.vehicleNo || 'GJ-05-8821',
        product_name: d.productName || 'Napkin Tissue',
        quantity_kg: Number(d.quantityKg || 0),
        reels_count: Number(d.reelsCount || 1),
        order_id: d.orderId || null
      }));
      const { error } = await supabase.from('dispatches').upsert(dispatchesPayload, { onConflict: 'id' });
      if (error) console.error('Supabase Dispatches Sync Error:', error.message);
    }
  } catch (err) {
    console.error('Dispatches sync error:', err);
  }

  // 11. Sync Store Items
  try {
    if (state.storeItems && state.storeItems.length > 0) {
      const storePayload = state.storeItems.map((s, idx) => ({
        id: s.id || `st-${s.category || 'sp'}-${idx}`,
        category: s.category || 'bearing',
        number: s.number || '',
        size: s.size || '',
        item_group: s.group || s.item_group || '',
        name: s.name || 'Store Item',
        pcs: Number(s.pcs || 0),
        use_for: s.useFor || s.use_for || ''
      }));
      const { error } = await supabase.from('store_items').upsert(storePayload, { onConflict: 'id' });
      if (error) console.error('Supabase Store Items Sync Error:', error.message);
    }
  } catch (err) {
    console.error('Store Items sync error:', err);
  }

  // 12. Sync Audit Logs
  try {
    if (state.auditLogs && state.auditLogs.length > 0) {
      const auditPayload = state.auditLogs.map((a, idx) => ({
        id: a.id || `audit-${idx}`,
        timestamp: a.timestamp || new Date().toISOString(),
        user_id: a.userId || a.user_id || 'usr-1',
        user_name: a.userName || a.user_name || 'Admin',
        role: a.role || a.roleName || 'admin',
        action: a.action || 'system_update',
        module: a.module || 'system',
        details: a.details || ''
      }));
      const { error } = await supabase.from('audit_logs').upsert(auditPayload, { onConflict: 'id' });
      if (error) console.error('Supabase Audit Logs Sync Error:', error.message);
    }
  } catch (err) {
    console.error('Audit Logs sync error:', err);
  }
};

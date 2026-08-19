import { supabase } from './supabaseClient';

/**
 * Supabase Data Adapter for Saheb Paper Mill ERP 13 Modules
 * Maps local state models to/from Supabase PostgreSQL tables
 */

export const syncStateToSupabase = async (state) => {
  if (!supabase) return;

  try {
    // 1. Sync Users
    if (state.users && state.users.length > 0) {
      const usersPayload = state.users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        password: u.password,
        role: u.role,
        employee_id: u.employeeId || u.employee_id || 'EMP-001',
        allowed_modules: u.allowedModules || u.allowed_modules || [],
        is_read_only: Boolean(u.isReadOnly || u.is_read_only)
      }));
      await supabase.from('users').upsert(usersPayload, { onConflict: 'id' });
    }

    // 2. Sync Raw Materials
    if (state.rawMaterials) {
      const rmPayload = [];
      Object.entries(state.rawMaterials).forEach(([catKey, items]) => {
        if (Array.isArray(items)) {
          items.forEach(item => {
            rmPayload.push({
              id: item.id && item.id.length === 36 ? item.id : undefined,
              date: item.date || state.selectedDate,
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
        await supabase.from('raw_materials').upsert(rmPayload);
      }
    }

    // 3. Sync Pulp Mill Logs
    if (state.pulpMillLogs) {
      const pulpPayload = Object.entries(state.pulpMillLogs).map(([dt, log]) => ({
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
        await supabase.from('pulp_mill_logs').upsert(pulpPayload, { onConflict: 'date' });
      }
    }

    // 4. Sync Machine Logs
    if (state.machineLogs) {
      const machinePayload = Object.entries(state.machineLogs).map(([dt, log]) => ({
        date: dt,
        shift_a_operator: log.shiftAOperator || '',
        shift_b_operator: log.shiftBOperator || '',
        retention_agent_rate: Number(log.retentionAgentRate || 0),
        defoamer_rate: Number(log.defoamerRate || 0),
        biocide_rate: Number(log.biocideRate || 0)
      }));
      if (machinePayload.length > 0) {
        await supabase.from('machine_logs').upsert(machinePayload, { onConflict: 'date' });
      }
    }

    // 5. Sync Rewinder Reels
    if (state.rewinderReels && state.rewinderReels.length > 0) {
      const reelsPayload = state.rewinderReels.map(r => ({
        date: r.date || state.selectedDate,
        reel_no: r.reelNo,
        running_roll_no: r.runningRollNo || '',
        running_size: r.runningSize || '',
        product_name: r.productName,
        gsm: Number(r.gsm || 16),
        size: r.size || '30cm',
        ply: Number(r.ply || 1),
        dia: Number(r.dia || 900),
        joint: Number(r.joint || 0),
        weight_kg: Number(r.weightKg || 0),
        broke_kg: Number(r.brokeKg || 0)
      }));
      await supabase.from('rewinder_reels').upsert(reelsPayload);
    }

    // 6. Sync Boiler Logs
    if (state.boilerLogs) {
      const boilerPayload = Object.entries(state.boilerLogs).map(([dt, log]) => ({
        date: dt,
        fuel_type: log.fuelType || 'Firewood',
        total_fuel_kg: Number(log.totalFuelKg || 0),
        water_consumption_ltr: Number(log.waterConsumptionLtr || 0),
        steam_generated_kg: Number(log.steamGeneratedKg || 0),
        running_hours: Number(log.runningHours || 24)
      }));
      if (boilerPayload.length > 0) {
        await supabase.from('boiler_logs').upsert(boilerPayload, { onConflict: 'date' });
      }
    }

    // 7. Sync ETP Logs
    if (state.etpLogs) {
      const etpPayload = Object.entries(state.etpLogs).map(([dt, log]) => ({
        date: dt,
        flock_100_liq_ltr: Number(log.flock100LiqLtr || 0),
        flock_master_kg: Number(log.flockMasterKg || 0),
        treated_water_ltr: Number(log.treatedWaterLtr || 0)
      }));
      if (etpPayload.length > 0) {
        await supabase.from('etp_logs').upsert(etpPayload, { onConflict: 'date' });
      }
    }

    // 8. Sync Electricity Logs
    if (state.electricityLogs) {
      const elecPayload = Object.entries(state.electricityLogs).map(([dt, log]) => ({
        date: dt,
        daily_units_kwh: Number(log.dailyUnitsKwh || 0),
        unit_per_ton: Number(log.unitPerTon || 0)
      }));
      if (elecPayload.length > 0) {
        await supabase.from('electricity_logs').upsert(elecPayload, { onConflict: 'date' });
      }
    }

    // 9. Sync Pending Orders
    if (state.pendingOrders && state.pendingOrders.length > 0) {
      const ordersPayload = state.pendingOrders.map(o => ({
        date: o.date || state.selectedDate,
        party: o.party,
        product_name: o.productName,
        gsm: Number(o.gsm || 16),
        size: o.size || '30cm',
        ply: Number(o.ply || 1),
        quantity_kg: Number(o.quantityKg || 0),
        dispatched_kg: Number(o.dispatchedKg || 0),
        status: o.status || 'pending'
      }));
      await supabase.from('pending_orders').upsert(ordersPayload);
    }

    // 10. Sync Dispatches
    if (state.dispatches && state.dispatches.length > 0) {
      const dispatchesPayload = state.dispatches.map(d => ({
        dispatch_no: d.dispatchNo,
        date: d.date || state.selectedDate,
        party: d.party,
        vehicle_no: d.vehicleNo,
        product_name: d.productName,
        quantity_kg: Number(d.quantityKg || 0),
        reels_count: Number(d.reelsCount || 1),
        order_id: d.orderId || null
      }));
      await supabase.from('dispatches').upsert(dispatchesPayload, { onConflict: 'dispatch_no' });
    }

    // 11. Sync Store Items
    if (state.storeItems && state.storeItems.length > 0) {
      const storePayload = state.storeItems.map(s => ({
        category: s.category || 'bearing',
        number: s.number || '',
        size: s.size || '',
        item_group: s.group || s.item_group || '',
        name: s.name,
        pcs: Number(s.pcs || 0),
        use_for: s.useFor || s.use_for || ''
      }));
      await supabase.from('store_items').upsert(storePayload);
    }

    // 12. Sync Audit Logs
    if (state.auditLogs && state.auditLogs.length > 0) {
      const auditPayload = state.auditLogs.map(a => ({
        timestamp: a.timestamp || new Date().toISOString(),
        user_id: a.userId || a.user_id || 'usr-1',
        user_name: a.userName || a.user_name || 'Admin',
        role: a.role || 'admin',
        action: a.action || 'system_update',
        module: a.module || 'system',
        details: a.details || ''
      }));
      await supabase.from('audit_logs').upsert(auditPayload);
    }

  } catch (err) {
    console.warn('Supabase sync background notice:', err.message);
  }
};

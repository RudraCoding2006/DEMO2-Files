/**
 * Saheb Paper Pvt. Ltd. — Production Engine & Calculation Logic
 * Implements Rules 1 through 12 per Business Rules & Architecture specs.
 */

import { RAW_MATERIALS } from '../data/masterData';

/**
 * Reconciles stock deductions for a given date based on machine roll production,
 * pulp mill formula, and chemical rates using delta tracking.
 */
export const recalculateDailyDeductions = (date, state) => {
  const nextState = JSON.parse(JSON.stringify(state));

  // 1. Calculate total machine production for the date
  const machineLog = nextState.machineLogs[date] || { rolls: [], chemicalRates: {} };
  const totalPaperProducedKg = (machineLog.rolls || []).reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
  const totalTonsProduced = totalPaperProducedKg / 1000;

  // 2. Get Pulp Mill formula and chemical rates for the date
  const pulpMillLog = nextState.pulpMillLogs[date] || { wastePaperMix: {}, chemicalRates: {} };
  const wastePaperMix = pulpMillLog.wastePaperMix || {};
  const pulpChemRates = pulpMillLog.chemicalRates || {};
  const machineChemRates = machineLog.chemicalRates || {};

  // Map raw material IDs/Names to target consumption in KG/LTR for today
  const newTargets = {};

  // A. Waste Paper Target Consumption (Rule 2)
  Object.entries(wastePaperMix).forEach(([rmId, pct]) => {
    if (pct > 0) {
      const targetKg = (Number(pct) / 100) * totalPaperProducedKg;
      newTargets[rmId] = (newTargets[rmId] || 0) + targetKg;
    }
  });

  // Helper to resolve chemical name to rawMaterialItemId
  const findChemItemId = (chemName) => {
    const found = RAW_MATERIALS.find(m => m.name.toLowerCase() === chemName.toLowerCase());
    return found ? found.id : null;
  };

  // B. Pulp Mill Chemical Target Consumption (Rule 3)
  Object.entries(pulpChemRates).forEach(([chemName, rate]) => {
    const itemId = findChemItemId(chemName);
    if (itemId && Number(rate) > 0) {
      const targetKg = Number(rate) * totalTonsProduced;
      newTargets[itemId] = (newTargets[itemId] || 0) + targetKg;
    }
  });

  // C. Machine Chemical Target Consumption (Rule 3 - Additive with Pulp Mill)
  Object.entries(machineChemRates).forEach(([chemName, rate]) => {
    const itemId = findChemItemId(chemName);
    if (itemId && Number(rate) > 0) {
      const targetKg = Number(rate) * totalTonsProduced;
      newTargets[itemId] = (newTargets[itemId] || 0) + targetKg;
    }
  });

  // D. Delta Reconciliation per Raw Material Item
  if (!nextState.dailyDeductions) nextState.dailyDeductions = {};
  if (!nextState.dailyDeductions[date]) nextState.dailyDeductions[date] = {};

  const currentDayDeductions = nextState.dailyDeductions[date];

  // Combine all item IDs that have either previous deductions or new targets
  const allItemIds = new Set([...Object.keys(currentDayDeductions), ...Object.keys(newTargets)]);

  allItemIds.forEach(itemId => {
    const prevDeducted = Number(currentDayDeductions[itemId] || 0);
    const targetDeduction = Number(newTargets[itemId] || 0);
    const delta = targetDeduction - prevDeducted;

    if (delta !== 0) {
      // Adjust stock (Rule 2 & Rule 3)
      nextState.rawMaterialStocks[itemId] = (nextState.rawMaterialStocks[itemId] || 0) - delta;
      // Record updated deducted target for today
      currentDayDeductions[itemId] = targetDeduction;

      // Log stock transaction audit
      if (!nextState.stockTransactions) nextState.stockTransactions = [];
      nextState.stockTransactions.unshift({
        id: `tx-auto-${date}-${itemId}-${Date.now()}`,
        date,
        itemId,
        type: 'consumption',
        delta: -delta,
        targetTotal: targetDeduction,
        source: 'Auto-Deduction (Production & Rates)'
      });
    }
  });

  return nextState;
};

/**
 * Calculates Machine Running Hours for a specific date (Rule 5)
 */
export const calculateMachineRunningHours = (runningTimeData) => {
  if (!runningTimeData || !runningTimeData.startTime || !runningTimeData.offTime) return 0;
  
  const [startH, startM] = runningTimeData.startTime.split(':').map(Number);
  const [offH, offM] = runningTimeData.offTime.split(':').map(Number);

  let startMinutes = startH * 60 + startM;
  let offMinutes = offH * 60 + offM;

  if (offMinutes < startMinutes) {
    offMinutes += 24 * 60; // Overnight shift
  }

  const grossMinutes = offMinutes - startMinutes;
  const downtimeMinutes = (runningTimeData.downtimes || []).reduce((sum, d) => sum + Number(d.durationMinutes || 0), 0);

  const netMinutes = Math.max(0, grossMinutes - downtimeMinutes);
  return (netMinutes / 60).toFixed(2);
};

/**
 * Computes finish stock grouped by Product -> GSM -> Size -> Ply
 */
export const computeFinishStockHierarchy = (reels, dispatches) => {
  const stockMap = {};

  // Add completed reels
  reels.forEach(reel => {
    const key = `${reel.productName}||${reel.gsm}||${reel.size}||${reel.ply}||${reel.dia || 'N/A'}`;
    const netWeight = Math.max(0, Number(reel.weightKg || 0) - Number(reel.brokeKg || 0));

    if (!stockMap[key]) {
      stockMap[key] = {
        productName: reel.productName,
        gsm: reel.gsm,
        size: reel.size,
        ply: reel.ply,
        dia: reel.dia || null,
        reels: [],
        totalKg: 0
      };
    }
    stockMap[key].reels.push(reel);
    stockMap[key].totalKg += netWeight;
  });

  // Track total dispatched kg for summary display
  let totalDispatchedKg = 0;

  // Deduct dispatches with fallback matching
  dispatches.forEach(disp => {
    const dispQty = Number(disp.quantityKg || 0);
    if (dispQty <= 0) return;
    totalDispatchedKg += dispQty;

    // 1. Try exact key match first
    const exactKey = `${disp.productName}||${disp.gsm}||${disp.size}||${disp.ply}||${disp.dia || 'N/A'}`;
    if (stockMap[exactKey]) {
      stockMap[exactKey].totalKg = Math.max(0, stockMap[exactKey].totalKg - dispQty);
      return;
    }

    // 2. Fallback: match by productName only (deduct from largest matching entry first)
    const productMatches = Object.keys(stockMap).filter(k => stockMap[k].productName === disp.productName);
    if (productMatches.length > 0) {
      // Sort by totalKg descending — deduct from largest bucket first
      productMatches.sort((a, b) => stockMap[b].totalKg - stockMap[a].totalKg);
      let remaining = dispQty;
      for (const mk of productMatches) {
        if (remaining <= 0) break;
        const deduct = Math.min(stockMap[mk].totalKg, remaining);
        stockMap[mk].totalKg = Math.max(0, stockMap[mk].totalKg - deduct);
        remaining -= deduct;
      }
      return;
    }

    // 3. Final fallback: distribute deduction across ALL stock entries proportionally
    const allKeys = Object.keys(stockMap);
    const totalStock = allKeys.reduce((s, k) => s + stockMap[k].totalKg, 0);
    if (totalStock > 0) {
      let remaining = dispQty;
      // Sort by totalKg descending
      allKeys.sort((a, b) => stockMap[b].totalKg - stockMap[a].totalKg);
      for (const ak of allKeys) {
        if (remaining <= 0) break;
        const deduct = Math.min(stockMap[ak].totalKg, remaining);
        stockMap[ak].totalKg = Math.max(0, stockMap[ak].totalKg - deduct);
        remaining -= deduct;
      }
    }
  });

  // Attach metadata for the UI to read
  stockMap.__dispatchMeta = { totalDispatchedKg };

  return stockMap;
};

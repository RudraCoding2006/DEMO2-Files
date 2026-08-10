import { RAW_MATERIALS } from './masterData';

// Helper to format YYYY-MM-DD offset from today
export const getDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Seed 60 days (2 months) of natural paper mill history
const TOTAL_DAYS = 60;

// Master lists for natural variations (7 paper grades: A to G)
const PRODUCTS_LIST = [
  { name: 'Napkin Tissue', gsmList: [14, 16, 18], sizes: ['30cm', '33cm', '40cm'], plies: [1, 2], dia: 900 },
  { name: 'Toilet Tissue', gsmList: [15, 17, 19], sizes: ['10cm'], plies: [2, 3], dia: null },
  { name: 'KT', gsmList: [18, 20, 22], sizes: ['20cm', '23cm'], plies: [1, 2], dia: null },
  { name: 'HRT', gsmList: [20, 22, 24], sizes: ['20cm', '25cm'], plies: [1, 2], dia: null },
  { name: 'Napkin B Grade', gsmList: [14, 16, 18], sizes: ['30cm', '33cm'], plies: [1, 2], dia: 850 },
  { name: 'Toilet B Grade', gsmList: [15, 17, 19], sizes: ['10cm'], plies: [2, 3], dia: null },
  { name: 'KT B Grade', gsmList: [18, 20, 22], sizes: ['20cm', '23cm'], plies: [1, 2], dia: null },
];

const PARTIES_LIST = [
  'Surat Paper Mart',
  'Apex Packaging Pvt Ltd',
  'Metro Tissue Suppliers',
  'Royal Hygiene Crafts',
  'Shree Ram Convertors',
  'Vardhman Hygiene Products',
  'Gujarat Tissue Products',
  'Maharashra Hygiene Pvt Ltd'
];

const VEHICLES_LIST = [
  'GJ-05-BX-8821', 'GJ-06-TY-4512', 'MH-04-AZ-9921', 'GJ-12-KL-3411',
  'GJ-03-ER-6723', 'MH-15-GH-1290', 'GJ-16-PO-9043', 'GJ-05-ZZ-1102'
];

const DOWNTIME_REASONS = [
  'Paper break at MG cylinder wire section',
  'Felt washing & steam joint maintenance',
  'Tail cutter blade replacement',
  'High density cleaner valve replacement',
  'Doctor blade adjustment & cleaning',
  'Slush chest level sensor calibration',
  'Pulper main belt tensioning',
  'Vacuum pump seal inspection'
];

// Initial baseline stock reserve — sized generously so consumption leaves 100% positive stock!
export const INITIAL_RAW_MATERIAL_STOCKS = {
  'rm-wp-1': 850000, // Indian Tissue Waste
  'rm-wp-2': 520000, // Imported Tissue Waste
  'rm-wp-3': 340000, // SMK
  'rm-wp-4': 240000, // Cupstock
  'rm-wp-5': 240000, // Pulp Sheet
  'rm-wp-6': 120000, // Silicon
  'rm-wp-7': 95000,  // Broke

  'rm-ch-1': 65000,  // DSR
  'rm-ch-2': 68000,  // WSR
  'rm-ch-3': 45000,  // Hydrogen Peroxide
  'rm-ch-4': 48000,  // Hypo
  'rm-ch-5': 65000,  // Bleaching Powder
  'rm-ch-6': 85000,  // Caustic
  'rm-ch-7': 28000,  // OBA
  'rm-ch-8': 18000,  // M Violet
  'rm-ch-9': 29000,  // Washing Powder
  'rm-ch-10': 29000, // Flock 100 Liq
  'rm-ch-11': 28000, // Flock Master
  'rm-ch-12': 28000, // PEO
  'rm-ch-13': 29000, // Deformer
  'rm-ch-14': 32000, // HCL
  'rm-ch-15': 26000, // MG Release
  'rm-ch-16': 26000, // MG Coating
  'rm-ch-17': 28000, // RO Chemical

  'rm-fw-1': 850000, // Wood
  'rm-fw-2': 580000, // Biocoal
};

// Data log objects
export const INITIAL_INWARD_ENTRIES = [];
export const INITIAL_PULP_MILL_FORMULAS = {};
export const INITIAL_MACHINE_LOGS = {};
export const INITIAL_REWINDER_REELS = [];
export const INITIAL_BOILER_LOGS = {};
export const INITIAL_ETP_LOGS = {};
export const INITIAL_ELECTRICITY_LOGS = {};
export const INITIAL_PENDING_ORDERS = [];
export const INITIAL_DISPATCHES = [];

// Seed 60 Days Data
let rollCounter = 101;
let reelCounter = 101;
let inwardCounter = 1;
let dispatchCounter = 1;

for (let offset = -TOTAL_DAYS; offset <= 0; offset++) {
  const date = getDateStr(offset);
  const dayIndex = TOTAL_DAYS + offset;

  // 1. Raw Material Inward Entry every 5-7 days
  if (dayIndex % 6 === 0) {
    const itemIdx = (dayIndex / 6) % RAW_MATERIALS.length;
    const item = RAW_MATERIALS[itemIdx];
    const inwQty = item.category === 'firewood' ? 40000 : item.category === 'waste_paper' ? 15000 : 2500;
    
    INITIAL_INWARD_ENTRIES.push({
      id: `inw-seed-${inwardCounter++}`,
      date,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      quantity: inwQty,
      unit: item.unit,
      remarks: `PO #${4000 + inwardCounter} - Truck ${VEHICLES_LIST[inwardCounter % VEHICLES_LIST.length]}`
    });
  }

  // 2. Pulp Mill Formula for the day
  const wp1Pct = 45 + (dayIndex % 10);
  const wp2Pct = 20 + ((dayIndex * 3) % 10);
  const wp3Pct = 15;
  const brokePct = 100 - (wp1Pct + wp2Pct + wp3Pct);

  const hasPulpDowntime = dayIndex % 4 === 0;

  INITIAL_PULP_MILL_FORMULAS[date] = {
    wastePaperMix: {
      'rm-wp-1': wp1Pct,
      'rm-wp-2': wp2Pct,
      'rm-wp-3': wp3Pct,
      'rm-wp-7': Math.max(5, brokePct)
    },
    chemicalRates: {
      DSR: 10 + (dayIndex % 3),
      WSR: 12 + (dayIndex % 4),
      'Hydrogen Peroxide': 5 + (dayIndex % 2),
      Hypo: 8,
      'Bleaching Powder': 14 + (dayIndex % 3),
      Caustic: 10 + (dayIndex % 2),
      OBA: 2.2,
      'M Violet': 0.5,
      Deformer: 3
    },
    downtimeLogs: hasPulpDowntime ? [{
      id: `pm-dt-${date}`,
      durationMinutes: 20 + (dayIndex % 30),
      reason: DOWNTIME_REASONS[dayIndex % DOWNTIME_REASONS.length]
    }] : []
  };

  // 3. Paper Machine Production Rolls (5 to 6 Jumbo Rolls per day)
  const rollsCount = 5 + (dayIndex % 2);
  const dailyRolls = [];
  const currentHour = new Date().getHours();
  
  for (let r = 0; r < rollsCount; r++) {
    const prod = PRODUCTS_LIST[(dayIndex + r) % PRODUCTS_LIST.length];
    const gsm = prod.gsmList[r % prod.gsmList.length];
    const weight = 1480 + ((dayIndex * 17 + r * 63) % 240);
    const hour = 7 + r * 3;
    const timeStr = `${String(hour).padStart(2, '0')}:15`;

    dailyRolls.push({
      id: `roll-seed-${rollCounter}`,
      rollNo: `M-${rollCounter++}`,
      time: timeStr,
      productName: prod.name,
      gsm,
      rollWidth: 1650,
      weightKg: weight
    });
  }

  const hasMachineDowntime = dayIndex % 3 === 0;
  const todayOffTime = '23:30';

  INITIAL_MACHINE_LOGS[date] = {
    rolls: dailyRolls,
    chemicalRates: {
      PEO: 2.5,
      Deformer: 1.5,
      HCL: 4.0,
      'MG Release': 1.2,
      'MG Coating': 1.0,
      'Washing Powder': 2.0,
      Caustic: 5.0
    },
    runningTime: {
      startTime: '06:00',
      offTime: todayOffTime,
      downtimes: hasMachineDowntime ? [{
        id: `m-dt-${date}`,
        durationMinutes: 30 + (dayIndex % 40),
        reason: DOWNTIME_REASONS[(dayIndex + 2) % DOWNTIME_REASONS.length]
      }] : []
    }
  };

  // 4. Rewinder Reels (6 to 8 reels per day)
  const reelsCount = 6 + (dayIndex % 3);
  for (let k = 0; k < reelsCount; k++) {
    const matchingRoll = dailyRolls[k % dailyRolls.length];
    const prod = PRODUCTS_LIST[(dayIndex + k) % PRODUCTS_LIST.length];
    const brokeKg = 60 + ((dayIndex * 11 + k * 19) % 70);

    INITIAL_REWINDER_REELS.push({
      id: `reel-seed-${reelCounter}`,
      reelNo: `RL-${reelCounter++}`,
      date,
      runningRollNo: matchingRoll ? matchingRoll.rollNo : `M-${100 + k}`,
      runningSize: '1650 mm',
      productName: prod.name,
      gsm: prod.gsmList[k % prod.gsmList.length],
      size: prod.sizes[k % prod.sizes.length],
      ply: prod.plies[k % prod.plies.length],
      dia: prod.dia,
      joint: k % 3,
      weightKg: 1380 + ((k * 43 + dayIndex * 17) % 250),
      brokeKg
    });
  }

  // 5. Boiler Daily Log
  INITIAL_BOILER_LOGS[date] = {
    woodConsumptionKg: 3800 + ((dayIndex * 37) % 500),
    waterConsumptionLtr: 12500 + ((dayIndex * 120) % 1000),
    woodType: dayIndex % 3 === 0 ? 'Biocoal' : 'Wood'
  };

  // 6. ETP Log
  INITIAL_ETP_LOGS[date] = {
    flockLiquidLtr: 42 + (dayIndex % 12),
    flockMasterKg: 28 + (dayIndex % 8)
  };

  // 7. Electricity Log
  INITIAL_ELECTRICITY_LOGS[date] = {
    dailyUnitsKwh: 4800 + ((dayIndex * 43) % 500)
  };

  // 8. Pending Orders (Every 3 days)
  if (dayIndex % 3 === 0 && dayIndex > 10) {
    const party = PARTIES_LIST[dayIndex % PARTIES_LIST.length];
    const prod = PRODUCTS_LIST[dayIndex % PRODUCTS_LIST.length];
    INITIAL_PENDING_ORDERS.push({
      id: `ord-seed-${dayIndex}`,
      party,
      productName: prod.name,
      gsm: prod.gsmList[0],
      size: prod.sizes[0],
      ply: prod.plies[0],
      quantityKg: 3500 + (dayIndex % 5) * 1000,
      orderDate: date,
      status: dayIndex % 8 === 0 ? 'fulfilled' : dayIndex % 3 === 0 ? 'partial' : 'pending'
    });
  }

  // 9. Dispatches (Every 4 days)
  if (dayIndex % 4 === 0 && dayIndex > 12) {
    const party = PARTIES_LIST[(dayIndex + 1) % PARTIES_LIST.length];
    const prod = PRODUCTS_LIST[(dayIndex + 1) % PRODUCTS_LIST.length];
    const dispQty = 2500 + (dayIndex % 4) * 800;

    INITIAL_DISPATCHES.push({
      id: `disp-seed-${dispatchCounter}`,
      dispatchNo: `DSP-2026-${String(dispatchCounter++).padStart(3, '0')}`,
      date,
      party,
      vehicleNumber: VEHICLES_LIST[dispatchCounter % VEHICLES_LIST.length],
      reelNos: [`RL-${100 + dispatchCounter}`, `RL-${101 + dispatchCounter}`, `RL-${102 + dispatchCounter}`],
      productName: prod.name,
      gsm: prod.gsmList[0],
      size: prod.sizes[0],
      ply: prod.plies[0],
      quantityKg: dispQty,
      remarks: 'Full Load Logistics Delivery'
    });
  }
}

// Master Spares List
export const INITIAL_STORE_ITEMS = [
  { id: 'st-b-1', category: 'bearing', number: '6205 2RS', pcs: 24, useFor: 'Pulp Mill Pump Shaft' },
  { id: 'st-b-2', category: 'bearing', number: '22216 EK', pcs: 12, useFor: 'MG Cylinder Drive' },
  { id: 'st-b-3', category: 'bearing', number: '6310 C3', pcs: 18, useFor: 'Rewinder Drum Assembly' },
  { id: 'st-b-4', category: 'bearing', number: '6212 2Z', pcs: 15, useFor: 'Vacuum Pump Bearing' },
  { id: 'st-v-1', category: 'v_belt', size: 'B-75', group: 'B Section', pcs: 30, useFor: 'Vacuum Pump Drive' },
  { id: 'st-v-2', category: 'v_belt', size: 'C-120', group: 'C Section', pcs: 16, useFor: 'Pulper Main Motor' },
  { id: 'st-v-3', category: 'v_belt', size: 'D-180', group: 'D Section', pcs: 10, useFor: 'Agitator Drive' },
  { id: 'st-o-1', category: 'other', name: 'Mechanical Seal 45mm', pcs: 8, useFor: 'Chest Agitator' },
  { id: 'st-o-2', category: 'other', name: 'Steam Joint Carbon Ring 2"', pcs: 14, useFor: 'MG Steam Header' },
  { id: 'st-o-3', category: 'other', name: 'Doctor Blade Synthetic 1700mm', pcs: 10, useFor: 'Yankee Creping Doctor' },
  { id: 'st-o-4', category: 'other', name: 'Press Felt Cleaning Nozzle', pcs: 20, useFor: 'High Pressure Shower' },
];

export const INITIAL_USERS = [
  {
    id: 'usr-1',
    workerId: 'EMP-001',
    name: 'Rajesh Sharma',
    username: 'admin',
    password: 'admin@password123',
    roleId: 'admin',
    roleName: 'Admin / Management',
    email: 'admin@sahebpaper.com',
    phone: '+91 98250 12345',
    status: 'active',
    allowedModules: ['dashboard', 'raw-material', 'pulp-mill', 'machine', 'rewinder', 'boiler', 'etp', 'electricity', 'pending-order', 'finish-stock', 'dispatch', 'store', 'reports']
  },
  {
    id: 'usr-2',
    workerId: 'EMP-002',
    name: 'Suresh Patel',
    username: 'suresh_pulp',
    password: 'pulp@pass2026',
    roleId: 'pulp_mill',
    roleName: 'Pulp Mill Operator',
    email: 'suresh.pulp@sahebpaper.com',
    phone: '+91 98250 23456',
    status: 'active',
    allowedModules: ['dashboard', 'raw-material', 'pulp-mill']
  },
  {
    id: 'usr-3',
    workerId: 'EMP-003',
    name: 'Amit Verma',
    username: 'amit_machine',
    password: 'machine@pass2026',
    roleId: 'machine',
    roleName: 'Machine Operator',
    email: 'amit.machine@sahebpaper.com',
    phone: '+91 98250 34567',
    status: 'active',
    allowedModules: ['dashboard', 'machine', 'rewinder']
  },
  {
    id: 'usr-4',
    workerId: 'EMP-004',
    name: 'Vikram Singh',
    username: 'vikram_store',
    password: 'store@pass2026',
    roleId: 'store_keeper',
    roleName: 'Store Keeper',
    email: 'vikram.store@sahebpaper.com',
    phone: '+91 98250 45678',
    status: 'active',
    allowedModules: ['dashboard', 'raw-material', 'store', 'finish-stock']
  },
  {
    id: 'usr-5',
    workerId: 'EMP-005',
    name: 'Dinesh Kumar',
    username: 'dinesh_dispatch',
    password: 'dispatch@pass2026',
    roleId: 'dispatch',
    roleName: 'Dispatch Manager',
    email: 'dinesh.dispatch@sahebpaper.com',
    phone: '+91 98250 56789',
    status: 'active',
    allowedModules: ['dashboard', 'pending-order', 'finish-stock', 'dispatch']
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'seed-log-101',
    type: 'login',
    userId: 'usr-1',
    userName: 'Rajesh Sharma',
    workerId: 'EMP-001',
    roleName: 'Admin / Management',
    action: 'Worker Rajesh Sharma (EMP-001) logged in to Admin / Management session',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isoDate: getDateStr(0),
    formattedTime: `09:50 AM (${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-102',
    type: 'password_change',
    userId: 'usr-2',
    userName: 'Suresh Patel',
    workerId: 'EMP-002',
    roleName: 'Pulp Mill Operator',
    action: 'Admin approved password reset request for Suresh Patel (EMP-002)',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    isoDate: getDateStr(0),
    formattedTime: `08:45 AM (${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-103',
    type: 'login',
    userId: 'usr-2',
    userName: 'Suresh Patel',
    workerId: 'EMP-002',
    roleName: 'Pulp Mill Operator',
    action: 'Worker Suresh Patel (EMP-002) logged in to Pulp Mill Operator session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    isoDate: getDateStr(-1),
    formattedTime: `08:30 AM (${new Date(Date.now() - 86400000).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-104',
    type: 'login',
    userId: 'usr-3',
    userName: 'Amit Verma',
    workerId: 'EMP-003',
    roleName: 'Machine Operator',
    action: 'Worker Amit Verma (EMP-003) logged in to Machine Operator session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    isoDate: getDateStr(-1),
    formattedTime: `09:15 AM (${new Date(Date.now() - 86400000).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-105',
    type: 'permission_change',
    userId: 'usr-4',
    userName: 'Vikram Singh',
    workerId: 'EMP-004',
    roleName: 'Store Keeper',
    action: 'Updated profile details & permissions for worker Vikram Singh (EMP-004)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    isoDate: getDateStr(-1),
    formattedTime: `11:00 AM (${new Date(Date.now() - 86400000).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-106',
    type: 'login',
    userId: 'usr-5',
    userName: 'Dinesh Kumar',
    workerId: 'EMP-005',
    roleName: 'Dispatch Manager',
    action: 'Worker Dinesh Kumar (EMP-005) logged in to Dispatch Manager session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    isoDate: getDateStr(-2),
    formattedTime: `08:15 AM (${new Date(Date.now() - 86400000 * 2).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-107',
    type: 'password_change',
    userId: 'usr-3',
    userName: 'Amit Verma',
    workerId: 'EMP-003',
    roleName: 'Machine Operator',
    action: 'Admin updated password for Amit Verma (EMP-003)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
    isoDate: getDateStr(-2),
    formattedTime: `02:30 PM (${new Date(Date.now() - 86400000 * 2).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-108',
    type: 'login',
    userId: 'usr-1',
    userName: 'Rajesh Sharma',
    workerId: 'EMP-001',
    roleName: 'Admin / Management',
    action: 'Worker Rajesh Sharma (EMP-001) logged in to Admin / Management session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(),
    isoDate: getDateStr(-3),
    formattedTime: `09:00 AM (${new Date(Date.now() - 86400000 * 3).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-109',
    type: 'login',
    userId: 'usr-4',
    userName: 'Vikram Singh',
    workerId: 'EMP-004',
    roleName: 'Store Keeper',
    action: 'Worker Vikram Singh (EMP-004) logged in to Store Keeper session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 76).toISOString(),
    isoDate: getDateStr(-3),
    formattedTime: `10:45 AM (${new Date(Date.now() - 86400000 * 3).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-110',
    type: 'login',
    userId: 'usr-2',
    userName: 'Suresh Patel',
    workerId: 'EMP-002',
    roleName: 'Pulp Mill Operator',
    action: 'Worker Suresh Patel (EMP-002) logged in to Pulp Mill Operator session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 122).toISOString(),
    isoDate: getDateStr(-5),
    formattedTime: `08:00 AM (${new Date(Date.now() - 86400000 * 5).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-111',
    type: 'permission_change',
    userId: 'usr-5',
    userName: 'Dinesh Kumar',
    workerId: 'EMP-005',
    roleName: 'Dispatch Manager',
    action: 'Updated profile details & permissions for worker Dinesh Kumar (EMP-005)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 170).toISOString(),
    isoDate: getDateStr(-7),
    formattedTime: `04:15 PM (${new Date(Date.now() - 86400000 * 7).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  },
  {
    id: 'seed-log-112',
    type: 'login',
    userId: 'usr-1',
    userName: 'Rajesh Sharma',
    workerId: 'EMP-001',
    roleName: 'Admin / Management',
    action: 'Worker Rajesh Sharma (EMP-001) logged in to Admin / Management session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 242).toISOString(),
    isoDate: getDateStr(-10),
    formattedTime: `09:30 AM (${new Date(Date.now() - 86400000 * 10).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
  }
];


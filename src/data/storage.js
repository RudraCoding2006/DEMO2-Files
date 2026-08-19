import { RAW_MATERIALS } from './masterData';
import {
  INITIAL_RAW_MATERIAL_STOCKS,
  INITIAL_INWARD_ENTRIES,
  INITIAL_PULP_MILL_FORMULAS,
  INITIAL_MACHINE_LOGS,
  INITIAL_REWINDER_REELS,
  INITIAL_BOILER_LOGS,
  INITIAL_ETP_LOGS,
  INITIAL_ELECTRICITY_LOGS,
  INITIAL_PENDING_ORDERS,
  INITIAL_DISPATCHES,
  INITIAL_STORE_ITEMS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  getDateStr
} from './initialSeedData';
import { recalculateDailyDeductions } from '../engine/productionEngine';
import { syncStateToSupabase } from '../lib/supabaseSyncEngine';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'SAHEB_PAPER_DEMO2_STATE_LIVE_V14';
const FALLBACK_KEYS = [
  'SAHEB_PAPER_DEMO2_STATE_LIVE_V14',
  'SAHEB_PAPER_DEMO2_STATE_LIVE_V13',
  'SAHEB_PAPER_DEMO2_STATE_LIVE_V12',
  'SAHEB_PAPER_DEMO2_STATE_LIVE_V11',
  'SAHEB_PAPER_DEMO2_STATE_LIVE_V10',
  'SAHEB_PAPER_DEMO2_STATE_LIVE_V9',
  'SAHEB_PAPER_DEMO2_STATE_LIVE_V8',
  'SAHEB_PAPER_DEMO2_STATE_LIVE_V7',
  'SAHEB_PAPER_DEMO2_STATE_LIVE_V6',
  'SAHEB_PAPER_DEMO2_STATE_LIVE_V5',
  'SAHEB_PAPER_DEMO2_STATE_LIVE'
];

const sanitizeSizes = (stateObj) => {
  if (!stateObj) return stateObj;
  const cleanSize = (s) => {
    if (!s) return s;
    const str = String(s).trim();
    const match = str.match(/^(\d+)\s*x\s*\d+\s*(cm|mm)?$/i);
    if (match) {
      const unit = match[2] ? match[2].toLowerCase() : 'cm';
      return `${match[1]}${unit}`;
    }
    return str;
  };

  if (Array.isArray(stateObj.rewinderReels)) {
    stateObj.rewinderReels.forEach(r => { if (r.size) r.size = cleanSize(r.size); });
  }
  if (Array.isArray(stateObj.pendingOrders)) {
    stateObj.pendingOrders.forEach(o => { if (o.size) o.size = cleanSize(o.size); });
  }
  if (Array.isArray(stateObj.dispatches)) {
    stateObj.dispatches.forEach(d => { if (d.size) d.size = cleanSize(d.size); });
  }
  return stateObj;
};

const getInitialState = () => ({
  isAuthenticated: true,
  activeRole: 'admin',
  activeUserId: 'usr-1',
  timeRange: 'week',
  theme: 'dark',
  users: JSON.parse(JSON.stringify(INITIAL_USERS)),
  selectedDate: getDateStr(0),
  rawMaterialStocks: { ...INITIAL_RAW_MATERIAL_STOCKS },
  inwardEntries: [...INITIAL_INWARD_ENTRIES],
  pulpMillLogs: JSON.parse(JSON.stringify(INITIAL_PULP_MILL_FORMULAS)),
  machineLogs: JSON.parse(JSON.stringify(INITIAL_MACHINE_LOGS)),
  rewinderReels: [...INITIAL_REWINDER_REELS],
  boilerLogs: JSON.parse(JSON.stringify(INITIAL_BOILER_LOGS)),
  etpLogs: JSON.parse(JSON.stringify(INITIAL_ETP_LOGS)),
  electricityLogs: JSON.parse(JSON.stringify(INITIAL_ELECTRICITY_LOGS)),
  pendingOrders: [...INITIAL_PENDING_ORDERS],
  dispatches: [...INITIAL_DISPATCHES],
  storeItems: [...INITIAL_STORE_ITEMS],
  dailyDeductions: {},
  stockTransactions: [],
  notifications: [],
  auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS))
});

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
    if (!this.state.lastModified) {
      this.state.lastModified = Date.now();
    }
    this.initAutomation();

    // Sync theme to DOM immediately on store initialization
    this.setTheme(this.state.theme || 'dark');

    // Immediately persist loaded state to disk and server so refresh never loses entries
    this.saveState();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          this.syncFromLocalStorage(event.newValue);
        }
      });

      // Background polling loop (1s) to guarantee real-time cross-tab and cross-device sync
      setInterval(() => {
        this.syncFromLocalStorage();
        this.syncNetworkState();
      }, 1000);
    }
  }

  syncFromLocalStorage(rawString = null) {
    if (typeof window === 'undefined') return;
    try {
      const saved = rawString || localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const externalState = JSON.parse(saved);
      if (!externalState) return;

      const currentLastMod = Number(this.state.lastModified || 0);
      const externalLastMod = Number(externalState.lastModified || 0);

      // ONLY sync from localStorage IF external state timestamp is strictly newer!
      if (externalLastMod > currentLastMod) {
        const externalReqs = externalState.passwordResetRequests || [];
        const currentReqs = this.state.passwordResetRequests || [];

        let hasNewReset = externalReqs.length > currentReqs.length ||
          externalReqs.some(ext => {
            const matched = currentReqs.find(c => c.id === ext.id);
            return !matched || matched.status !== ext.status;
          });

        const currentTabActiveUserId = this.state.activeUserId;
        const currentTabActiveRole = this.state.activeRole;
        const currentTabIsAuthenticated = this.state.isAuthenticated;

        this.state = {
          ...this.state,
          ...externalState,
          activeUserId: currentTabActiveUserId,
          activeRole: currentTabActiveRole,
          isAuthenticated: currentTabIsAuthenticated
        };

        if (hasNewReset && currentTabActiveRole === 'admin') {
          const pendingReq = externalReqs.find(r => r.status === 'pending');
          if (pendingReq) {
            this.showToast({
              title: `🔑 Password reset approval required for ${pendingReq.userName} (${pendingReq.workerId})`,
              type: 'info'
            });
          }
        }

        this.notify();
      }
    } catch (e) {
      // Catch sync errors silently
    }
  }

  loadState() {
    try {
      let saved = null;
      for (const k of FALLBACK_KEYS) {
        const val = localStorage.getItem(k);
        if (val) {
          saved = val;
          break;
        }
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Always default selectedDate to TODAY'S real live date so the demo automatically updates day by day!
        const todayStr = getDateStr(0);
        let validDate = todayStr;

        let validRange = 'today';

        const mergedAuditLogs = (parsed.auditLogs && Array.isArray(parsed.auditLogs) && parsed.auditLogs.length > 0)
          ? parsed.auditLogs
          : getInitialState().auditLogs;

        const savedReels = (parsed.rewinderReels && Array.isArray(parsed.rewinderReels)) ? parsed.rewinderReels : [];
        const reelMap = new Map();
        savedReels.forEach(r => { if (r && (r.id || r.reelNo)) reelMap.set(r.id || r.reelNo, r); });
        INITIAL_REWINDER_REELS.forEach(r => {
          if (r && (r.id || r.reelNo) && !reelMap.has(r.id || r.reelNo)) {
            reelMap.set(r.id || r.reelNo, r);
          }
        });
        const mergedReels = Array.from(reelMap.values());

        const seedUserIds = new Set(INITIAL_USERS.map(u => u.id));
        const savedUsers = (parsed.users && Array.isArray(parsed.users))
          ? parsed.users.filter(u => seedUserIds.has(u.id))
          : [];
        const userMap = new Map();
        savedUsers.forEach(u => { if (u && u.id) userMap.set(u.id, u); });
        INITIAL_USERS.forEach(seedUser => {
          const existing = userMap.get(seedUser.id);
          if (existing) {
            userMap.set(seedUser.id, {
              ...existing,
              name: seedUser.name,
              roleId: seedUser.roleId === 'machine' ? 'plant_manager' : seedUser.roleId,
              roleName: seedUser.roleName === 'Machine Operator' ? 'Plant Manager' : seedUser.roleName,
              workerId: seedUser.workerId,
              username: seedUser.username
            });
          } else {
            userMap.set(seedUser.id, seedUser);
          }
        });
        const mergedUsers = Array.from(userMap.values());

        const rawOrders = (parsed.pendingOrders && Array.isArray(parsed.pendingOrders) && parsed.pendingOrders.length > 0)
          ? parsed.pendingOrders
          : getInitialState().pendingOrders;

        const orderMap = new Map();
        (rawOrders || []).forEach((o, idx) => {
          if (!o) return;
          const dt = o.orderDate || o.date || validDate;
          const dateTag = (dt || '').replace(/-/g, '') || '20260819';
          let cleanId = o.id;
          if (!cleanId || !cleanId.startsWith('PEND_ORDER')) {
            cleanId = `PEND_ORDER${dateTag}-001`;
          }
          const cleanItem = {
            ...o,
            id: cleanId,
            orderDate: dt
          };
          const key = cleanId.endsWith('-001') ? `${cleanId}_${o.party}_${o.productName}` : cleanId;
          if (!orderMap.has(key)) {
            orderMap.set(key, cleanItem);
          }
        });
        const mergedPendingOrders = Array.from(orderMap.values());

        return sanitizeSizes({
          ...getInitialState(),
          ...parsed,
          pendingOrders: mergedPendingOrders,
          rewinderReels: mergedReels,
          auditLogs: mergedAuditLogs,
          selectedDate: validDate,
          timeRange: validRange,
          users: mergedUsers
        });
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
    return sanitizeSizes(getInitialState());
  }

  syncMasterLogs() {
    try {
      const diskSaved = localStorage.getItem(STORAGE_KEY);
      const logMap = new Map();

      // 1. Add baseline 30-day initial seed logs
      (INITIAL_AUDIT_LOGS || []).forEach(log => {
        if (log && log.id) logMap.set(log.id, log);
      });

      // 2. Add disk logs (disk master records)
      if (diskSaved) {
        try {
          const diskParsed = JSON.parse(diskSaved);
          if (diskParsed && Array.isArray(diskParsed.auditLogs)) {
            diskParsed.auditLogs.forEach(log => {
              if (log && log.id) logMap.set(log.id, log);
            });
          }
        } catch (e) {}
      }

      // 3. Add current in-memory logs (newly generated events)
      (this.state?.auditLogs || []).forEach(log => {
        if (log && log.id) {
          logMap.set(log.id, log);
        }
      });

      // 4. Sort chronologically descending
      const masterLogs = Array.from(logMap.values()).sort((a, b) => {
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      });

      this.state.auditLogs = masterLogs;
    } catch (e) {
      console.warn('Failed to sync master logs', e);
    }
  }

  saveState() {
    try {
      this.syncMasterLogs();
      this.state.lastModified = Date.now();
      const payload = JSON.stringify(this.state);
      localStorage.setItem(STORAGE_KEY, payload);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
        if (window.fetch) {
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
          }).catch(() => {});
        }
        // Direct background sync to Supabase
        syncStateToSupabase(this.state).catch((err) => {
          console.warn('Supabase Background Sync Warning:', err);
        });
      }
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  async syncNetworkState() {
    if (typeof window === 'undefined' || !window.fetch) return;
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) return;
      const networkState = await res.json();
      if (!networkState || typeof networkState !== 'object') return;

      const currentLastMod = Number(this.state.lastModified || 0);
      const serverLastMod = Number(networkState.lastModified || 0);

      // ONLY overwrite local state IF server state has a STRICTLY NEWER timestamp!
      if (serverLastMod > currentLastMod) {
        const currentTabActiveUserId = this.state.activeUserId;
        const currentTabActiveRole = this.state.activeRole;
        const currentTabIsAuthenticated = this.state.isAuthenticated;

        const externalReqs = networkState.passwordResetRequests || [];
        const currentReqs = this.state.passwordResetRequests || [];
        let hasNewReset = externalReqs.length > currentReqs.length ||
          externalReqs.some(ext => {
            const matched = currentReqs.find(c => c.id === ext.id);
            return !matched || matched.status !== ext.status;
          });

        this.state = {
          ...this.state,
          ...networkState,
          activeUserId: currentTabActiveUserId,
          activeRole: currentTabActiveRole,
          isAuthenticated: currentTabIsAuthenticated
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));

        if (hasNewReset && currentTabActiveRole === 'admin') {
          const pendingReq = externalReqs.find(r => r.status === 'pending');
          if (pendingReq) {
            this.showToast({
              title: `🔑 Password reset approval required for ${pendingReq.userName} (${pendingReq.workerId})`,
              type: 'info'
            });
          }
        }

        this.notify();
      } else if (currentLastMod > serverLastMod || serverLastMod === 0) {
        // Push fresher local state to server if server is lagging or uninitialized
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.state),
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {
      // Catch sync errors silently
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  getState() {
    return this.state;
  }

  getTheme() {
    return this.state.theme || 'dark';
  }

  setTheme(theme) {
    const validTheme = theme === 'light' ? 'light' : 'dark';
    this.state.theme = validTheme;
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.className = validTheme;
        document.body.className = validTheme === 'light' ? 'light-mode light' : 'dark-mode dark';
      }
    } catch (e) {}
    this.saveState();
  }

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  resetDemoData() {
    this.state = getInitialState();
    this.initAutomation();
    this.saveState();
  }

  initAutomation() {
    // Run initial calculation recalculations across all dates in seed history
    const dates = new Set([
      ...Object.keys(this.state.pulpMillLogs || {}),
      ...Object.keys(this.state.machineLogs || {})
    ]);
    dates.forEach(d => {
      this.state = recalculateDailyDeductions(d, this.state);
    });
  }

  // Setters & Actions
  setActiveRole(roleId) {
    this.state.activeRole = roleId;
    this.saveState();
  }

  setSelectedDate(dateStr) {
    this.state.selectedDate = dateStr;
    this.saveState();
  }

  setTimeRange(timeRange) {
    this.state.timeRange = timeRange;
    this.saveState();
  }

  isReadOnlyUser() {
    const activeUser = (this.state.users || []).find(u => u.id === this.state.activeUserId);
    return this.state.activeRole === 'guest_viewer' || activeUser?.isReadOnly === true || activeUser?.roleId === 'guest_viewer';
  }

  // Rule 1: Inward Entry
  addInwardEntry(entry) {
    if (this.isReadOnlyUser()) {
      this.showToast({
        title: '🔒 Read-Only Guest Mode: Action restricted. Guest cannot add or edit stock data.',
        type: 'alert'
      });
      return;
    }
    const newEntry = {
      id: `inw-${Date.now()}`,
      date: entry.date || this.state.selectedDate,
      ...entry
    };
    this.state.inwardEntries.unshift(newEntry);
    
    // Direct stock addition (Rule 1)
    const itemId = entry.itemId;
    this.state.rawMaterialStocks[itemId] = (this.state.rawMaterialStocks[itemId] || 0) + Number(entry.quantity);
    
    this.addNotification(`Inward stock added: +${entry.quantity} ${entry.unit} for ${entry.itemName}`);
    this.saveState();
  }

  // Pulp Mill Formula & Chemical Rates (Rule 2 & 3 trigger)
  savePulpMillLog(date, wastePaperMix, chemicalRates, downtimeLog) {
    if (this.isReadOnlyUser()) {
      this.showToast({ title: '🔒 Read-Only Guest Mode: Cannot save or edit Pulp Mill logs.', type: 'alert' });
      return;
    }
    if (!this.state.pulpMillLogs[date]) {
      this.state.pulpMillLogs[date] = { wastePaperMix: {}, chemicalRates: {}, downtimeLogs: [] };
    }
    this.state.pulpMillLogs[date].wastePaperMix = wastePaperMix;
    this.state.pulpMillLogs[date].chemicalRates = chemicalRates;
    if (downtimeLog) {
      this.state.pulpMillLogs[date].downtimeLogs.push({ id: `pm-dt-${Date.now()}`, ...downtimeLog });
    }

    // Trigger Rule 2 & 3 calculation engine
    this.state = recalculateDailyDeductions(date, this.state);
    this.saveState();
  }

  // Machine Roll Entry (Rule 4, 2, 3 trigger)
  addMachineRoll(date, rollData) {
    if (this.isReadOnlyUser()) {
      this.showToast({ title: '🔒 Read-Only Guest Mode: Cannot add machine rolls.', type: 'alert' });
      return;
    }
    if (!this.state.machineLogs[date]) {
      this.state.machineLogs[date] = { rolls: [], chemicalRates: {}, runningTime: { startTime: '06:00', offTime: '22:00', downtimes: [] } };
    }
    const newRoll = {
      id: `roll-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...rollData
    };
    this.state.machineLogs[date].rolls.push(newRoll);

    // Trigger Rule 2 & 3 calculation engine
    this.state = recalculateDailyDeductions(date, this.state);
    this.addNotification(`Machine roll ${rollData.rollNo} saved (${rollData.weightKg} kg). Raw material stock updated!`);
    this.saveState();
  }

  saveMachineRatesAndRunningTime(date, chemicalRates, runningTimeData) {
    if (!this.state.machineLogs[date]) {
      this.state.machineLogs[date] = { rolls: [], chemicalRates: {}, runningTime: {} };
    }
    this.state.machineLogs[date].chemicalRates = chemicalRates;
    if (runningTimeData) {
      this.state.machineLogs[date].runningTime = runningTimeData;
    }

    // Trigger Rule 2 & 3 calculation engine
    this.state = recalculateDailyDeductions(date, this.state);
    this.saveState();
  }

  deleteMachineRoll(date, rollId) {
    if (this.state.machineLogs[date]) {
      this.state.machineLogs[date].rolls = this.state.machineLogs[date].rolls.filter(r => r.id !== rollId);
      this.state = recalculateDailyDeductions(date, this.state);
      this.saveState();
    }
  }

  // Rule 6: Rewinder Reel & Broke Return
  addRewinderReel(reelData) {
    const newReel = {
      id: `reel-${Date.now()}`,
      date: reelData.date || this.state.selectedDate,
      ...reelData
    };
    this.state.rewinderReels.unshift(newReel);

    // Auto Broke Return to Raw Material > Waste Paper > Broke (Rule 6)
    if (Number(reelData.brokeKg) > 0) {
      const brokeItem = RAW_MATERIALS.find(m => m.name === 'Broke');
      if (brokeItem) {
        this.state.rawMaterialStocks[brokeItem.id] = (this.state.rawMaterialStocks[brokeItem.id] || 0) + Number(reelData.brokeKg);
        this.addNotification(`Broke loop-back: +${reelData.brokeKg} kg returned to Raw Material > Broke!`);
      }
    }

    this.saveState();
  }

  // Rule 7: Boiler Log & Wood Deduction
  saveBoilerLog(date, logData) {
    const prevWood = Number(this.state.boilerLogs[date]?.woodConsumptionKg || 0);
    const newWood = Number(logData.woodConsumptionKg || 0);
    const deltaWood = newWood - prevWood;

    this.state.boilerLogs[date] = logData;

    // Deduct Wood from Firewood Stock (Rule 7)
    if (deltaWood !== 0) {
      const woodItem = RAW_MATERIALS.find(m => m.name === (logData.woodType || 'Wood'));
      if (woodItem) {
        this.state.rawMaterialStocks[woodItem.id] = (this.state.rawMaterialStocks[woodItem.id] || 0) - deltaWood;
      }
    }
    this.saveState();
  }

  // Rule 8: ETP Log & Chemical Deduction
  saveEtpLog(date, etpData) {
    const prevLiq = Number(this.state.etpLogs[date]?.flockLiquidLtr || 0);
    const prevSolid = Number(this.state.etpLogs[date]?.flockMasterKg || 0);

    const newLiq = Number(etpData.flockLiquidLtr || 0);
    const newSolid = Number(etpData.flockMasterKg || 0);

    const deltaLiq = newLiq - prevLiq;
    const deltaSolid = newSolid - prevSolid;

    this.state.etpLogs[date] = etpData;

    const liqItem = RAW_MATERIALS.find(m => m.name.includes('Flock 100'));
    const solidItem = RAW_MATERIALS.find(m => m.name.includes('Flock Master'));

    if (liqItem && deltaLiq !== 0) {
      this.state.rawMaterialStocks[liqItem.id] = (this.state.rawMaterialStocks[liqItem.id] || 0) - deltaLiq;
    }
    if (solidItem && deltaSolid !== 0) {
      this.state.rawMaterialStocks[solidItem.id] = (this.state.rawMaterialStocks[solidItem.id] || 0) - deltaSolid;
    }

    this.saveState();
  }

  // Rule 9: Electricity Log
  saveElectricityLog(date, logData) {
    this.state.electricityLogs[date] = logData;
    this.saveState();
  }

  // Rule 12: Dispatch & Finish Stock Deduction
  addDispatch(dispatchData) {
    const newDisp = {
      id: `disp-${Date.now()}`,
      dispatchNo: `DSP-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: dispatchData.date || this.state.selectedDate,
      ...dispatchData
    };
    this.state.dispatches.unshift(newDisp);

    this.addNotification(`Dispatch ${newDisp.dispatchNo} confirmed! Finish Stock updated.`);
    this.saveState();
  }

  // Pending Order Actions
  addPendingOrder(orderData) {
    const targetDate = orderData.orderDate || this.state.selectedDate || new Date().toISOString().split('T')[0];
    const dateTag = targetDate.replace(/-/g, '');
    const prefix = `PEND_ORDER${dateTag}-`;
    const sameDayOrders = (this.state.pendingOrders || []).filter(o => {
      const d = (o.orderDate || o.date || '').replace(/-/g, '');
      return d === dateTag || (o.id && o.id.startsWith(prefix));
    });
    const nextSeq = sameDayOrders.length + 1;
    const newId = `${prefix}${String(nextSeq).padStart(3, '0')}`;

    const newOrder = {
      id: newId,
      orderDate: targetDate,
      status: 'pending',
      ...orderData
    };
    this.state.pendingOrders.unshift(newOrder);
    this.saveState();

    // Instant direct push to Supabase (under 50ms!)
    if (supabase) {
      supabase.from('pending_orders').upsert([{
        id: newOrder.id,
        date: newOrder.orderDate,
        party: newOrder.party || 'Default Party',
        product_name: newOrder.productName || 'Napkin Tissue',
        gsm: Number(newOrder.gsm || 16),
        size: newOrder.size || '30cm',
        ply: Number(newOrder.ply || 1),
        quantity_kg: Number(newOrder.quantityKg || 0),
        dispatched_kg: Number(newOrder.dispatchedKg || 0),
        status: 'pending'
      }], { onConflict: 'id' }).then(({ data, error }) => {
        if (error) console.error('❌ Instant Order Supabase Error:', error);
        else console.log('✅ Instant Order Pushed to Supabase:', newOrder.id);
      }).catch(err => console.error('Instant Order Catch Error:', err));
    }
  }

  // Store Spares Actions (Rule 13)
  addStoreItem(itemData) {
    const newItem = {
      id: `st-custom-${Date.now()}`,
      ...itemData
    };
    this.state.storeItems.push(newItem);
    this.saveState();
  }

  addNotification(message) {
    const now = new Date();
    const arrivalTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
    const notif = {
      id: `notif-${Date.now()}`,
      message,
      time: arrivalTime
    };
    if (!this.state.notifications) this.state.notifications = [];
    this.state.notifications.unshift(notif);
    if (this.state.notifications.length > 20) this.state.notifications.pop();
    this.showToast({ title: message });
  }

  showToast(toastData) {
    this.state.activeToast = {
      id: `toast-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...toastData
    };
    this.notify();
  }

  hideToast() {
    this.state.activeToast = null;
    this.saveState();
  }

  clearNotifications() {
    this.state.notifications = [];
    this.saveState();
  }

  // User Management Methods
  logSecurityEvent({ type, userId, userName, workerId, roleName, action }) {
    this.syncMasterLogs();

    if (!this.state.auditLogs) {
      this.state.auditLogs = [];
    }
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';

    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type, // 'login' | 'password_change' | 'permission_change' | 'user_created' | 'user_deleted'
      userId: userId || 'unknown',
      userName: userName || 'Worker',
      workerId: workerId || 'N/A',
      roleName: roleName || 'Operator',
      action,
      timestamp: now.toISOString(),
      isoDate: now.toISOString().split('T')[0],
      formattedTime
    };

    this.state.auditLogs.unshift(newLog);

    if (this.state.auditLogs.length > 250) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 250);
    }

    if (!this.state.notifications) this.state.notifications = [];
    const notifPrefix = type === 'password_change' ? '🔑' : type === 'login' ? '🔔' : '🛡️';
    this.state.notifications.unshift({
      id: `notif-${Date.now()}`,
      message: `${notifPrefix} ${action}`,
      time: formattedTime
    });

    this.saveState();
  }

  // Password Reset Approval & Recovery Workflow
  requestPasswordReset(workerId, silent = false) {
    if (!this.state.passwordResetRequests) {
      this.state.passwordResetRequests = [];
    }
    const user = (this.state.users || []).find(u => u.id === workerId || u.workerId === workerId);
    if (!user) return null;

    // Check if pending request exists
    let existing = this.state.passwordResetRequests.find(r => r.userId === user.id && r.status !== 'completed');
    if (existing) {
      if (!silent && this.state.activeRole !== 'admin') {
        this.showToast({ title: `Reset request for ${user.name} is already pending Admin approval`, type: 'info' });
      }
      return existing;
    }

    const newReq = {
      id: `req-${Date.now()}`,
      userId: user.id,
      workerId: user.workerId,
      userName: user.name,
      roleName: user.roleName,
      status: 'pending', // 'pending' | 'approved' | 'completed'
      requestedAt: new Date().toISOString()
    };

    this.state.passwordResetRequests.unshift(newReq);

    this.logSecurityEvent({
      type: 'password_change',
      userId: user.id,
      userName: user.name,
      workerId: user.workerId,
      roleName: user.roleName,
      action: `Password reset request submitted by ${user.name} (${user.workerId})`
    });

    this.saveState();
    return newReq;
  }

  approvePasswordReset(requestId) {
    if (!this.state.passwordResetRequests) return;
    const req = this.state.passwordResetRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'approved';
      req.approvedAt = new Date().toISOString();

      this.logSecurityEvent({
        type: 'password_change',
        userId: req.userId,
        userName: req.userName,
        workerId: req.workerId,
        roleName: req.roleName,
        action: `✅ Admin approved password reset request for ${req.userName} (${req.workerId})`
      });

      this.showToast({
        title: `Approved password reset for ${req.userName}`,
        type: 'success'
      });

      this.saveState();
    }
  }

  completePasswordReset(requestId, newPassword) {
    if (!this.state.passwordResetRequests) return false;
    const req = this.state.passwordResetRequests.find(r => r.id === requestId);
    if (!req) return false;

    const user = (this.state.users || []).find(u => u.id === req.userId);
    if (user) {
      user.password = newPassword;
      req.status = 'completed';
      req.completedAt = new Date().toISOString();

      this.logSecurityEvent({
        type: 'password_change',
        userId: user.id,
        userName: user.name,
        workerId: user.workerId,
        roleName: user.roleName,
        action: `🔑 Worker ${user.name} (${user.workerId}) reset account password to new password`
      });

      this.showToast({
        title: `Password updated successfully for ${user.name}!`,
        type: 'success'
      });

      this.saveState();
      return true;
    }
    return false;
  }

  addUser(userData) {
    if (!this.state.users) this.state.users = [];
    const newUser = {
      id: `usr-${Date.now()}`,
      workerId: userData.workerId || `EMP-00${this.state.users.length + 1}`,
      name: userData.name,
      username: userData.username,
      password: userData.password,
      roleId: userData.roleId || 'plant_manager',
      roleName: userData.roleName || 'Plant Manager',
      email: userData.email || '',
      phone: userData.phone || '',
      status: userData.status || 'active',
      allowedModules: userData.allowedModules || ['dashboard']
    };
    this.state.users.push(newUser);
    this.logSecurityEvent({
      type: 'user_created',
      userId: newUser.id,
      userName: newUser.name,
      workerId: newUser.workerId,
      roleName: newUser.roleName,
      action: `Created new worker account: ${newUser.name} (${newUser.workerId})`
    });
    this.showToast({
      title: `“${newUser.name}” account created`,
      actionText: 'View profile'
    });
    this.saveState();
  }

  updateUser(userId, updatedData) {
    if (!this.state.users) return;
    const index = this.state.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const prevUser = { ...this.state.users[index] };
      const isPasswordChanged = updatedData.password && updatedData.password !== prevUser.password;

      this.state.users[index] = {
        ...this.state.users[index],
        ...updatedData
      };

      const targetUser = this.state.users[index];

      if (isPasswordChanged) {
        const isAdminActor = this.state.activeRole === 'admin' || this.state.activeUserId === 'usr-1';
        this.logSecurityEvent({
          type: 'password_change',
          userId: targetUser.id,
          userName: targetUser.name,
          workerId: targetUser.workerId,
          roleName: targetUser.roleName,
          action: isAdminActor
            ? `Admin updated password for ${targetUser.name} (${targetUser.workerId})`
            : `Worker ${targetUser.name} (${targetUser.workerId}) updated password`
        });
      } else {
        this.logSecurityEvent({
          type: 'permission_change',
          userId: targetUser.id,
          userName: targetUser.name,
          workerId: targetUser.workerId,
          roleName: targetUser.roleName,
          action: `Updated profile details & permissions for worker ${targetUser.name} (${targetUser.workerId})`
        });
      }

      this.showToast({
        title: `“${targetUser.name}” details updated`,
        actionText: 'View profile'
      });
      this.saveState();
    }
  }

  deleteUser(userId) {
    if (!this.state.users) return;
    const target = this.state.users.find(u => u.id === userId);
    this.state.users = this.state.users.filter(u => u.id !== userId);
    if (target) {
      this.logSecurityEvent({
        type: 'user_deleted',
        userId: target.id,
        userName: target.name,
        workerId: target.workerId,
        roleName: target.roleName,
        action: `Removed worker account ${target.name} (${target.workerId})`
      });
      this.showToast({
        title: `“${target.name}” user deleted`,
        type: 'alert'
      });
    }
    this.saveState();
  }

  setActiveUser(userId) {
    const user = (this.state.users || []).find(u => u.id === userId);
    if (user) {
      this.state.activeUserId = user.id;
      this.state.activeRole = user.roleId;
      this.logSecurityEvent({
        type: 'login',
        userId: user.id,
        userName: user.name,
        workerId: user.workerId,
        roleName: user.roleName,
        action: `Switched active session to worker ${user.name} (${user.workerId})`
      });
      this.saveState();
    }
  }

  login(username, password) {
    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!this.state.users || this.state.users.length === 0) {
      this.state.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    }

    let user = (this.state.users || []).find(
      u => (u.username || '').trim().toLowerCase() === cleanUsername || (u.workerId || '').trim().toLowerCase() === cleanUsername
    );

    // Default admin fallback
    if (!user && (cleanUsername === 'admin' || cleanUsername === 'emp-001')) {
      user = INITIAL_USERS[0];
    }

    if (!user) {
      this.showToast({
        title: `Worker account "${username}" not found.`,
        type: 'alert'
      });
      return false;
    }

    // Strict Password Match Verification
    if (cleanPassword !== user.password) {
      this.showToast({
        title: `Incorrect password for ${user.name} (${user.workerId})`,
        type: 'alert'
      });
      return false;
    }

    this.state.activeUserId = user.id;
    this.state.activeRole = user.roleId;
    this.state.isAuthenticated = true;
    
    this.logSecurityEvent({
      type: 'login',
      userId: user.id,
      userName: user.name,
      workerId: user.workerId,
      roleName: user.roleName,
      action: `Worker ${user.name} (${user.workerId}) logged in to ${user.roleName} session`
    });

    this.showToast({
      title: `Welcome back, ${user.name}! (${user.roleName})`,
      actionText: 'View profile'
    });
    this.saveState();
    return true;
  }

  logout() {
    this.syncMasterLogs();
    this.state.isAuthenticated = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }
}

export const store = new Store();

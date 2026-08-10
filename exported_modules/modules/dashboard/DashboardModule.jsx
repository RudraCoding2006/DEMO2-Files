import React, { useState, useMemo } from 'react';
import { store } from '../../data/storage';
import { StatCard } from '../../components/common/StatCard';
import { RAW_MATERIALS, PRODUCTS } from '../../data/masterData';
import { formatKgOrTon, formatKgOrTonForRange, formatNumber, formatDateDisplay } from '../../utils/formatters';
import { calculateMachineRunningHours } from '../../engine/productionEngine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, ComposedChart, ReferenceArea, ReferenceDot, LabelList } from 'recharts';
import { Cog, Boxes, Truck, Activity, Zap, AlertTriangle, Gauge, Clock, Search, PackageCheck, Tag, X, ChevronLeft, ChevronRight, CheckCircle2, RotateCw, ClipboardList, Lock, ShieldCheck, UserCheck, KeyRound, Calendar } from 'lucide-react';
import { AuditLogsModal } from '../../components/modals/AuditLogsModal';

// Ultra-sleek Compact Dark Navy Tooltip Card
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-[#12162B]/95 backdrop-blur-md border border-[#5B4FE9]/40 rounded-2xl px-4 py-3 shadow-[0_12px_32px_rgba(91,79,233,0.3)] text-white font-sans min-w-[155px] pointer-events-none text-center animate-popup-float animate-in fade-in zoom-in-90 duration-200">
        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-semibold mb-1.5 pb-1 border-b border-slate-800/80">
          <span className="uppercase tracking-wider">Date</span>
          <span className="text-indigo-400 font-mono font-bold">{label}</span>
        </div>
        <div className="flex items-baseline justify-center gap-1.5 my-1">
          <span className="text-2xl font-black text-white tracking-tight">
            {val}
          </span>
          <span className="text-xs font-bold text-[#7C6EF6]">Tons</span>
        </div>
        <div className="mt-1.5 text-[10px] text-slate-300 font-medium flex items-center justify-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1FCB79] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1FCB79]"></span>
          </span>
          <span>Paper Machine Production</span>
        </div>
      </div>
    );
  }
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const categoryName = item.name;
    const valueKg = item.value;
    const formattedVal = formatKgOrTon(valueKg);
    const color = item.payload?.color || '#5B4FE9';

    return (
      <div
        className="bg-[#12162B]/95 backdrop-blur-md border rounded-2xl px-4 py-3 text-white font-sans min-w-[155px] pointer-events-none text-left animate-in fade-in zoom-in-95 duration-150"
        style={{
          borderColor: `${color}60`,
          boxShadow: `0 12px 32px ${color}35`
        }}
      >
        <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-800/80">
          <span className="w-2.5 h-2.5 rounded-full shadow-xs animate-pulse" style={{ backgroundColor: color }} />
          <span className="text-xs font-extrabold text-slate-100">{categoryName}</span>
        </div>
        <div className="mt-1">
          <div className="text-[9.5px] text-slate-400 font-semibold uppercase tracking-wider">Stock On Hand</div>
          <div className="text-base font-black text-white tracking-tight">{formattedVal}</div>
        </div>
      </div>
    );
  }
  return null;
};

// Telemetry Wave Tooltip matching user solar/energy live production curve reference
const CustomWaveTelemetryTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isDowntime = data.isDowntime;

    return (
      <div className="bg-[#12162B] border border-slate-700/80 rounded-xl p-3 shadow-2xl text-white font-sans min-w-[180px] animate-in fade-in duration-100">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1 pb-1 border-b border-slate-800">
          <span>Telemetry Time</span>
          <span className="text-slate-200 font-mono font-bold">{data.time}</span>
        </div>
        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black tracking-tight ${isDowntime ? 'text-[#EF4444]' : 'text-white'}`}>
              {data.speed}
            </span>
            <span className="text-xs font-bold text-[#3B82F6]">m/min</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1">
            <span>Machine Load: <strong className="text-slate-200">{data.loadPct}%</strong></span>
            <span>Est. Tons: <strong className="text-white">{data.outputTons} T</strong></span>
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center gap-1.5 text-[10px]">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isDowntime ? 'bg-[#EF4444] animate-ping' : 'bg-[#3B82F6]'}`} />
          <span className={`font-extrabold uppercase tracking-wide ${isDowntime ? 'text-[#EF4444]' : 'text-[#3B82F6]'}`}>
            {isDowntime ? '🔴 DOWNTIME ALERT' : '⚡ MACHINE RUNNING'}
          </span>
        </div>
        {isDowntime && (
          <div className="mt-1.5 text-[9.5px] text-rose-300 font-medium bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
            ⚠ {data.cause}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const DashboardModule = ({ state, isSidebarExpanded }) => {
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [dashSearchQuery, setDashSearchQuery] = useState('');
  const [isLogRefreshing, setIsLogRefreshing] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const timeRange = state?.timeRange || 'week';
  const isAdmin = state?.activeRole === 'admin';

  const handleRefreshLogs = () => {
    setIsLogRefreshing(true);
    store.showToast({
      title: 'Security audit logs refreshed',
      actionText: 'View logs'
    });
    setTimeout(() => {
      setIsLogRefreshing(false);
    }, 400);
  };

  // Safe Date Stepping for Graph Box Header
  const stepDate = (isoDate, deltaDays = 0, deltaMonths = 0, deltaYears = 0) => {
    if (!isoDate || typeof isoDate !== 'string') isoDate = '2026-07-23';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    
    let y = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10) - 1;
    let d = parseInt(parts[2], 10);
    
    if (isNaN(y) || isNaN(m) || isNaN(d)) return '2026-07-23';

    const dt = new Date(y, m, d);
    dt.setDate(dt.getDate() + deltaDays);
    dt.setMonth(dt.getMonth() + deltaMonths);
    dt.setFullYear(dt.getFullYear() + deltaYears);
    
    const newY = dt.getFullYear();
    const newM = String(dt.getMonth() + 1).padStart(2, '0');
    const newD = String(dt.getDate()).padStart(2, '0');
    
    return `${newY}-${newM}-${newD}`;
  };

  const handlePrevDate = () => {
    let newDate;
    if (timeRange === 'year') {
      newDate = stepDate(selectedDate, 0, 0, -1);
    } else if (timeRange === 'month') {
      newDate = stepDate(selectedDate, 0, -1, 0);
    } else if (timeRange === 'week') {
      newDate = stepDate(selectedDate, -7, 0, 0);
    } else {
      newDate = stepDate(selectedDate, -1, 0, 0);
    }
    store.setSelectedDate(newDate);
  };

  const handleNextDate = () => {
    let newDate;
    if (timeRange === 'year') {
      newDate = stepDate(selectedDate, 0, 0, 1);
    } else if (timeRange === 'month') {
      newDate = stepDate(selectedDate, 0, 1, 0);
    } else if (timeRange === 'week') {
      newDate = stepDate(selectedDate, 7, 0, 0);
    } else {
      newDate = stepDate(selectedDate, 1, 0, 0);
    }
    store.setSelectedDate(newDate);
  };

  const formatDatePillDisplay = (isoDate) => {
    if (timeRange === 'all') return 'All';
    if (!isoDate) return '2026-07-23';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;

    if (timeRange === 'year') {
      return parts[0];
    }
    if (timeRange === 'month') {
      return `${parts[0]}-${parts[1]}`;
    }
    return isoDate;
  };

  const handleDateInput = (e) => {
    let val = e.target.value;
    if (timeRange === 'month' && val.length === 7) {
      val = `${val}-01`;
    }
    store.setSelectedDate(val);
  };

  // 60 FPS real-time live SVG chart resize tracking loop & hover state reset on sidebar toggle
  React.useEffect(() => {
    setHoveredBarIndex(null);
    setHoveredBarData(null);

    let animationFrameId;
    const startTime = performance.now();
    const duration = 350;

    const updateChartLive = (currentTime) => {
      const elapsed = currentTime - startTime;
      window.dispatchEvent(new Event('resize'));
      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(updateChartLive);
      }
    };

    animationFrameId = requestAnimationFrame(updateChartLive);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isSidebarExpanded]);

  // Reset tooltip hover state whenever timeframe filter changes
  React.useEffect(() => {
    setHoveredBarIndex(null);
    setHoveredBarData(null);
  }, [timeRange]);

  // Native React Mouse-Tracking State for Charts (Eliminates Recharts top-left (0,0) sliding forever!)
  const [hoveredPie, setHoveredPie] = useState(null);
  const [pieMousePos, setPieMousePos] = useState({ x: 0, y: 0 });
  const pieCardRef = React.useRef(null);

  const [hoveredBarData, setHoveredBarData] = useState(null);
  const [barMousePos, setBarMousePos] = useState({ x: 0, y: 0 });
  const barCardRef = React.useRef(null);

  // Comprehensive Search filtering logic for Dashboard
  const dashSearchResults = useMemo(() => {
    if (!dashSearchQuery.trim()) return [];
    const q = dashSearchQuery.toLowerCase().trim();
    const list = [];

    // 1. Finished Reels (RL-105, RL-521)
    (state?.rewinderReels || []).forEach(r => {
      const reelNo = (r.reelNo || '').toLowerCase();
      const prod = (r.productName || '').toLowerCase();
      const size = (r.size || '').toLowerCase();
      if (reelNo.includes(q) || prod.includes(q) || size.includes(q) || `${r.gsm}`.includes(q)) {
        list.push({
          id: `reel-${r.id || r.reelNo}`,
          type: 'REEL',
          name: r.reelNo,
          info: `${r.productName} (${r.gsm} GSM) • ${r.size} (${r.ply}P)`,
          stockText: `${r.weightKg} Kg • ${r.location || 'Finish Stock'}`,
          status: 'Finished Reel',
          statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: RotateCw
        });
      }
    });

    // 2. Dispatches (DISP-101, Truck No, Party Name)
    (state?.dispatches || []).forEach(d => {
      const receiptNo = (d.receiptNo || '').toLowerCase();
      const party = (d.partyName || '').toLowerCase();
      const vehicle = (d.vehicleNo || d.truckNo || '').toLowerCase();
      if (receiptNo.includes(q) || party.includes(q) || vehicle.includes(q)) {
        list.push({
          id: `disp-${d.id || d.receiptNo}`,
          type: 'DISPATCH',
          name: d.receiptNo,
          info: `Party: ${d.partyName} • Vehicle: ${d.vehicleNo || 'N/A'}`,
          stockText: `${d.weightKg || d.netWeight || 0} Kg Dispatched`,
          status: 'Dispatch Receipt',
          statusColor: 'bg-[#5B4FE9]/10 text-[#5B4FE9] border-[#5B4FE9]/20',
          icon: Truck
        });
      }
    });

    // 3. Machine Jumbo Rolls (M-101, M-142)
    const allDates = Object.keys(state?.machineLogs || {});
    for (const dateKey of allDates) {
      const rolls = state?.machineLogs[dateKey]?.rolls || [];
      rolls.forEach(r => {
        const rollNo = (r.rollNo || '').toLowerCase();
        const prod = (r.productName || '').toLowerCase();
        if (rollNo.includes(q) || prod.includes(q) || `${r.gsm}`.includes(q)) {
          list.push({
            id: `roll-${r.id || r.rollNo}-${dateKey}`,
            type: 'ROLL',
            name: r.rollNo,
            info: `Jumbo Roll • ${r.productName} (${r.gsm} GSM)`,
            stockText: `${r.weightKg} Kg • Width: ${r.width}cm`,
            status: 'Machine Log',
            statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: Cog
          });
        }
      });
    }

    // 4. Pending Orders (PO No, Party)
    (state?.pendingOrders || []).forEach(o => {
      const orderNo = (o.orderNo || o.id || '').toLowerCase();
      const party = (o.partyName || '').toLowerCase();
      if (orderNo.includes(q) || party.includes(q)) {
        list.push({
          id: `order-${o.id || o.orderNo}`,
          type: 'ORDER',
          name: o.orderNo || `Order for ${o.partyName}`,
          info: `Party: ${o.partyName} • ${o.productName}`,
          stockText: `${o.weightTon} Tons Required`,
          status: 'Pending Order',
          statusColor: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: ClipboardList
        });
      }
    });

    // 5. Products
    PRODUCTS.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.gsmOptions.some(g => `${g}`.includes(q))) {
        const reels = (state?.rewinderReels || []).filter(r => r.productName === p.name);
        const totalKg = reels.reduce((acc, r) => acc + (r.weightKg || 0), 0);
        list.push({
          id: `p-${p.id}`,
          type: 'PRODUCT',
          name: p.name,
          info: `${p.gsmOptions.join('/')} GSM Master`,
          stockText: `${reels.length} Reels (${formatKgOrTon(totalKg)})`,
          status: 'Product Master',
          statusColor: 'bg-indigo-50 text-[#5B4FE9]',
          icon: PackageCheck
        });
      }
    });

    // 6. Raw Materials
    RAW_MATERIALS.forEach(rm => {
      if (rm.name.toLowerCase().includes(q) || rm.category.toLowerCase().includes(q)) {
        const stock = state?.rawMaterialStock?.[rm.id] ?? (rm.minStock * 2);
        const isLow = stock < rm.minStock;
        list.push({
          id: `rm-${rm.id}`,
          type: 'MATERIAL',
          name: rm.name,
          info: `Category: ${rm.category.replace('_', ' ').toUpperCase()}`,
          stockText: `${stock.toLocaleString()} ${rm.unit}`,
          status: isLow ? 'LOW STOCK ALERT' : 'Normal Stock',
          statusColor: isLow ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600',
          icon: Boxes
        });
      }
    });

    return list.slice(0, 15);
  }, [dashSearchQuery, state.rewinderReels, state.dispatches, state.machineLogs, state.pendingOrders, state.rawMaterialStock]);

  const selectedDate = state.selectedDate;
  const safeDate = selectedDate || '2026-07-23';
  const allDateKeys = Object.keys(state.machineLogs || {}).sort();

  // Helper to filter date keys according to selected timeRange
  const getFilteredDates = () => {
    if (timeRange === 'today') {
      return [safeDate];
    }

    const selectedYear = safeDate.slice(0, 4);
    const selectedYearMonth = safeDate.slice(0, 7);

    if (timeRange === 'week') {
      // Last 7 Days
      const selDateObj = new Date(safeDate);
      const weekDates = allDateKeys.filter(d => {
        const diffDays = (selDateObj - new Date(d)) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays < 7;
      });
      return weekDates.length > 0 ? weekDates : [safeDate];
    }

    if (timeRange === 'month') {
      // Month: All dates in selected month (e.g. 2026-07)
      const monthDates = allDateKeys.filter(d => d.startsWith(selectedYearMonth));
      return monthDates.length > 0 ? monthDates : [safeDate];
    }

    if (timeRange === 'year') {
      // Year: All dates in selected year (e.g. 2026)
      const yearDates = allDateKeys.filter(d => d.startsWith(selectedYear));
      return yearDates.length > 0 ? yearDates : [safeDate];
    }

    // All Time
    return allDateKeys.length > 0 ? allDateKeys : [safeDate];
  };

  const filteredDates = getFilteredDates();

  // Calculate Total Paper Production & Rolls logged in selected timeframe
  let totalProductionKg = 0;
  let totalRollsCount = 0;
  let totalRunningHours = 0;

  filteredDates.forEach(d => {
    const log = state.machineLogs[d] || { rolls: [], runningTime: {} };
    const rolls = log.rolls || [];
    totalRollsCount += rolls.length;
    totalProductionKg += rolls.reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
    totalRunningHours += Number(calculateMachineRunningHours(log.runningTime) || 0);
  });

  // Calculate Total Dispatches in selected timeframe
  const filteredDispatches = (state.dispatches || []).filter(d => {
    if (timeRange === 'all') return true;
    return filteredDates.includes(d.date);
  });
  const totalDispatchKg = filteredDispatches.reduce((sum, d) => sum + Number(d.quantityKg || 0), 0);

  // Stock totals by category
  const stocks = state.rawMaterialStocks || {};
  let wastePaperTotalKg = 0;
  let chemicalTotalKg = 0;
  let firewoodTotalKg = 0;

  RAW_MATERIALS.forEach(item => {
    const qty = Number(stocks[item.id] || 0);
    if (item.category === 'waste_paper') wastePaperTotalKg += qty;
    if (item.category === 'chemical') chemicalTotalKg += qty;
    if (item.category === 'firewood') firewoodTotalKg += qty;
  });

  const stockPieData = [
    { name: 'Waste Paper', value: wastePaperTotalKg, color: '#ca8d42' },
    { name: 'Chemicals', value: chemicalTotalKg, color: '#cb8734' },
    { name: 'Firewood', value: firewoodTotalKg, color: '#d29f60' },
  ];

  // Production trend chart data matching selected timeframe: Week (7 days), Month (30/31 days), Year (12 months), All (Multi-Year History)
  const getTrendData = () => {
    if (timeRange === 'week' || timeRange === 'today') {
      // 1. WEEK VIEW: 7 Days
      const datesToUse = [];
      const baseDate = selectedDate || '2026-07-26';
      for (let i = 6; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        datesToUse.push(`${yyyy}-${mm}-${dd}`);
      }
      return datesToUse.map(d => {
        const rolls = state.machineLogs?.[d]?.rolls || [];
        const kg = rolls.reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
        return {
          date: d ? d.slice(5) : '',
          fullDate: d,
          productionTons: Number((kg / 1000).toFixed(2)),
          isFuture: false
        };
      });
    }

    if (timeRange === 'month') {
      // 2. MONTH VIEW: 30 or 31 Days
      const baseDate = selectedDate || '2026-07-26';
      const [yearStr, monthStr] = baseDate.split('-');
      const yyyy = parseInt(yearStr, 10) || 2026;
      const mmIndex = (parseInt(monthStr, 10) || 7) - 1;

      const daysInMonth = new Date(yyyy, mmIndex + 1, 0).getDate();
      const monthData = [];
      const todayStr = new Date().toISOString().slice(0, 10);

      for (let day = 1; day <= daysInMonth; day++) {
        const dStr = `${yyyy}-${String(mmIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const rolls = state.machineLogs?.[dStr]?.rolls || [];
        const kg = rolls.reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
        const isFuture = dStr > todayStr;

        monthData.push({
          date: `${String(mmIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          fullDate: dStr,
          productionTons: isFuture ? 0 : Number((kg / 1000).toFixed(2)),
          isFuture
        });
      }
      return monthData;
    }

    if (timeRange === 'year') {
      // 3. YEAR VIEW: 12 Months (Jan..Dec)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthBaselines = [238.4, 245.2, 252.0, 248.6, 255.4, 251.8, 258.0, 0, 0, 0, 0, 0];
      const currentYear = new Date().getFullYear();
      const currentMonthIdx = new Date().getMonth();

      return monthNames.map((monthName, idx) => {
        const isFuture = idx > currentMonthIdx;
        let totalKgMonth = 0;
        Object.keys(state.machineLogs || {}).forEach(dKey => {
          const dObj = new Date(dKey);
          if (dObj.getFullYear() === currentYear && dObj.getMonth() === idx) {
            const rolls = state.machineLogs[dKey]?.rolls || [];
            totalKgMonth += rolls.reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
          }
        });

        const actualTons = Number((totalKgMonth / 1000).toFixed(2));
        const demoVal = (actualTons > 150 ? actualTons : (idx <= currentMonthIdx ? monthBaselines[idx] : 0));

        return {
          date: monthName,
          fullDate: `${monthName} ${currentYear}`,
          productionTons: isFuture ? 15 : demoVal,
          actualDisplayTons: isFuture ? 0 : demoVal,
          isFuture
        };
      });
    }

    // 4. ALL VIEW: Multi-Year Production History (2022, 2023, 2024, 2025, 2026)
    return [
      { date: '2022', fullDate: 'Full Year 2022 Total Production', productionTons: 2840.5, isFuture: false },
      { date: '2023', fullDate: 'Full Year 2023 Total Production', productionTons: 2980.2, isFuture: false },
      { date: '2024', fullDate: 'Full Year 2024 Total Production', productionTons: 3120.8, isFuture: false },
      { date: '2025', fullDate: 'Full Year 2025 Total Production', productionTons: 3050.4, isFuture: false },
      { date: '2026 (YTD)', fullDate: '2026 Year-to-Date Production', productionTons: 1754.4, isFuture: false }
    ];
  };

  const trendData = getTrendData();

  // High-Resolution 24-Hour Continuous Wave Telemetry Generator responding dynamically to selectedDate
  const generateWaveTelemetryData = (dateStr) => {
    const validStr = typeof dateStr === 'string' && dateStr ? dateStr : '2026-07-23';

    // If the selected date is in the future, return flat empty data (no telemetry yet)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(validStr + 'T00:00:00');
    if (selectedDateObj > today) {
      const timeStamps = [
        '00:00', '00:45', '01:30', '02:15', '03:00', '03:45', '04:30', '05:15',
        '06:00', '06:45', '07:30', '08:15', '09:00', '09:45', '10:30', '11:15',
        '12:00', '12:45', '13:30', '14:15', '15:00', '15:45', '16:30', '17:15',
        '18:00', '18:45', '19:30', '20:15', '21:00', '21:45', '22:30', '23:15', '23:55'
      ];
      return timeStamps.map(time => ({
        time, speed: 0, downtimeSpeed: null, isDowntime: false,
        loadPct: 0, outputTons: '0.00', cause: 'No Data — Future Date'
      }));
    }

    const seed = validStr.split('-').reduce((acc, n) => acc + (parseInt(n, 10) || 0), 0);

    const timeStamps = [
      '00:00', '00:45', '01:30', '02:15', '03:00', '03:45', '04:30', '05:15',
      '06:00', '06:45', '07:30', '08:15', '09:00', '09:45', '10:30', '11:15',
      '12:00', '12:45', '13:30', '14:15', '15:00', '15:45', '16:30', '17:15',
      '18:00', '18:45', '19:30', '20:15', '21:00', '21:45', '22:30', '23:15', '23:55'
    ];

    // Seed-based dynamic variation per date
    const peakMult = 0.92 + ((seed % 7) * 0.03); // Speed variation
    const dtIdx1 = 12 + (seed % 5); // First downtime slot (e.g., 09:00 to 12:00)
    const dtIdx2 = 21 + ((seed * 2) % 4); // Second downtime slot (e.g., 15:45 to 18:00)
    const hasSecondDt = (seed % 3) !== 0;

    return timeStamps.map((time, idx) => {
      let baseVal = 0;
      if (idx >= 6 && idx <= 27) {
        // Active daytime operation hill — smooth gentle curve
        const progress = (idx - 6) / 21;
        const sineWave = Math.sin(progress * Math.PI);
        const ripple = Math.sin(idx * 1.4 + seed) * 80 + Math.cos(idx * 0.7) * 50;
        baseVal = Math.round((sineWave * 1400 + ripple + 350) * peakMult);
        if (baseVal < 140) baseVal = 140;
      } else if (idx > 27) {
        baseVal = Math.round(Math.max(0, (32 - idx) * 50));
      } else if (idx < 6) {
        baseVal = Math.round(Math.max(0, idx * 35));
      }

      // Check dynamic downtime events for selected date
      const isDowntime = (idx === dtIdx1) || (hasSecondDt && idx === dtIdx2);
      const speed = isDowntime ? 0 : baseVal;
      const loadPct = isDowntime ? 0 : Math.min(100, Math.round((speed / 2200) * 100));

      // Red downtime envelope: touches neighbor blue values at edges, fills the dip down to 0
      // This shows the "lost production" gap — red covers from curve level down to 0 during downtime
      let downtimeSpeed = null;
      if (idx === dtIdx1 - 1) downtimeSpeed = baseVal;
      else if (idx === dtIdx1) downtimeSpeed = baseVal;  // red fills from baseVal down to the blue's 0
      else if (idx === dtIdx1 + 1) downtimeSpeed = baseVal;
      else if (hasSecondDt && idx === dtIdx2 - 1) downtimeSpeed = baseVal;
      else if (hasSecondDt && idx === dtIdx2) downtimeSpeed = baseVal;
      else if (hasSecondDt && idx === dtIdx2 + 1) downtimeSpeed = baseVal;

      const cause = isDowntime
        ? (idx === dtIdx1
            ? (seed % 2 === 0 ? 'Scheduled Wire Wash & Cleaning' : 'Press Section Felt Replacement')
            : (seed % 2 === 1 ? 'Paper Web Break at Reel' : 'Yankee Dryer Steam Pressure Calibration'))
        : 'Normal Operation';

      return {
        time,
        speed,
        downtimeSpeed,
        isDowntime,
        loadPct,
        outputTons: (speed * 0.0032).toFixed(2),
        cause
      };
    });
  };

  const waveTelemetryData = generateWaveTelemetryData(selectedDate);
  const maxTelemetrySpeed = Math.max(...waveTelemetryData.map(d => d.speed), 1800);

  // Stock transactions matching selected timeframe
  const filteredTransactions = (state.stockTransactions || []).filter(tx => {
    if (timeRange === 'all') return true;
    return filteredDates.includes(tx.date);
  });

  // Label text helper
  const rangeLabel = timeRange === 'today'
    ? 'Today'
    : timeRange === 'week'
    ? 'This Week'
    : timeRange === 'month'
    ? 'This Month'
    : timeRange === 'year'
    ? 'This Year'
    : 'All Time';

  return (
    <div className="space-y-6 font-sans">
      {/* Top Stat Cards Responsive Grid (Option 1: Smoothly grows larger when left bar opens, contracts when left bar closes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu">
        <div className="animate-card-stagger delay-0">
          <StatCard
            variant="indigo"
            title={`Total Production (${rangeLabel})`}
            value={formatKgOrTonForRange(totalProductionKg, timeRange)}
            subtitle={`${totalRollsCount} Machine Rolls Logged`}
            icon={Cog}
            isExpanded={isSidebarExpanded}
          />
        </div>
        <div className="animate-card-stagger delay-50">
          <StatCard
            variant="violet"
            title="Raw Material Inventory"
            value={formatKgOrTonForRange(wastePaperTotalKg + chemicalTotalKg + firewoodTotalKg, timeRange)}
            subtitle={`Waste Paper: ${formatKgOrTonForRange(wastePaperTotalKg, timeRange)}`}
            icon={Boxes}
            trend="+4.2%"
            trendType="up"
            isExpanded={isSidebarExpanded}
          />
        </div>
        <div className="animate-card-stagger delay-100">
          <StatCard
            variant="amber"
            title={`Machine Uptime (${rangeLabel})`}
            value={`${(Number(totalRunningHours) || 0).toFixed(1)} Hours`}
            subtitle="Net Operating Time"
            icon={Activity}
            trend="92% Efficiency"
            trendType="up"
            isExpanded={isSidebarExpanded}
          />
        </div>
        <div className="animate-card-stagger delay-150">
          <StatCard
            variant="blue"
            title={`Dispatched (${rangeLabel})`}
            value={formatKgOrTonForRange(totalDispatchKg, timeRange)}
            subtitle={`${filteredDispatches.length} Receipts Generated`}
            icon={Truck}
            isExpanded={isSidebarExpanded}
          />
        </div>
      </div>



      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Trend / Hourly Buildup Chart */}
        <div
          ref={barCardRef}
          onMouseMove={(e) => {
            if (barCardRef.current) {
              const rect = barCardRef.current.getBoundingClientRect();
              setBarMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
            }
          }}
          onMouseLeave={() => {
            setHoveredBarData(null);
            setHoveredBarIndex(null);
          }}
          className={`relative ${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} min-w-0 overflow-hidden bg-white rounded-2xl p-3.5 sm:p-6 border border-[#e2cbb6] shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#EEF0F5]">
            <div>
              <h3 className="text-base font-bold text-[#161B26]">
                Paper Production Trend ({rangeLabel})
              </h3>
              <p className="text-xs text-[#8A8FA3]">
                {timeRange === 'week' ? 'Daily Tonnage Output for Last 7 Days' : timeRange === 'month' ? 'Daily Tonnage Output for Selected Month' : timeRange === 'year' ? 'Monthly Production Tonnage for Current Year' : 'Multi-Year Historical Production Output'}
              </p>
            </div>

            {/* Desktop Computer Badge View (Shown ONLY on Computer / Desktop screens >= 768px) */}
            <span className="hidden md:inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#f4e7d7] text-[#cf8730] shrink-0">
              {timeRange === 'week' ? '7 Days View' : timeRange === 'month' ? 'Full Month View' : timeRange === 'year' ? '12 Months View' : 'Multi-Year View'}
            </span>

            {/* Mobile Responsive Date Range & Stepper Filter Strip (Shown ONLY on Mobile screens < 768px) */}
            <div className="flex md:hidden items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Segmented Pill Selector (Week | Month | Year | All) */}
              <div className="flex items-center bg-[#F8F9FC] border border-slate-200/90 rounded-xl p-0.5 shadow-2xs font-semibold text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => store.setTimeRange('week')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 text-xs ${
                    timeRange === 'week' || timeRange === 'today'
                      ? 'bg-white font-extrabold text-[#cf8730] shadow-xs ring-1 ring-slate-900/5'
                      : 'hover:text-[#161B26] hover:bg-slate-200/50'
                  }`}
                >
                  Week
                </button>
                <span className="w-[1px] h-3.5 bg-slate-200/80" />
                <button
                  type="button"
                  onClick={() => store.setTimeRange('month')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 text-xs ${
                    timeRange === 'month'
                      ? 'bg-white font-extrabold text-[#cf8730] shadow-xs ring-1 ring-slate-900/5'
                      : 'hover:text-[#161B26] hover:bg-slate-200/50'
                  }`}
                >
                  Month
                </button>
                <span className="w-[1px] h-3.5 bg-slate-200/80" />
                <button
                  type="button"
                  onClick={() => store.setTimeRange('year')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 text-xs ${
                    timeRange === 'year'
                      ? 'bg-white font-extrabold text-[#cf8730] shadow-xs ring-1 ring-slate-900/5'
                      : 'hover:text-[#161B26] hover:bg-slate-200/50'
                  }`}
                >
                  Year
                </button>
                <span className="w-[1px] h-3.5 bg-slate-200/80" />
                <button
                  type="button"
                  onClick={() => store.setTimeRange('all')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 text-xs ${
                    timeRange === 'all'
                      ? 'bg-white font-extrabold text-[#cf8730] shadow-xs ring-1 ring-slate-900/5'
                      : 'hover:text-[#161B26] hover:bg-slate-200/50'
                  }`}
                >
                  All
                </button>
              </div>

              {/* Unbreakable Date Stepper Group (< [ Calendar Pill ] >) */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Previous Date Arrow < */}
                <button
                  type="button"
                  onClick={handlePrevDate}
                  className="p-1.5 rounded-xl border border-slate-200/90 text-slate-500 hover:text-[#161B26] hover:bg-slate-100 active:scale-90 transition-all cursor-pointer shrink-0"
                  title="Step Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Date Picker Button [ 2026-07-27 📅 ] */}
                <div className="relative flex items-center justify-between gap-1.5 w-28 sm:w-36 px-2 sm:px-3 py-1 rounded-xl border border-slate-200/90 bg-white shadow-2xs text-xs font-bold text-[#161B26] hover:border-[#cf8730] hover:text-[#cf8730] transition-all cursor-pointer group shrink-0">
                  <span className="font-mono tracking-tight text-xs text-center flex-1">{formatDatePillDisplay(selectedDate)}</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#cf8730] shrink-0" />
                  <input
                    type={timeRange === 'month' ? 'month' : 'date'}
                    value={timeRange === 'month' ? (selectedDate ? selectedDate.slice(0, 7) : '') : (selectedDate || '')}
                    onChange={handleDateInput}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    title="Select date or month"
                  />
                </div>

                {/* Next Date Arrow > */}
                <button
                  type="button"
                  onClick={handleNextDate}
                  className="p-1.5 rounded-xl border border-slate-200/90 text-slate-500 hover:text-[#161B26] hover:bg-slate-100 active:scale-90 transition-all cursor-pointer shrink-0"
                  title="Step Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <div className="h-80 sm:h-96 w-full min-w-0 overflow-hidden outline-none border-none">
            <ResponsiveContainer width="99.9%" height="100%" debounce={16} tabIndex={-1} style={{ outline: 'none', overflow: 'hidden' }}>
              <ComposedChart
                data={trendData}
                barCategoryGap="10%"
                margin={{ top: 25, right: 20, left: 10, bottom: 5 }}
                style={{ outline: 'none', overflow: 'hidden' }}
                tabIndex={-1}
                onMouseMove={(chartState) => {
                  if (chartState && chartState.activeTooltipIndex !== undefined && chartState.activeTooltipIndex !== null) {
                    setHoveredBarIndex(chartState.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredBarIndex(null);
                  setHoveredBarData(null);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2cbb6" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#916c3b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={timeRange === 'month' ? 4 : 0}
                />
                <YAxis
                  stroke="#916c3b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v) => `${v} T`}
                  domain={[0, (dataMax) => Math.max(10, Math.ceil((dataMax || 10) * 1.15))]}
                />
                <Tooltip
                  isAnimationActive={true}
                  animationDuration={200}
                  animationEasing="ease-out"
                  wrapperStyle={{ pointerEvents: 'none', outline: 'none' }}
                  cursor={{ fill: 'rgba(204, 156, 98, 0.08)', rx: 12, ry: 12 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      if (data.isFuture) {
                        return (
                          <div className="bg-white border border-[#e2cbb6] rounded-2xl px-4 py-3 shadow-xl text-[#241b0f] font-sans min-w-[155px] text-center pointer-events-none">
                            <div className="text-[10px] text-[#916c3b] font-semibold mb-1 uppercase tracking-wider">
                              {data.fullDate || label}
                            </div>
                            <div className="text-xs font-bold text-slate-400 italic">
                              Future Period — No Production
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="bg-white border border-[#e2cbb6] rounded-2xl px-4 py-3 shadow-xl text-[#241b0f] font-sans min-w-[155px] text-center pointer-events-none transition-all duration-200">
                          <div className="flex items-center justify-between gap-2 text-[10px] text-[#916c3b] font-semibold mb-1.5 pb-1 border-b border-[#e2cbb6]">
                            <span className="uppercase tracking-wider">DATE</span>
                            <span className="text-[#CC9C62] font-mono font-bold">{data?.date || label}</span>
                          </div>
                          <div className="flex items-baseline justify-center gap-1.5 my-1">
                            <span className="text-2xl font-black text-[#241b0f] tracking-tight">
                              {data?.actualDisplayTons !== undefined ? data.actualDisplayTons : data?.productionTons}
                            </span>
                            <span className="text-xs font-bold text-[#CC9C62]">Tons</span>
                          </div>
                          <div className="mt-1.5 text-[10px] text-[#916c3b] font-medium flex items-center justify-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CC9C62] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CC9C62]"></span>
                            </span>
                            <span>Paper Machine Production</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="productionTons"
                  fill="#CC9C62"
                  radius={timeRange === 'month' ? [4, 4, 0, 0] : [16, 16, 0, 0]}
                  maxBarSize={600}
                  barSize={
                    timeRange === 'week'
                      ? 48
                      : timeRange === 'month'
                      ? 14
                      : timeRange === 'year'
                      ? 36
                      : 56
                  }
                  isAnimationActive={true}
                  animationDuration={400}
                  animationEasing="cubic-bezier(0.25, 0.1, 0.25, 1)"
                  className="transition-all duration-300 cursor-pointer hover:opacity-90 hover:brightness-105"
                >
                  <LabelList
                    dataKey="productionTons"
                    position="top"
                    content={(props) => {
                      const { x, y, width, value, payload } = props;
                      if (payload?.isFuture || !value) return null;
                      const displayVal = payload?.actualDisplayTons !== undefined ? payload.actualDisplayTons : value;
                      return (
                        <text
                          x={x + width / 2}
                          y={y - 8}
                          fill="#a3763f"
                          textAnchor="middle"
                          fontWeight={800}
                          fontSize={11}
                        >
                          {displayVal} T
                        </text>
                      );
                    }}
                  />
                  {trendData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isFuture ? '#e2cbb6' : '#CC9C62'}
                      opacity={entry.isFuture ? 0.35 : 1}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-1): Live Worker Access & Security Audit Logs (ADMIN ONLY!) */}
        {isAdmin && (
          <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-[#EEF0F5] shadow-xs space-y-3 flex flex-col justify-start min-w-0 animate-in fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[#EEF0F5] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f4e7d7] text-[#cf8730] flex items-center justify-center shrink-0 shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#241b0f] leading-tight">
                    Security Audit Logs
                  </h3>
                  <p className="text-[11px] text-[#916c3b] font-medium">Admin &bull; Worker logins & security events</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#241b0f] text-white hover:bg-[#3d2e1a] text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Open Calendar Date Picker & Full Logs Pop-Up"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#cf8730]" />
                  <span>Calendar & Logs</span>
                </button>
                <button
                  type="button"
                  onClick={handleRefreshLogs}
                  className="p-1.5 rounded-xl bg-[#f4e7d7]/60 text-[#cf8730] hover:bg-[#f4e7d7] border border-[#e2cbb6] transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                  title="Refresh Security Logs"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLogRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Audit Log Entries Timeline */}
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar max-h-[350px] pr-1">
              {(state?.auditLogs || []).length === 0 ? (
                <div className="p-6 text-center bg-[#f4e7d7]/20 rounded-2xl border border-dashed border-[#e2cbb6] space-y-2">
                  <Activity className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="font-bold text-xs text-slate-600">No security logs recorded</p>
                </div>
              ) : (
                (state?.auditLogs || []).slice(0, 8).map((log) => {
                  const isPassChange = log.type === 'password_change';
                  const isLogin = log.type === 'login';
                  const isDeleted = log.type === 'user_deleted';

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-white border border-[#EEF0F5] hover:border-[#cf8730]/40 shadow-2xs hover:shadow-xs transition-all space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                            isPassChange
                              ? 'bg-amber-100 text-amber-800'
                              : isLogin
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDeleted
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-[#f4e7d7] text-[#cf8730]'
                          }`}>
                            {isPassChange ? <Lock className="w-3.5 h-3.5" /> : isLogin ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                          </div>
                          <span className="font-black font-sans text-[#161B26] truncate text-xs tracking-wide">{log.userName}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[9px] font-bold">
                            {log.workerId}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold font-sans text-slate-500 shrink-0 tracking-tight">
                          {log.formattedTime}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] font-medium leading-tight pl-8">{log.action}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity / Audit Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#161B26]">Automatic Stock Transactions ({rangeLabel})</h3>
            <p className="text-xs text-[#8A8FA3]">Raw Material Auto-Deductions & Consumption Events</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-[#5B4FE9]">
            {filteredTransactions.length} Logged Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                <th className="p-3 rounded-l-xl">Date</th>
                <th className="p-3">Source Event</th>
                <th className="p-3">Raw Material</th>
                <th className="p-3 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-400 font-medium">
                    No automatic stock transactions found for {rangeLabel.toLowerCase()}.
                  </td>
                </tr>
              ) : (
                filteredTransactions.slice(0, 6).map((tx) => {
                  const item = RAW_MATERIALS.find(m => m.id === tx.itemId);
                  const isNegative = tx.delta < 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-700">{formatDateDisplay(tx.date)}</td>
                      <td className="p-3 text-slate-600 font-medium">{tx.source}</td>
                      <td className="p-3 font-bold text-[#161B26]">{item?.name || 'Item'}</td>
                      <td className={`p-3 text-right font-extrabold ${isNegative ? 'text-[#F1533C]' : 'text-[#1FCB79]'}`}>
                        {isNegative ? '' : '+'}{formatKgOrTon(tx.delta)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Logs History Modal with Interactive Calendar */}
      <AuditLogsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        state={state}
      />
    </div>
  );
};

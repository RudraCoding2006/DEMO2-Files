import React, { useState, useRef, useEffect, useMemo } from 'react';
import { USER_ROLES, RAW_MATERIALS, PRODUCTS } from '../../data/masterData';
import { MODULES } from './Sidebar';
import {
  Calendar,
  UserCheck,
  RefreshCw,
  Bell,
  Search,
  X,
  AlertTriangle,
  Cog,
  Truck,
  CheckCircle2,
  Trash2,
  User,
  Users,
  LogOut,
  ChevronDown,
  Shield,
  Key,
  Settings,
  Boxes,
  PackageCheck,
  Wrench,
  RotateCw,
  ClipboardList,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { store } from '../../data/storage';
import { UserManagementModal } from '../modals/UserManagementModal';
import { EditProfileModal } from '../modals/EditProfileModal';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const TopBar = ({ activeRole, selectedDate, title, state, onSelectModule, isSidebarExpanded }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [notifCategory, setNotifCategory] = useState('all');
  const [liquidWaveOverlay, setLiquidWaveOverlay] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    type: 'danger',
    icon: null,
    onConfirm: () => {}
  });

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const dateInputRef = useRef(null);
  const themeBtnRef = useRef(null);

  const users = state?.users || [];
  const timeRange = state?.timeRange || 'today';
  const isAdmin = activeRole === 'admin' || state?.activeRole === 'admin';
  const allNotifications = state?.notifications || [];

  const handleLiquidFloorWave = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const currentTheme = store.getTheme();
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    const btn = e?.currentTarget || (e?.target && typeof e.target.closest === 'function' ? e.target.closest('button') : null) || themeBtnRef.current;
    
    let originX = Math.round(window.innerWidth / 2);
    let originY = 30;

    if (btn) {
      const rect = btn.getBoundingClientRect();
      if (rect && rect.width > 0) {
        originX = Math.round(rect.left + rect.width / 2);
        originY = Math.round(rect.top + rect.height / 2);
      }
    }

    const maxDist = Math.ceil(Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY)
    )) + 160;

    const xPct = ((originX / window.innerWidth) * 100).toFixed(2);
    const yPct = ((originY / window.innerHeight) * 100).toFixed(2);

    if (typeof document.startViewTransition === 'function') {
      try {
        const transition = document.startViewTransition(() => {
          store.setTheme(nextTheme);
        });

        transition.ready.then(() => {
          document.documentElement.animate(
            [
              { clipPath: `circle(0px at ${xPct}% ${yPct}%)` },
              { clipPath: `circle(${maxDist}px at ${xPct}% ${yPct}%)` }
            ],
            {
              duration: 900,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              pseudoElement: '::view-transition-new(root)'
            }
          );
        }).catch(() => {
          store.setTheme(nextTheme);
        });
      } catch (err) {
        store.setTheme(nextTheme);
      }
    } else {
      store.setTheme(nextTheme);
    }
  };

  const notifications = useMemo(() => {
    if (isAdmin) return allNotifications;
    // For non-admin workers, filter out security/login notifications
    return allNotifications.filter(n => {
      const msg = (n.message || '').toLowerCase();
      const isSecurityNotif =
        msg.includes('logged in') ||
        msg.includes('changed account password') ||
        msg.includes('updated password') ||
        msg.includes('worker') ||
        msg.includes('switched active session') ||
        msg.includes('created new worker') ||
        msg.includes('user deleted') ||
        msg.includes('🔑') ||
        msg.includes('🛡️');
    });
  }, [allNotifications, isAdmin]);

  const activeUser = users.find(u => u.id === state?.activeUserId) || users[0] || {
    name: 'Rajesh Sharma',
    workerId: 'EMP-001',
    roleName: 'Admin / Management',
    username: 'admin',
    email: 'admin@sahebpaper.com'
  };

  const notifStorageKey = `SAHEB_LAST_SEEN_NOTIF_${activeUser?.id || 'admin'}`;

  const [lastSeenCount, setLastSeenCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem(notifStorageKey) || '0', 10);
    } catch (e) {
      return 0;
    }
  });

  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(notifStorageKey) || '0', 10);
      setLastSeenCount(saved);
    } catch (e) {}
  }, [notifStorageKey]);

  const unreadCount = useMemo(() => {
    return Math.max(0, notifications.length - lastSeenCount);
  }, [notifications.length, lastSeenCount]);

  const handleToggleNotifs = () => {
    if (!showNotifs) {
      const count = notifications.length;
      setLastSeenCount(count);
      try {
        localStorage.setItem(notifStorageKey, String(count));
      } catch (e) {}
      setShowNotifs(true);
      setShowProfileMenu(false);
    } else {
      setShowNotifs(false);
    }
  };


  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateChange = (e) => {
    store.setSelectedDate(e.target.value);
  };

  // Safe Date Stepping without toISOString RangeError bugs
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

  // Format pill text matching reference images (2026-07-23, 2026-07, 2026, All)
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

  const handleClearNotifications = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Notifications?',
      message: 'Are you sure you want to clear all live mill notifications and automation events?',
      confirmText: 'Delete All',
      type: 'danger',
      icon: Trash2,
      onConfirm: () => store.clearNotifications()
    });
  };

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Log Out User Session?',
      message: `Are you sure you want to log out session for ${activeUser.name}?`,
      confirmText: 'Log Out',
      type: 'danger',
      icon: LogOut,
      onConfirm: () => {
        setShowProfileMenu(false);
        store.logout();
      }
    });
  };

  // Global Search Filtering across Reels, Dispatches, Rolls, Orders, Products, Materials, Spares & Workers
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results = [];

    // 1. Search Finished Reels (e.g., RL-105, RL-521, Napkin Tissue, 16 GSM)
    (state?.rewinderReels || []).forEach(r => {
      const reelNo = (r.reelNo || '').toLowerCase();
      const prod = (r.productName || '').toLowerCase();
      const size = (r.size || '').toLowerCase();
      const status = (r.status || '').toLowerCase();
      if (reelNo.includes(q) || prod.includes(q) || size.includes(q) || status.includes(q) || `${r.gsm}`.includes(q)) {
        results.push({
          id: `reel-${r.id || r.reelNo}`,
          title: r.reelNo,
          subtitle: `Finished Reel • ${r.productName} (${r.gsm} GSM) • ${r.weightKg} Kg • ${r.size} (${r.ply}P) • ${r.location || 'Finish Stock'}`,
          icon: RotateCw,
          badge: 'REEL',
          badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          action: () => {
            if (onSelectModule) onSelectModule('finish-stock');
            setSearchOpen(false);
            setSearchQuery('');
          }
        });
      }
    });

    // 2. Search Dispatch Receipts (e.g., DISP-101, Truck No, Customer / Party Name)
    (state?.dispatches || []).forEach(d => {
      const receiptNo = (d.receiptNo || '').toLowerCase();
      const party = (d.partyName || '').toLowerCase();
      const vehicle = (d.vehicleNo || d.truckNo || '').toLowerCase();
      const driver = (d.driverName || '').toLowerCase();
      if (receiptNo.includes(q) || party.includes(q) || vehicle.includes(q) || driver.includes(q)) {
        results.push({
          id: `disp-${d.id || d.receiptNo}`,
          title: d.receiptNo,
          subtitle: `Dispatch • Party: ${d.partyName} • Vehicle: ${d.vehicleNo || 'N/A'} • Weight: ${d.weightKg || d.netWeight || 0} Kg`,
          icon: Truck,
          badge: 'DISPATCH',
          badgeStyle: 'bg-[#5B4FE9]/10 text-[#5B4FE9] border-[#5B4FE9]/20',
          action: () => {
            if (onSelectModule) onSelectModule('dispatch');
            setSearchOpen(false);
            setSearchQuery('');
          }
        });
      }
    });

    // 3. Search Machine Jumbo Rolls (e.g., M-101, M-142)
    const allDates = Object.keys(state?.machineLogs || {});
    for (const dateKey of allDates) {
      const rolls = state?.machineLogs[dateKey]?.rolls || [];
      rolls.forEach(r => {
        const rollNo = (r.rollNo || '').toLowerCase();
        const prod = (r.productName || '').toLowerCase();
        if (rollNo.includes(q) || prod.includes(q) || `${r.gsm}`.includes(q)) {
          results.push({
            id: `roll-${r.id || r.rollNo}-${dateKey}`,
            title: r.rollNo,
            subtitle: `Jumbo Roll • ${r.productName} (${r.gsm} GSM) • ${r.weightKg} Kg • ${r.width} cm`,
            icon: Cog,
            badge: 'JUMBO ROLL',
            badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
            action: () => {
              if (onSelectModule) onSelectModule('machine');
              setSearchOpen(false);
              setSearchQuery('');
            }
          });
        }
      });
    }

    // 4. Search Pending Orders (e.g., PO-1001, Party Name)
    (state?.pendingOrders || []).forEach(o => {
      const orderNo = (o.orderNo || o.id || '').toLowerCase();
      const party = (o.partyName || '').toLowerCase();
      const prod = (o.productName || '').toLowerCase();
      if (orderNo.includes(q) || party.includes(q) || prod.includes(q)) {
        results.push({
          id: `order-${o.id || o.orderNo}`,
          title: o.orderNo || `Order for ${o.partyName}`,
          subtitle: `Pending Order • Party: ${o.partyName} • ${o.productName} (${o.gsm} GSM) • ${o.weightTon} Tons`,
          icon: ClipboardList,
          badge: 'ORDER',
          badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
          action: () => {
            if (onSelectModule) onSelectModule('pending-order');
            setSearchOpen(false);
            setSearchQuery('');
          }
        });
      }
    });

    // 5. Search Finished Products (Napkin Tissue, Toilet Tissue, KT, HRT, etc.)
    PRODUCTS.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.gsmOptions.some(g => `${g}`.includes(q))) {
        const reels = (state?.rewinderReels || []).filter(r => r.productName === p.name);
        const totalKg = reels.reduce((acc, r) => acc + (r.weightKg || 0), 0);
        results.push({
          id: `prod-${p.id}`,
          title: p.name,
          subtitle: `Product Master • GSM: ${p.gsmOptions.join('/')} • Stock: ${reels.length} Reels (${(totalKg / 1000).toFixed(2)} T)`,
          icon: PackageCheck,
          badge: 'PRODUCT',
          badgeStyle: 'bg-indigo-50 text-[#5B4FE9] border-indigo-100',
          action: () => {
            if (onSelectModule) onSelectModule('finish-stock');
            setSearchOpen(false);
            setSearchQuery('');
          }
        });
      }
    });

    // 6. Search Raw Materials (Waste Paper, Chemicals, Firewood)
    RAW_MATERIALS.forEach(rm => {
      if (rm.name.toLowerCase().includes(q) || rm.category.toLowerCase().includes(q)) {
        const stockKg = state?.rawMaterialStock?.[rm.id] ?? (rm.minStock * 2);
        const isLow = stockKg < rm.minStock;
        results.push({
          id: `rm-${rm.id}`,
          title: rm.name,
          subtitle: `Raw Material • Stock: ${stockKg.toLocaleString()} ${rm.unit} ${isLow ? '⚠️ LOW STOCK' : '✓ Normal'}`,
          icon: Boxes,
          badge: rm.category.replace('_', ' ').toUpperCase(),
          badgeStyle: isLow ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100',
          action: () => {
            if (onSelectModule) onSelectModule('raw-material');
            setSearchOpen(false);
            setSearchQuery('');
          }
        });
      }
    });

    // 7. Search Modules
    MODULES.forEach(m => {
      if (m.name.toLowerCase().includes(q)) {
        results.push({
          id: `mod-${m.id}`,
          title: m.name,
          subtitle: 'Mill ERP Module',
          icon: m.icon,
          badge: 'MODULE',
          badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
          action: () => {
            if (onSelectModule) onSelectModule(m.id);
            setSearchOpen(false);
            setSearchQuery('');
          }
        });
      }
    });

    // 8. Search Store Spares
    (state?.storeItems || []).forEach(st => {
      const name = st.number || st.name || '';
      if (name.toLowerCase().includes(q) || st.useFor?.toLowerCase().includes(q)) {
        results.push({
          id: `st-${st.id}`,
          title: name,
          subtitle: `Store Spare (${st.pcs} Pcs) • ${st.useFor}`,
          icon: Wrench,
          badge: 'SPARE',
          badgeStyle: 'bg-amber-50 text-amber-600 border-amber-100',
          action: () => {
            if (onSelectModule) onSelectModule('store');
            setSearchOpen(false);
            setSearchQuery('');
          }
        });
      }
    });

    return results.slice(0, 12);
  };

  const searchResults = getSearchResults();

  // Classify notifications into categories cleanly
  const classifiedNotifs = notifications.map(n => {
    const msg = n.message || '';
    const lowerMsg = msg.toLowerCase();
    let category = 'production';
    let icon = Cog;
    let colorClass = 'bg-indigo-50 text-[#5B4FE9] border-indigo-100';

    if (lowerMsg.includes('inward') || lowerMsg.includes('added') || lowerMsg.includes('received')) {
      category = 'production';
      icon = Boxes;
      colorClass = 'bg-indigo-50 text-[#5B4FE9] border-indigo-100';
    } else if (lowerMsg.includes('dispatch') || lowerMsg.includes('receipt') || lowerMsg.includes('truck')) {
      category = 'dispatch';
      icon = Truck;
      colorClass = 'bg-emerald-50 text-[#1FCB79] border-emerald-100';
    } else if (lowerMsg.includes('low stock') || lowerMsg.includes('alert') || lowerMsg.includes('downtime') || lowerMsg.includes('deficit') || lowerMsg.includes('warning')) {
      category = 'alerts';
      icon = AlertTriangle;
      colorClass = 'bg-rose-50 text-[#F1533C] border-rose-100';
    }

    return { ...n, category, icon, colorClass };
  });

  const filteredNotifs = classifiedNotifs.filter(n => {
    if (notifCategory !== 'all' && n.category !== notifCategory) return false;
    return true;
  });

  const alertsCount = classifiedNotifs.filter(n => n.category === 'alerts').length;

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#12162B] border-b border-[#EEF0F5] dark:border-[#222943] text-slate-800 dark:text-white h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 shadow-xs font-sans m-0 rounded-none shrink-0">
        {/* Title & Greeting */}
        <div className="flex items-center gap-2 truncate">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#161B26] dark:text-white truncate">{title || 'Dashboard'}</h2>
            <p className="text-[11px] text-[#8A8FA3] hidden sm:block">Saheb Paper Mill &bull; Unit 1 (Tissue Line)</p>
          </div>
        </div>

        {/* Right Actions Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Desktop Computer Date Filter Bar (Shown ONLY on Computer / Desktop screens >= 768px) */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
            {/* Segmented Pill Selector (Week | Month | Year | All) */}
            <div className="flex items-center bg-[#F8F9FC] dark:bg-[#181D35] border border-slate-200/90 dark:border-[#262D4A] rounded-xl p-0.5 shadow-2xs font-semibold text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => store.setTimeRange('week')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 text-xs ${
                  timeRange === 'week' || timeRange === 'today'
                    ? 'bg-[#cf8730] font-extrabold text-white shadow-sm'
                    : 'hover:text-[#161B26] dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#252D48]'
                }`}
              >
                Week
              </button>

              <span className="w-[1px] h-3.5 bg-slate-200/80 dark:bg-[#262D4A]" />

              <button
                type="button"
                onClick={() => store.setTimeRange('month')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 text-xs ${
                  timeRange === 'month'
                    ? 'bg-[#cf8730] font-extrabold text-white shadow-sm'
                    : 'hover:text-[#161B26] dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#252D48]'
                }`}
              >
                Month
              </button>

              <span className="w-[1px] h-3.5 bg-slate-200/80 dark:bg-[#262D4A]" />

              <button
                type="button"
                onClick={() => store.setTimeRange('year')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 text-xs ${
                  timeRange === 'year'
                    ? 'bg-[#cf8730] font-extrabold text-white shadow-sm'
                    : 'hover:text-[#161B26] dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#252D48]'
                }`}
              >
                Year
              </button>

              <span className="w-[1px] h-3.5 bg-slate-200/80 dark:bg-[#262D4A]" />

              <button
                type="button"
                onClick={() => store.setTimeRange('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 text-xs ${
                  timeRange === 'all'
                    ? 'bg-[#cf8730] font-extrabold text-white shadow-sm'
                    : 'hover:text-[#161B26] dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#252D48]'
                }`}
              >
                All
              </button>
            </div>

            {/* Previous Date Arrow < */}
            <button
              type="button"
              onClick={handlePrevDate}
              className="p-1.5 rounded-xl border border-slate-200/90 dark:border-[#262D4A] bg-white dark:bg-[#181D35] text-slate-500 dark:text-slate-300 hover:text-[#161B26] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252D48] active:scale-90 transition-all cursor-pointer shrink-0"
              title="Step Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Date Picker Button [ 2026-07-27 📅 ] */}
            <div className="relative flex items-center justify-between gap-1.5 w-36 px-3 py-1 rounded-xl border border-slate-200/90 dark:border-[#262D4A] bg-white dark:bg-[#181D35] shadow-2xs text-xs font-bold text-[#161B26] dark:text-white hover:border-[#cf8730] hover:text-[#cf8730] transition-all cursor-pointer group shrink-0">
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
              className="p-1.5 rounded-xl border border-slate-200/90 dark:border-[#262D4A] bg-white dark:bg-[#181D35] text-slate-500 dark:text-slate-300 hover:text-[#161B26] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252D48] active:scale-90 transition-all cursor-pointer shrink-0"
              title="Step Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hover-Expandable Product & Material Search Bar */}
          <div
            className="relative"
            ref={searchRef}
            onMouseEnter={() => setIsSearchHovered(true)}
            onMouseLeave={() => {
              setIsSearchHovered(false);
              if (!searchQuery) setSearchOpen(false);
            }}
          >
            <div
              className={`flex items-center bg-[#F5F6FA] border border-[#EEF0F5] focus-within:border-[#cf8730] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#cf8730]/10 rounded-xl px-2.5 py-1.5 text-xs transition-all duration-300 shadow-2xs ${
                (isSearchHovered || searchOpen || searchQuery) ? 'w-44 sm:w-64 lg:w-80' : 'w-9 sm:w-9 justify-center px-0'
              }`}
            >
              <Search className="w-4 h-4 text-[#cf8730] shrink-0 cursor-pointer" onClick={() => setSearchOpen(true)} />
              
              {(isSearchHovered || searchOpen || searchQuery) && (
                <>
                  <input
                    type="text"
                    placeholder="Search Reel No, Dispatch No, Product, Material..."
                    value={searchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    className="bg-transparent font-medium text-[#161B26] placeholder:text-slate-400 focus:outline-none w-full ml-2 text-xs animate-in fade-in duration-150"
                    autoFocus={searchOpen}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                      className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Live Search Results Dropdown Overlay */}
            {searchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#EEF0F5] overflow-hidden z-50 animate-in fade-in duration-150 p-2 space-y-1">
                <div className="px-2 py-1.5 text-[10px] uppercase font-extrabold text-[#8A8FA3] tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Product & Material Search</span>
                  <span className="text-[#cf8730]">{searchResults.length} matches</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium">
                    No matching products or raw materials found for "{searchQuery}".
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto space-y-1 custom-scrollbar">
                    {searchResults.map(item => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          className="w-full p-2.5 rounded-xl hover:bg-[#F5F6FA] flex items-center justify-between gap-3 text-left transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-[#f4e7d7] text-[#cf8730] group-hover:bg-[#cf8730] group-hover:text-white transition-colors shrink-0">
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-extrabold text-xs text-[#161B26] truncate group-hover:text-[#cf8730]">{item.title}</p>
                                {item.badge && (
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${item.badgeStyle} shrink-0`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#8A8FA3] font-medium truncate mt-0.5">{item.subtitle}</p>
                            </div>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#cf8730] shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Changing Switcher Button (Sun ☀️ / Moon 🌙) */}
          <button
            ref={themeBtnRef}
            type="button"
            onClick={handleLiquidFloorWave}
            className="p-2 rounded-xl bg-[#F5F6FA] dark:bg-[#181D35] text-slate-600 dark:text-amber-400 border border-[#EEF0F5] dark:border-[#262D4A] hover:text-[#cf8730] hover:bg-[#f4e7d7] dark:hover:bg-[#252D48] transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center shrink-0"
            title={`Switch Theme (Current: ${(state?.theme || 'dark').toUpperCase()})`}
          >
            {(state?.theme || 'dark') === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-[#cf8730] hover:rotate-12 transition-transform" />
            )}
          </button>

          {/* Notification Bar Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleToggleNotifs}
              className={`p-2 rounded-xl border border-[#EEF0F5] dark:border-[#262D4A] transition-all relative ${
                showNotifs
                  ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                  : 'bg-[#F5F6FA] dark:bg-[#181D35] text-slate-600 dark:text-slate-200 hover:text-[#cf8730] hover:bg-[#f4e7d7] dark:hover:bg-[#252D48]'
              }`}
              title="Live Mill Automation Logs & Alerts"
            >
              <Bell className="w-4 h-4" />
              {!showNotifs && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F1533C] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F1533C] text-[9px] font-bold text-white items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifs && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#EEF0F5] overflow-hidden z-50 animate-in fade-in duration-150">
                {/* Header */}
                <div className="p-3.5 bg-[#cf8730] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs">Mill Automation Logs</h3>
                      <p className="text-[10px] text-white/80">Live Rule 1–12 Event Stream</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alertsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#F1533C] text-white text-[10px] font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {alertsCount}
                      </span>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Clear All Notifications"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Chips Bar */}
                <div className="p-2 bg-[#F5F6FA] border-b border-[#EEF0F5] flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setNotifCategory('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        notifCategory === 'all' ? 'bg-[#5B4FE9] text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({classifiedNotifs.length})
                    </button>
                    <button
                      onClick={() => setNotifCategory('alerts')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        notifCategory === 'alerts' ? 'bg-[#F1533C] text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Alerts
                    </button>
                    <button
                      onClick={() => setNotifCategory('production')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        notifCategory === 'production' ? 'bg-[#5B4FE9] text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Production
                    </button>
                    <button
                      onClick={() => setNotifCategory('dispatch')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        notifCategory === 'dispatch' ? 'bg-[#1FCB79] text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Dispatch
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-72 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                  {filteredNotifs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 space-y-1">
                      <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                      <p className="text-xs font-semibold">No notifications in this category.</p>
                    </div>
                  ) : (
                    filteredNotifs.map(n => {
                      const IconComponent = n.icon;
                      const isPendingResetReq = isAdmin &&
                        (n.message || '').toLowerCase().includes('password reset request submitted') &&
                        (state?.passwordResetRequests || []).some(r => r.status === 'pending');
                      return (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-[#F5F6FA] border border-slate-100 hover:bg-slate-100/80 transition-colors flex items-start justify-between gap-2.5 group"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className={`p-2 rounded-xl border shrink-0 ${n.colorClass}`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#161B26] text-xs leading-snug break-words">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{n.time || 'Just now'}</span>
                              </span>
                            </div>
                          </div>

                          {isPendingResetReq && (
                            <button
                              type="button"
                              onClick={() => {
                                const pendingReq = (state?.passwordResetRequests || []).find(r => r.status === 'pending');
                                if (pendingReq) {
                                  store.approvePasswordReset(pendingReq.id);
                                } else {
                                  setShowNotifs(false);
                                  setIsUserMgmtOpen(true);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-extrabold shrink-0 shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                              title="Approve Worker Password Reset Request"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve Reset</span>
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Panel Footer */}
                <div className="p-2.5 border-t border-slate-100 bg-[#F5F6FA] flex items-center justify-between text-[11px] text-[#8A8FA3]">
                  <span>Automated Paper Mill Engine</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-[#F1533C] font-bold hover:underline"
                    >
                      Delete All
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* USER PROFILE ICON & DROPDOWN MENU */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifs(false);
              }}
              className={`flex items-center gap-2 p-1 sm:px-2 py-1 rounded-xl transition-all border ${
                showProfileMenu
                  ? 'bg-slate-100 border-[#cf8730] ring-2 ring-[#cf8730]/20'
                  : 'bg-[#F5F6FA] border-[#EEF0F5] hover:border-slate-300'
              }`}
              title="User Profile & Settings"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-[#cf8730] text-white flex items-center justify-center font-bold text-xs shadow-md">
                  {activeUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#1FCB79]" />
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#161B26] leading-none truncate max-w-[100px] sm:max-w-[120px]">{activeUser.name}</p>
                <p className="text-[10px] text-[#8A8FA3] font-medium leading-tight truncate">{activeUser.workerId || 'EMP-001'}</p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Drawer Card */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-[#EEF0F5] overflow-hidden z-50 animate-in fade-in duration-150">
                {/* Header User Summary Card */}
                <div className="p-4 bg-[#cf8730] text-white space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-extrabold text-base backdrop-blur-xs">
                      {activeUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-sm truncate text-white">{activeUser.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold inline-block mt-0.5 backdrop-blur-xs">
                        {activeUser.roleName || 'Operator'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[11px] text-white/90">
                    <span>Badge ID: <strong className="text-white font-mono">{activeUser.workerId || 'EMP-001'}</strong></span>
                    <span>User: <strong className="text-white font-mono">{activeUser.username || 'admin'}</strong></span>
                  </div>
                </div>

                {/* Dropdown Menu Items */}
                {isAdmin ? (
                  <div className="p-2 space-y-1 text-xs font-semibold text-slate-700">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setIsUserMgmtOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#f4e7d7]/70 text-[#cf8730] border border-[#e2cbb6] hover:bg-[#cf8730] hover:text-white transition-all group font-bold shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#cf8730]/15 group-hover:bg-white/20 text-[#cf8730] group-hover:text-white">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-extrabold">User Management</p>
                          <p className="text-[10px] text-slate-500 group-hover:text-white/80 font-normal">Manage Workers & Passwords</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#cf8730] text-white group-hover:bg-white group-hover:text-[#cf8730] text-[9px] font-extrabold">
                        ADMIN
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2 space-y-1 text-xs font-semibold text-slate-700">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setIsEditProfileOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#f4e7d7]/70 text-[#cf8730] border border-[#e2cbb6] hover:bg-[#cf8730] hover:text-white transition-all group font-bold shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#cf8730]/15 group-hover:bg-white/20 text-[#cf8730] group-hover:text-white">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-extrabold">Edit Profile</p>
                          <p className="text-[10px] text-slate-500 group-hover:text-white/80 font-normal">Update Name, Phone & Password</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#cf8730] text-white group-hover:bg-white group-hover:text-[#cf8730] text-[9px] font-extrabold">
                        PROFILE
                      </span>
                    </button>
                  </div>
                )}

                {/* Footer / Logout */}
                <div className="p-2 border-t border-slate-100 bg-[#F5F6FA]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-rose-50 text-[#F1533C] hover:bg-[#F1533C] hover:text-white font-extrabold text-xs transition-colors shadow-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Render User Management Modal (Admin Only) */}
      <UserManagementModal
        isOpen={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
        state={state}
      />

      {/* Render Edit Profile Modal (Non-Admin Workers) */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        activeUser={activeUser}
        state={state}
      />

      {/* Render Custom Confirmation Modal UI */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        icon={confirmModal.icon}
      />
    </>
  );
};

import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Boxes,
  Factory,
  Cog,
  RotateCw,
  Flame,
  Droplets,
  Zap,
  ClipboardList,
  PackageCheck,
  Truck,
  Wrench,
  BarChart3,
  Menu,
  X,
  Lock
} from 'lucide-react';

export const MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'raw-material', name: 'Raw Material Stock', icon: Boxes },
  { id: 'pulp-mill', name: 'Pulp Mill', icon: Factory },
  { id: 'machine', name: 'Plant Manager', icon: Cog },
  { id: 'rewinder', name: 'Rewinder', icon: RotateCw },
  { id: 'boiler', name: 'Boiler', icon: Flame },
  { id: 'etp', name: 'ETP', icon: Droplets },
  { id: 'electricity', name: 'Electricity', icon: Zap },
  { id: 'pending-order', name: 'Pending Orders', icon: ClipboardList },
  { id: 'finish-stock', name: 'Finish Stock', icon: PackageCheck },
  { id: 'dispatch', name: 'Dispatch', icon: Truck },
  { id: 'store', name: 'Store (Spares)', icon: Wrench },
  { id: 'reports', name: 'Reports & Analytics', icon: BarChart3 },
];

export const Sidebar = ({ activeModule, onSelectModule, state, onExpandChange }) => {
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hoverTimerRef = useRef(null);
  const leaveTimerRef = useRef(null);

  // Always keep parent App.jsx layout (lg:ml-64 vs lg:ml-20) 100% in sync with sidebar hover state
  React.useEffect(() => {
    if (onExpandChange) {
      onExpandChange(isHoverExpanded);
    }
  }, [isHoverExpanded, onExpandChange]);

  // Active User & Module Filtering
  const activeUser = (state?.users || []).find(u => u.id === state?.activeUserId) || state?.users?.[0];
  const allowedModuleIds = activeUser?.roleId === 'admin'
    ? MODULES.map(m => m.id)
    : (activeUser?.allowedModules || ['dashboard']);

  const visibleModules = MODULES.filter(m => allowedModuleIds.includes(m.id));
  const primaryMobileModules = visibleModules.slice(0, 4);

  // Mouse Enter: Instantly expand sidebar with 0ms lag
  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (!isHoverExpanded) {
      setIsHoverExpanded(true);
      if (onExpandChange) onExpandChange(true);
    }
  };

  // Mouse Leave: Wait 150ms before closing overlay sidebar
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsHoverExpanded(false);
      if (onExpandChange) onExpandChange(false);
      leaveTimerRef.current = null;
    }, 150);
  };

  const handleLogoClick = () => {
    onSelectModule('dashboard');
    setIsHoverExpanded(false);
    if (onExpandChange) onExpandChange(false);
  };

  return (
    <>
      {/* Desktop Hover-Expandable Sidebar Rail (Push/Dynamic Layout Mode) */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40 bg-white dark:bg-[#12162B] text-slate-700 dark:text-slate-200 shadow-xl border-r border-[#E5E7EB] dark:border-[#222943] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu ${
          isHoverExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand Header — Basic SP Logo Badge */}
        <div className="p-4 border-b border-[#e2cbb6] flex items-center gap-3 overflow-hidden">
          <button
            onClick={handleLogoClick}
            className="w-10 h-10 rounded-xl bg-[#c78738] flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0 hover:scale-105 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d29f60]"
            title="Go to Dashboard"
          >
            SP
          </button>

          <button
            onClick={handleLogoClick}
            className={`text-left min-w-0 focus:outline-none group transition-opacity ${
              isHoverExpanded
                ? 'opacity-100 duration-200 delay-75'
                : 'opacity-0 duration-120 pointer-events-none'
            }`}
          >
            <h1 className="font-extrabold text-[#241b0f] text-base tracking-wide leading-tight truncate group-hover:text-[#c78738] transition-colors whitespace-nowrap">SAHEB PAPER</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#c78738] font-semibold truncate whitespace-nowrap">
              {activeUser?.roleName || 'Stock & Mill ERP'}
            </p>
          </button>
        </div>

        {/* Navigation List (Filtered by Worker Permissions!) */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
          {visibleModules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  onSelectModule(mod.id);
                }}
                title={!isHoverExpanded ? mod.name : undefined}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-xs transition-colors duration-200 group overflow-hidden cursor-pointer ${
                  isActive
                    ? 'bg-[#c78738] text-white shadow-lg shadow-[#c78738]/25 font-semibold'
                    : 'text-[#6d512c] hover:text-[#241b0f] hover:bg-[#f4e7d7]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#916c3b] group-hover:text-[#241b0f]'}`} />
                <span className={`whitespace-nowrap transition-opacity ${
                  isHoverExpanded
                    ? 'opacity-100 duration-200 delay-75'
                    : 'opacity-0 duration-120 pointer-events-none'
                }`}>
                  {mod.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer info showing Active Worker Session */}
        <div className={`p-3 border-t border-[#E5E7EB] bg-slate-50 text-[11px] text-slate-500 text-center transition-opacity overflow-hidden ${
          isHoverExpanded
            ? 'opacity-100 duration-200 delay-75'
            : 'opacity-0 duration-120 pointer-events-none h-0 p-0 border-none'
        }`}>
          <div className="flex items-center justify-center gap-1.5 font-bold text-[#111827] text-[11px] whitespace-nowrap">
            <Lock className="w-3 h-3 text-[#1FCB79]" /> {activeUser?.name || 'Worker'}
          </div>
          <p className="text-[10px] text-slate-400 whitespace-nowrap">{visibleModules.length} Modules Allowed</p>
        </div>
      </aside>

      {/* Mobile / Tablet Bottom Navigation Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white text-slate-700 border-t border-[#E5E7EB] shadow-2xl px-2 py-1.5 flex items-center justify-around">
        {primaryMobileModules.map(mod => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => {
                onSelectModule(mod.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-[#7C6EF6] font-bold' : 'text-slate-500 hover:text-[#111827]'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#7C6EF6]' : 'text-slate-500'}`} />
              <span className="text-[10px] tracking-tight">{mod.name}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
            isMobileMenuOpen || !primaryMobileModules.some(m => m.id === activeModule)
              ? 'text-[#7C6EF6] font-bold'
              : 'text-slate-500 hover:text-[#111827]'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5 text-slate-500" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </div>

      {/* Mobile Slide-up Drawer Sheet */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="bg-white text-[#111827] rounded-t-3xl border-t border-[#E5E7EB] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">Allowed Mill Modules</h3>
                <p className="text-[11px] text-slate-400">{activeUser?.name} ({activeUser?.roleName})</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2.5">
              {visibleModules.map(mod => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      onSelectModule(mod.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-left border transition-all ${
                      isActive
                        ? 'bg-[#5B4FE9] border-[#5B4FE9] text-white font-bold shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-semibold truncate">{mod.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

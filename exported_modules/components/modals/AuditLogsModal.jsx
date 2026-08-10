import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Activity,
  Calendar,
  Search,
  KeyRound,
  User,
  ShieldCheck,
  Clock,
  RotateCw,
  Lock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { store } from '../../data/storage';

export const AuditLogsModal = ({ isOpen, onClose, state }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [auditFilter, setAuditFilter] = useState('all'); // 'all' | 'login' | 'password_change' | 'permission_change'
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const auditLogs = state?.auditLogs || [];

  // Lock background body scroll when modal is active so mouse wheel only scrolls modal content!
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrevDay = () => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    base.setDate(base.getDate() - 1);
    setSelectedDate(base.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    base.setDate(base.getDate() + 1);
    setSelectedDate(base.toISOString().split('T')[0]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    store.showToast({
      title: 'Security logs updated',
      type: 'info'
    });
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // Filter audit logs by selected calendar date, type, and search query
  const filteredLogs = auditLogs.filter(log => {
    // Check Date match (ISO YYYY-MM-DD or timestamp comparison)
    if (selectedDate) {
      const logIso = log.isoDate || (log.timestamp ? log.timestamp.split('T')[0] : '');
      if (logIso && logIso !== selectedDate) {
        return false;
      }
    }
    // Check Filter type
    if (auditFilter !== 'all' && log.type !== auditFilter) {
      return false;
    }
    // Check Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName?.toLowerCase().includes(q) ||
        log.workerId?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white text-[#111827] rounded-3xl shadow-2xl border border-[#EEF0F5] w-full max-w-3xl max-h-[85vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-modal-pop">
        {/* Clean Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#EEF0F5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4e7d7] text-[#cf8730] flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#241b0f]">System Security & Access Audit History</h2>
              <p className="text-xs text-[#916c3b] font-medium">Select any date on calendar to view worker logins & password logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar: Calendar Date Picker, Search & Type Filters */}
        <div className="p-3.5 bg-[#F5F6FA] border-b border-[#EEF0F5] space-y-3 shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Interactive Calendar Stepper & Date Picker (User Custom Design) */}
            <div className="flex items-center gap-2">
              {/* Left Circular Stepper Button */}
              <button
                type="button"
                onClick={handlePrevDay}
                className="w-8 h-8 rounded-full bg-white border border-[#e2cbb6] hover:bg-[#f4e7d7] hover:border-[#cf8730] text-[#241b0f] flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                title="Previous Day (-1 Day)"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {/* Middle Rounded Pill Date Input with Calendar Icon on the Right */}
              <div className="relative flex items-center bg-white border border-[#e2cbb6] rounded-full px-3.5 py-1 shadow-2xs hover:border-[#cf8730] transition-all">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-bold font-mono text-[#241b0f] focus:outline-none cursor-pointer tracking-wider text-center hide-native-date-icon"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 pointer-events-none ml-1 shrink-0" />
              </div>

              {/* Right Circular Stepper Button */}
              <button
                type="button"
                onClick={handleNextDay}
                className="w-8 h-8 rounded-full bg-white border border-[#e2cbb6] hover:bg-[#f4e7d7] hover:border-[#cf8730] text-[#241b0f] flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                title="Next Day (+1 Day)"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              {/* All Dates Toggle Button */}
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                  !selectedDate
                    ? 'bg-[#241b0f] text-white border-[#241b0f]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-[#e2cbb6]'
                }`}
                title="View All Historic Logs"
              >
                All Dates
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search worker name or action..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#cf8730] w-44 sm:w-56 shadow-2xs"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5 text-xs">
              {['all', 'login', 'password_change', 'permission_change'].map(filterType => (
                <button
                  key={filterType}
                  onClick={() => setAuditFilter(filterType)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    auditFilter === filterType
                      ? 'bg-[#241b0f] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {filterType === 'all' ? 'All Events' : filterType === 'login' ? 'Logins' : filterType === 'password_change' ? 'Passwords' : 'Permissions'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#cf8730] hover:bg-[#f4e7d7] cursor-pointer"
                title="Refresh Logs"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-[#f4e7d7] text-[#cf8730] border border-[#e2cbb6]">
                {filteredLogs.length} Events Logged
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Audit Log Entries List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar min-h-0 space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="p-10 text-center bg-[#f4e7d7]/20 rounded-2xl border border-dashed border-[#e2cbb6] space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-xs text-slate-700">No security audit logs found for {selectedDate ? `date "${selectedDate}"` : 'selected filter'}</p>
              <p className="text-[11px] text-slate-500">Pick another date in the calendar above or click "All Dates" to view complete log history</p>
            </div>
          ) : (
            filteredLogs.map(log => {
              const isPassChange = log.type === 'password_change';
              const isLogin = log.type === 'login';
              const isDeleted = log.type === 'user_deleted';

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#EEF0F5] hover:border-[#cf8730]/40 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-2xs ${
                      isPassChange
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : isLogin
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isDeleted
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-[#f4e7d7] text-[#cf8730] border border-[#e2cbb6]'
                    }`}>
                      {isPassChange ? <Lock className="w-4 h-4" /> : isLogin ? <CheckCircle2 className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black font-sans text-[#161B26] text-xs sm:text-sm tracking-wide">{log.userName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                          {log.workerId}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase tracking-wider ${
                          isPassChange
                            ? 'bg-amber-100 text-amber-800'
                            : isLogin
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {log.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed text-xs">{log.action}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold font-sans text-slate-500 shrink-0 mt-1 tracking-tight">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.formattedTime}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

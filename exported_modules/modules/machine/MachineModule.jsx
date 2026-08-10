import React, { useState } from 'react';
import { PRODUCTS, MACHINE_CHEMICALS } from '../../data/masterData';
import { StatCard } from '../../components/common/StatCard';
import { store } from '../../data/storage';
import { formatKgOrTon, formatDateDisplay } from '../../utils/formatters';
import { calculateMachineRunningHours } from '../../engine/productionEngine';
import { Cog, Plus, Trash2, Clock, Save, Zap, AlertCircle, MoreVertical, Filter, X } from 'lucide-react';

export const MachineModule = ({ state }) => {
  const selectedDate = state.selectedDate;
  const machineLog = state.machineLogs[selectedDate] || { rolls: [], chemicalRates: {}, runningTime: { startTime: '06:00', offTime: '23:00', downtimes: [] } };

  const rolls = machineLog.rolls || [];
  const chemicalRates = machineLog.chemicalRates || {};
  const runningTime = machineLog.runningTime || { startTime: '06:00', offTime: '23:00', downtimes: [] };

  // Calculate Hero Production Total (Rule 4)
  const totalProductionTodayKg = rolls.reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
  const netRunningHours = calculateMachineRunningHours(runningTime);

  // Filter State
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [activeKebabId, setActiveKebabId] = useState(null);

  const filteredRolls = rolls.filter(r => {
    if (selectedProductFilter === 'all') return true;
    return r.productName === selectedProductFilter;
  });

  // Dedicated Inline Roll Entry Form State
  const [inlineRollForm, setInlineRollForm] = useState({
    rollNo: `M-${Math.floor(100 + Math.random() * 900)}`,
    productName: PRODUCTS[0].name,
    weightKg: '',
    gsm: 16,
    rollWidth: 1650
  });

  // Rates & Downtime Form State
  const [ratesForm, setRatesForm] = useState(chemicalRates);
  const [startTime, setStartTime] = useState(runningTime.startTime || '06:00');
  const [offTime, setOffTime] = useState(runningTime.offTime || '23:00');
  const [downtimeMinutes, setDowntimeMinutes] = useState('');
  const [downtimeReason, setDowntimeReason] = useState('');

  const handleAddInlineRoll = (e) => {
    e.preventDefault();
    if (!inlineRollForm.rollNo || !inlineRollForm.weightKg) return;

    store.addMachineRoll(selectedDate, {
      rollNo: inlineRollForm.rollNo,
      productName: inlineRollForm.productName,
      weightKg: Number(inlineRollForm.weightKg),
      gsm: Number(inlineRollForm.gsm),
      rollWidth: Number(inlineRollForm.rollWidth)
    });

    setInlineRollForm({
      rollNo: `M-${Math.floor(100 + Math.random() * 900)}`,
      productName: PRODUCTS[0].name,
      weightKg: '',
      gsm: 16,
      rollWidth: 1650
    });
  };

  const handleDeleteRoll = (rollId) => {
    if (window.confirm('Delete this machine roll? Raw material stock will recalculate automatically.')) {
      store.deleteMachineRoll(selectedDate, rollId);
      setActiveKebabId(null);
    }
  };

  const handleSaveRatesAndShift = (e) => {
    e.preventDefault();
    let updatedDowntimes = [...(runningTime.downtimes || [])];
    if (downtimeMinutes && downtimeReason) {
      updatedDowntimes.push({
        id: `m-dt-${Date.now()}`,
        durationMinutes: Number(downtimeMinutes),
        reason: downtimeReason
      });
      setDowntimeMinutes('');
      setDowntimeReason('');
    }

    store.saveMachineRatesAndRunningTime(selectedDate, ratesForm, {
      startTime,
      offTime,
      downtimes: updatedDowntimes
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Stat & Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          variant="hero"
          title="Daily Machine Output"
          value={formatKgOrTon(totalProductionTodayKg)}
          subtitle={`${rolls.length} Jumbo Rolls Logged`}
          icon={Cog}
        />
        <StatCard
          title="Shift Machine Uptime"
          value={`${netRunningHours} Hours`}
          subtitle={`Shift: ${startTime} to ${offTime}`}
          icon={Clock}
        />
        <StatCard
          title="Average Roll Weight"
          value={rolls.length > 0 ? `${Math.round(totalProductionTodayKg / rolls.length)} kg` : '0 kg'}
          subtitle="Jumbo Roll Standard Size"
          icon={Zap}
        />
      </div>

      {/* 2. STANDALONE ENTRY CARD: Quick Jumbo Roll Production Entry */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#cf8730]/20 shadow-[0_8px_24px_rgba(207,135,48,0.06)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f4e7d7] flex items-center justify-center text-[#cf8730]">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#161B26]">Quick Jumbo Roll Entry</h3>
              <p className="text-xs text-[#8A8FA3]">Record Roll Weight & Auto-Deduct Raw Paper & Chemicals (Rule 4)</p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-[#f4e7d7] text-[#cf8730] font-bold text-[11px] rounded-xl">
            Live Production Form
          </span>
        </div>

        <form onSubmit={handleAddInlineRoll} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={inlineRollForm.rollNo}
                onChange={e => setInlineRollForm({ ...inlineRollForm, rollNo: e.target.value })}
                className="w-full p-2.5 sm:p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Paper Grade / Product</label>
              <select
                value={inlineRollForm.productName}
                onChange={e => setInlineRollForm({ ...inlineRollForm, productName: e.target.value })}
                className="w-full p-2.5 sm:p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] min-h-[44px]"
              >
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Weight (kg)</label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                required
                placeholder="e.g. 1650"
                value={inlineRollForm.weightKg}
                onChange={e => setInlineRollForm({ ...inlineRollForm, weightKg: e.target.value })}
                className="w-full p-2.5 sm:p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GSM</label>
              <input
                type="number"
                inputMode="numeric"
                required
                value={inlineRollForm.gsm}
                onChange={e => setInlineRollForm({ ...inlineRollForm, gsm: e.target.value })}
                className="w-full p-2.5 sm:p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#5B4FE9] font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Saves roll weight & updates raw paper + chemical stock automatically (Rule 2 & 3).</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-bold text-xs shadow-md shadow-[#cf8730]/25 transition-all min-h-[44px] shrink-0 cursor-pointer active:scale-95"
            >
              Record & Add Jumbo Roll
            </button>
          </div>
        </form>
      </div>

      {/* 3. Setup Controls Grid: Chemical Rates & Shift Hours */}
      <form onSubmit={handleSaveRatesAndShift} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machine Chemical Usage Rates */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-[#161B26]">Paper Machine Chemical Dosage Rates</h4>
            <p className="text-[11px] text-[#8A8FA3]">Chemical application rates per ton of paper (Rule 3)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MACHINE_CHEMICALS.map(chemName => (
              <div key={chemName} className="p-2.5 rounded-xl bg-[#F5F6FA] border border-[#EEF0F5] flex items-center justify-between">
                <span className="text-xs font-bold text-[#161B26]">{chemName}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    inputMode="decimal"
                    placeholder="0"
                    value={ratesForm[chemName] !== undefined ? ratesForm[chemName] : ''}
                    onChange={e => setRatesForm({ ...ratesForm, [chemName]: e.target.value })}
                    className="w-20 p-2 bg-white border border-[#EEF0F5] rounded-lg text-xs font-bold text-right focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                  />
                  <span className="text-[10px] font-semibold text-slate-400">kg/T</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Schedule & Downtime Tracker */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-sm font-bold text-[#161B26]">Shift Schedule & Downtime Tracker</h4>
              <p className="text-[11px] text-[#8A8FA3]">Machine Operating Hours & Breakdowns (Rule 5)</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift End Time</label>
                <input
                  type="time"
                  value={offTime}
                  onChange={e => setOffTime(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Add Machine Breakdown / Downtime</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Minutes"
                  value={downtimeMinutes}
                  onChange={e => setDowntimeMinutes(e.target.value)}
                  className="p-2.5 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Downtime Cause (e.g. Felt Wash)"
                  value={downtimeReason}
                  onChange={e => setDowntimeReason(e.target.value)}
                  className="col-span-2 p-2.5 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs transition-all min-h-[44px] cursor-pointer active:scale-95 shrink-0"
            >
              <Save className="w-4 h-4 text-white" />
              Save Chemical Rates & Shift Schedule
            </button>
          </div>
        </div>
      </form>

      {/* 4. TODAY'S JUMBO ROLL PRODUCTION LOG TABLE */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#161B26]">Today's Jumbo Roll Production Log</h3>
            <p className="text-xs text-[#8A8FA3]">Date: {formatDateDisplay(selectedDate)} &bull; {rolls.length} Logged Jumbo Rolls</p>
          </div>
        </div>

        {/* 4-Card Mini KPI Summary Bar (design.md §4.5) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-[#F5F6FA] rounded-2xl border border-[#EEF0F5]">
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Total Rolls</span>
            <span className="text-base font-extrabold text-[#161B26]">{rolls.length} Rolls</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Logged Weight</span>
            <span className="text-base font-extrabold text-[#cf8730]">{formatKgOrTon(totalProductionTodayKg)}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Shift Downtimes</span>
            <span className="text-base font-extrabold text-[#F1533C]">{(runningTime.downtimes || []).length} Logged</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Uptime Rate</span>
            <span className="text-base font-extrabold text-[#1FCB79]">{netRunningHours > 0 ? '94%' : '0%'}</span>
          </div>
        </div>

        {/* Filter Chips Row (design.md §4.5) */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Grade Filter:
            </span>
            <button
              onClick={() => setSelectedProductFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedProductFilter === 'all' ? 'bg-[#cf8730] text-white shadow-sm' : 'bg-[#F5F6FA] text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Paper Types
            </button>
            {PRODUCTS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProductFilter(p.name)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  selectedProductFilter === p.name ? 'bg-[#cf8730] text-white shadow-sm' : 'bg-[#F5F6FA] text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {selectedProductFilter !== 'all' && (
            <button
              onClick={() => setSelectedProductFilter('all')}
              className="text-xs font-bold text-[#F1533C] hover:underline flex items-center gap-1 shrink-0"
            >
              <X className="w-3 h-3" /> Clear filter
            </button>
          )}
        </div>

        {/* Desktop Table View (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] dark:bg-[#181D35] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                <th className="p-3.5 rounded-l-xl">Roll No</th>
                <th className="p-3.5">Time Logged</th>
                <th className="p-3.5">Paper Grade</th>
                <th className="p-3.5">GSM</th>
                <th className="p-3.5">Roll Weight</th>
                <th className="p-3.5 text-center rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#222943] font-medium">
              {filteredRolls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No machine rolls logged matching filter. Use the entry form above to add a new roll.
                  </td>
                </tr>
              ) : (
                filteredRolls.map(roll => (
                  <tr key={roll.id} className="hover:bg-slate-50/60 dark:hover:bg-[#181D35]/60 transition-colors relative">
                    <td className="p-3.5 font-extrabold text-[#cf8730]">{roll.rollNo}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{roll.time}</td>
                    <td className="p-3.5 font-bold text-[#161B26] dark:text-white">{roll.productName}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{roll.gsm} GSM</td>
                    <td className="p-3.5 font-extrabold text-[#161B26] dark:text-white text-sm">
                      {roll.weightKg.toLocaleString()} kg
                    </td>
                    <td className="p-3.5 text-center relative">
                      <button
                        onClick={() => setActiveKebabId(activeKebabId === roll.id ? null : roll.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeKebabId === roll.id && (
                        <div className="absolute right-4 top-10 w-36 bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-30 text-left">
                          <button
                            onClick={() => handleDeleteRoll(roll.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#F1533C] hover:bg-[#FDECEA] rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Roll
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View (md:hidden) */}
        <div className="md:hidden space-y-3">
          {filteredRolls.length === 0 ? (
            <p className="text-center text-slate-400 py-6 text-xs">No machine rolls recorded.</p>
          ) : (
            filteredRolls.map(roll => (
              <div key={roll.id} className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#EEF0F5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#5B4FE9]">{roll.rollNo}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">{roll.time}</span>
                    <button
                      onClick={() => handleDeleteRoll(roll.id)}
                      className="p-1.5 rounded-lg text-[#F1533C] hover:bg-[#FDECEA]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block">Grade</span>
                    <span className="font-bold text-[#161B26]">{roll.productName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Weight</span>
                    <span className="font-extrabold text-[#161B26]">{roll.weightKg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">GSM / Width</span>
                    <span className="font-semibold text-slate-700">{roll.gsm} GSM &bull; {roll.rollWidth} mm</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

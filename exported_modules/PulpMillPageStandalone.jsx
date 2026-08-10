import React, { useState } from 'react';
import { 
  Factory, 
  AlertCircle, 
  Save, 
  Clock, 
  CheckCircle2,
  Trash2,
  Calendar,
  Search,
  Sun,
  Bell,
  ChevronDown
} from 'lucide-react';

/**
 * 📦 MASTER DATASETS: WASTE PAPER & CHEMICALS
 */
const WASTE_PAPER_ITEMS = [
  { id: 'indian_tissue_waste', name: 'Indian Tissue Waste', defaultPercent: 100 },
  { id: 'imported_tissue_waste', name: 'Imported Tissue Waste', defaultPercent: 0 },
  { id: 'smk', name: 'SMK', defaultPercent: 0 },
  { id: 'cupstock', name: 'Cupstock', defaultPercent: 0 },
  { id: 'pulp_sheet', name: 'Pulp Sheet', defaultPercent: 0 },
  { id: 'silicon', name: 'Silicon', defaultPercent: 0 },
  { id: 'broke', name: 'Broke', defaultPercent: 0 }
];

const CHEMICAL_RATES_MASTER = [
  { id: 'dsr', name: 'DSR', defaultRate: 10, unit: 'kg/T' },
  { id: 'wsr', name: 'WSR', defaultRate: 12, unit: 'kg/T' },
  { id: 'hydrogen_peroxide', name: 'Hydrogen Peroxide', defaultRate: 5, unit: 'kg/T' },
  { id: 'hypo', name: 'Hypo', defaultRate: 8, unit: 'kg/T' },
  { id: 'bleaching_powder', name: 'Bleaching Powder', defaultRate: 14, unit: 'kg/T' },
  { id: 'caustic', name: 'Caustic', defaultRate: 10, unit: 'kg/T' },
  { id: 'oba', name: 'OBA', defaultRate: 2.2, unit: 'kg/T' },
  { id: 'm_violet', name: 'M Violet', defaultRate: 0.5, unit: 'kg/T' },
  { id: 'deformer', name: 'Deformer', defaultRate: 3, unit: 'kg/T' }
];

/**
 * 🚀 MAIN STANDALONE PULP MILL PAGE COMPONENT
 */
export default function PulpMillPageStandalone() {
  const [selectedDate, setSelectedDate] = useState('2026-07-31');

  // Waste Paper Mix % state
  const [mix, setMix] = useState(() => {
    const initial = {};
    WASTE_PAPER_ITEMS.forEach(item => {
      initial[item.id] = item.defaultPercent;
    });
    return initial;
  });

  // Chemical Consumption Rates (kg / Ton) state
  const [chemRates, setChemRates] = useState(() => {
    const initial = {};
    CHEMICAL_RATES_MASTER.forEach(item => {
      initial[item.id] = item.defaultRate;
    });
    return initial;
  });

  // Downtime Log state
  const [downtimeLogs, setDowntimeLogs] = useState([
    { id: 1, durationMinutes: 20, reason: 'Doctor blade adjustment & cleaning', timestamp: '10:45 AM' }
  ]);
  const [downtimeMinutes, setDowntimeMinutes] = useState('');
  const [downtimeReason, setDowntimeReason] = useState('');

  // Notification Banner State
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Formula sum check
  const formulaSum = Object.values(mix).reduce((sum, val) => sum + Number(val || 0), 0);
  const isFormula100 = formulaSum === 100;

  const handleMixChange = (itemId, val) => {
    setMix(prev => ({ ...prev, [itemId]: val === '' ? '' : Math.max(0, Number(val)) }));
  };

  const handleRateChange = (chemId, val) => {
    setChemRates(prev => ({ ...prev, [chemId]: val === '' ? '' : Math.max(0, Number(val)) }));
  };

  const handleSaveFormulaAndRates = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleAddDowntime = (e) => {
    e.preventDefault();
    if (!downtimeMinutes || !downtimeReason) return;

    setDowntimeLogs(prev => [
      {
        id: Date.now(),
        durationMinutes: Number(downtimeMinutes),
        reason: downtimeReason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);

    setDowntimeMinutes('');
    setDowntimeReason('');
  };

  const handleDeleteDowntime = (id) => {
    setDowntimeLogs(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0b0e1b] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans space-y-6">
      {/* Top Header Navbar (Matching Screenshot UI) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C2237] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Pulp Mill</h1>
          <p className="text-xs text-slate-400 font-medium">Saheb Paper Mill &bull; Unit 1 (Tissue Line)</p>
        </div>

        {/* Date Filter & Top Bar Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {['Week', 'Month', 'Year', 'All'].map(t => (
            <button
              key={t}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                t === 'Week' ? 'bg-[#cf8730] text-white shadow-md' : 'bg-[#1C2237] text-slate-300 hover:bg-[#252D48]'
              }`}
            >
              {t}
            </button>
          ))}
          <div className="flex items-center gap-2 bg-[#12162B] border border-[#222943] px-3 py-1.5 rounded-xl text-xs font-semibold text-white">
            <Calendar className="w-3.5 h-3.5 text-[#cf8730]" />
            <span>{selectedDate}</span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button className="p-2 rounded-xl bg-[#12162B] border border-[#222943] text-slate-400 hover:text-white">
              <Sun className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-[#12162B] border border-[#222943] text-slate-400 hover:text-white">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 bg-[#12162B] border border-[#222943] px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-[#cf8730] text-white text-xs font-black flex items-center justify-center">
                R
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[11px] font-bold text-white">Rajesh Sharma</div>
                <div className="text-[9px] text-slate-400">EMP-001</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner Notice Card */}
      <div className="bg-[#12162B] rounded-2xl p-5 sm:p-6 border border-[#222943] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Factory className="w-5 h-5 text-[#cf8730]" />
            <h3 className="text-base sm:text-lg font-extrabold text-white">Pulp Mill Daily Formula & Rate Setup</h3>
          </div>
          <p className="text-xs text-slate-400">
            Date: <span className="font-semibold text-slate-200">{selectedDate}</span> &bull; Governs automatic stock deduction on Machine Roll logging (Rule 2 & 3).
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1FCB79]/15 text-[#1FCB79] border border-[#1FCB79]/30 rounded-xl text-xs font-extrabold animate-in fade-in transition-all">
            <CheckCircle2 className="w-4 h-4" />
            Formula & Rates Saved to Engine!
          </div>
        )}
      </div>

      {/* Main Grid: Waste Paper Mix % & Chemical Consumption Rates */}
      <form onSubmit={handleSaveFormulaAndRates} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Waste Paper Consumption (%) */}
        <div className="bg-[#12162B] rounded-2xl p-5 sm:p-6 border border-[#222943] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#222943] pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-white">1. Waste Paper Consumption (%)</h4>
              <p className="text-[11px] text-slate-400">Total share must equal 100% (Rule 2)</p>
            </div>
            <div className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all ${
              isFormula100
                ? 'bg-[#1FCB79]/15 text-[#1FCB79] border border-[#1FCB79]/30 shadow-xs'
                : 'bg-[#cf8730]/15 text-[#cf8730] border border-[#cf8730]/30'
            }`}>
              {!isFormula100 && <AlertCircle className="w-3.5 h-3.5" />}
              Total: {formulaSum}% {isFormula100 ? '(Valid)' : '(Warning)'}
            </div>
          </div>

          <div className="space-y-3">
            {WASTE_PAPER_ITEMS.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-[#181D35] border border-[#262D4A]">
                <span className="text-xs font-bold text-white">{item.name}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={mix[item.id] !== undefined ? mix[item.id] : ''}
                    onChange={e => handleMixChange(item.id, e.target.value)}
                    className="w-20 p-2 bg-[#1C2237] border border-[#262D4A] rounded-lg text-xs font-extrabold text-white text-right focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
                  />
                  <span className="text-xs font-semibold text-slate-400">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Chemical Consumption Rates (kg / Ton) */}
        <div className="bg-[#12162B] rounded-2xl p-5 sm:p-6 border border-[#222943] shadow-xl space-y-4">
          <div className="border-b border-[#222943] pb-3">
            <h4 className="text-sm font-extrabold text-white">2. Chemical Consumption Rates (kg / Ton)</h4>
            <p className="text-[11px] text-slate-400">Pulp mill chemicals deducted per ton of paper (Rule 3)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHEMICAL_RATES_MASTER.map(chem => (
              <div key={chem.id} className="p-3 rounded-xl bg-[#181D35] border border-[#262D4A] flex items-center justify-between">
                <span className="text-xs font-bold text-white">{chem.name}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={chemRates[chem.id] !== undefined ? chemRates[chem.id] : ''}
                    onChange={e => handleRateChange(chem.id, e.target.value)}
                    className="w-20 p-2 bg-[#1C2237] border border-[#262D4A] rounded-lg text-xs font-extrabold text-white text-right focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
                  />
                  <span className="text-[10px] font-semibold text-slate-400">{chem.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#222943] flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-extrabold text-xs shadow-lg shadow-[#cf8730]/25 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4 text-white" />
              Save Formula & Rates
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Pulp Mill Downtime Log */}
      <div className="bg-[#12162B] rounded-2xl p-5 sm:p-6 border border-[#222943] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#cf8730]" />
            <h4 className="text-sm font-extrabold text-white">Pulp Mill Downtime Log (Date: {selectedDate})</h4>
          </div>
        </div>

        <form onSubmit={handleAddDowntime} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="number"
            placeholder="Duration (Minutes)"
            value={downtimeMinutes}
            onChange={e => setDowntimeMinutes(e.target.value)}
            className="p-3 bg-[#181D35] border border-[#262D4A] rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
          />
          <input
            type="text"
            placeholder="Downtime Reason (e.g. Pump cleaning)"
            value={downtimeReason}
            onChange={e => setDowntimeReason(e.target.value)}
            className="p-3 bg-[#181D35] border border-[#262D4A] rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#cf8730] sm:col-span-2"
          />
          <button
            type="submit"
            className="p-3 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            + Log Downtime
          </button>
        </form>

        {/* Logged Downtime List */}
        <div className="space-y-2 pt-2">
          {downtimeLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No downtime recorded for today.</p>
          ) : (
            downtimeLogs.map(dt => (
              <div key={dt.id} className="p-3 rounded-xl bg-[#181D35] border border-[#262D4A] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{dt.reason}</span>
                  <span className="text-[10px] text-slate-400">({dt.timestamp || 'Logged'})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold px-3 py-1 rounded-lg bg-[#F1533C]/15 text-[#F1533C] border border-[#F1533C]/30">
                    {dt.durationMinutes} Mins
                  </span>
                  <button
                    onClick={() => handleDeleteDowntime(dt.id)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { RAW_MATERIALS, PULP_MILL_CHEMICALS } from '../../data/masterData';
import { StatCard } from '../../components/common/StatCard';
import { StatusPill } from '../../components/common/StatusPill';
import { store } from '../../data/storage';
import { formatDateDisplay } from '../../utils/formatters';
import { Factory, AlertCircle, Save, Clock, Plus, CheckCircle2 } from 'lucide-react';

export const PulpMillModule = ({ state }) => {
  const selectedDate = state.selectedDate;
  const pulpLog = state.pulpMillLogs[selectedDate] || { wastePaperMix: {}, chemicalRates: {}, downtimeLogs: [] };
  const isReadOnly = state?.activeRole === 'guest_viewer' || state?.users?.find(u => u.id === state.activeUserId)?.isReadOnly;

  // Waste Paper Items
  const wastePaperItems = RAW_MATERIALS.filter(m => m.category === 'waste_paper');

  // Form State
  const [mix, setMix] = useState({});
  const [chemRates, setChemRates] = useState({});
  const [downtimeReason, setDowntimeReason] = useState('');
  const [downtimeMinutes, setDowntimeMinutes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setMix(pulpLog.wastePaperMix || {});
    setChemRates(pulpLog.chemicalRates || {});
  }, [selectedDate, state.pulpMillLogs]);

  // Formula sum check
  const formulaSum = Object.values(mix).reduce((sum, val) => sum + Number(val || 0), 0);
  const isFormula100 = formulaSum === 100;

  const handleMixChange = (itemId, val) => {
    if (isReadOnly) return;
    setMix(prev => ({ ...prev, [itemId]: val === '' ? '' : Math.max(0, Number(val)) }));
  };

  const handleRateChange = (chemName, val) => {
    if (isReadOnly) return;
    setChemRates(prev => ({ ...prev, [chemName]: val === '' ? '' : Math.max(0, Number(val)) }));
  };

  const handleSaveFormulaAndRates = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    let downtimeObj = null;
    if (downtimeMinutes && downtimeReason) {
      downtimeObj = { durationMinutes: Number(downtimeMinutes), reason: downtimeReason };
    }

    store.savePulpMillLog(selectedDate, mix, chemRates, downtimeObj);

    if (downtimeObj) {
      setDowntimeMinutes('');
      setDowntimeReason('');
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Factory className="w-5 h-5 text-[#cf8730]" />
            <h3 className="text-lg font-bold text-[#161B26]">Pulp Mill Daily Formula & Rate Setup</h3>
          </div>
          <p className="text-xs text-[#8A8FA3]">
            Date: <span className="font-semibold text-slate-700">{formatDateDisplay(selectedDate)}</span> &bull; Governs automatic stock deduction on Machine Roll logging (Rule 2 & 3).
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#E7F9EF] text-[#16A34A] border border-[#16A34A]/30 dark:bg-[#1FCB79]/15 dark:text-[#1FCB79] dark:border-[#1FCB79]/30 rounded-xl text-xs font-extrabold animate-in fade-in transition-all">
            <CheckCircle2 className="w-4 h-4" />
            Formula & Rates Saved to Engine!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveFormulaAndRates} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Paper Mix % Formula Card (Rule 2) */}
        <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-[#161B26]">1. Waste Paper Consumption (%)</h4>
              <p className="text-[11px] text-[#8A8FA3]">Total share must equal 100% (Rule 2)</p>
            </div>
            <div className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all ${
              isFormula100
                ? 'bg-[#E7F9EF] text-[#16A34A] border border-[#16A34A]/30 dark:bg-[#1FCB79]/15 dark:text-[#1FCB79] dark:border-[#1FCB79]/30 shadow-xs'
                : 'bg-[#FEF3E1] text-[#D97706] border border-[#D97706]/30 dark:bg-[#F5A623]/15 dark:text-[#F5A623] dark:border-[#F5A623]/30'
            }`}>
              {!isFormula100 && <AlertCircle className="w-3.5 h-3.5" />}
              Total: {formulaSum}% {isFormula100 ? '(Valid)' : '(Warning)'}
            </div>
          </div>

          <div className="space-y-3">
            {wastePaperItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F6FA] border border-[#EEF0F5]">
                <span className="text-xs font-bold text-[#161B26]">{item.name}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={mix[item.id] !== undefined ? mix[item.id] : ''}
                    onChange={e => handleMixChange(item.id, e.target.value)}
                    className={`w-20 p-1.5 border rounded-lg text-xs font-bold text-right focus:outline-none ${
                      isReadOnly
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                        : 'bg-white border-[#EEF0F5] text-slate-900 focus:ring-2 focus:ring-[#cf8730]'
                    }`}
                  />
                  <span className="text-xs font-semibold text-slate-500">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chemical Rates per Ton Card (Rule 3) */}
        <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-sm font-bold text-[#161B26]">2. Chemical Consumption Rates (kg / Ton)</h4>
              <p className="text-[11px] text-[#8A8FA3]">Pulp mill chemicals deducted per ton of paper (Rule 3)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PULP_MILL_CHEMICALS.map(chemName => (
                <div key={chemName} className="p-2.5 rounded-xl bg-[#F5F6FA] border border-[#EEF0F5] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#161B26]">{chemName}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                      value={chemRates[chemName] !== undefined ? chemRates[chemName] : ''}
                      onChange={e => handleRateChange(chemName, e.target.value)}
                      className={`w-20 p-1.5 border rounded-lg text-xs font-bold text-right focus:outline-none ${
                        isReadOnly
                          ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                          : 'bg-white border-[#EEF0F5] text-slate-900 focus:ring-2 focus:ring-[#cf8730]'
                      }`}
                    />
                    <span className="text-[10px] font-semibold text-slate-400">kg/T</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            {isReadOnly ? (
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-extrabold shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>🔒 Formula & Rates Saved (Read-Only Mode)</span>
              </div>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-bold text-xs shadow-lg shadow-[#cf8730]/25 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4 text-white" />
                Save Formula & Rates
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Pulp Mill Downtime Log Section (Rule 5) */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F5A623]" />
            <h4 className="text-sm font-bold text-[#161B26]">Pulp Mill Downtime Log (Date: {formatDateDisplay(selectedDate)})</h4>
          </div>
        </div>

        {!isReadOnly && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="number"
              placeholder="Duration (Minutes)"
              value={downtimeMinutes}
              onChange={e => setDowntimeMinutes(e.target.value)}
              className="p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
            />
            <input
              type="text"
              placeholder="Downtime Reason (e.g. Pump cleaning)"
              value={downtimeReason}
              onChange={e => setDowntimeReason(e.target.value)}
              className="p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#cf8730] sm:col-span-2"
            />
          </div>
        )}

        {/* Saved Downtimes List */}
        <div className="space-y-2 pt-2">
          {(pulpLog.downtimeLogs || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No downtime recorded for today.</p>
          ) : (
            (pulpLog.downtimeLogs || []).map(dt => (
              <div key={dt.id} className="p-3 rounded-xl bg-[#F5F6FA] dark:bg-[#181D35] border border-slate-200 dark:border-[#262D4A] flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{dt.reason}</span>
                <span className="font-bold px-2.5 py-1 rounded-lg bg-[#FDECEA] text-[#DC2626] border border-[#DC2626]/20 dark:bg-[#F1533C]/15 dark:text-[#F1533C] dark:border-[#F1533C]/30 transition-all">{dt.durationMinutes} Mins</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

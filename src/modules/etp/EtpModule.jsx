import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { store } from '../../data/storage';
import { formatDateDisplay } from '../../utils/formatters';
import { Droplets, Save, CheckCircle2 } from 'lucide-react';

export const EtpModule = ({ state }) => {
  const selectedDate = state.selectedDate;
  const isReadOnly = state?.activeRole === 'guest_viewer' || state?.users?.find(u => u.id === state.activeUserId)?.isReadOnly;
  const etpLog = state.etpLogs[selectedDate] || { flockLiquidLtr: '', flockMasterKg: '' };

  const [flockLiq, setFlockLiq] = useState(etpLog.flockLiquidLtr || '');
  const [flockMaster, setFlockMaster] = useState(etpLog.flockMasterKg || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFlockLiq(etpLog.flockLiquidLtr || '');
    setFlockMaster(etpLog.flockMasterKg || '');
  }, [selectedDate, state.etpLogs]);

  const handleSaveEtp = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    store.saveEtpLog(selectedDate, {
      flockLiquidLtr: Number(flockLiq),
      flockMasterKg: Number(flockMaster)
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard
          variant="hero"
          title="Flock 100 Liquid (Sedicell)"
          value={`${Number(flockLiq || 0).toLocaleString()} Ltr`}
          subtitle="Deducted from Raw Material Chemical Stock (Rule 8)"
          icon={Droplets}
        />
        <StatCard
          title="Flock Master (Solid)"
          value={`${Number(flockMaster || 0).toLocaleString()} kg`}
          subtitle="Deducted from Raw Material Chemical Stock (Rule 8)"
          icon={Droplets}
        />
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-[#161B26]">ETP Effluent Treatment Chemical Log</h3>
            <p className="text-xs text-[#8A8FA3]">Date: {formatDateDisplay(selectedDate)} &bull; Direct Deduction from Chemical Inventory (Rule 8)</p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E7F9EF] text-[#1FCB79] rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Saved & Chemical Stock Deducted!
            </div>
          )}
        </div>

        <form onSubmit={handleSaveEtp} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Flock 100 Liq (Sedicell) Usage (Liters)</label>
              <input
                type="number"
                required
                disabled={isReadOnly}
                readOnly={isReadOnly}
                placeholder="e.g. 45"
                value={flockLiq}
                onChange={e => setFlockLiq(e.target.value)}
                className={`w-full p-3 border rounded-xl text-xs font-bold focus:outline-none ${
                  isReadOnly
                    ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                    : 'bg-[#F5F6FA] border-[#EEF0F5] text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Flock Master (Solid) Usage (kg)</label>
              <input
                type="number"
                required
                disabled={isReadOnly}
                readOnly={isReadOnly}
                placeholder="e.g. 30"
                value={flockMaster}
                onChange={e => setFlockMaster(e.target.value)}
                className={`w-full p-3 border rounded-xl text-xs font-bold focus:outline-none ${
                  isReadOnly
                    ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                    : 'bg-[#F5F6FA] border-[#EEF0F5] text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end">
            {isReadOnly ? (
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-extrabold shrink-0">
                <Droplets className="w-4 h-4 text-amber-600" />
                <span>🔒 ETP Log Saved (Read-Only Mode)</span>
              </div>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-bold text-xs shadow-lg shadow-[#cf8730]/25 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4 text-white" />
                Save ETP Log & Deduct Stock
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { store } from '../../data/storage';
import { formatDateDisplay, formatKgOrTon } from '../../utils/formatters';
import { Flame, Droplets, Save, CheckCircle2 } from 'lucide-react';

export const BoilerModule = ({ state }) => {
  const selectedDate = state.selectedDate;
  const isReadOnly = state?.activeRole === 'guest_viewer' || state?.users?.find(u => u.id === state.activeUserId)?.isReadOnly;
  const boilerLog = state.boilerLogs[selectedDate] || { woodConsumptionKg: '', waterConsumptionLtr: '', woodType: 'Wood' };

  const machineLog = state.machineLogs[selectedDate] || { rolls: [] };
  const totalPaperProducedKg = (machineLog.rolls || []).reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
  const totalTonsProduced = totalPaperProducedKg / 1000;

  const [woodKg, setWoodKg] = useState(boilerLog.woodConsumptionKg || '');
  const [waterLtr, setWaterLtr] = useState(boilerLog.waterConsumptionLtr || '');
  const [woodType, setWoodType] = useState(boilerLog.woodType || 'Wood');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setWoodKg(boilerLog.woodConsumptionKg || '');
    setWaterLtr(boilerLog.waterConsumptionLtr || '');
    setWoodType(boilerLog.woodType || 'Wood');
  }, [selectedDate, state.boilerLogs]);

  // Rule 7: Auto calculated Wood per Ton ratio
  const woodPerTon = totalTonsProduced > 0 && woodKg > 0 ? (Number(woodKg) / totalTonsProduced).toFixed(2) : '0';

  const handleSaveBoiler = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    store.saveBoilerLog(selectedDate, {
      woodConsumptionKg: Number(woodKg),
      waterConsumptionLtr: Number(waterLtr),
      woodType
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Stat Card — Rule 7 Auto Wood/Ton Ratio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          variant="hero"
          title="Auto Wood / Ton Ratio (Rule 7)"
          value={`${woodPerTon} kg / Ton`}
          subtitle="Auto Calculated (Wood ÷ Total Tons Today)"
          icon={Flame}
        />
        <StatCard
          title="Total Firewood Consumption"
          value={formatKgOrTon(woodKg || 0)}
          subtitle={`Type: ${woodType} (Deducted from Stock)`}
          icon={Flame}
        />
        <StatCard
          title="Water Consumption"
          value={`${Number(waterLtr || 0).toLocaleString()} Ltr`}
          subtitle="Boiler Feed Water Log"
          icon={Droplets}
        />
      </div>

      {/* Main Daily Entry Form Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-[#161B26]">Boiler Daily Consumption Entry</h3>
            <p className="text-xs text-[#8A8FA3]">Date: {formatDateDisplay(selectedDate)} &bull; Deducts Firewood Stock (Rule 7)</p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E7F9EF] text-[#1FCB79] rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Saved & Firewood Stock Updated!
            </div>
          )}
        </div>

        <form onSubmit={handleSaveBoiler} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Firewood Fuel Type</label>
              <select
                disabled={isReadOnly}
                value={woodType}
                onChange={e => setWoodType(e.target.value)}
                className={`w-full p-3 border rounded-xl text-xs font-bold focus:outline-none ${
                  isReadOnly
                    ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                    : 'bg-[#F5F6FA] border-[#EEF0F5] text-slate-900'
                }`}
              >
                <option value="Wood">Wood</option>
                <option value="Biocoal">Biocoal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Fuel Consumption (kg)</label>
              <input
                type="number"
                required
                disabled={isReadOnly}
                readOnly={isReadOnly}
                placeholder="e.g. 4000"
                value={woodKg}
                onChange={e => setWoodKg(e.target.value)}
                className={`w-full p-3 border rounded-xl text-xs font-bold focus:outline-none ${
                  isReadOnly
                    ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                    : 'bg-[#F5F6FA] border-[#EEF0F5] text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Water Consumption (Liters)</label>
              <input
                type="number"
                required
                disabled={isReadOnly}
                readOnly={isReadOnly}
                placeholder="e.g. 12000"
                value={waterLtr}
                onChange={e => setWaterLtr(e.target.value)}
                className={`w-full p-3 border rounded-xl text-xs font-bold focus:outline-none ${
                  isReadOnly
                    ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                    : 'bg-[#F5F6FA] border-[#EEF0F5] text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Auto Calculation Preview */}
          <div className="p-4 rounded-xl bg-[#F5F6FA] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
            <div>
              <span className="font-bold text-[#161B26] block">Rule 7 Calculation Engine Preview</span>
              <span className="text-slate-500">
                Paper Production Today: <strong className="text-slate-700">{totalTonsProduced.toFixed(2)} Tons</strong> ({totalPaperProducedKg} kg)
              </span>
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 font-extrabold text-[#5B4FE9] text-sm">
              Wood / Ton = {woodPerTon} kg/Ton
            </div>
          </div>

          <div className="flex justify-end">
            {isReadOnly ? (
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-extrabold shrink-0">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>🔒 Boiler Log Saved (Read-Only Mode)</span>
              </div>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-bold text-xs shadow-lg shadow-[#cf8730]/25 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4 text-white" />
                Save Boiler Log & Deduct Firewood
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

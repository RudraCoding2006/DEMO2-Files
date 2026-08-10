import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { store } from '../../data/storage';
import { formatDateDisplay } from '../../utils/formatters';
import { Zap, Save, CheckCircle2 } from 'lucide-react';

export const ElectricityModule = ({ state }) => {
  const selectedDate = state.selectedDate;
  const elecLog = state.electricityLogs[selectedDate] || { dailyUnitsKwh: '' };

  const machineLog = state.machineLogs[selectedDate] || { rolls: [] };
  const totalPaperProducedKg = (machineLog.rolls || []).reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
  const totalTonsProduced = totalPaperProducedKg / 1000;

  const [unitsKwh, setUnitsKwh] = useState(elecLog.dailyUnitsKwh || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setUnitsKwh(elecLog.dailyUnitsKwh || '');
  }, [selectedDate, state.electricityLogs]);

  // Rule 9: Auto calculated Unit per Ton ratio
  const unitPerTon = totalTonsProduced > 0 && unitsKwh > 0 ? (Number(unitsKwh) / totalTonsProduced).toFixed(2) : '0';

  const handleSaveElectricity = (e) => {
    e.preventDefault();
    store.saveElectricityLog(selectedDate, {
      dailyUnitsKwh: Number(unitsKwh)
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stat Cards — Rule 9 Auto Unit/Ton Ratio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard
          variant="hero"
          title="Auto Unit / Ton Ratio (Rule 9)"
          value={`${unitPerTon} kWh / Ton`}
          subtitle="Auto Calculated (Daily kWh ÷ Total Tons Today)"
          icon={Zap}
        />
        <StatCard
          title="Total Daily Unit Consumption"
          value={`${Number(unitsKwh || 0).toLocaleString()} kWh`}
          subtitle="Mill Main Meter Reading"
          icon={Zap}
        />
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-[#161B26]">Electricity Daily Consumption Entry</h3>
            <p className="text-xs text-[#8A8FA3]">Date: {formatDateDisplay(selectedDate)} &bull; Computes Energy Efficiency per Ton (Rule 9)</p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E7F9EF] text-[#1FCB79] rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Saved & Energy Ratio Updated!
            </div>
          )}
        </div>

        <form onSubmit={handleSaveElectricity} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Daily Unit Consumption (kWh)</label>
            <input
              type="number"
              required
              placeholder="e.g. 5000"
              value={unitsKwh}
              onChange={e => setUnitsKwh(e.target.value)}
              className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
            />
          </div>

          {/* Auto Calculation Preview */}
          <div className="p-4 rounded-xl bg-[#F5F6FA] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
            <div>
              <span className="font-bold text-[#161B26] block">Rule 9 Calculation Engine Preview</span>
              <span className="text-slate-500">
                Paper Production Today: <strong className="text-slate-700">{totalTonsProduced.toFixed(2)} Tons</strong> ({totalPaperProducedKg} kg)
              </span>
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 font-extrabold text-[#5B4FE9] text-sm">
              Unit / Ton = {unitPerTon} kWh/Ton
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-bold text-xs shadow-lg shadow-[#cf8730]/25 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4 text-white" />
              Save Electricity Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

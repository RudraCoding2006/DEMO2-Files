import React, { useState } from 'react';
import { PRODUCTS } from '../../data/masterData';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { store } from '../../data/storage';
import { formatKgOrTon, formatDateDisplay, formatSingleSize } from '../../utils/formatters';
import { RotateCw, Plus, RefreshCw, AlertCircle, AlertTriangle, PackageCheck, Filter, X, MoreVertical, Trash2 } from 'lucide-react';

export const RewinderModule = ({ state }) => {
  const selectedDate = state.selectedDate;
  const reels = (state.rewinderReels || []).filter(r => r.date === selectedDate);

  const isReadOnly = state?.activeRole === 'guest_viewer' || state?.users?.find(u => u.id === state.activeUserId)?.isReadOnly;

  // Stats
  const totalReelWeightKg = reels.reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
  const totalBrokeKg = reels.reduce((sum, r) => sum + Number(r.brokeKg || 0), 0);
  const netFinishStockKg = Math.max(0, totalReelWeightKg - totalBrokeKg);

  // Filter State
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [activeKebabId, setActiveKebabId] = useState(null);

  const filteredReels = reels.filter(r => {
    if (selectedProductFilter === 'all') return true;
    return r.productName === selectedProductFilter;
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reelsCut, setReelsCut] = useState(1);
  const [reelItems, setReelItems] = useState([
    {
      reelNo: `RL-${Math.floor(100 + Math.random() * 900)}`,
      gsm: '',
      size: '',
      weightKg: '',
      joint: ''
    }
  ]);
  const [reelForm, setReelForm] = useState({
    runningRollNo: 'M-001',
    runningSize: '1650 mm',
    productName: PRODUCTS[0].name,
    gsm: 16,
    size: '30cm',
    ply: 1,
    dia: 900,
    joint: 0,
    weightKg: '',
    brokeKg: ''
  });

  const handleReelsCutChange = (count, currentWeightKg = reelForm.weightKg, currentProdName = reelForm.productName) => {
    const num = Math.min(17, Math.max(1, Number(count)));
    setReelsCut(num);
    const baseNum = Math.floor(100 + Math.random() * 900);
    const splitWeight = currentWeightKg ? (Number(currentWeightKg) / num).toFixed(0) : '';

    setReelItems(prev => {
      const nextArr = [];
      for (let i = 0; i < num; i++) {
        if (prev[i]) {
          nextArr.push({
            ...prev[i],
            weightKg: prev[i].weightKg || splitWeight
          });
        } else {
          nextArr.push({
            reelNo: `RL-${baseNum + i}`,
            gsm: '',
            size: '',
            weightKg: splitWeight,
            joint: ''
          });
        }
      }
      return nextArr;
    });
  };

  const handleProductChange = (prodName) => {
    setReelForm(prev => ({ ...prev, productName: prodName }));
  };

  const handleTotalWeightChange = (weight) => {
    setReelForm(prev => ({ ...prev, weightKg: weight }));
    if (!weight) return;
    const count = reelsCut || 1;
    const splitWeight = (Number(weight) / count).toFixed(0);
    setReelItems(prev => prev.map(item => ({
      ...item,
      weightKg: splitWeight
    })));
  };

  // Live Weight Mismatch & Validation Check
  const totalEnteredWeight = Number(reelForm.weightKg || 0);
  const sumCutWeights = reelItems.reduce((acc, item) => acc + (Number(item.weightKg) || 0), 0);
  const weightDiff = sumCutWeights - totalEnteredWeight;
  const isWeightMismatch = totalEnteredWeight > 0 && Math.abs(weightDiff) >= 1;

  // Duplicate Reel No Check
  const reelNoSet = new Set();
  let hasDuplicateReelNo = false;
  reelItems.forEach(item => {
    const trimmed = (item.reelNo || '').trim().toUpperCase();
    if (trimmed && reelNoSet.has(trimmed)) {
      hasDuplicateReelNo = true;
    }
    if (trimmed) reelNoSet.add(trimmed);
  });

  const handleAddReel = (e) => {
    e.preventDefault();
    if (!reelForm.weightKg || reelItems.length === 0) return;

    if (isWeightMismatch) {
      alert(`⚠️ Cannot Save Reel Entry!\n\nWeight Mismatch Detected:\nSum of cut reels (${sumCutWeights.toLocaleString()} kg) does not match Total Roll Weight (${totalEnteredWeight.toLocaleString()} kg).\nDiscrepancy: ${weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg.\n\nPlease fix the weights before submitting.`);
      return;
    }

    if (hasDuplicateReelNo) {
      alert(`⚠️ Cannot Save Reel Entry!\n\nDuplicate Reel Numbers detected among cut reels. Please give each cut reel a unique Reel No.`);
      return;
    }

    const count = reelsCut || 1;
    const defaultWeightPerReel = Number(reelForm.weightKg) / count;

    reelItems.forEach((item, idx) => {
      const itemWeight = item.weightKg !== '' ? Number(item.weightKg) : defaultWeightPerReel;
      store.addRewinderReel({
        date: selectedDate,
        reelNo: item.reelNo.trim() || `RL-${Math.floor(100 + Math.random() * 900)}-${idx + 1}`,
        runningRollNo: reelForm.runningRollNo,
        runningSize: reelForm.runningSize,
        productName: reelForm.productName,
        gsm: Number(item.gsm || 16),
        size: item.size ? formatSingleSize(item.size) : '30cm',
        ply: 1, // Fixed 1 Ply for every reel as requested
        dia: Number(reelForm.dia || 900),
        joint: Number(item.joint || 0),
        weightKg: Number(itemWeight.toFixed(2)),
        brokeKg: 0
      });
    });

    setIsModalOpen(false);
    setReelsCut(1);
    setReelItems([{
      reelNo: `RL-${Math.floor(100 + Math.random() * 900)}`,
      gsm: '',
      size: '',
      weightKg: '',
      joint: ''
    }]);
    setReelForm({
      runningRollNo: 'M-001',
      runningSize: '1650 mm',
      productName: PRODUCTS[0].name,
      gsm: 16,
      size: '30cm',
      ply: 1,
      dia: 900,
      joint: 0,
      weightKg: '',
      brokeKg: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          variant="hero"
          title="Rewinder Reel Output Today"
          value={formatKgOrTon(totalReelWeightKg)}
          subtitle={`${reels.length} Finished Reels Formed`}
          icon={RotateCw}
        />
        <StatCard
          title="Broke (Wastage) Generated (Rule 6)"
          value={formatKgOrTon(totalBrokeKg)}
          subtitle="Auto Loop-Back to Raw Material > Broke"
          icon={RefreshCw}
          trend={totalReelWeightKg > 0 ? `${((totalBrokeKg / totalReelWeightKg) * 100).toFixed(1)}% Loss` : '0%'}
          trendType="down"
        />
        <StatCard
          title="Net Added to Finish Stock"
          value={formatKgOrTon(netFinishStockKg)}
          subtitle="Net of Broke (Rule 6 & 10)"
          icon={PackageCheck}
          trend="+Ready"
          trendType="up"
        />
      </div>

      {/* Main Reels Table & Mobile Card Stack Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#161B26]">Rewinder Reel Production Log</h3>
            <p className="text-xs text-[#8A8FA3]">Date: {formatDateDisplay(selectedDate)} &bull; Broke automatically increases Raw Material Stock (Rule 6)</p>
          </div>

          {isReadOnly ? (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>🔒 Read-Only Guest Mode</span>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-[#cf8730] hover:bg-[#b87528] text-white font-extrabold text-xs shadow-md shadow-[#cf8730]/25 transition-all min-h-[44px] cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 text-white" />
              + Add Reel Entry
            </button>
          )}
        </div>

        {/* 4-Card Mini KPI Summary Bar (design.md §4.5) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-[#F5F6FA] rounded-2xl border border-[#EEF0F5]">
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Total Reels</span>
            <span className="text-base font-extrabold text-[#161B26]">{reels.length} Reels</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Total Weight</span>
            <span className="text-base font-extrabold text-[#cf8730]">{formatKgOrTon(totalReelWeightKg)}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Broke Returned</span>
            <span className="text-base font-extrabold text-[#F1533C]">+{totalBrokeKg} kg</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Net Yield Rate</span>
            <span className="text-base font-extrabold text-[#1FCB79]">
              {totalReelWeightKg > 0 ? `${(100 - (totalBrokeKg / totalReelWeightKg) * 100).toFixed(1)}%` : '100%'}
            </span>
          </div>
        </div>

        {/* Filter Chips Row (design.md §4.5) */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setSelectedProductFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedProductFilter === 'all'
                  ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                  : 'bg-[#F5F6FA] dark:bg-[#1C2237] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252D48]'
              }`}
            >
              All Paper Types
            </button>
            {PRODUCTS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProductFilter(p.name)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  selectedProductFilter === p.name
                    ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                    : 'bg-[#F5F6FA] dark:bg-[#1C2237] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252D48]'
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
              <tr className="bg-[#F5F6FA] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                <th className="p-3.5 rounded-l-xl">Running Roll</th>
                <th className="p-3.5">Reel No</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">GSM / Size / Ply</th>
                <th className="p-3.5">Dia / Joint</th>
                <th className="p-3.5 text-right">Reel Weight</th>
                <th className="p-3.5 text-right text-[#F1533C]">Broke (kg)</th>
                <th className="p-3.5 text-right rounded-r-xl font-bold">Net Stock Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredReels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No rewinder reels recorded matching filter. Click "+ Add Reel Entry" to log finished reels.
                  </td>
                </tr>
              ) : (
                filteredReels.map(reel => {
                  const netKg = Math.max(0, reel.weightKg - reel.brokeKg);
                  return (
                    <tr key={reel.id} className="hover:bg-slate-50/60 dark:hover:bg-[#181D35]/60 transition-colors">
                      <td className="p-3.5 font-bold text-slate-700 dark:text-slate-200">{reel.runningRollNo}</td>
                      <td className="p-3.5 font-extrabold text-[#cf8730]">{reel.reelNo}</td>
                      <td className="p-3.5 font-bold text-[#161B26] dark:text-white">{reel.productName}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{reel.gsm} GSM | {formatSingleSize(reel.size)} | {reel.ply} Ply</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{reel.dia ? `${reel.dia} mm` : '-'} | {reel.joint} Joint</td>
                      <td className="p-3.5 text-right font-bold text-[#161B26] dark:text-white">{reel.weightKg.toLocaleString()} kg</td>
                      <td className="p-3.5 text-right font-extrabold text-[#F1533C]">+{reel.brokeKg} kg</td>
                      <td className="p-3.5 text-right font-extrabold text-[#161B26] dark:text-white">{netKg.toLocaleString()} kg</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View (md:hidden) */}
        <div className="md:hidden space-y-3">
          {filteredReels.length === 0 ? (
            <p className="text-center text-slate-400 py-6 text-xs">No rewinder reels recorded.</p>
          ) : (
            filteredReels.map(reel => {
              const netKg = Math.max(0, reel.weightKg - reel.brokeKg);
              return (
                <div key={reel.id} className="p-4 rounded-2xl bg-[#F5F6FA] dark:bg-[#181D35] border border-[#EEF0F5] dark:border-[#262D4A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#cf8730]">{reel.reelNo}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#E7F9EF] text-[#1FCB79]">
                      Net: {netKg.toLocaleString()} kg
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block">Product</span>
                      <span className="font-bold text-[#161B26]">{reel.productName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Reel Weight</span>
                      <span className="font-extrabold text-[#161B26]">{reel.weightKg.toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">GSM / Size / Ply</span>
                      <span className="font-semibold text-slate-700">{reel.gsm} GSM &bull; {formatSingleSize(reel.size)} &bull; {reel.ply}P</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Broke (Returned)</span>
                      <span className="font-bold text-[#F1533C]">+{reel.brokeKg} kg</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Reel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Rewinder Reel & Broke (Rule 6)"
      >
        <form onSubmit={handleAddReel} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Running Roll No</label>
              <input
                type="text"
                value={reelForm.runningRollNo}
                onChange={e => setReelForm({ ...reelForm, runningRollNo: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] dark:bg-[#181D35] border border-[#EEF0F5] dark:border-[#262D4A] text-slate-800 dark:text-white rounded-xl text-xs font-semibold focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reels Cut (1 to 17 Max)</label>
              <select
                value={reelsCut}
                onChange={e => handleReelsCutChange(e.target.value)}
                className="w-full p-3 bg-[#F5F6FA] dark:bg-[#181D35] border border-[#EEF0F5] dark:border-[#262D4A] text-slate-800 dark:text-white rounded-xl text-xs font-semibold focus:outline-none min-h-[44px] cursor-pointer"
              >
                {Array.from({ length: 17 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n} className="dark:bg-[#12162B] dark:text-white">
                    {n} {n === 1 ? 'Reel' : 'Reels'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Running Size</label>
              <input
                type="text"
                value={reelForm.runningSize}
                onChange={e => setReelForm({ ...reelForm, runningSize: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] dark:bg-[#181D35] border border-[#EEF0F5] dark:border-[#262D4A] text-slate-800 dark:text-white rounded-xl text-xs font-semibold focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product</label>
              <select
                value={reelForm.productName}
                onChange={e => handleProductChange(e.target.value)}
                className="w-full p-3 bg-[#F5F6FA] dark:bg-[#181D35] border border-[#EEF0F5] dark:border-[#262D4A] text-slate-800 dark:text-white rounded-xl text-xs font-semibold focus:outline-none min-h-[44px]"
              >
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.name} className="dark:bg-[#12162B] dark:text-white">{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Weight (kg)</label>
              <input
                type="number"
                inputMode="numeric"
                required
                placeholder="5000"
                value={reelForm.weightKg}
                onChange={e => handleTotalWeightChange(e.target.value)}
                className="w-full p-3 bg-[#F5F6FA] dark:bg-[#181D35] border border-[#EEF0F5] dark:border-[#262D4A] text-slate-800 dark:text-white rounded-xl text-xs font-semibold focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ply</label>
              <div className="w-full p-3 bg-[#F5F6FA] dark:bg-[#181D35] border border-[#EEF0F5] dark:border-[#262D4A] text-slate-800 dark:text-white rounded-xl text-xs font-bold min-h-[44px] flex items-center justify-between">
                <span>1 Ply</span>
                <span className="text-[10px] text-slate-400 font-normal">(Fixed)</span>
              </div>
            </div>
          </div>

          {/* Live Weight Tracker & Warning Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-[#12162B] rounded-xl border border-slate-200 dark:border-[#222943] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400">Sum of Cut Reels:</span>
              <span className={`text-sm font-extrabold ${isWeightMismatch ? 'text-[#F1533C]' : 'text-[#16A34A] dark:text-[#1FCB79]'}`}>
                {sumCutWeights.toLocaleString()} kg
              </span>
              <span className="text-slate-400">/ Total Roll: {totalEnteredWeight.toLocaleString()} kg</span>
            </div>

            {totalEnteredWeight > 0 && (
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                isWeightMismatch
                  ? 'bg-[#FDECEA] text-[#F1533C] border border-[#F1533C]/40 font-black'
                  : 'bg-[#E7F9EF] text-[#16A34A] border border-[#16A34A]/30'
              }`}>
                {isWeightMismatch ? `⚠️ Discrepancy: ${weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg` : '✓ Weights Match Perfectly'}
              </span>
            )}
          </div>

          {/* Live Red Mismatch Warning Alert Box */}
          {isWeightMismatch && (
            <div className="p-3.5 rounded-xl text-xs font-semibold flex items-start gap-3 bg-[#FDECEA] text-[#F1533C] border-2 border-[#F1533C] dark:bg-[#F1533C]/20 dark:text-[#FF6B6B] dark:border-[#F1533C] shadow-md animate-pulse">
              <AlertTriangle className="w-5 h-5 shrink-0 text-[#F1533C] dark:text-[#FF6B6B] mt-0.5" />
              <div>
                <strong className="block text-sm font-black mb-0.5 uppercase tracking-wider">⚠️ Weight Mismatch Warning!</strong>
                The sum of your cut reels (<span className="underline font-extrabold">{sumCutWeights.toLocaleString()} kg</span>) does not match Total Roll Weight (<span className="underline font-extrabold">{totalEnteredWeight.toLocaleString()} kg</span>).
                <div className="mt-1 font-extrabold flex items-center gap-1.5">
                  Difference: <span className="bg-[#F1533C] text-white px-2 py-0.5 rounded text-xs font-black">{weightDiff > 0 ? `+${weightDiff.toLocaleString()}` : weightDiff.toLocaleString()} kg</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">Please adjust individual cut reel weights to match total weight before saving.</p>
              </div>
            </div>
          )}

          {/* Duplicate Reel No Warning Alert Box */}
          {hasDuplicateReelNo && (
            <div className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-[#FDECEA] text-[#F1533C] border-2 border-[#F1533C]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>Duplicate Reel No Warning:</strong> Multiple cut reels have identical Reel Numbers. Ensure each cut reel has a unique Reel No.</span>
            </div>
          )}

          {/* Dynamic Generated Reel Cut Customizer Section */}
          <div className={`p-3.5 rounded-2xl border space-y-3 transition-all ${
            isWeightMismatch ? 'bg-[#FDECEA]/30 dark:bg-[#F1533C]/10 border-[#F1533C]/50' : 'bg-[#F5F6FA] dark:bg-[#181D35] border-[#EEF0F5] dark:border-[#262D4A]'
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#cf8730] uppercase tracking-wider flex items-center gap-2">
                Configure Cut Reels [{reelsCut} {reelsCut === 1 ? 'Reel Cut' : 'Reels Cut'}]
              </label>
              <span className="text-[11px] font-semibold text-slate-400">Set individual GSM, Size, Weight & Joints for each reel</span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {reelItems.map((item, idx) => {
                const selectedProd = PRODUCTS.find(p => p.name === reelForm.productName) || PRODUCTS[0];
                return (
                  <div key={idx} className="p-3 rounded-xl bg-white dark:bg-[#12162B] border border-slate-200 dark:border-[#222943] grid grid-cols-1 sm:grid-cols-5 gap-2 items-center shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#cf8730] shrink-0">#{idx + 1}</span>
                      <input
                        type="text"
                        required
                        placeholder="Reel No (Unique)"
                        value={item.reelNo}
                        onChange={e => {
                          const updated = [...reelItems];
                          updated[idx].reelNo = e.target.value;
                          setReelItems(updated);
                        }}
                        className="w-full p-2 bg-[#F5F6FA] dark:bg-[#181D35] border border-slate-200 dark:border-[#262D4A] text-slate-800 dark:text-white rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#cf8730]"
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="GSM"
                        value={item.gsm !== undefined ? item.gsm : ''}
                        onChange={e => {
                          const updated = [...reelItems];
                          updated[idx].gsm = e.target.value;
                          setReelItems(updated);
                        }}
                        className="w-full p-2 bg-[#F5F6FA] dark:bg-[#181D35] border border-slate-200 dark:border-[#262D4A] text-slate-800 dark:text-white rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#cf8730]"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Size"
                        value={item.size !== undefined ? item.size : ''}
                        onChange={e => {
                          const updated = [...reelItems];
                          updated[idx].size = e.target.value;
                          setReelItems(updated);
                        }}
                        className="w-full p-2 bg-[#F5F6FA] dark:bg-[#181D35] border border-slate-200 dark:border-[#262D4A] text-slate-800 dark:text-white rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#cf8730]"
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="Weight (kg)"
                        value={item.weightKg !== undefined ? item.weightKg : ''}
                        onChange={e => {
                          const updated = [...reelItems];
                          updated[idx].weightKg = e.target.value;
                          setReelItems(updated);
                        }}
                        className="w-full p-2 bg-[#F5F6FA] dark:bg-[#181D35] border border-slate-200 dark:border-[#262D4A] text-slate-800 dark:text-white rounded-lg text-xs font-extrabold focus:outline-none"
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Joints"
                        value={item.joint !== undefined ? item.joint : ''}
                        onChange={e => {
                          const updated = [...reelItems];
                          updated[idx].joint = e.target.value;
                          setReelItems(updated);
                        }}
                        className="w-full p-2 bg-[#F5F6FA] dark:bg-[#181D35] border border-slate-200 dark:border-[#262D4A] text-slate-800 dark:text-white rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#cf8730]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-[#222943]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-3 rounded-xl font-semibold text-xs transition-all min-h-[44px] cursor-pointer bg-slate-100 dark:bg-[#1C2237] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252D48] border border-slate-200 dark:border-[#262D4A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isWeightMismatch || hasDuplicateReelNo}
              className={`px-5 py-3 rounded-xl font-extrabold text-xs transition-all min-h-[44px] cursor-pointer flex items-center justify-center gap-2 ${
                isWeightMismatch || hasDuplicateReelNo
                  ? 'bg-slate-200 dark:bg-[#252D48] text-[#F1533C] dark:text-[#FF6B6B] border border-[#F1533C]/50 cursor-not-allowed'
                  : 'btn-primary active:scale-95'
              }`}
            >
              {isWeightMismatch ? (
                <>
                  <AlertTriangle className="w-4 h-4" /> Fix Weight Mismatch To Save
                </>
              ) : hasDuplicateReelNo ? (
                <>
                  <AlertTriangle className="w-4 h-4" /> Fix Duplicate Reel No
                </>
              ) : (
                'Save Reel Entry'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

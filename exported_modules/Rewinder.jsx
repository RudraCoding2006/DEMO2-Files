import React, { useState } from 'react';
import { RotateCw, Plus, RefreshCw, AlertCircle, AlertTriangle, PackageCheck, Filter, X, MoreVertical, Trash2 } from 'lucide-react';

/**
 * Paper Mill Products & Master Data
 */
const PRODUCTS = [
  { id: 'p1', name: 'Napkin Tissue', gsmOptions: [14, 16, 18], sizeOptions: ['30cm', '33cm', '40cm'] },
  { id: 'p2', name: 'Toilet Tissue', gsmOptions: [15, 17, 19], sizeOptions: ['10cm'] },
  { id: 'p3', name: 'Towel Tissue', gsmOptions: [20, 22, 24], sizeOptions: ['20cm', '25cm'] },
  { id: 'p4', name: 'Hard Roll Towel', gsmOptions: [35, 38, 40], sizeOptions: ['20cm'] },
  { id: 'p5', name: 'JRT Towel', gsmOptions: [16, 18, 20], sizeOptions: ['10cm'] },
  { id: 'p6', name: 'Facial Tissue', gsmOptions: [13, 14, 15], sizeOptions: ['20cm'] },
  { id: 'p7', name: 'Carrier Tissue', gsmOptions: [18, 20], sizeOptions: ['30cm'] }
];

/**
 * Format Helpers
 */
const formatKgOrTon = (kg) => {
  const num = Number(kg) || 0;
  if (num >= 1000) {
    return `${(num / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ton`;
  }
  return `${num.toLocaleString()} kg`;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatSingleSize = (sizeStr) => {
  if (!sizeStr) return '';
  const str = String(sizeStr).trim();
  const match = str.match(/(\d+)\s*(?:x\s*\d+)?\s*(cm|mm|in)?/i);
  if (match) {
    const val = match[1];
    const unit = match[2] ? match[2].toLowerCase() : 'cm';
    return `${val}${unit}`;
  }
  return str;
};

/**
 * UI Components: StatCard & Modal
 */
const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendType = 'up', variant = 'default' }) => {
  const isHero = variant === 'hero';
  return (
    <div className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden ${
      isHero
        ? 'bg-gradient-to-br from-[#12162B] via-[#181D35] to-[#1C2237] text-white border-[#262D4A] shadow-xl'
        : 'bg-white dark:bg-[#12162B] text-slate-800 dark:text-white border-[#EEF0F5] dark:border-[#222943] shadow-[0_8px_24px_rgba(0,0,0,0.04)]'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${isHero ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{title}</p>
          <h3 className={`text-2xl sm:text-3xl font-black mt-1 ${isHero ? 'text-white' : 'text-[#161B26] dark:text-white'}`}>{value}</h3>
          {subtitle && <p className={`text-xs mt-1 font-semibold ${isHero ? 'text-[#cf8730]' : 'text-slate-500 dark:text-slate-400'}`}>{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${isHero ? 'bg-[#cf8730]/20 text-[#cf8730]' : 'bg-[#F5F6FA] dark:bg-[#181D35] text-[#cf8730]'}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#222943] flex items-center justify-between text-xs font-bold">
          <span className={trendType === 'up' ? 'text-[#16A34A]' : 'text-[#F1533C]'}>{trend}</span>
        </div>
      )}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#12162B] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-[#262D4A] p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222943] pb-3">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-[#1C2237]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

/**
 * Main Standalone Rewinder Component
 */
export default function Rewinder() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reels, setReels] = useState([
    { id: 'r1', date: selectedDate, reelNo: 'RL-101', runningRollNo: 'M-301', runningSize: '1650 mm', productName: 'Napkin Tissue', gsm: 14, size: '30cm', ply: 1, dia: 900, joint: 0, weightKg: 1000, brokeKg: 0 },
    { id: 'r2', date: selectedDate, reelNo: 'RL-102', runningRollNo: 'M-301', runningSize: '1650 mm', productName: 'Napkin Tissue', gsm: 14, size: '30cm', ply: 1, dia: 900, joint: 0, weightKg: 1000, brokeKg: 0 },
    { id: 'r3', date: selectedDate, reelNo: 'RL-103', runningRollNo: 'M-301', runningSize: '1650 mm', productName: 'Napkin Tissue', gsm: 16, size: '33cm', ply: 1, dia: 900, joint: 1, weightKg: 1000, brokeKg: 0 }
  ]);

  // Filter State
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');

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
    weightKg: '',
    brokeKg: ''
  });

  // Stats
  const totalReelWeightKg = reels.reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
  const totalBrokeKg = reels.reduce((sum, r) => sum + Number(r.brokeKg || 0), 0);
  const netFinishStockKg = Math.max(0, totalReelWeightKg - totalBrokeKg);

  const handleReelsCutChange = (count, currentWeightKg = reelForm.weightKg) => {
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

  // Validation Calculations
  const totalEnteredWeight = Number(reelForm.weightKg || 0);
  const sumCutWeights = reelItems.reduce((acc, item) => acc + (Number(item.weightKg) || 0), 0);
  const weightDiff = sumCutWeights - totalEnteredWeight;
  const isWeightMismatch = totalEnteredWeight > 0 && Math.abs(weightDiff) >= 1;

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

    const newReels = reelItems.map((item, idx) => {
      const itemWeight = item.weightKg !== '' ? Number(item.weightKg) : defaultWeightPerReel;
      return {
        id: `reel-${Date.now()}-${idx}`,
        date: selectedDate,
        reelNo: item.reelNo.trim() || `RL-${Math.floor(100 + Math.random() * 900)}-${idx + 1}`,
        runningRollNo: reelForm.runningRollNo,
        runningSize: reelForm.runningSize,
        productName: reelForm.productName,
        gsm: Number(item.gsm || 16),
        size: item.size ? formatSingleSize(item.size) : '30cm',
        ply: 1,
        joint: Number(item.joint || 0),
        weightKg: Number(itemWeight.toFixed(2)),
        brokeKg: 0
      };
    });

    setReels(prev => [...newReels, ...prev]);
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
      weightKg: '',
      brokeKg: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0E1B] p-4 sm:p-6 font-sans text-slate-800 dark:text-white space-y-6">
      {/* Date Header Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#12162B] p-4 rounded-2xl border border-slate-200 dark:border-[#222943] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">Rewinder Section & Stock Log</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage Jumbo Roll cutting into finished reels with live weight validation</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="p-2.5 bg-[#F5F6FA] dark:bg-[#181D35] border border-slate-200 dark:border-[#262D4A] rounded-xl text-xs font-bold focus:outline-none"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Reel Entry
          </button>
        </div>
      </div>

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
          title="Broke (Wastage) Generated"
          value={formatKgOrTon(totalBrokeKg)}
          subtitle="Auto Loop-Back to Stock"
          icon={RefreshCw}
          trend={totalReelWeightKg > 0 ? `${((totalBrokeKg / totalReelWeightKg) * 100).toFixed(1)}% Loss` : '0%'}
          trendType="down"
        />
        <StatCard
          title="Net Added to Finish Stock"
          value={formatKgOrTon(netFinishStockKg)}
          subtitle="Net Output Weight"
          icon={PackageCheck}
          trend="+Ready"
          trendType="up"
        />
      </div>

      {/* Main Reels Table Card */}
      <div className="bg-white dark:bg-[#12162B] rounded-2xl p-4 sm:p-6 border border-[#EEF0F5] dark:border-[#222943] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        {/* Table Title & Summary Cards Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white">Rewinder Reel Production Log</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Date: {formatDateDisplay(selectedDate)} • Broke automatically increases Raw Material Stock (Rule 6)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#F5F6FA] dark:bg-[#181D35] rounded-xl border border-slate-200/60 dark:border-[#262D4A]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Reels</span>
            <span className="text-base sm:text-lg font-black text-slate-800 dark:text-white mt-0.5 block">{reels.length} Reels</span>
          </div>
          <div className="p-3 bg-[#F5F6FA] dark:bg-[#181D35] rounded-xl border border-slate-200/60 dark:border-[#262D4A]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Weight</span>
            <span className="text-base sm:text-lg font-black text-[#cf8730] mt-0.5 block">{formatKgOrTon(totalReelWeightKg)}</span>
          </div>
          <div className="p-3 bg-[#F5F6FA] dark:bg-[#181D35] rounded-xl border border-slate-200/60 dark:border-[#262D4A]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Broke Returned</span>
            <span className="text-base sm:text-lg font-black text-[#F1533C] mt-0.5 block">+{formatKgOrTon(totalBrokeKg)}</span>
          </div>
          <div className="p-3 bg-[#F5F6FA] dark:bg-[#181D35] rounded-xl border border-slate-200/60 dark:border-[#262D4A]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Net Yield Rate</span>
            <span className="text-base sm:text-lg font-black text-[#16A34A] dark:text-[#1FCB79] mt-0.5 block">
              {totalReelWeightKg > 0 ? `${(((totalReelWeightKg - totalBrokeKg) / totalReelWeightKg) * 100).toFixed(1)}%` : '100.0%'}
            </span>
          </div>
        </div>

        {/* Table Filter Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#222943]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter Grade:
            </span>
            <button
              onClick={() => setSelectedProductFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedProductFilter === 'all'
                  ? 'bg-[#cf8730] text-white shadow-md'
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
                    ? 'bg-[#cf8730] text-white shadow-md'
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

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] dark:bg-[#181D35] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                <th className="p-3.5 rounded-l-xl">Running Roll</th>
                <th className="p-3.5">Reel No</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">GSM / Size / Ply</th>
                <th className="p-3.5">Joints</th>
                <th className="p-3.5 text-right rounded-r-xl font-bold">Reel Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#222943] font-medium">
              {filteredReels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No rewinder reels recorded matching filter. Click "+ Add Reel Entry" to log finished reels.
                  </td>
                </tr>
              ) : (
                filteredReels.map(reel => (
                  <tr key={reel.id} className="hover:bg-slate-50/60 dark:hover:bg-[#181D35]/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 dark:text-slate-200">{reel.runningRollNo}</td>
                    <td className="p-3.5 font-extrabold text-[#cf8730]">{reel.reelNo}</td>
                    <td className="p-3.5 font-bold text-[#161B26] dark:text-white">{reel.productName}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{reel.gsm} GSM | {formatSingleSize(reel.size)} | {reel.ply} Ply</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{reel.joint || 0} Joint</td>
                    <td className="p-3.5 text-right font-extrabold text-[#161B26] dark:text-white text-sm">{reel.weightKg.toLocaleString()} kg</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Reel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Rewinder Reel Entry"
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
              {reelItems.map((item, idx) => (
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
              ))}
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
}

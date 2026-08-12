import React, { useState, useEffect } from 'react';
import { RotateCw, Plus, RefreshCw, AlertTriangle, CheckCircle2, X } from 'lucide-react';

const DEFAULT_PRODUCTS = [
  { id: 'napkin_tissue', name: 'Napkin Tissue' },
  { id: 'toilet_tissue', name: 'Toilet Tissue' },
  { id: 'kt', name: 'KT' },
  { id: 'hrt', name: 'HRT' },
  { id: 'napkin_b_grade', name: 'Napkin B Grade' },
  { id: 'toilet_b_grade', name: 'Toilet B Grade' },
  { id: 'kt_b_grade', name: 'KT B Grade' }
];

export const RewinderAddEntryModal = ({
  isOpen,
  onClose,
  onSave,
  selectedDate = new Date().toISOString().split('T')[0],
  productsList = DEFAULT_PRODUCTS
}) => {
  const [reelsCut, setReelsCut] = useState(1);
  const [reelForm, setReelForm] = useState({
    runningRollNo: 'M-001',
    runningSize: '1650 mm',
    productName: productsList[0]?.name || 'Napkin Tissue',
    weightKg: '5000',
    gsm: 16,
    dia: 900
  });

  const [reelItems, setReelItems] = useState([
    {
      reelNo: `RL-${Math.floor(100 + Math.random() * 900)}`,
      gsm: 16,
      size: '30cm',
      weightKg: '5000',
      joint: 0
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      const initialRollNo = `M-${Math.floor(100 + Math.random() * 900)}`;
      setReelForm({
        runningRollNo: initialRollNo,
        runningSize: '1650 mm',
        productName: productsList[0]?.name || 'Napkin Tissue',
        weightKg: '5000',
        gsm: 16,
        dia: 900
      });
      setReelsCut(1);
      setReelItems([
        {
          reelNo: `RL-${Math.floor(100 + Math.random() * 900)}`,
          gsm: 16,
          size: '30cm',
          weightKg: '5000',
          joint: 0
        }
      ]);
    }
  }, [isOpen, productsList]);

  if (!isOpen) return null;

  const handleReelsCutChange = (countVal) => {
    const count = Number(countVal) || 1;
    setReelsCut(count);

    const totalW = Number(reelForm.weightKg || 0);
    const weightPerReel = count > 0 && totalW > 0 ? (totalW / count).toFixed(2) : '';

    const newItems = Array.from({ length: count }, (_, idx) => {
      const existing = reelItems[idx];
      return {
        reelNo: existing?.reelNo || `RL-${Math.floor(100 + Math.random() * 900)}-${idx + 1}`,
        gsm: existing?.gsm || reelForm.gsm || 16,
        size: existing?.size || '30cm',
        weightKg: weightPerReel,
        joint: existing?.joint || 0
      };
    });
    setReelItems(newItems);
  };

  const handleTotalWeightChange = (weightVal) => {
    setReelForm(prev => ({ ...prev, weightKg: weightVal }));
    const totalW = Number(weightVal || 0);
    const count = reelsCut || 1;
    const weightPerReel = count > 0 && totalW > 0 ? (totalW / count).toFixed(2) : '';

    setReelItems(prevItems =>
      prevItems.map(item => ({
        ...item,
        weightKg: weightPerReel
      }))
    );
  };

  const handleItemChange = (index, field, val) => {
    setReelItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleProductChange = (prodName) => {
    setReelForm(prev => ({ ...prev, productName: prodName }));
  };

  // Live Weight Mismatch Calculations
  const sumCutWeights = reelItems.reduce((sum, item) => sum + Number(item.weightKg || 0), 0);
  const totalEnteredWeight = Number(reelForm.weightKg || 0);
  const weightDiff = Number((sumCutWeights - totalEnteredWeight).toFixed(2));
  const isWeightMismatch = Math.abs(weightDiff) > 0.01;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check duplicate Reel Nos among cut reels
    const reelNosList = reelItems.map(i => i.reelNo.trim());
    const hasDuplicateReelNo = new Set(reelNosList).size !== reelNosList.length;

    if (hasDuplicateReelNo) {
      alert(`⚠️ Cannot Save Reel Entry!\n\nDuplicate Reel Numbers detected among cut reels. Please give each cut reel a unique Reel No.`);
      return;
    }

    const count = reelsCut || 1;
    const defaultWeightPerReel = totalEnteredWeight / count;

    const formattedPayloads = reelItems.map((item, idx) => {
      const itemWeight = item.weightKg !== '' ? Number(item.weightKg) : defaultWeightPerReel;
      return {
        date: selectedDate,
        reelNo: item.reelNo.trim() || `RL-${Math.floor(100 + Math.random() * 900)}-${idx + 1}`,
        runningRollNo: reelForm.runningRollNo,
        runningSize: reelForm.runningSize,
        productName: reelForm.productName,
        gsm: Number(item.gsm || 16),
        size: item.size || '30cm',
        ply: 1, // Fixed 1 Ply
        dia: Number(reelForm.dia || 900),
        joint: Number(item.joint || 0),
        weightKg: Number(itemWeight.toFixed(2)),
        brokeKg: 0
      };
    });

    if (onSave) {
      onSave(formattedPayloads);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#12162B] text-slate-800 dark:text-white rounded-2xl border border-slate-200 dark:border-[#222943] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-[#222943] sticky top-0 bg-white dark:bg-[#12162B] z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#cf8730]/15 text-[#cf8730]">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#161B26] dark:text-white">Log Rewinder Reel & Cut Entry</h3>
              <p className="text-xs text-[#8A8FA3]">Selected Date: {selectedDate} &bull; Paper Mill Production System</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E2540] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
          {/* Top Form Fields */}
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Grade</label>
              <select
                value={reelForm.productName}
                onChange={e => handleProductChange(e.target.value)}
                className="w-full p-3 bg-[#F5F6FA] dark:bg-[#181D35] border border-[#EEF0F5] dark:border-[#262D4A] text-slate-800 dark:text-white rounded-xl text-xs font-semibold focus:outline-none min-h-[44px]"
              >
                {productsList.map(p => (
                  <option key={p.id || p.name} value={p.name} className="dark:bg-[#12162B] dark:text-white">{p.name}</option>
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

          {/* Live Weight Tracker Header */}
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

          {/* Live Warning Box */}
          {isWeightMismatch && (
            <div className="p-3.5 rounded-xl text-xs font-semibold flex items-start gap-3 bg-[#FDECEA] text-[#F1533C] border-2 border-[#F1533C] dark:bg-[#F1533C]/20 dark:text-[#FF6B6B] dark:border-[#F1533C] shadow-md animate-pulse">
              <AlertTriangle className="w-5 h-5 shrink-0 text-[#F1533C] dark:text-[#FF6B6B] mt-0.5" />
              <div>
                <strong className="block text-sm font-black mb-0.5 uppercase tracking-wider">⚠️ Weight Mismatch Warning!</strong>
                The sum of your cut reels (<span className="underline font-extrabold">{sumCutWeights.toLocaleString()} kg</span>) does not match Total Roll Weight (<span className="underline font-extrabold">{totalEnteredWeight.toLocaleString()} kg</span>).
                <div className="mt-1 font-extrabold flex items-center gap-1.5">
                  Difference: <span className="bg-[#F1533C] text-white px-2 py-0.5 rounded text-xs font-black">{weightDiff > 0 ? `+${weightDiff.toLocaleString()}` : weightDiff.toLocaleString()} kg</span>
                </div>
              </div>
            </div>
          )}

          {/* Individual Cut Reels Grid List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold text-[#161B26] dark:text-white uppercase tracking-wider">
              Individual Cut Reels Breakdown ({reelsCut} {reelsCut === 1 ? 'Reel' : 'Reels'})
            </h4>

            {reelItems.map((item, index) => (
              <div key={index} className="p-3.5 rounded-xl bg-[#F5F6FA] dark:bg-[#181D35] border border-[#EEF0F5] dark:border-[#262D4A] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#cf8730]">Reel #{index + 1}</span>
                  <span className="text-[11px] font-semibold text-slate-400">Target Weight: ~{(totalEnteredWeight / (reelsCut || 1)).toFixed(1)} kg</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Reel No</label>
                    <input
                      type="text"
                      required
                      value={item.reelNo}
                      onChange={e => handleItemChange(index, 'reelNo', e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#12162B] border border-slate-200 dark:border-[#262D4A] rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">GSM</label>
                    <input
                      type="number"
                      required
                      value={item.gsm}
                      onChange={e => handleItemChange(index, 'gsm', e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#12162B] border border-slate-200 dark:border-[#262D4A] rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Size</label>
                    <input
                      type="text"
                      required
                      value={item.size}
                      onChange={e => handleItemChange(index, 'size', e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#12162B] border border-slate-200 dark:border-[#262D4A] rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Reel Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.weightKg}
                      onChange={e => handleItemChange(index, 'weightKg', e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#12162B] border border-slate-200 dark:border-[#262D4A] rounded-lg text-xs font-extrabold focus:outline-none text-[#cf8730]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#222943]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#262D4A] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2540] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#cf8730] hover:bg-[#b87e47] text-white font-extrabold text-xs shadow-md shadow-[#cf8730]/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Save Rewinder Entry ({reelsCut} {reelsCut === 1 ? 'Reel' : 'Reels'})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RewinderAddEntryModal;

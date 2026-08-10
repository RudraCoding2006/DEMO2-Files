import React, { useState } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { computeFinishStockHierarchy } from '../../engine/productionEngine';
import { formatKgOrTon } from '../../utils/formatters';
import { PRODUCTS } from '../../data/masterData';
import { PackageCheck, Boxes, RotateCw, Layers, ChevronDown, ChevronRight, Layers3 } from 'lucide-react';

export const FinishStockModule = ({ state }) => {
  const [selectedGrade, setSelectedGrade] = useState('all'); // 'all', 'a', 'b'
  const [selectedType, setSelectedType] = useState('all');   // 'all', 'napkin', 'toilet', 'kt', 'hrt'

  const stockHierarchy = computeFinishStockHierarchy(state.rewinderReels || [], state.dispatches || []);
  const totalDispatchedKg = stockHierarchy.__dispatchMeta?.totalDispatchedKg || 0;
  const entries = Object.entries(stockHierarchy).filter(([k]) => k !== '__dispatchMeta').map(([, v]) => v);

  // Filter products by Grade & Paper Type
  const filteredProducts = PRODUCTS.filter(prod => {
    const isBGrade = prod.name.toLowerCase().includes('b grade');
    if (selectedGrade === 'a' && isBGrade) return false;
    if (selectedGrade === 'b' && !isBGrade) return false;

    if (selectedType !== 'all') {
      const pName = prod.name.toLowerCase();
      if (selectedType === 'napkin' && !pName.includes('napkin')) return false;
      if (selectedType === 'toilet' && !pName.includes('toilet')) return false;
      if (selectedType === 'kt' && !pName.includes('kt')) return false;
      if (selectedType === 'hrt' && !pName.includes('hrt')) return false;
    }

    return true;
  });

  // Grand Total of ALL products combined (this is already net after dispatch deductions)
  const grandTotalKg = entries.reduce((sum, item) => sum + item.totalKg, 0);
  const grossTotalKg = grandTotalKg + totalDispatchedKg;
  const totalReelsCount = entries.reduce((sum, item) => sum + item.reels.length, 0);

  // Group by exact Product Name
  const stockByProduct = {};

  // Initialize stockByProduct for ALL 7 master products so every category A-G is represented
  PRODUCTS.forEach(prod => {
    stockByProduct[prod.name] = {
      meta: prod,
      items: [],
      totalKg: 0,
      totalReels: 0
    };
  });

  // Populate actual stock items
  entries.forEach(item => {
    const prodName = item.productName;
    if (stockByProduct[prodName]) {
      stockByProduct[prodName].items.push(item);
      stockByProduct[prodName].totalKg += item.totalKg;
      stockByProduct[prodName].totalReels += item.reels.length;
    } else {
      // Fallback for custom or legacy product names
      stockByProduct[prodName] = {
        meta: { name: prodName, label: prodName, fields: ['gsm', 'size', 'ply', 'dia'] },
        items: [item],
        totalKg: item.totalKg,
        totalReels: item.reels.length
      };
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Stat Cards (Fluid flex-1 width & shape animation on sidebar hover expand/collapse) */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 sm:gap-5 w-full transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu">
        <div className="flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu">
          <StatCard
            variant="indigo"
            title="Grand Total Finished Stock"
            value={formatKgOrTon(grandTotalKg)}
            subtitle={`Net Available Inventory Across All ${Object.keys(stockByProduct).length} Product Lines`}
            icon={PackageCheck}
          />
        </div>
        <div className="flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu">
          <StatCard
            variant="blue"
            title="Active Product Categories"
            value={`${PRODUCTS.length} Product Lines`}
            subtitle="Categorized per GSM / Size / Ply / Dia"
            icon={Boxes}
          />
        </div>
        <div className="flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu">
          <StatCard
            variant="emerald"
            title="Total Available Reels"
            value={`${totalReelsCount} Reels`}
            subtitle="Tracked From Rewinder Completion Logs"
            icon={RotateCw}
          />
        </div>
      </div>

      {/* Prominent Hero-Matching Total Stock Panel at Top */}
      <div className="p-5 bg-[#cf8730] rounded-2xl text-white shadow-md border border-[#b87e47]/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold shadow-xs backdrop-blur-xs">
              <PackageCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white uppercase tracking-wider">
                FINISHED GOODS STOCK SUMMARY
              </h4>
              <p className="text-xs text-amber-100/90 mt-0.5 font-medium">Summed across Napkin, Toilet, KT, HRT, and B-Grade lines</p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-end">
            {/* Gross Production */}
            <div className="text-right">
              <div className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">GROSS PRODUCED</div>
              <div className="text-lg font-black text-white">{formatKgOrTon(grossTotalKg)}</div>
            </div>
            <div className="h-8 w-px bg-white/25"></div>
            {/* Dispatched (Deduction) */}
            <div className="text-right">
              <div className="text-[10px] text-red-200 font-bold uppercase tracking-wider">DISPATCHED</div>
              <div className="text-lg font-black text-red-100">
                {totalDispatchedKg > 0 ? `− ${formatKgOrTon(totalDispatchedKg)}` : '0 kg'}
              </div>
            </div>
            <div className="h-8 w-px bg-white/25"></div>
            {/* Net Available */}
            <div className="text-right">
              <div className="text-[10px] text-green-200 font-bold uppercase tracking-wider">NET AVAILABLE</div>
              <div className="text-2xl font-black text-white tracking-tight">{formatKgOrTon(grandTotalKg)}</div>
              <div className="text-[10px] text-amber-200 font-medium">{grandTotalKg.toLocaleString()} kg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stock Table & Mobile Cards Card */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#161B26] flex items-center gap-2">
              <Layers3 className="w-5 h-5 text-[#cf8730]" />
              Finished Goods Inventory (Categorized Stock Breakdown)
            </h3>
            <p className="text-xs text-[#8A8FA3] mt-0.5">
              Categorized by GSM, Size, Ply, and Dia per product line &bull; Auto-deducted on confirmed Dispatches
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#f4e7d7] text-[#cf8730] border border-[#cf8730]/20">
              Grand Total: {formatKgOrTon(grandTotalKg)} ({grandTotalKg.toLocaleString()} kg)
            </span>
          </div>
        </div>

        {/* Interactive Grade & Paper Type Filter Strip (Shown ONLY on Mobile screens < 768px) */}
        <div className="flex md:hidden flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#F8F9FC] rounded-2xl border border-slate-200/90 text-xs">
          {/* Grade Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mr-1">Grade:</span>
            <button
              type="button"
              onClick={() => setSelectedGrade('all')}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                selectedGrade === 'all'
                  ? 'bg-[#cf8730] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Grades
            </button>
            <button
              type="button"
              onClick={() => setSelectedGrade('a')}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                selectedGrade === 'a'
                  ? 'bg-[#cf8730] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              A Grade Only
            </button>
            <button
              type="button"
              onClick={() => setSelectedGrade('b')}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                selectedGrade === 'b'
                  ? 'bg-[#cf8730] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              B Grade Only
            </button>
          </div>

          {/* Paper Type Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mr-1">Paper Type:</span>
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-[#12162B] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('napkin')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedType === 'napkin'
                  ? 'bg-[#12162B] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Napkin
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('toilet')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedType === 'toilet'
                  ? 'bg-[#12162B] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Toilet
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('kt')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedType === 'kt'
                  ? 'bg-[#12162B] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              KT
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('hrt')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedType === 'hrt'
                  ? 'bg-[#12162B] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              HRT
            </button>
          </div>
        </div>

        {/* Product Sections (Filtered dynamically) */}
        <div className="space-y-6 sm:space-y-8">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No paper stock matching selected Grade & Type filters.
            </div>
          ) : (
            filteredProducts.map(prod => {
            const group = stockByProduct[prod.name] || { items: [], totalKg: 0, totalReels: 0 };
            const hasDia = prod.fields?.includes('dia');
            const hasPly = prod.fields?.includes('ply');

            return (
              <div key={prod.id} className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                {/* Product Section Header with Subtotal */}
                <div className="bg-[#cf8730] md:bg-[#12162B] text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-black tracking-wider px-3 py-1.5 rounded-lg bg-black/20 text-white shadow-xs border border-white/20 uppercase">
                      {prod.label}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-amber-100">
                      {group.items.length} Variant{group.items.length === 1 ? '' : 's'} &bull; {group.totalReels} Reel{group.totalReels === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 justify-between sm:justify-end border-t sm:border-t-0 border-white/20 pt-2 sm:pt-0">
                    <span className="text-[11px] sm:text-xs font-bold text-amber-100">Total Stock:</span>
                    <span className="font-extrabold text-xs px-3 py-1 bg-white text-[#cf8730] rounded-lg shadow-xs">
                      {formatKgOrTon(group.totalKg)} ({group.totalKg.toLocaleString()} kg)
                    </span>
                  </div>
                </div>

                {/* Categorized Stock: Mobile Cards + Desktop Table */}
                {group.items.length === 0 ? (
                  <div className="p-5 text-center text-slate-400 bg-slate-50/50 text-xs font-medium">
                    No active stock available for <span className="font-semibold text-slate-600">{prod.name}</span> currently (0 Kg / 0 Reels).
                  </div>
                ) : (
                  <>
                    {/* Mobile Responsive Stock Cards (< 768px) */}
                    <div className="block md:hidden p-3 space-y-2.5 bg-slate-50/50">
                      {group.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#f4e7d7] text-[#cf8730] font-black text-xs">
                              {item.gsm} GSM
                            </span>
                            <span className="font-extrabold text-xs text-[#161B26]">{item.size}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold text-slate-600">
                            {hasPly && (
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-700">
                                {item.ply} Ply
                              </span>
                            )}
                            {hasDia && (
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-700">
                                Dia: {item.dia ? `${item.dia} mm` : '-'}
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200/60 font-bold">
                              {item.reels.length} Reel{item.reels.length === 1 ? '' : 's'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Available Weight</span>
                            <div className="text-right font-black text-sm text-[#cf8730]">
                              {item.totalKg.toLocaleString()} kg
                              <span className="text-xs font-bold text-slate-500 ml-1">
                                ({formatKgOrTon(item.totalKg)})
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View (>= 768px) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-[#F8F9FC] text-[#8A8FA3] uppercase tracking-wider font-semibold border-b border-slate-200">
                            <th className="p-3.5">GSM</th>
                            <th className="p-3.5">Size</th>
                            {hasPly && <th className="p-3.5">Ply</th>}
                            {hasDia && <th className="p-3.5">Dia (mm)</th>}
                            <th className="p-3.5">Reels Count</th>
                            <th className="p-3.5 text-right">Available Stock Weight</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {group.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                              <td className="p-3.5 font-bold text-[#cf8730]">{item.gsm} GSM</td>
                              <td className="p-3.5 font-bold text-[#161B26]">{item.size}</td>
                              {hasPly && (
                                <td className="p-3.5">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold">
                                    {item.ply} Ply
                                  </span>
                                </td>
                              )}
                              {hasDia && (
                                <td className="p-3.5 text-slate-600">
                                  {item.dia ? `${item.dia} mm` : '-'}
                                </td>
                              )}
                              <td className="p-3.5 font-semibold text-slate-800">
                                {item.reels.length} Reel{item.reels.length === 1 ? '' : 's'}
                              </td>
                              <td className="p-3.5 text-right font-black text-[#cf8730] text-sm">
                                {item.totalKg.toLocaleString()} kg
                                <span className="text-xs font-bold text-slate-500 ml-1.5">
                                  ({formatKgOrTon(item.totalKg)})
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[#F1F3F9] font-bold text-slate-800 border-t-2 border-slate-200">
                            <td colSpan={2 + (hasPly ? 1 : 0) + (hasDia ? 1 : 0)} className="p-3.5 text-slate-600 uppercase tracking-wider text-[11px]">
                              {prod.name} Category Subtotal
                            </td>
                            <td className="p-3.5 text-amber-800 font-bold">{group.totalReels} Reels</td>
                            <td className="p-3.5 text-right text-sm font-extrabold text-[#cf8730]">
                              {group.totalKg.toLocaleString()} kg ({formatKgOrTon(group.totalKg)})
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
};

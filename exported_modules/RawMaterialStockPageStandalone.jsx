import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  ArrowUpRight, 
  Filter, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  X, 
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';

/**
 * 📦 MASTER DATASET: RAW MATERIALS (26 SKUs matching Saheb Paper Mill ERP)
 */
export const RAW_MATERIALS_MASTER = [
  // Waste Paper (7 SKUs)
  { id: 'indian_tissue_waste', name: 'Indian Tissue Waste', category: 'waste_paper', unit: 'kg', minStock: 2000, defaultStock: 591222.5 },
  { id: 'imported_tissue_waste', name: 'Imported Tissue Waste', category: 'waste_paper', unit: 'kg', minStock: 1500, defaultStock: 390502.9 },
  { id: 'smk', name: 'SMK', category: 'waste_paper', unit: 'kg', minStock: 1000, defaultStock: 266854 },
  { id: 'cupstock', name: 'Cupstock', category: 'waste_paper', unit: 'kg', minStock: 1000, defaultStock: 240000 },
  { id: 'pulp_sheet', name: 'Pulp Sheet', category: 'waste_paper', unit: 'kg', minStock: 800, defaultStock: 240000 },
  { id: 'silicon', name: 'Silicon', category: 'waste_paper', unit: 'kg', minStock: 500, defaultStock: 120000 },
  { id: 'broke', name: 'Broke', category: 'waste_paper', unit: 'kg', minStock: 500, defaultStock: 36853.82 },

  // Chemicals (17 SKUs)
  { id: 'dsr', name: 'DSR (Dry Strength Resin)', category: 'chemical', unit: 'kg', minStock: 250, defaultStock: 59102.32 },
  { id: 'wsr', name: 'WSR (Wet Strength Resin)', category: 'chemical', unit: 'kg', minStock: 300, defaultStock: 60740.96 },
  { id: 'hydrogen_peroxide', name: 'Hydrogen Peroxide (H2O2)', category: 'chemical', unit: 'ltr', minStock: 200, defaultStock: 42027.38 },
  { id: 'hypo', name: 'Hypo (Sodium Hypochlorite)', category: 'chemical', unit: 'ltr', minStock: 300, defaultStock: 43704.08 },
  { id: 'bleaching_powder', name: 'Bleaching Powder', category: 'chemical', unit: 'kg', minStock: 400, defaultStock: 56954.36 },
  { id: 'caustic', name: 'Caustic Soda', category: 'chemical', unit: 'kg', minStock: 500, defaultStock: 76657.48 },
  { id: 'oba', name: 'OBA (Optical Brightener)', category: 'chemical', unit: 'kg', minStock: 100, defaultStock: 26818.622 },
  { id: 'm_violet', name: 'M Violet (Dye)', category: 'chemical', unit: 'ltr', minStock: 50, defaultStock: 17731.505 },
  { id: 'washing_powder', name: 'Washing Powder', category: 'chemical', unit: 'kg', minStock: 150, defaultStock: 27926.02 },
  { id: 'flock_100_liq', name: 'Flock 100 Liq (Sedicell)', category: 'chemical', unit: 'ltr', minStock: 100, defaultStock: 29000 },
  { id: 'flock_master', name: 'Flock Master (Solid)', category: 'chemical', unit: 'kg', minStock: 100, defaultStock: 28000 },
  { id: 'peo', name: 'PEO (Polyethylene Oxide)', category: 'chemical', unit: 'kg', minStock: 100, defaultStock: 18500 },
  { id: 'deformer', name: 'Deformer (Defoamer)', category: 'chemical', unit: 'kg', minStock: 100, defaultStock: 22000 },
  { id: 'hcl', name: 'HCL (Hydrochloric Acid)', category: 'chemical', unit: 'ltr', minStock: 200, defaultStock: 31000 },
  { id: 'mg_release', name: 'MG Release Chemical', category: 'chemical', unit: 'kg', minStock: 150, defaultStock: 19500 },
  { id: 'mg_coating', name: 'MG Coating Chemical', category: 'chemical', unit: 'kg', minStock: 150, defaultStock: 18900 },
  { id: 'ro_chemical', name: 'RO Antiscalant Chemical', category: 'chemical', unit: 'ltr', minStock: 100, defaultStock: 14200 },

  // Firewood / Fuel (2 SKUs)
  { id: 'wood', name: 'Firewood (Lathi/Logs)', category: 'firewood', unit: 'kg', minStock: 10000, defaultStock: 850000 },
  { id: 'biocoal', name: 'Biocoal Briquettes', category: 'firewood', unit: 'kg', minStock: 5000, defaultStock: 450000 }
];

/**
 * 🔢 FORMATTERS
 */
const formatKgOrTon = (kgVal) => {
  const num = Number(kgVal) || 0;
  if (num >= 1000) {
    return `${(num / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tons`;
  }
  return `${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
};

/**
 * ⚡ EMBEDDED UI COMPONENTS (StatCard, StatusPill, Modal)
 */
const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendType = 'up' }) => (
  <div className="relative overflow-hidden rounded-2xl text-white bg-[#cf8730] shadow-lg shadow-[#cf8730]/20 p-5 min-h-[135px] flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all">
    <div className="flex items-center justify-between gap-1 mb-2">
      <span className="font-bold uppercase text-[11px] tracking-wide text-white/90">{title}</span>
      {Icon && (
        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
    <div className="flex flex-wrap items-baseline justify-between gap-2 my-1">
      <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">{value}</div>
      {trend && (
        <div className="flex items-center text-[11px] font-extrabold rounded-lg bg-white/20 backdrop-blur-md px-2 py-0.5 text-white">
          {trendType === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {trend}
        </div>
      )}
    </div>
    {subtitle && <p className="text-white/85 text-xs font-medium truncate">{subtitle}</p>}
  </div>
);

const StatusPill = ({ type = 'success', text }) => {
  const styles = {
    success: 'bg-[#1FCB79]/15 text-[#1FCB79] border-[#1FCB79]/30',
    warning: 'bg-[#cf8730]/15 text-[#cf8730] border-[#cf8730]/30',
    danger: 'bg-[#F1533C]/15 text-[#F1533C] border-[#F1533C]/30'
  };
  const icons = {
    success: CheckCircle2,
    warning: AlertCircle,
    danger: XCircle
  };
  const Icon = icons[type] || CheckCircle2;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${styles[type] || styles.success}`}>
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#12162B] border border-[#EEF0F5] dark:border-[#222943] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-[#222943]">
          <h3 className="text-base font-extrabold text-[#161B26] dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C2237] hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

/**
 * 🚀 MAIN STANDALONE RAW MATERIAL STOCK PAGE COMPONENT
 */
export default function RawMaterialStockPageStandalone() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize stocks from master dataset
  const [stocks, setStocks] = useState(() => {
    const initial = {};
    RAW_MATERIALS_MASTER.forEach(m => {
      initial[m.id] = m.defaultStock;
    });
    return initial;
  });

  const [inwardEntries, setInwardEntries] = useState([
    { id: 1, itemName: 'Indian Tissue Waste', quantity: 5000, unit: 'kg', remarks: 'PO-4021 Truck GJ05AB1234', date: '2026-07-31' },
    { id: 2, itemName: 'Caustic Soda', quantity: 2000, unit: 'kg', remarks: 'Supplier Chemical Inward', date: '2026-07-30' },
    { id: 3, itemName: 'Hydrogen Peroxide (H2O2)', quantity: 1500, unit: 'ltr', remarks: 'Bleaching Chemical Batch', date: '2026-07-29' }
  ]);

  const [inwardForm, setInwardForm] = useState({
    itemId: RAW_MATERIALS_MASTER[0].id,
    quantity: '',
    remarks: ''
  });

  // Filter items by category and search
  const filteredItems = RAW_MATERIALS_MASTER.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate totals
  let totalStockKg = 0;
  let lowStockCount = 0;
  filteredItems.forEach(item => {
    const qty = Number(stocks[item.id] || 0);
    totalStockKg += qty;
    if (qty <= item.minStock) lowStockCount++;
  });

  const handleInwardSubmit = (e) => {
    e.preventDefault();
    const item = RAW_MATERIALS_MASTER.find(m => m.id === inwardForm.itemId);
    if (!item || !inwardForm.quantity) return;

    const addQty = Number(inwardForm.quantity);
    
    // Update local stock state
    setStocks(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + addQty
    }));

    // Record inward delivery history
    setInwardEntries(prev => [
      {
        id: Date.now(),
        itemName: item.name,
        quantity: addQty,
        unit: item.unit,
        remarks: inwardForm.remarks || 'Manual Stock Add',
        date: new Date().toISOString().slice(0, 10)
      },
      ...prev
    ]);

    setIsModalOpen(false);
    setInwardForm({ itemId: RAW_MATERIALS_MASTER[0].id, quantity: '', remarks: '' });
  };

  return (
    <div className="min-h-screen bg-[#0b0e1b] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans space-y-6">
      {/* Top Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C2237] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Raw Material Stock</h1>
          <p className="text-xs text-slate-400 font-medium">Saheb Paper Mill &bull; Unit 1 (Tissue Line)</p>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search raw materials..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#12162B] border border-[#222943] rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
          />
        </div>
      </div>

      {/* Top Banner KPI Cards (Matching Image 3,946.01 Tons & 15 Inwards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full">
        <StatCard
          title="TOTAL CATEGORY INVENTORY"
          value={formatKgOrTon(totalStockKg)}
          subtitle={`${filteredItems.length} Monitored Items`}
          icon={Boxes}
        />
        <StatCard
          title="LOW STOCK ALERTS"
          value={`${lowStockCount} Items`}
          subtitle={lowStockCount > 0 ? "Requires Purchase Inward" : "All Stock Levels Healthy"}
          icon={AlertTriangle}
          trend={lowStockCount > 0 ? "Attention" : "Optimal"}
          trendType={lowStockCount > 0 ? "down" : "up"}
        />
        <StatCard
          title="INWARD ENTRIES LOGGED"
          value={`${inwardEntries.length} Inwards`}
          subtitle="Filtered Manual Stock Receipts"
          icon={ArrowUpRight}
        />
      </div>

      {/* Main Table Container */}
      <div className="bg-[#12162B] rounded-2xl p-4 sm:p-6 border border-[#222943] shadow-xl space-y-5">
        {/* Category Tabs & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-[#8A8FA3] mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'waste_paper', label: 'Waste Paper' },
              { id: 'chemical', label: 'Chemicals' },
              { id: 'firewood', label: 'Firewood' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                    : 'bg-[#1C2237] text-slate-300 hover:bg-[#252D48]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-bold text-xs transition-all shadow-md shadow-[#cf8730]/20 min-h-[44px] cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            + Inward Entry (Manual Add)
          </button>
        </div>

        {/* 4-Card Mini KPI Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-[#181D35] rounded-2xl border border-[#262D4A]">
          <div className="p-3 bg-[#12162B] rounded-xl border border-[#222943]">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">TOTAL SKUS</span>
            <span className="text-base font-extrabold text-white">{filteredItems.length} Items</span>
          </div>
          <div className="p-3 bg-[#12162B] rounded-xl border border-[#222943]">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">INVENTORY WEIGHT</span>
            <span className="text-base font-extrabold text-[#cf8730]">{formatKgOrTon(totalStockKg)}</span>
          </div>
          <div className="p-3 bg-[#12162B] rounded-xl border border-[#222943]">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">HEALTHY ITEMS</span>
            <span className="text-base font-extrabold text-[#1FCB79]">{filteredItems.length - lowStockCount} SKUs</span>
          </div>
          <div className="p-3 bg-[#12162B] rounded-xl border border-[#222943]">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">LOW STOCK ALERTS</span>
            <span className="text-base font-extrabold text-[#F1533C]">{lowStockCount} SKUs</span>
          </div>
        </div>

        {/* Raw Material Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#181D35] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                <th className="p-3.5 rounded-l-xl">RAW MATERIAL ITEM</th>
                <th className="p-3.5">CATEGORY</th>
                <th className="p-3.5">UNIT</th>
                <th className="p-3.5">MIN STOCK LIMIT</th>
                <th className="p-3.5 text-right">CURRENT STOCK</th>
                <th className="p-3.5 text-center rounded-r-xl">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222943] font-medium">
              {filteredItems.map(item => {
                const currentQty = Number(stocks[item.id] || 0);
                const isLow = currentQty <= item.minStock;
                const isNegative = currentQty < 0;

                return (
                  <tr key={item.id} className="hover:bg-[#181D35]/60 transition-colors">
                    <td className="p-3.5 font-bold text-white">{item.name}</td>
                    <td className="p-3.5 capitalize text-slate-400">
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="p-3.5 text-slate-300">{item.unit}</td>
                    <td className="p-3.5 text-slate-400">{item.minStock.toLocaleString()} {item.unit}</td>
                    <td className={`p-3.5 text-right font-extrabold text-sm ${isNegative ? 'text-[#F1533C]' : 'text-white'}`}>
                      {currentQty.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })} {item.unit}
                    </td>
                    <td className="p-3.5 text-center">
                      {isNegative ? (
                        <StatusPill type="danger" text="Negative Warning" />
                      ) : isLow ? (
                        <StatusPill type="warning" text="Low Stock" />
                      ) : (
                        <StatusPill type="success" text="In Stock" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Inward Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Raw Material Inward Entry"
      >
        <form onSubmit={handleInwardSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Select Raw Material Item</label>
            <select
              value={inwardForm.itemId}
              onChange={e => setInwardForm({ ...inwardForm, itemId: e.target.value })}
              className="w-full p-3 bg-[#1C2237] border border-[#262D4A] rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
            >
              {RAW_MATERIALS_MASTER.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.category.replace('_', ' ')}) — Unit: {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Inward Quantity</label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              required
              placeholder="e.g. 5000"
              value={inwardForm.quantity}
              onChange={e => setInwardForm({ ...inwardForm, quantity: e.target.value })}
              className="w-full p-3 bg-[#1C2237] border border-[#262D4A] rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Remarks / Supplier / Vehicle PO</label>
            <input
              type="text"
              placeholder="e.g. PO 4021 - Truck GJ05AB1234"
              value={inwardForm.remarks}
              onChange={e => setInwardForm({ ...inwardForm, remarks: e.target.value })}
              className="w-full p-3 bg-[#1C2237] border border-[#262D4A] rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#222943]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-3 rounded-xl font-semibold text-xs bg-[#1C2237] text-slate-300 hover:bg-[#252D48]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl font-extrabold text-xs bg-[#cf8730] hover:bg-[#b57324] text-white shadow-md active:scale-95 transition-all"
            >
              Save & Increase Stock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

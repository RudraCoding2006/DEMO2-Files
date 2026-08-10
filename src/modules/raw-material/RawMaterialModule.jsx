import React, { useState } from 'react';
import { RAW_MATERIALS } from '../../data/masterData';
import { StatCard } from '../../components/common/StatCard';
import { StatusPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { store } from '../../data/storage';
import { formatKgOrTon, formatDateDisplay } from '../../utils/formatters';
import { Plus, Boxes, AlertTriangle, ArrowUpRight, Filter, X } from 'lucide-react';

export const RawMaterialModule = ({ state }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inwardForm, setInwardForm] = useState({
    itemId: RAW_MATERIALS[0].id,
    quantity: '',
    remarks: ''
  });

  const stocks = state.rawMaterialStocks || {};

  const searchQuery = (state.searchQuery || '').toLowerCase().trim();

  const filteredItems = RAW_MATERIALS.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery) || 
      item.category.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Dynamic Date Filter Helper
  const filterByDateRange = (list = [], dateField = 'createdAt') => {
    const timeRange = state.timeRange || 'all';
    const selectedDate = state.selectedDate;
    if (!list || !Array.isArray(list)) return [];
    if (timeRange === 'all' && !selectedDate) return list;

    return list.filter(item => {
      if (!item || !item[dateField]) return true;
      const itemDate = new Date(item[dateField]);
      if (isNaN(itemDate.getTime())) return true;

      if (selectedDate) {
        return itemDate.toISOString().slice(0, 10) === selectedDate;
      }

      if (timeRange === 'today') {
        const todayStr = new Date().toISOString().slice(0, 10);
        return itemDate.toISOString().slice(0, 10) === todayStr;
      } else if (timeRange === 'week') {
        const diff = (new Date() - itemDate) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      } else if (timeRange === 'month') {
        const now = new Date();
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredInwards = filterByDateRange(state.inwardEntries || [], 'timestamp');

  // Calculate stats
  let totalStockKg = 0;
  let lowStockCount = 0;
  filteredItems.forEach(item => {
    const qty = Number(stocks[item.id] || 0);
    totalStockKg += qty;
    if (qty <= item.minStock) lowStockCount++;
  });

  const handleInwardSubmit = (e) => {
    e.preventDefault();
    const item = RAW_MATERIALS.find(m => m.id === inwardForm.itemId);
    if (!item || !inwardForm.quantity) return;

    store.addInwardEntry({
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      quantity: Number(inwardForm.quantity),
      unit: item.unit,
      remarks: inwardForm.remarks
    });

    setIsModalOpen(false);
    setInwardForm({ itemId: RAW_MATERIALS[0].id, quantity: '', remarks: '' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats (Fluid flex-1 width & shape animation on sidebar hover expand/collapse) */}
      <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 w-full transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu">
        <div className="flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu">
          <StatCard
            variant="indigo"
            title="Total Category Inventory"
            value={formatKgOrTon(totalStockKg)}
            subtitle={`${filteredItems.length} Monitored Items`}
            icon={Boxes}
          />
        </div>
        <div className="flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu">
          <StatCard
            variant="amber"
            title="Low Stock Alerts"
            value={`${lowStockCount} Items`}
            subtitle={lowStockCount > 0 ? "Requires Purchase Inward" : "All Stock Levels Healthy"}
            icon={AlertTriangle}
            trend={lowStockCount > 0 ? "Attention" : "Optimal"}
            trendType={lowStockCount > 0 ? "down" : "up"}
          />
        </div>
        <div className="flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu">
          <StatCard
            variant="blue"
            title="Inward Entries Logged"
            value={`${filteredInwards.length} Inwards`}
            subtitle="Filtered Manual Stock Receipts"
            icon={ArrowUpRight}
          />
        </div>
      </div>

      {/* Main Table & Mobile Stack Card */}
      <div className="bg-white dark:bg-[#12162B] rounded-2xl p-4 sm:p-6 border border-[#EEF0F5] dark:border-[#222943] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-xs font-bold text-slate-500 dark:text-[#8A8FA3] mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Category:
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
                    : 'bg-[#F5F6FA] dark:bg-[#1C2237] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252D48]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-bold text-xs transition-all shadow-md shadow-[#cf8730]/20 min-h-[44px] cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            + Inward Entry (Manual Add)
          </button>
        </div>

        {/* 4-Card Mini KPI Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-[#F5F6FA] dark:bg-[#181D35] rounded-2xl border border-[#EEF0F5] dark:border-[#262D4A]">
          <div className="p-3 bg-white dark:bg-[#12162B] rounded-xl border border-slate-100 dark:border-[#222943]">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Total SKUs</span>
            <span className="text-base font-extrabold text-[#161B26] dark:text-white">{filteredItems.length} Items</span>
          </div>
          <div className="p-3 bg-white dark:bg-[#12162B] rounded-xl border border-slate-100 dark:border-[#222943]">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Inventory Weight</span>
            <span className="text-base font-extrabold text-[#cf8730]">{formatKgOrTon(totalStockKg)}</span>
          </div>
          <div className="p-3 bg-white dark:bg-[#12162B] rounded-xl border border-slate-100 dark:border-[#222943]">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Healthy Items</span>
            <span className="text-base font-extrabold text-[#1FCB79]">{filteredItems.length - lowStockCount} SKUs</span>
          </div>
          <div className="p-3 bg-white dark:bg-[#12162B] rounded-xl border border-slate-100 dark:border-[#222943]">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Low Stock Alerts</span>
            <span className="text-base font-extrabold text-[#F1533C]">{lowStockCount} SKUs</span>
          </div>
        </div>

        {/* Desktop Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] dark:bg-[#181D35] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                <th className="p-3.5 rounded-l-xl">Raw Material Item</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Unit</th>
                <th className="p-3.5">Min Stock Limit</th>
                <th className="p-3.5 text-right">Current Stock</th>
                <th className="p-3.5 text-center rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#222943] font-medium">
              {filteredItems.map(item => {
                const currentQty = Number(stocks[item.id] || 0);
                const isLow = currentQty <= item.minStock;
                const isNegative = currentQty < 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-[#181D35]/60 transition-colors">
                    <td className="p-3.5 font-bold text-[#161B26] dark:text-white">{item.name}</td>
                    <td className="p-3.5 capitalize text-slate-500 dark:text-slate-400">
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{item.unit}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{item.minStock.toLocaleString()} {item.unit}</td>
                    <td className={`p-3.5 text-right font-extrabold text-sm ${isNegative ? 'text-[#F1533C]' : 'text-[#161B26] dark:text-white'}`}>
                      {currentQty.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-3.5 text-center">
                      {isNegative ? (
                        <StatusPill type="danger" text="Negative Stock Warning" />
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

        {/* Mobile Stacked Cards (md:hidden) */}
        <div className="md:hidden space-y-3">
          {filteredItems.map(item => {
            const currentQty = Number(stocks[item.id] || 0);
            const isLow = currentQty <= item.minStock;
            const isNegative = currentQty < 0;

            return (
              <div key={item.id} className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#EEF0F5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#161B26]">{item.name}</span>
                  {isNegative ? (
                    <StatusPill type="danger" text="Negative Warning" />
                  ) : isLow ? (
                    <StatusPill type="warning" text="Low Stock" />
                  ) : (
                    <StatusPill type="success" text="In Stock" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block">Category</span>
                    <span className="font-semibold text-slate-700 capitalize">{item.category.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Current Stock</span>
                    <span className={`font-extrabold ${isNegative ? 'text-[#F1533C]' : 'text-[#161B26]'}`}>
                      {currentQty.toLocaleString()} {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inward Deliveries & Gate Receipts History Card (Rule 1 Log) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#161B26] flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#1FCB79]" />
                Recent Inward Deliveries & Gate Receipts
              </h3>
              <p className="text-xs text-[#8A8FA3]">
                {filteredInwards.length} Inward deliveries logged &bull; Auto-increases Raw Material Inventory
              </p>
            </div>
          </div>

          {filteredInwards.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No inward deliveries logged yet for this category.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F5F6FA] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                      <th className="p-3.5 rounded-l-xl">Date</th>
                      <th className="p-3.5">Raw Material Item</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Supplier / Remarks</th>
                      <th className="p-3.5 text-right rounded-r-xl">Quantity Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredInwards.map(inw => (
                      <tr key={inw.id} className="hover:bg-slate-50/60">
                        <td className="p-3.5 text-slate-500 font-semibold">{formatDateDisplay(inw.date)}</td>
                        <td className="p-3.5 font-extrabold text-[#161B26]">{inw.itemName}</td>
                        <td className="p-3.5 text-slate-500 capitalize">{inw.category ? inw.category.replace('_', ' ') : 'General'}</td>
                        <td className="p-3.5 text-slate-600">{inw.remarks || 'Supplier Inward'}</td>
                        <td className="p-3.5 text-right font-black text-[#1FCB79] text-sm">
                          +{inw.quantity.toLocaleString()} {inw.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View */}
              <div className="md:hidden space-y-3">
                {filteredInwards.map(inw => (
                  <div key={inw.id} className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#EEF0F5] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-[#161B26]">{inw.itemName}</span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#E7F9EF] text-[#1FCB79] font-black text-xs">
                        +{inw.quantity.toLocaleString()} {inw.unit}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block">Date</span>
                        <span className="font-bold text-slate-700">{formatDateDisplay(inw.date)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Remarks / Truck</span>
                        <span className="font-semibold text-slate-600 truncate">{inw.remarks || 'Supplier Inward'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Inward Entry Modal (Rule 1) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Raw Material Inward (Rule 1)"
      >
        <form onSubmit={handleInwardSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Raw Material Item</label>
            <select
              value={inwardForm.itemId}
              onChange={e => setInwardForm({ ...inwardForm, itemId: e.target.value })}
              className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#cf8730] min-h-[44px]"
            >
              {RAW_MATERIALS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.category.replace('_', ' ')}) — Unit: {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Inward Quantity</label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              required
              placeholder="e.g. 5000"
              value={inwardForm.quantity}
              onChange={e => setInwardForm({ ...inwardForm, quantity: e.target.value })}
              className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#cf8730] min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Supplier / Vehicle PO</label>
            <input
              type="text"
              placeholder="e.g. PO 4021 - Truck GJ05AB1234"
              value={inwardForm.remarks}
              onChange={e => setInwardForm({ ...inwardForm, remarks: e.target.value })}
              className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#cf8730] min-h-[44px]"
            />
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
              className="btn-primary px-5 py-3 rounded-xl font-extrabold text-xs transition-all min-h-[44px] cursor-pointer active:scale-95"
            >
              Save & Increase Stock (Rule 1)
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

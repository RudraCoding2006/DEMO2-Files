import React, { useState } from 'react';
import { PARTIES, PRODUCTS } from '../../data/masterData';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { store } from '../../data/storage';
import { formatKgOrTon, formatDateDisplay } from '../../utils/formatters';
import { generateDispatchPdf } from '../../utils/pdfGenerator';
import { Truck, Plus, FileText, Download, CheckCircle2, Filter, X, MoreVertical } from 'lucide-react';

export const DispatchModule = ({ state }) => {
  const selectedDate = state.selectedDate;
  const dispatchesToday = (state.dispatches || []).filter(d => d.date === selectedDate);
  const totalDispatchTodayKg = dispatchesToday.reduce((sum, d) => sum + Number(d.quantityKg || 0), 0);

  // Filter State
  const [selectedPartyFilter, setSelectedPartyFilter] = useState('all');
  const [activeKebabId, setActiveKebabId] = useState(null);

  const filteredDispatches = (state.dispatches || []).filter(d => {
    if (selectedPartyFilter === 'all') return true;
    return d.party === selectedPartyFilter;
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dispForm, setDispForm] = useState({
    party: PARTIES[0],
    vehicleNumber: 'GJ-05-BX-8821',
    productName: PRODUCTS[0].name,
    gsm: 16,
    size: '30cm',
    ply: 2,
    quantityKg: '',
    reelNos: 'RL-001, RL-002',
    remarks: 'Express Truck Delivery'
  });

  const handleCreateDispatch = (e) => {
    e.preventDefault();
    if (!dispForm.party || !dispForm.quantityKg) return;

    const reelList = dispForm.reelNos.split(',').map(s => s.trim()).filter(Boolean);

    const dispatchObj = {
      date: selectedDate,
      party: dispForm.party,
      vehicleNumber: dispForm.vehicleNumber,
      productName: dispForm.productName,
      gsm: Number(dispForm.gsm),
      size: dispForm.size,
      ply: Number(dispForm.ply),
      quantityKg: Number(dispForm.quantityKg),
      reelNos: reelList,
      remarks: dispForm.remarks
    };

    store.addDispatch(dispatchObj);

    // Auto generate downloadable PDF (Rule 12)
    generateDispatchPdf(dispatchObj);

    setIsModalOpen(false);
  };

  const isReadOnly = state?.activeRole === 'guest_viewer' || state?.users?.find(u => u.id === state.activeUserId)?.isReadOnly;

  return (
    <div className="space-y-6">
      {/* Top Banner Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          variant="hero"
          title="Daily Total Dispatch (Rule 12)"
          value={formatKgOrTon(totalDispatchTodayKg)}
          subtitle="Auto Stat Rollup for Selected Date"
          icon={Truck}
        />
        <StatCard
          title="Dispatches Logged Today"
          value={`${dispatchesToday.length} Receipts`}
          subtitle="Confirmed Gate Passes"
          icon={FileText}
        />
        <StatCard
          title="Total Historical Dispatches"
          value={`${(state.dispatches || []).length} Deliveries`}
          subtitle="PDF Receipts Saved"
          icon={Download}
        />
      </div>

      {/* Dispatches List Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#161B26]">Dispatch Receipts & Gate Passes</h3>
            <p className="text-xs text-[#8A8FA3]">Date: {formatDateDisplay(selectedDate)} &bull; Confirmed dispatches reduce Finish Stock (Rule 12)</p>
          </div>

          <button
            type="button"
            disabled={isReadOnly}
            onClick={() => {
              if (isReadOnly) return;
              setIsModalOpen(true);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition-all min-h-[44px] ${
              isReadOnly
                ? 'bg-[#cf8730]/60 cursor-not-allowed opacity-75'
                : 'bg-[#cf8730] hover:bg-[#b87e47] active:scale-95 cursor-pointer shadow-[#cf8730]/25'
            }`}
            title={isReadOnly ? "🔒 Read-Only Guest Mode: Action disabled for Viewers" : "New Dispatch & PDF Receipt"}
          >
            <Plus className="w-4 h-4" />
            <span>+ New Dispatch & PDF Receipt</span>
          </button>
        </div>

        {/* 4-Card Mini KPI Summary Bar (design.md §4.5) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-[#F5F6FA] rounded-2xl border border-[#EEF0F5]">
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Total Dispatched</span>
            <span className="text-base font-extrabold text-[#161B26]">{filteredDispatches.length} Gate Passes</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Dispatched Weight</span>
            <span className="text-base font-extrabold text-[#cf8730]">
              {formatKgOrTon(filteredDispatches.reduce((sum, d) => sum + Number(d.quantityKg || 0), 0))}
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Active Parties</span>
            <span className="text-base font-extrabold text-[#1FCB79]">
              {new Set(filteredDispatches.map(d => d.party)).size} Clients
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-[#8A8FA3] uppercase block">Truck Gate Out</span>
            <span className="text-base font-extrabold text-[#F5A623]">100% Cleared</span>
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Party:
            </span>
            <button
              onClick={() => setSelectedPartyFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPartyFilter === 'all'
                  ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                  : 'bg-[#F5F6FA] dark:bg-[#1C2237] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252D48]'
              }`}
            >
              All Parties
            </button>
            {PARTIES.slice(0, 3).map(party => (
              <button
                key={party}
                onClick={() => setSelectedPartyFilter(party)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedPartyFilter === party
                    ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                    : 'bg-[#F5F6FA] dark:bg-[#1C2237] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252D48]'
                }`}
              >
                {party}
              </button>
            ))}
          </div>

          {selectedPartyFilter !== 'all' && (
            <button
              onClick={() => setSelectedPartyFilter('all')}
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
                <th className="p-3.5 rounded-l-xl">Dispatch No</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Customer / Party</th>
                <th className="p-3.5">Vehicle No</th>
                <th className="p-3.5">Product Details</th>
                <th className="p-3.5 text-right">Dispatched Weight</th>
                <th className="p-3.5 text-center rounded-r-xl">Receipt PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDispatches.map(disp => (
                <tr key={disp.id} className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-extrabold text-[#5B4FE9]">{disp.dispatchNo || 'DSP-001'}</td>
                  <td className="p-3.5 text-slate-600">{formatDateDisplay(disp.date)}</td>
                  <td className="p-3.5 font-bold text-[#161B26]">{disp.party}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{disp.vehicleNumber}</td>
                  <td className="p-3.5 text-slate-600">
                    {disp.productName} ({disp.gsm} GSM, {disp.size})
                  </td>
                  <td className="p-3.5 text-right font-extrabold text-[#161B26] text-sm">
                    {disp.quantityKg.toLocaleString()} kg
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => generateDispatchPdf(disp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f4e7d7] text-[#cf8730] hover:bg-[#cf8730] hover:text-white font-extrabold text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View (md:hidden) */}
        <div className="md:hidden space-y-3">
          {filteredDispatches.map(disp => (
            <div key={disp.id} className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#EEF0F5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#cf8730]">{disp.dispatchNo || 'DSP-001'}</span>
                <button
                  onClick={() => generateDispatchPdf(disp)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#cf8730] text-white font-extrabold text-xs cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Party / Client</span>
                  <span className="font-bold text-[#161B26]">{disp.party}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Dispatched Weight</span>
                  <span className="font-extrabold text-[#161B26]">{disp.quantityKg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Vehicle & Date</span>
                  <span className="font-semibold text-slate-700">{disp.vehicleNumber} &bull; {formatDateDisplay(disp.date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Product</span>
                  <span className="font-medium text-slate-600">{disp.productName} ({disp.gsm} GSM)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Dispatch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Dispatch & Generate PDF Receipt (Rule 12)"
      >
        <form onSubmit={handleCreateDispatch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Party Name</label>
              <select
                value={dispForm.party}
                onChange={e => setDispForm({ ...dispForm, party: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none min-h-[44px]"
              >
                {PARTIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Number</label>
              <input
                type="text"
                required
                value={dispForm.vehicleNumber}
                onChange={e => setDispForm({ ...dispForm, vehicleNumber: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product</label>
              <select
                value={dispForm.productName}
                onChange={e => setDispForm({ ...dispForm, productName: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none min-h-[44px]"
              >
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GSM</label>
              <input
                type="number"
                inputMode="numeric"
                value={dispForm.gsm}
                onChange={e => setDispForm({ ...dispForm, gsm: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Size</label>
              <input
                type="text"
                value={dispForm.size}
                onChange={e => setDispForm({ ...dispForm, size: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ply</label>
              <input
                type="number"
                inputMode="numeric"
                value={dispForm.ply}
                onChange={e => setDispForm({ ...dispForm, ply: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Dispatched (kg)</label>
              <input
                type="number"
                inputMode="numeric"
                required
                placeholder="e.g. 2500"
                value={dispForm.quantityKg}
                onChange={e => setDispForm({ ...dispForm, quantityKg: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reel No(s) (Comma Separated)</label>
              <input
                type="text"
                value={dispForm.reelNos}
                onChange={e => setDispForm({ ...dispForm, reelNos: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all bg-[#E7F9EF] text-[#16A34A] border border-[#16A34A]/30 dark:bg-[#1FCB79]/15 dark:text-[#1FCB79] dark:border-[#1FCB79]/30">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Confirming will deduct stock from Finish Stock and auto-download a PDF receipt.</span>
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
              Confirm Dispatch & Download PDF
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

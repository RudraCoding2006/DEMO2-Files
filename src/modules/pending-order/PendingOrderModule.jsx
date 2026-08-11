import React, { useState } from 'react';
import { PARTIES, PRODUCTS } from '../../data/masterData';
import { StatCard } from '../../components/common/StatCard';
import { StatusPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { store } from '../../data/storage';
import { formatKgOrTon, formatDateDisplay } from '../../utils/formatters';
import { ClipboardList, Plus } from 'lucide-react';

export const PendingOrderModule = ({ state }) => {
  const orders = state.pendingOrders || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    party: PARTIES[0],
    productName: PRODUCTS[0].name,
    gsm: 16,
    size: '30cm',
    ply: 2,
    quantityKg: ''
  });

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (!orderForm.quantityKg) return;

    store.addPendingOrder({
      party: orderForm.party,
      productName: orderForm.productName,
      gsm: Number(orderForm.gsm),
      size: orderForm.size,
      ply: Number(orderForm.ply),
      quantityKg: Number(orderForm.quantityKg)
    });

    setIsModalOpen(false);
    setOrderForm({
      party: PARTIES[0],
      productName: PRODUCTS[0].name,
      gsm: 16,
      size: '30cm',
      ply: 2,
      quantityKg: ''
    });
  };

  const isReadOnly = state?.activeRole === 'guest_viewer' || state?.users?.find(u => u.id === state.activeUserId)?.isReadOnly;

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          variant="hero"
          title="Total Pending Orders"
          value={`${orders.length} Orders`}
          subtitle="Awaiting Full Dispatch"
          icon={ClipboardList}
        />
        <StatCard
          title="Pending Order Weight"
          value={formatKgOrTon(orders.reduce((sum, o) => sum + Number(o.quantityKg || 0), 0))}
          subtitle="Total Contracted Quantity"
          icon={ClipboardList}
        />
        <StatCard
          title="Parties / Customers"
          value={`${new Set(orders.map(o => o.party)).size} Parties`}
          subtitle="Active Buying Clients"
          icon={ClipboardList}
        />
      </div>

      {/* Orders Table & Mobile Cards Container */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#161B26]">Customer Pending Orders List</h3>
            <p className="text-xs text-[#8A8FA3]">Orders available for Finished Stock Dispatch (Rule 12)</p>
          </div>

          <button
            type="button"
            disabled={isReadOnly}
            onClick={() => {
              if (isReadOnly) return;
              setIsModalOpen(true);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition-all w-full sm:w-auto min-h-[44px] ${
              isReadOnly
                ? 'bg-[#cf8730]/60 cursor-not-allowed opacity-75'
                : 'bg-[#cf8730] hover:bg-[#b87e47] active:scale-95 cursor-pointer shadow-[#cf8730]/25'
            }`}
            title={isReadOnly ? "🔒 Read-Only Guest Mode: Action disabled for Viewers" : "Add New Customer Order"}
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Customer Order</span>
          </button>
        </div>

        {/* Mobile Responsive Order Cards (Shown on mobile screens < 768px) */}
        <div className="block md:hidden space-y-3">
          {orders.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No pending customer orders available.
            </div>
          ) : (
            orders.map(ord => (
              <div
                key={ord.id}
                className="p-3.5 rounded-2xl bg-white border border-[#EEF0F5] shadow-2xs hover:border-[#cf8730]/40 space-y-2.5 transition-all"
              >
                {/* Top Row: Customer Name & Status Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#f4e7d7] text-[#cf8730] flex items-center justify-center shrink-0 font-bold text-xs">
                      {ord.party?.charAt(0) || 'C'}
                    </div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#161B26] truncate">{ord.party}</h4>
                  </div>
                  <div className="shrink-0">
                    {ord.status === 'fulfilled' ? (
                      <StatusPill type="success" text="Fulfilled" />
                    ) : ord.status === 'partial' ? (
                      <StatusPill type="info" text="Partially Dispatched" />
                    ) : (
                      <StatusPill type="warning" text="Pending Dispatch" />
                    )}
                  </div>
                </div>

                {/* Specs Pill Strip */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-slate-600">
                  <span className="px-2 py-0.5 rounded-md bg-[#f4e7d7] text-[#cf8730] font-extrabold">
                    {ord.productName}
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                    {ord.gsm} GSM &bull; {ord.size} &bull; {ord.ply} Ply
                  </span>
                </div>

                {/* Bottom Row: Date & Order Quantity */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium text-[11px]">Ordered: {formatDateDisplay(ord.orderDate)}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Quantity</span>
                    <span className="font-black text-xs sm:text-sm text-[#161B26]">{formatKgOrTon(ord.quantityKg)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (Shown on md:block screens >= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                <th className="p-3.5 rounded-l-xl">Order Date</th>
                <th className="p-3.5">Customer / Party Name</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">GSM / Size / Ply</th>
                <th className="p-3.5 text-right">Order Quantity</th>
                <th className="p-3.5 text-center rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.map(ord => (
                <tr key={ord.id} className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-semibold text-slate-700">{formatDateDisplay(ord.orderDate)}</td>
                  <td className="p-3.5 font-bold text-[#161B26]">{ord.party}</td>
                  <td className="p-3.5 font-bold text-[#cf8730]">{ord.productName}</td>
                  <td className="p-3.5 text-slate-600">{ord.gsm} GSM | {ord.size} | {ord.ply} Ply</td>
                  <td className="p-3.5 text-right font-extrabold text-[#161B26]">{ord.quantityKg.toLocaleString()} kg</td>
                  <td className="p-3.5 text-center">
                    {ord.status === 'fulfilled' ? (
                      <StatusPill type="success" text="Fulfilled" />
                    ) : ord.status === 'partial' ? (
                      <StatusPill type="info" text="Partially Dispatched" />
                    ) : (
                      <StatusPill type="warning" text="Pending Dispatch" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Customer Order"
      >
        <form onSubmit={handleAddOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Party Name</label>
            <select
              value={orderForm.party}
              onChange={e => setOrderForm({ ...orderForm, party: e.target.value })}
              className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
            >
              {PARTIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product</label>
              <select
                value={orderForm.productName}
                onChange={e => setOrderForm({ ...orderForm, productName: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
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
                value={orderForm.gsm}
                onChange={e => setOrderForm({ ...orderForm, gsm: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Size</label>
              <input
                type="text"
                value={orderForm.size}
                onChange={e => setOrderForm({ ...orderForm, size: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ply</label>
              <input
                type="number"
                value={orderForm.ply}
                onChange={e => setOrderForm({ ...orderForm, ply: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (kg)</label>
            <input
              type="number"
              required
              placeholder="e.g. 5000"
              value={orderForm.quantityKg}
              onChange={e => setOrderForm({ ...orderForm, quantityKg: e.target.value })}
              className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#cf8730] text-white font-extrabold text-xs hover:bg-[#b87e47] shadow-md shadow-[#cf8730]/25 cursor-pointer"
            >
              Save Customer Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

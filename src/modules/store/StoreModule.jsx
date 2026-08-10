import React, { useState } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { store } from '../../data/storage';
import { Wrench, Plus } from 'lucide-react';

export const StoreModule = ({ state }) => {
  const [activeTab, setActiveTab] = useState('bearing');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const items = (state.storeItems || []).filter(i => i.category === activeTab);

  const [form, setForm] = useState({
    number: '',
    size: '',
    group: '',
    name: '',
    pcs: '',
    useFor: ''
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    store.addStoreItem({
      category: activeTab,
      number: form.number,
      size: form.size,
      group: form.group,
      name: form.name,
      pcs: Number(form.pcs || 0),
      useFor: form.useFor
    });

    setIsModalOpen(false);
    setForm({ number: '', size: '', group: '', name: '', pcs: '', useFor: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          variant="hero"
          title="Store Spares Inventory (Rule 13)"
          value={`${(state.storeItems || []).length} Items`}
          subtitle="Manual In/Out Spares Tracking"
          icon={Wrench}
        />
        <StatCard
          title="Bearing Spares"
          value={`${(state.storeItems || []).filter(i => i.category === 'bearing').reduce((sum, i) => sum + i.pcs, 0)} Pcs`}
          subtitle="Precision Bearings Stock"
          icon={Wrench}
        />
        <StatCard
          title="V-Belt Spares"
          value={`${(state.storeItems || []).filter(i => i.category === 'v_belt').reduce((sum, i) => sum + i.pcs, 0)} Pcs`}
          subtitle="Drive Belts Stock"
          icon={Wrench}
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'bearing', label: 'Bearings' },
              { id: 'v_belt', label: 'V-Belts' },
              { id: 'other', label: 'Other Spares' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                    : 'bg-[#F5F6FA] dark:bg-[#1C2237] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252D48]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-bold text-xs transition-all shadow-md shadow-[#cf8730]/20 cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            Add New Spare
          </button>
        </div>

        {/* Spares Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                {activeTab === 'bearing' && <th className="p-3.5 rounded-l-xl">Bearing Number</th>}
                {activeTab === 'v_belt' && <th className="p-3.5 rounded-l-xl">Size</th>}
                {activeTab === 'v_belt' && <th className="p-3.5">Belt Group</th>}
                {activeTab === 'other' && <th className="p-3.5 rounded-l-xl">Item Name</th>}
                <th className="p-3.5">Quantity (Pcs)</th>
                <th className="p-3.5 rounded-r-xl">Used For / Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  {activeTab === 'bearing' && <td className="p-3.5 font-extrabold text-[#5B4FE9]">{item.number}</td>}
                  {activeTab === 'v_belt' && <td className="p-3.5 font-extrabold text-[#5B4FE9]">{item.size}</td>}
                  {activeTab === 'v_belt' && <td className="p-3.5 font-semibold text-slate-700">{item.group}</td>}
                  {activeTab === 'other' && <td className="p-3.5 font-extrabold text-[#5B4FE9]">{item.name}</td>}
                  <td className="p-3.5 font-bold text-[#161B26] text-sm">{item.pcs} Pcs</td>
                  <td className="p-3.5 text-slate-600">{item.useFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Store Spare (${activeTab.replace('_', ' ').toUpperCase()})`}
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          {activeTab === 'bearing' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bearing Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 6205 2RS"
                value={form.number}
                onChange={e => setForm({ ...form, number: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          )}

          {activeTab === 'v_belt' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Belt Size</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B-75"
                  value={form.size}
                  onChange={e => setForm({ ...form, size: e.target.value })}
                  className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Belt Group</label>
                <input
                  type="text"
                  placeholder="e.g. B Section"
                  value={form.group}
                  onChange={e => setForm({ ...form, group: e.target.value })}
                  className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'other' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Mechanical Seal 45mm"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Pcs)</label>
              <input
                type="number"
                required
                placeholder="e.g. 10"
                value={form.pcs}
                onChange={e => setForm({ ...form, pcs: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Used For / Equipment</label>
              <input
                type="text"
                placeholder="e.g. Pulper Motor"
                value={form.useFor}
                onChange={e => setForm({ ...form, useFor: e.target.value })}
                className="w-full p-3 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
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
              className="btn-primary px-5 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer active:scale-95"
            >
              Save Spare Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

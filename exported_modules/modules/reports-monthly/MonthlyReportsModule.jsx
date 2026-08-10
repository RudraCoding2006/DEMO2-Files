import React, { useState } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { calculateMachineRunningHours } from '../../engine/productionEngine';
import { formatKgOrTon, formatDateDisplay } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Clock, AlertOctagon, Cog } from 'lucide-react';

export const MonthlyReportsModule = ({ state }) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-07');

  // Filter logs for selected month
  const machineLogs = state.machineLogs || {};
  const dates = Object.keys(machineLogs).filter(d => d.startsWith(selectedMonth));

  let monthProductionKg = 0;
  let monthRunningHours = 0;
  let monthBrokeKg = 0;
  const dailyBreakdown = [];

  dates.sort().forEach(date => {
    const rolls = machineLogs[date]?.rolls || [];
    const dayKg = rolls.reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
    monthProductionKg += dayKg;

    const runningData = machineLogs[date]?.runningTime;
    const hours = Number(calculateMachineRunningHours(runningData));
    monthRunningHours += hours;

    const reels = (state.rewinderReels || []).filter(r => r.date === date);
    const dayBroke = reels.reduce((sum, r) => sum + Number(r.brokeKg || 0), 0);
    monthBrokeKg += dayBroke;

    dailyBreakdown.push({
      date: date.slice(8),
      productionTons: Number((dayKg / 1000).toFixed(2)),
      runningHours: hours,
      brokeKg: dayBroke
    });
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Control */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#161B26]">Monthly Production & Efficiency Report (Rule 11)</h3>
          <p className="text-xs text-[#8A8FA3]">100% Auto-Aggregated from Daily Machine & Rewinder Logs</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="p-2 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
          />
        </div>
      </div>

      {/* 3 Core Rule 11 Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          variant="hero"
          title="Total Production of Month (Rule 11)"
          value={formatKgOrTon(monthProductionKg)}
          subtitle={`Across ${dates.length} Recorded Production Days`}
          icon={Cog}
        />
        <StatCard
          title="Total Loss of Month (Broke)"
          value={formatKgOrTon(monthBrokeKg)}
          subtitle="Auto Computed from Rewinder Wastage"
          icon={AlertOctagon}
          trend={monthProductionKg > 0 ? `${((monthBrokeKg / monthProductionKg) * 100).toFixed(1)}% Loss` : '0%'}
          trendType="down"
        />
        <StatCard
          title="Total Machine Running Hours"
          value={`${monthRunningHours.toFixed(1)} Hours`}
          subtitle="SUM of Daily Machine Net Uptime"
          icon={Clock}
          trend="Automated"
          trendType="up"
        />
      </div>

      {/* Production Chart */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-bold text-[#161B26] mb-4">Daily Production Rollup ({selectedMonth})</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyBreakdown} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#8A8FA3" fontSize={11} tickLine={false} />
              <YAxis stroke="#8A8FA3" fontSize={11} tickLine={false} width={32} unit=" T" />
              <Tooltip
                contentStyle={{ backgroundColor: '#12162B', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`${val} Tons`, 'Production']}
              />
              <Bar dataKey="productionTons" fill="#ca8d42" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-bold text-[#161B26] mb-4">Daily Aggregated Rollup Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                <th className="p-3.5 rounded-l-xl">Day</th>
                <th className="p-3.5 text-right">Paper Production</th>
                <th className="p-3.5 text-right">Machine Running Hours</th>
                <th className="p-3.5 text-right rounded-r-xl">Broke Wastage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {dailyBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-[#161B26]">{selectedMonth}-{row.date}</td>
                  <td className="p-3.5 text-right font-extrabold text-[#5B4FE9]">{row.productionTons} Tons</td>
                  <td className="p-3.5 text-right font-bold text-slate-700">{row.runningHours} Hrs</td>
                  <td className="p-3.5 text-right font-bold text-[#F1533C]">{row.brokeKg} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

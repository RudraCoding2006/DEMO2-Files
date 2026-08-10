import React from 'react';
import { StatCard } from '../../components/common/StatCard';
import { calculateMachineRunningHours } from '../../engine/productionEngine';
import { formatKgOrTon } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CalendarRange, Cog, AlertOctagon, Clock } from 'lucide-react';

export const YearlyReportsModule = ({ state }) => {
  const selectedYear = '2026';
  const machineLogs = state.machineLogs || {};

  // Months array
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let yearlyProductionKg = 0;
  let yearlyRunningHours = 0;
  let yearlyBrokeKg = 0;

  const monthlyChartData = months.map((m, idx) => {
    const monthKey = `${selectedYear}-${m}`;
    const dates = Object.keys(machineLogs).filter(d => d.startsWith(monthKey));

    let mKg = 0;
    let mHours = 0;
    let mBroke = 0;

    dates.forEach(date => {
      const rolls = machineLogs[date]?.rolls || [];
      const dayKg = rolls.reduce((sum, r) => sum + Number(r.weightKg || 0), 0);
      mKg += dayKg;

      const runningData = machineLogs[date]?.runningTime;
      mHours += Number(calculateMachineRunningHours(runningData));

      const reels = (state.rewinderReels || []).filter(r => r.date === date);
      mBroke += reels.reduce((sum, r) => sum + Number(r.brokeKg || 0), 0);
    });

    yearlyProductionKg += mKg;
    yearlyRunningHours += mHours;
    yearlyBrokeKg += mBroke;

    return {
      month: monthNames[idx],
      productionTons: Number((mKg / 1000).toFixed(2)),
      brokeTons: Number((mBroke / 1000).toFixed(2)),
      runningHours: Math.round(mHours)
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#161B26]">Yearly Production Rollup & Performance Report ({selectedYear})</h3>
          <p className="text-xs text-[#8A8FA3]">Rule 11 Aggregation Across All 12 Months</p>
        </div>
        <span className="px-3.5 py-1.5 rounded-xl bg-[#5B4FE9] text-white font-extrabold text-xs">
          FY 2026-27
        </span>
      </div>

      {/* 3 Core Rule 11 Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          variant="hero"
          title="Total Production of Year (Rule 11)"
          value={formatKgOrTon(yearlyProductionKg)}
          subtitle="Cumulative Annual Output"
          icon={Cog}
        />
        <StatCard
          title="Total Loss of Year (Broke)"
          value={formatKgOrTon(yearlyBrokeKg)}
          subtitle="Annual Wastage Loop-Back"
          icon={AlertOctagon}
          trend={yearlyProductionKg > 0 ? `${((yearlyBrokeKg / yearlyProductionKg) * 100).toFixed(1)}% Annual Loss` : '0%'}
          trendType="down"
        />
        <StatCard
          title="Total Machine Running Hours"
          value={`${yearlyRunningHours.toFixed(0)} Hours`}
          subtitle="Annual Mill Operating Time"
          icon={Clock}
          trend="Target Met"
          trendType="up"
        />
      </div>

      {/* Yearly Trend Bar Chart */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-bold text-[#161B26] mb-4">12-Month Production vs Broke Wastage (Metric Tons)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#8A8FA3" fontSize={11} tickLine={false} />
              <YAxis stroke="#8A8FA3" fontSize={11} tickLine={false} width={32} unit=" T" />
              <Tooltip
                contentStyle={{ backgroundColor: '#12162B', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="productionTons" name="Paper Production (Tons)" fill="#ca8d42" radius={[6, 6, 0, 0]} />
              <Bar dataKey="brokeTons" name="Broke Loss (Tons)" fill="#F1533C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Rollup Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-bold text-[#161B26] mb-4">12-Month Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                <th className="p-3.5 rounded-l-xl">Month</th>
                <th className="p-3.5 text-right">Production (Tons)</th>
                <th className="p-3.5 text-right">Running Hours</th>
                <th className="p-3.5 text-right rounded-r-xl">Broke Loss (Tons)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {monthlyChartData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-[#161B26]">{row.month} 2026</td>
                  <td className="p-3.5 text-right font-extrabold text-[#5B4FE9]">{row.productionTons} Tons</td>
                  <td className="p-3.5 text-right font-bold text-slate-700">{row.runningHours} Hrs</td>
                  <td className="p-3.5 text-right font-bold text-[#F1533C]">{row.brokeTons} Tons</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

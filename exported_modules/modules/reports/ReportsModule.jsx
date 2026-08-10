import React, { useState } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { calculateMachineRunningHours } from '../../engine/productionEngine';
import { formatKgOrTon, formatDateDisplay } from '../../utils/formatters';
import { BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, CalendarRange, Clock, AlertOctagon, Cog, Printer, Download, Filter } from 'lucide-react';

export const ReportsModule = ({ state }) => {
  const [reportTab, setReportTab] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const selectedYear = '2026';

  const machineLogs = state.machineLogs || {};

  // --- Monthly Calculation ---
  const monthDates = Object.keys(machineLogs).filter(d => d.startsWith(selectedMonth)).sort();
  let monthProductionKg = 0;
  let monthRunningHours = 0;
  let monthBrokeKg = 0;
  const dailyBreakdown = [];

  monthDates.forEach(date => {
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
      fullDate: date,
      productionTons: Number((dayKg / 1000).toFixed(2)),
      runningHours: hours,
      brokeKg: dayBroke
    });
  });

  // --- Yearly Calculation ---
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Unified Top Banner with Tab Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-[#5B4FE9]" />
            <h3 className="text-lg font-bold text-[#161B26]">Mill Reports & Analytics (Rule 11)</h3>
          </div>
          <p className="text-xs text-[#8A8FA3]">Unified Monthly & Yearly Aggregation Engine — 100% Automated</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Selector */}
          <div className="flex items-center bg-[#F5F6FA] p-1 rounded-xl border border-[#EEF0F5]">
            <button
              onClick={() => setReportTab('monthly')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reportTab === 'monthly'
                  ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Monthly Report
            </button>
            <button
              onClick={() => setReportTab('yearly')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reportTab === 'yearly'
                  ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              Yearly Report
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#12162B] text-white hover:bg-black text-xs font-bold transition-all"
            title="Print Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* MONTHLY REPORT VIEW */}
      {reportTab === 'monthly' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#cf8730]" /> Select Month for Rollup:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="p-2 bg-[#F5F6FA] border border-[#EEF0F5] rounded-xl text-xs font-bold focus:outline-none"
            />
          </div>

          {/* 3 Core Rule 11 Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              variant="hero"
              title="Total Production of Month (Rule 11)"
              value={formatKgOrTon(monthProductionKg)}
              subtitle={`Across ${monthDates.length} Recorded Production Days`}
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

          {/* Monthly Production Smooth Area Chart */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-bold text-[#161B26] mb-4">Daily Production Rollup ({selectedMonth})</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyBreakdown} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" vertical={false} />
                  <XAxis dataKey="date" stroke="#8A8FA3" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8A8FA3" fontSize={11} tickLine={false} axisLine={false} width={32} unit=" T" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#12162B', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                    formatter={(val) => [`${val} Tons`, 'Paper Production']}
                  />
                  <Area
                    type="monotone"
                    dataKey="productionTons"
                    stroke="#ca8d42"
                    strokeWidth={3}
                    fillOpacity={0.15}
                    fill="#ca8d42"
                    dot={{ r: 4, fill: '#ca8d42', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7, fill: '#ca8d42', strokeWidth: 3, stroke: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Breakdown Table */}
          <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-bold text-[#161B26] mb-4">Daily Aggregated Rollup Log ({selectedMonth})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5F6FA] text-[#8A8FA3] uppercase tracking-wider font-semibold">
                    <th className="p-3.5 rounded-l-xl">Date</th>
                    <th className="p-3.5 text-right">Paper Production</th>
                    <th className="p-3.5 text-right">Machine Running Hours</th>
                    <th className="p-3.5 text-right rounded-r-xl">Broke Wastage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dailyBreakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-[#161B26]">{formatDateDisplay(row.fullDate)}</td>
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
      )}

      {/* YEARLY REPORT VIEW */}
      {reportTab === 'yearly' && (
        <div className="space-y-6 animate-in fade-in">
          {/* 3 Core Rule 11 Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              variant="hero"
              title="Total Production of Year (Rule 11)"
              value={formatKgOrTon(yearlyProductionKg)}
              subtitle={`FY ${selectedYear} Annual Output`}
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
          <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-bold text-[#161B26] mb-4">12-Month Production vs Broke Wastage (FY {selectedYear})</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <XAxis dataKey="month" stroke="#8A8FA3" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8A8FA3" fontSize={11} tickLine={false} unit=" T" />
                  <Tooltip contentStyle={{ backgroundColor: '#12162B', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="productionTons" name="Paper Production (Tons)" fill="#ca8d42" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="brokeTons" name="Broke Loss (Tons)" fill="#F1533C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Rollup Table */}
          <div className="bg-white rounded-2xl p-6 border border-[#EEF0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-bold text-[#161B26] mb-4">12-Month Annual Performance Summary</h3>
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
                      <td className="p-3.5 font-bold text-[#161B26]">{row.month} {selectedYear}</td>
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
      )}
    </div>
  );
};

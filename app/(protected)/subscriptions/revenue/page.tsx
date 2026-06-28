'use client';
import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, IndianRupee, Users, Download,
  CreditCard, UserMinus, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Badge, StatCard, Card, Button, Tabs, cn } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';

// ─── Chart theme hook ─────────────────────────────────────────────────────────
function useChartTheme() {
  const { isDark } = useTheme();
  return {
    grid: isDark ? '#1e293b' : '#f1f5f9',
    text: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0',
    tooltipColor: isDark ? '#f1f5f9' : '#1e293b',
  };
}

function ChartTooltip({ active, payload, label, currency }: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
  currency?: boolean;
}) {
  const t = useChartTheme();
  if (!active || !payload?.length) return null;
  const fmt = (v: number) => currency ? `₹${v.toLocaleString('en-IN')}` : v.toLocaleString('en-IN');
  return (
    <div className="rounded-lg shadow-xl px-3 py-2 border text-xs" style={{ background: t.tooltipBg, borderColor: t.tooltipBorder, color: t.tooltipColor }}>
      {label && <p className="font-semibold mb-1 opacity-60">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="opacity-75">{p.name}:</span>
          <span className="font-semibold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 142000, newSubs: 186, churned: 24, mrr: 142000, subscriptions: 1420 },
  { month: 'Feb', revenue: 156400, newSubs: 201, churned: 27, mrr: 156400, subscriptions: 1594 },
  { month: 'Mar', revenue: 163500, newSubs: 178, churned: 32, mrr: 163500, subscriptions: 1740 },
  { month: 'Apr', revenue: 171000, newSubs: 194, churned: 29, mrr: 171000, subscriptions: 1905 },
  { month: 'May', revenue: 178000, newSubs: 162, churned: 31, mrr: 178000, subscriptions: 2036 },
  { month: 'Jun', revenue: 184200, newSubs: 148, churned: 22, mrr: 184200, subscriptions: 1842 },
];

const PLAN_BREAKDOWN = [
  { plan: 'Basic', price: 999, subscribers: 680, revenue: 679320, color: '#0284c7' },
  { plan: 'Standard', price: 1999, subscribers: 720, revenue: 1439280, color: '#0d9488' },
  { plan: 'Premium', price: 2999, subscribers: 320, revenue: 959680, color: '#6366f1' },
  { plan: 'Family', price: 3999, subscribers: 122, revenue: 487878, color: '#f59e0b' },
];

const PLAN_PIE = PLAN_BREAKDOWN.map(p => ({ name: p.plan, value: p.subscribers }));
const PLAN_COLORS = PLAN_BREAKDOWN.map(p => p.color);

const CITY_REVENUE = [
  { city: 'Mumbai', revenue: 54200, subs: 412 },
  { city: 'Delhi', revenue: 48600, subs: 369 },
  { city: 'Bangalore', revenue: 32800, subs: 248 },
  { city: 'Chennai', revenue: 21400, subs: 162 },
  { city: 'Kolkata', revenue: 14900, subs: 113 },
  { city: 'Others', revenue: 12300, subs: 93 },
];

const CHURN_TREND = [
  { month: 'Jan', churnRate: 1.7, arpu: 1000 },
  { month: 'Feb', churnRate: 1.9, arpu: 1020 },
  { month: 'Mar', churnRate: 2.1, arpu: 1040 },
  { month: 'Apr', churnRate: 1.8, arpu: 1060 },
  { month: 'May', churnRate: 2.3, arpu: 1080 },
  { month: 'Jun', churnRate: 1.5, arpu: 1100 },
];

const MONTHLY_TABLE = [
  { month: 'June 2026', newSubs: 148, churned: 22, netNew: 126, mrr: 184200, growth: 3.5 },
  { month: 'May 2026', newSubs: 162, churned: 31, netNew: 131, mrr: 178000, growth: 4.1 },
  { month: 'April 2026', newSubs: 194, churned: 29, netNew: 165, mrr: 171000, growth: 4.6 },
  { month: 'March 2026', newSubs: 178, churned: 32, netNew: 146, mrr: 163500, growth: 4.5 },
  { month: 'February 2026', newSubs: 201, churned: 27, netNew: 174, mrr: 156400, growth: 10.1 },
  { month: 'January 2026', newSubs: 186, churned: 24, netNew: 162, mrr: 142000, growth: 8.2 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}`; }
function fmtK(n: number) { return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`; }

function DeltaBadge({ v }: { v: number }) {
  if (v > 0) return <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-medium"><TrendingUp className="w-3 h-3" />+{v}%</span>;
  if (v < 0) return <span className="inline-flex items-center gap-0.5 text-xs text-red-500 font-medium"><TrendingDown className="w-3 h-3" />{v}%</span>;
  return <span className="text-xs text-slate-400">—</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RevenueReportsPage() {
  const theme = useChartTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [year, setYear] = useState('2026');

  const ytdRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const currentMRR = 184200;
  const arr = currentMRR * 12;
  const arpu = Math.round(currentMRR / 1842);
  const totalSubs = 1842;
  const churnRate = 1.5;

  function handleExport() {
    const csv = [
      ['Month', 'New Subscriptions', 'Churned', 'Net New', 'MRR (₹)', 'Growth %'],
      ...MONTHLY_TABLE.map(r => [r.month, r.newSubs, r.churned, r.netNew, r.mrr, r.growth]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'revenue-report.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Revenue Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">MRR, ARR, churn analysis, and subscription breakdown</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => setYear(e.target.value)} className="input-field w-28">
            <option value="2026">FY 2026</option>
            <option value="2025">FY 2025</option>
          </select>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="MRR" value={fmtK(currentMRR)} icon={<IndianRupee className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" change={3.5} />
        <StatCard title="ARR" value={fmtK(arr)} icon={<BarChart3 className="w-5 h-5" />} gradient="bg-gradient-to-br from-teal-500 to-teal-700" change={3.5} />
        <StatCard title="YTD Revenue" value={fmtK(ytdRevenue)} icon={<CreditCard className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" change={18} />
        <StatCard title="Active Subs" value={totalSubs.toLocaleString()} icon={<Users className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" change={8} />
        <StatCard title="ARPU / Month" value={fmt(arpu)} icon={<IndianRupee className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-amber-700" change={2.1} />
        <StatCard title="Churn Rate" value={`${churnRate}%`} icon={<UserMinus className="w-5 h-5" />} gradient="bg-gradient-to-br from-rose-500 to-rose-700" change={-0.8} />
      </div>

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 pt-5 border-b border-slate-100 dark:border-slate-800">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Revenue Overview' },
              { id: 'plans', label: 'By Plan' },
              { id: 'geography', label: 'By City' },
              { id: 'churn', label: 'Churn & ARPU' },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="section-title mb-4">Monthly Revenue Trend (Jan – Jun 2026)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                    <XAxis dataKey="month" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<ChartTooltip currency />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0284c7" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: '#0284c7' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="section-title mb-4">New vs Churned Subscriptions</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barSize={14} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="newSubs" name="New" fill="#10b981" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="churned" name="Churned" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="section-title mb-4">Active Subscriptions Growth</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                      <XAxis dataKey="month" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="subscriptions" name="Active Subs" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="section-title mb-4">Revenue by Plan</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={PLAN_BREAKDOWN} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
                      <XAxis type="number" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="plan" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                      <Tooltip content={<ChartTooltip currency />} />
                      <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                        {PLAN_BREAKDOWN.map((p, i) => <Cell key={i} fill={p.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="section-title mb-4">Subscribers by Plan</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={PLAN_PIE} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                        {PLAN_PIE.map((_, i) => <Cell key={i} fill={PLAN_COLORS[i]} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Plan</th>
                      <th className="table-header">Price / Month</th>
                      <th className="table-header">Subscribers</th>
                      <th className="table-header">Share</th>
                      <th className="table-header">Monthly Revenue</th>
                      <th className="table-header">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAN_BREAKDOWN.map(p => {
                      const totalRevenue = PLAN_BREAKDOWN.reduce((s, x) => s + x.revenue, 0);
                      const totalSubs = PLAN_BREAKDOWN.reduce((s, x) => s + x.subscribers, 0);
                      return (
                        <tr key={p.plan} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="table-cell">
                            <div className="flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                              <span className="font-medium text-slate-900 dark:text-white">{p.plan}</span>
                            </div>
                          </td>
                          <td className="table-cell font-mono text-sm">{fmt(p.price)}</td>
                          <td className="table-cell font-semibold">{p.subscribers.toLocaleString()}</td>
                          <td className="table-cell text-slate-500 dark:text-slate-400 text-sm">
                            {((p.subscribers / totalSubs) * 100).toFixed(1)}%
                          </td>
                          <td className="table-cell font-semibold text-emerald-700 dark:text-emerald-400">{fmt(p.revenue)}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden max-w-[80px]">
                                <div className="h-full rounded-full" style={{ width: `${(p.revenue / totalRevenue) * 100}%`, background: p.color }} />
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{((p.revenue / totalRevenue) * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 font-semibold">
                      <td className="table-cell text-slate-700 dark:text-slate-200">Total</td>
                      <td className="table-cell" />
                      <td className="table-cell text-slate-700 dark:text-slate-200">{PLAN_BREAKDOWN.reduce((s, p) => s + p.subscribers, 0).toLocaleString()}</td>
                      <td className="table-cell text-slate-500">100%</td>
                      <td className="table-cell text-emerald-700 dark:text-emerald-400">{fmt(PLAN_BREAKDOWN.reduce((s, p) => s + p.revenue, 0))}</td>
                      <td className="table-cell text-slate-500">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Geography Tab */}
          {activeTab === 'geography' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="section-title mb-4">Revenue by City</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={CITY_REVENUE} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
                      <XAxis type="number" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="city" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                      <Tooltip content={<ChartTooltip currency />} />
                      <Bar dataKey="revenue" name="Revenue" fill="#0284c7" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="section-title mb-4">Subscribers by City</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={CITY_REVENUE} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
                      <XAxis type="number" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="city" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="subs" name="Subscribers" fill="#0d9488" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">City</th>
                      <th className="table-header">Subscribers</th>
                      <th className="table-header">Revenue</th>
                      <th className="table-header">ARPU</th>
                      <th className="table-header">Share of Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CITY_REVENUE.map(c => {
                      const total = CITY_REVENUE.reduce((s, x) => s + x.revenue, 0);
                      return (
                        <tr key={c.city} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="table-cell font-medium text-slate-900 dark:text-white">{c.city}</td>
                          <td className="table-cell">{c.subs.toLocaleString()}</td>
                          <td className="table-cell font-semibold text-emerald-700 dark:text-emerald-400">{fmt(c.revenue)}</td>
                          <td className="table-cell text-sm text-slate-600 dark:text-slate-300">{fmt(Math.round(c.revenue / c.subs))}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(c.revenue / total) * 100}%` }} />
                              </div>
                              <span className="text-xs text-slate-500">{((c.revenue / total) * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Churn Tab */}
          {activeTab === 'churn' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="section-title mb-4">Monthly Churn Rate (%)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={CHURN_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                      <XAxis dataKey="month" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 3]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="churnRate" name="Churn %" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4, fill: '#f43f5e' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="section-title mb-4">ARPU Trend (₹ / subscriber / month)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={CHURN_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="arpuGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                      <XAxis dataKey="month" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} domain={[900, 1200]} />
                      <Tooltip content={<ChartTooltip currency />} />
                      <Area type="monotone" dataKey="arpu" name="ARPU" stroke="#0d9488" strokeWidth={2.5} fill="url(#arpuGrad)" dot={{ r: 4, fill: '#0d9488' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="section-title">Monthly Breakdown</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Jan – Jun 2026</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Month</th>
                <th className="table-header">New Subs</th>
                <th className="table-header">Churned</th>
                <th className="table-header">Net New</th>
                <th className="table-header">MRR</th>
                <th className="table-header">MoM Growth</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_TABLE.map((row, i) => (
                <tr key={i} className={cn('hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors', i === 0 && 'font-medium')}>
                  <td className="table-cell text-slate-900 dark:text-white font-medium">{row.month}</td>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      +{row.newSubs}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                      -{row.churned}
                    </span>
                  </td>
                  <td className="table-cell font-semibold text-slate-800 dark:text-slate-200">+{row.netNew}</td>
                  <td className="table-cell font-semibold text-brand-700 dark:text-brand-400">{fmt(row.mrr)}</td>
                  <td className="table-cell"><DeltaBadge v={row.growth} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/50 font-semibold border-t border-slate-200 dark:border-slate-700">
                <td className="table-cell text-slate-700 dark:text-slate-200">Total / YTD</td>
                <td className="table-cell text-emerald-700 dark:text-emerald-400">+{MONTHLY_TABLE.reduce((s, r) => s + r.newSubs, 0)}</td>
                <td className="table-cell text-red-600 dark:text-red-400">-{MONTHLY_TABLE.reduce((s, r) => s + r.churned, 0)}</td>
                <td className="table-cell text-slate-700 dark:text-slate-200">+{MONTHLY_TABLE.reduce((s, r) => s + r.netNew, 0)}</td>
                <td className="table-cell text-brand-700 dark:text-brand-400">{fmtK(ytdRevenue)}</td>
                <td className="table-cell"><DeltaBadge v={18} /></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

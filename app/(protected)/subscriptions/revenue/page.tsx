'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp, TrendingDown, IndianRupee, Users, Download,
  CreditCard, BarChart3, Loader2, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { StatCard, Button, Tabs, cn } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getAdminRevenueSummary, type RevenueSummary } from '@/src/services/adminApi';

const TIER_COLORS = ['#0284c7', '#0d9488', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6'];

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

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}`; }
function fmtK(n: number) { return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : fmt(n); }

function DeltaBadge({ v }: { v: number }) {
  if (v > 0) return <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-medium"><TrendingUp className="w-3 h-3" />+{v}%</span>;
  if (v < 0) return <span className="inline-flex items-center gap-0.5 text-xs text-red-500 font-medium"><TrendingDown className="w-3 h-3" />{v}%</span>;
  return <span className="text-xs text-slate-400">—</span>;
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const idx = Number(m) - 1;
  return `${names[idx] || m} ${y}`;
}

export default function RevenueReportsPage() {
  const theme = useChartTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminRevenueSummary();
        if (res.success) setSummary(res.summary);
        else setError(res.error || 'Failed to load revenue');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load revenue');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const monthly = useMemo(() => (summary?.monthly || []).map(m => ({
    month: monthLabel(m.month).slice(0, 3),
    monthFull: monthLabel(m.month),
    revenue: m.revenue,
    payments: m.payments,
  })), [summary]);

  const planBreakdown = useMemo(() => (summary?.by_tier || []).map((t, i) => ({
    plan: t.plan,
    price: 0,
    subscribers: t.subscribers,
    revenue: t.revenue,
    color: TIER_COLORS[i % TIER_COLORS.length],
  })), [summary]);

  const planPie = planBreakdown.map(p => ({ name: p.plan, value: p.subscribers }));

  const monthlyTable = useMemo(() => {
    return [...monthly].reverse().map((m, i, arr) => {
      const prev = arr[i + 1];
      const growth = prev && prev.revenue > 0
        ? Math.round(((m.revenue - prev.revenue) / prev.revenue) * 1000) / 10
        : 0;
      return { ...m, growth };
    });
  }, [monthly]);

  const ytdRevenue = summary?.total_revenue ?? 0;
  const totalSubs = summary?.active_subscriptions ?? 0;
  const recentRevenue = monthly.length ? monthly[monthly.length - 1].revenue : 0;
  const arpu = totalSubs > 0 ? Math.round(recentRevenue / totalSubs) : 0;

  function handleExport() {
    const csv = [
      ['Month', 'Payments', 'Revenue (₹)', 'MoM Growth %'],
      ...monthlyTable.map(r => [r.monthFull, r.payments, r.revenue, r.growth]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'revenue-report.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading revenue…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Revenue Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Captured payments, active subscriptions, and tier breakdown</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Captured Revenue" value={fmtK(ytdRevenue)} icon={<IndianRupee className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" />
        <StatCard title="Latest Month" value={fmtK(recentRevenue)} icon={<BarChart3 className="w-5 h-5" />} gradient="bg-gradient-to-br from-teal-500 to-teal-700" />
        <StatCard title="Active Subs" value={totalSubs.toLocaleString()} icon={<Users className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <StatCard title="Payments" value={String(summary?.captured_payments ?? 0)} icon={<CreditCard className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
      </div>

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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="section-title mb-4">Monthly Revenue (last 6 months)</h3>
                {monthly.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-sm">No captured payments yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={monthly} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
                )}
              </div>

              <div>
                <h3 className="section-title mb-4">Payments per Month</h3>
                {monthly.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">No payment activity</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="payments" name="Payments" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-6">
              {planBreakdown.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">No tier revenue yet</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="section-title mb-4">Revenue by Plan</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={planBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }} barSize={20}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
                          <XAxis type="number" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                          <YAxis type="category" dataKey="plan" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                          <Tooltip content={<ChartTooltip currency />} />
                          <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                            {planBreakdown.map((p, i) => <Cell key={i} fill={p.color} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 className="section-title mb-4">Subscribers by Plan</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={planPie} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                            {planPie.map((_, i) => <Cell key={i} fill={TIER_COLORS[i % TIER_COLORS.length]} />)}
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
                          <th className="table-header">Subscribers</th>
                          <th className="table-header">Share</th>
                          <th className="table-header">Revenue</th>
                          <th className="table-header">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planBreakdown.map(p => {
                          const totalRevenue = planBreakdown.reduce((s, x) => s + x.revenue, 0) || 1;
                          const totalPlanSubs = planBreakdown.reduce((s, x) => s + x.subscribers, 0) || 1;
                          return (
                            <tr key={p.plan} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="table-cell">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                                  <span className="font-medium text-slate-900 dark:text-white">{p.plan}</span>
                                </div>
                              </td>
                              <td className="table-cell font-semibold">{p.subscribers.toLocaleString()}</td>
                              <td className="table-cell text-slate-500 dark:text-slate-400 text-sm">
                                {((p.subscribers / totalPlanSubs) * 100).toFixed(1)}%
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
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'geography' && (
            <div className="py-16 text-center text-slate-400 text-sm">
              City-level revenue is not tracked yet (no city field on payments).
            </div>
          )}

          {activeTab === 'churn' && (
            <div className="space-y-4">
              <div className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Approx. ARPU (latest month ÷ active subs)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{fmt(arpu)}</p>
                </div>
              </div>
              <div className="py-10 text-center text-slate-400 text-sm">
                Churn rate is not tracked server-side yet.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="section-title">Monthly Breakdown</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Captured payments</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Month</th>
                <th className="table-header">Payments</th>
                <th className="table-header">Revenue</th>
                <th className="table-header">MoM Growth</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTable.map((row, i) => (
                <tr key={row.monthFull} className={cn('hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors', i === 0 && 'font-medium')}>
                  <td className="table-cell text-slate-900 dark:text-white font-medium">{row.monthFull}</td>
                  <td className="table-cell font-semibold text-slate-800 dark:text-slate-200">{row.payments}</td>
                  <td className="table-cell font-semibold text-brand-700 dark:text-brand-400">{fmt(row.revenue)}</td>
                  <td className="table-cell"><DeltaBadge v={row.growth} /></td>
                </tr>
              ))}
              {monthlyTable.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">No monthly revenue yet</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/50 font-semibold border-t border-slate-200 dark:border-slate-700">
                <td className="table-cell text-slate-700 dark:text-slate-200">Total</td>
                <td className="table-cell text-slate-700 dark:text-slate-200">{summary?.captured_payments ?? 0}</td>
                <td className="table-cell text-brand-700 dark:text-brand-400">{fmtK(ytdRevenue)}</td>
                <td className="table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

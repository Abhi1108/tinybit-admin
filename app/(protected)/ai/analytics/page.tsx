'use client';
import React, { useState, useMemo } from 'react';
import {
  Hash, Zap, Users, TrendingUp, Bot, Filter,
  Download, Search, CheckCircle2, XCircle, Clock, ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Badge, Avatar, StatCard, Button, Tabs, Pagination, cn } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';

// ─── Chart theme ──────────────────────────────────────────────────────────────
function useChartTheme() {
  const { isDark } = useTheme();
  return {
    grid: isDark ? '#1e293b' : '#f1f5f9',
    text: isDark ? '#94a3b8' : '#64748b',
    bg: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e2e8f0',
    fg: isDark ? '#f1f5f9' : '#1e293b',
  };
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string;
}) {
  const t = useChartTheme();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg shadow-xl px-3 py-2 border text-xs" style={{ background: t.bg, borderColor: t.border, color: t.fg }}>
      {label && <p className="font-semibold mb-1 opacity-60">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="opacity-75">{p.name}:</span>
          <span className="font-semibold">{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MODEL_COLORS: Record<string, string> = {
  'GPT-4o-mini': '#0284c7', 'GPT-4o': '#6366f1', 'Claude 3.5': '#f59e0b', 'Gemini 1.5': '#10b981',
};

const DAILY_TREND = [
  { date: 'Jun 9',  input: 312000, output: 578000, total: 890000 },
  { date: 'Jun 10', input: 368000, output: 672000, total: 1040000 },
  { date: 'Jun 11', input: 341000, output: 639000, total: 980000 },
  { date: 'Jun 12', input: 428000, output: 792000, total: 1220000 },
  { date: 'Jun 13', input: 413000, output: 767000, total: 1180000 },
  { date: 'Jun 14', input: 228000, output: 422000, total: 650000 },
  { date: 'Jun 15', input: 172000, output: 318000, total: 490000 },
];

const WEEKLY_TREND = [
  { date: 'Week 1', input: 1820000, output: 3980000, total: 5800000 },
  { date: 'Week 2', input: 1940000, output: 4260000, total: 6200000 },
  { date: 'Week 3', input: 1850000, output: 4050000, total: 5900000 },
  { date: 'Week 4', input: 2260000, output: 4840000, total: 7100000 },
];

const MONTHLY_TREND = [
  { date: 'Jan', input: 780000, output: 1420000, total: 2200000 },
  { date: 'Feb', input: 920000, output: 1680000, total: 2600000 },
  { date: 'Mar', input: 1040000, output: 1960000, total: 3000000 },
  { date: 'Apr', input: 1180000, output: 2220000, total: 3400000 },
  { date: 'May', input: 1320000, output: 2480000, total: 3800000 },
  { date: 'Jun', input: 2820000, output: 5630000, total: 8450000 },
];

const MODEL_BREAKDOWN = [
  { model: 'GPT-4o-mini', tokens: 4820000, pct: 57 },
  { model: 'GPT-4o', tokens: 2140000, pct: 25 },
  { model: 'Claude 3.5', tokens: 1080000, pct: 13 },
  { model: 'Gemini 1.5', tokens: 410000, pct: 5 },
];

const FEATURE_BREAKDOWN = [
  { feature: 'Sathi AI Chat', tokens: 3920000, requests: 2840 },
  { feature: 'Voice Transcription', tokens: 2110000, requests: 1240 },
  { feature: 'Text-to-Speech', tokens: 1270000, requests: 890 },
  { feature: 'Knowledge Base', tokens: 760000, requests: 310 },
  { feature: 'Health Insights', tokens: 390000, requests: 100 },
];

const DEPT_BREAKDOWN = [
  { dept: 'Elder Care', tokens: 4200000, users: 412 },
  { dept: 'Support', tokens: 2100000, users: 189 },
  { dept: 'Clinical', tokens: 1270000, users: 98 },
  { dept: 'Guardian Relations', tokens: 880000, users: 193 },
];

const TOP_USERS = [
  { name: 'Arjun Mehta', dept: 'Support', requests: 342, tokens: 421000, model: 'GPT-4o-mini', cost: 3.82 },
  { name: 'Priya Nair', dept: 'Clinical', requests: 289, tokens: 356000, model: 'GPT-4o', cost: 5.34 },
  { name: 'Rohit Verma', dept: 'Support', requests: 241, tokens: 297000, model: 'GPT-4o-mini', cost: 2.69 },
  { name: 'Meera Krishnan', dept: 'Elder Care', requests: 198, tokens: 244000, model: 'Claude 3.5', cost: 3.66 },
  { name: 'Sanjay Patil', dept: 'Guardian Relations', requests: 174, tokens: 214000, model: 'GPT-4o-mini', cost: 1.94 },
  { name: 'Kavya Reddy', dept: 'Clinical', requests: 162, tokens: 199000, model: 'GPT-4o', cost: 2.99 },
  { name: 'Ankit Sharma', dept: 'Support', requests: 143, tokens: 176000, model: 'GPT-4o-mini', cost: 1.59 },
  { name: 'Divya Joshi', dept: 'Elder Care', requests: 128, tokens: 157000, model: 'Claude 3.5', cost: 2.36 },
];

const MOCK_REQUESTS = [
  { id: 'REQ-4380', user: 'Ramesh Kumar (Elder)', dept: 'Elder Care', model: 'gpt-4o-mini', feature: 'Sathi AI Chat', inputTokens: 245, outputTokens: 512, total: 757, ts: '2026-06-15T09:32:00Z', responseTime: 1.2, status: 'success' },
  { id: 'REQ-4379', user: 'Priya Nair', dept: 'Clinical', model: 'gpt-4o', feature: 'Health Insights', inputTokens: 892, outputTokens: 1840, total: 2732, ts: '2026-06-15T09:28:00Z', responseTime: 2.8, status: 'success' },
  { id: 'REQ-4378', user: 'Savita Devi (Elder)', dept: 'Elder Care', model: 'gpt-4o-mini', feature: 'Sathi AI Chat', inputTokens: 189, outputTokens: 421, total: 610, ts: '2026-06-15T09:25:00Z', responseTime: 0.9, status: 'success' },
  { id: 'REQ-4377', user: 'Rohit Verma', dept: 'Support', model: 'gpt-4o-mini', feature: 'Chat Support', inputTokens: 312, outputTokens: 684, total: 996, ts: '2026-06-15T09:18:00Z', responseTime: 1.4, status: 'success' },
  { id: 'REQ-4376', user: 'Mohan Lal (Elder)', dept: 'Elder Care', model: 'tts-1', feature: 'Text-to-Speech', inputTokens: 0, outputTokens: 1240, total: 1240, ts: '2026-06-15T09:14:00Z', responseTime: 0.6, status: 'success' },
  { id: 'REQ-4375', user: 'Arjun Mehta', dept: 'Support', model: 'gpt-4o-mini', feature: 'Knowledge Base', inputTokens: 421, outputTokens: 892, total: 1313, ts: '2026-06-15T09:10:00Z', responseTime: 1.8, status: 'success' },
  { id: 'REQ-4374', user: 'Geeta Verma (Elder)', dept: 'Elder Care', model: 'whisper-1', feature: 'Voice Transcription', inputTokens: 0, outputTokens: 2840, total: 2840, ts: '2026-06-15T09:05:00Z', responseTime: 3.2, status: 'success' },
  { id: 'REQ-4373', user: 'Meera Krishnan', dept: 'Elder Care', model: 'claude-3-5-sonnet', feature: 'Health Insights', inputTokens: 1240, outputTokens: 2480, total: 3720, ts: '2026-06-15T08:58:00Z', responseTime: 4.1, status: 'success' },
  { id: 'REQ-4372', user: 'Baldev Singh (Elder)', dept: 'Elder Care', model: 'gpt-4o-mini', feature: 'Sathi AI Chat', inputTokens: 178, outputTokens: 396, total: 574, ts: '2026-06-15T08:52:00Z', responseTime: 1.0, status: 'failed' },
  { id: 'REQ-4371', user: 'Sanjay Patil', dept: 'Guardian Relations', model: 'gpt-4o', feature: 'Knowledge Base', inputTokens: 654, outputTokens: 1380, total: 2034, ts: '2026-06-15T08:45:00Z', responseTime: 2.4, status: 'success' },
  { id: 'REQ-4370', user: 'Sunita Rao (Elder)', dept: 'Elder Care', model: 'gpt-4o-mini', feature: 'Sathi AI Chat', inputTokens: 201, outputTokens: 448, total: 649, ts: '2026-06-15T08:40:00Z', responseTime: 1.1, status: 'success' },
  { id: 'REQ-4369', user: 'Kavya Reddy', dept: 'Clinical', model: 'gpt-4o', feature: 'Health Insights', inputTokens: 980, outputTokens: 1960, total: 2940, ts: '2026-06-15T08:35:00Z', responseTime: 3.0, status: 'success' },
  { id: 'REQ-4368', user: 'Priya Sharma (Elder)', dept: 'Elder Care', model: 'whisper-1', feature: 'Voice Transcription', inputTokens: 0, outputTokens: 3120, total: 3120, ts: '2026-06-15T08:28:00Z', responseTime: 3.8, status: 'success' },
  { id: 'REQ-4367', user: 'Ankit Sharma', dept: 'Support', model: 'gpt-4o-mini', feature: 'Chat Support', inputTokens: 287, outputTokens: 592, total: 879, ts: '2026-06-15T08:22:00Z', responseTime: 1.3, status: 'success' },
  { id: 'REQ-4366', user: 'Kamala Bai (Elder)', dept: 'Elder Care', model: 'gpt-4o-mini', feature: 'Sathi AI Chat', inputTokens: 156, outputTokens: 348, total: 504, ts: '2026-06-15T08:15:00Z', responseTime: 0.8, status: 'failed' },
];

function fmtK(n: number) { return n >= 1000000 ? `${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString(); }
function formatDate(iso: string) { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }

const TREND_DATA: Record<string, typeof DAILY_TREND> = { daily: DAILY_TREND, weekly: WEEKLY_TREND, monthly: MONTHLY_TREND };

export default function AIAnalyticsPage() {
  const theme = useChartTheme();
  const [mainTab, setMainTab] = useState('overview');
  const [trendPeriod, setTrendPeriod] = useState('daily');
  const [search, setSearch] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featureFilter, setFeatureFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredRequests = useMemo(() => MOCK_REQUESTS.filter(r => {
    const s = search.toLowerCase();
    const matchSearch = !s || r.id.toLowerCase().includes(s) || r.user.toLowerCase().includes(s) || r.dept.toLowerCase().includes(s);
    const matchModel = modelFilter === 'all' || r.model.includes(modelFilter);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchFeature = featureFilter === 'all' || r.feature === featureFilter;
    return matchSearch && matchModel && matchStatus && matchFeature;
  }), [search, modelFilter, statusFilter, featureFilter]);

  const paginatedRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize);
  const maxUserTokens = Math.max(...TOP_USERS.map(u => u.tokens));
  const maxFeatureTokens = Math.max(...FEATURE_BREAKDOWN.map(f => f.tokens));

  function handleExport() {
    const csv = [
      ['Request ID', 'User', 'Department', 'AI Model', 'Feature', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Response Time (s)', 'Status', 'Timestamp'],
      ...MOCK_REQUESTS.map(r => [r.id, r.user, r.dept, r.model, r.feature, r.inputTokens, r.outputTokens, r.total, r.responseTime, r.status, r.ts]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'token-analytics.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Token Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track token consumption across models, users, and features</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input-field w-32">
            <option>This Month</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom</option>
          </select>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tokens Consumed" value="8.45M" icon={<Hash className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" change={12} />
        <StatCard title="Input Tokens" value="2.82M" icon={<ArrowUpRight className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" change={10} />
        <StatCard title="Output Tokens" value="5.63M" icon={<Zap className="w-5 h-5" />} gradient="bg-gradient-to-br from-teal-500 to-teal-700" change={13} />
        <StatCard title="Avg Tokens / Request" value="1,927" icon={<TrendingUp className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-amber-700" change={3} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total AI Requests" value="4,380" icon={<Bot className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" change={8} />
        <StatCard title="Active AI Users" value="892" icon={<Users className="w-5 h-5" />} gradient="bg-gradient-to-br from-rose-500 to-rose-700" change={6} />
        <StatCard title="Top Model" value="GPT-4o-mini" icon={<Bot className="w-5 h-5" />} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <StatCard title="Monthly Token Growth" value="12.3%" icon={<TrendingUp className="w-5 h-5" />} gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" change={12} />
      </div>

      {/* Main Analytics Card */}
      <div className="card overflow-hidden">
        <div className="px-6 pt-5 border-b border-slate-100 dark:border-slate-800">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'feature', label: 'By Feature' },
              { id: 'user', label: 'By User' },
              { id: 'department', label: 'By Department' },
            ]}
            active={mainTab}
            onChange={setMainTab}
          />
        </div>
        <div className="p-6">

          {/* Overview */}
          {mainTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Token Usage Trend</h3>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  {(['daily', 'weekly', 'monthly'] as const).map(p => (
                    <button key={p} onClick={() => setTrendPeriod(p)} className={cn('px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize', trendPeriod === p ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400')}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={TREND_DATA[trendPeriod]} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} /><stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                  <XAxis dataKey="date" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="input" name="Input Tokens" stroke="#6366f1" strokeWidth={2} fill="url(#inGrad)" dot={false} />
                  <Area type="monotone" dataKey="output" name="Output Tokens" stroke="#0284c7" strokeWidth={2} fill="url(#outGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="section-title mb-4">Token Consumption by Model</h3>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={MODEL_BREAKDOWN} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="tokens">
                          {MODEL_BREAKDOWN.map((m, i) => <Cell key={i} fill={MODEL_COLORS[m.model]} />)}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {MODEL_BREAKDOWN.map(m => (
                      <div key={m.model} className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: MODEL_COLORS[m.model] }} />
                        <span className="text-xs text-slate-600 dark:text-slate-300 flex-1">{m.model}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtK(m.tokens)}</span>
                        <span className="text-xs text-slate-400 w-8 text-right">{m.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="section-title mb-4">Requests by Model (Daily Average)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={MODEL_BREAKDOWN} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 0 }} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
                      <XAxis type="number" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
                      <YAxis type="category" dataKey="model" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="tokens" name="Tokens" radius={[0, 4, 4, 0]}>
                        {MODEL_BREAKDOWN.map((m, i) => <Cell key={i} fill={MODEL_COLORS[m.model]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* By Feature */}
          {mainTab === 'feature' && (
            <div className="space-y-4">
              <h3 className="section-title">Token Consumption by Feature</h3>
              <div className="space-y-4">
                {FEATURE_BREAKDOWN.map((f, i) => {
                  const colors = ['#0284c7', '#0d9488', '#6366f1', '#f59e0b', '#10b981'];
                  return (
                    <div key={f.feature} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full" style={{ background: colors[i] }} />
                          <span className="font-medium text-sm text-slate-900 dark:text-white">{f.feature}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">{f.requests.toLocaleString()} requests</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{fmtK(f.tokens)} tokens</span>
                          <span className="text-slate-400 w-8 text-right">{Math.round((f.tokens / maxFeatureTokens) * 100)}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(f.tokens / maxFeatureTokens) * 100}%`, background: colors[i] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={FEATURE_BREAKDOWN} margin={{ top: 5, right: 10, left: 10, bottom: 30 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                    <XAxis dataKey="feature" tick={{ fill: theme.text, fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="tokens" name="Tokens" radius={[4, 4, 0, 0]} fill="#0284c7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* By User */}
          {mainTab === 'user' && (
            <div>
              <h3 className="section-title mb-4">Top Users by Token Consumption</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">User</th>
                      <th className="table-header">Department</th>
                      <th className="table-header">Primary Model</th>
                      <th className="table-header">Requests</th>
                      <th className="table-header">Tokens Used</th>
                      <th className="table-header">Token Share</th>
                      <th className="table-header">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOP_USERS.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={u.name} size="sm" />
                            <span className="font-medium text-sm text-slate-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="table-cell"><Badge variant="default" size="sm">{u.dept}</Badge></td>
                        <td className="table-cell"><span className="text-xs font-mono text-slate-600 dark:text-slate-300">{u.model}</span></td>
                        <td className="table-cell font-semibold">{u.requests.toLocaleString()}</td>
                        <td className="table-cell font-semibold text-brand-700 dark:text-brand-400">{fmtK(u.tokens)}</td>
                        <td className="table-cell min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(u.tokens / maxUserTokens) * 100}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-8">{Math.round((u.tokens / maxUserTokens) * 100)}%</span>
                          </div>
                        </td>
                        <td className="table-cell text-emerald-700 dark:text-emerald-400 font-semibold">${u.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* By Department */}
          {mainTab === 'department' && (
            <div className="space-y-6">
              <h3 className="section-title">Token Consumption by Department</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  {DEPT_BREAKDOWN.map((d, i) => {
                    const colors = ['#0284c7', '#6366f1', '#10b981', '#f59e0b'];
                    const total = DEPT_BREAKDOWN.reduce((s, x) => s + x.tokens, 0);
                    return (
                      <div key={d.dept} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ background: colors[i] }} />
                            <span className="font-medium text-sm text-slate-900 dark:text-white">{d.dept}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{fmtK(d.tokens)}</p>
                            <p className="text-xs text-slate-400">{d.users} users</p>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(d.tokens / total) * 100}%`, background: colors[i] }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{((d.tokens / total) * 100).toFixed(1)}% of total</p>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={DEPT_BREAKDOWN.map(d => ({ name: d.dept, value: d.tokens }))} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                        {DEPT_BREAKDOWN.map((_, i) => <Cell key={i} fill={['#0284c7', '#6366f1', '#10b981', '#f59e0b'][i]} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Log */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="section-title">Request Log</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">{MOCK_REQUESTS.length} requests today</span>
        </div>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input type="text" placeholder="Search by ID, user, department..." className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={modelFilter} onChange={e => { setModelFilter(e.target.value); setPage(1); }} className="input-field w-36">
            <option value="all">All Models</option>
            <option value="gpt-4o-mini">GPT-4o-mini</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="claude">Claude 3.5</option>
            <option value="gemini">Gemini</option>
            <option value="whisper">Whisper</option>
            <option value="tts">TTS</option>
          </select>
          <select value={featureFilter} onChange={e => { setFeatureFilter(e.target.value); setPage(1); }} className="input-field w-40">
            <option value="all">All Features</option>
            <option value="Sathi AI Chat">Sathi AI Chat</option>
            <option value="Voice Transcription">Voice Transcription</option>
            <option value="Text-to-Speech">Text-to-Speech</option>
            <option value="Health Insights">Health Insights</option>
            <option value="Chat Support">Chat Support</option>
            <option value="Knowledge Base">Knowledge Base</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-28">
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <button className="btn-secondary"><Filter className="w-4 h-4" /> More</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Request ID</th>
                <th className="table-header">User</th>
                <th className="table-header">Department</th>
                <th className="table-header">Model</th>
                <th className="table-header">Feature</th>
                <th className="table-header">Input</th>
                <th className="table-header">Output</th>
                <th className="table-header">Total</th>
                <th className="table-header">Response</th>
                <th className="table-header">Time</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="table-cell"><span className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-400">{r.id}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.user} size="xs" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[110px]">{r.user}</span>
                    </div>
                  </td>
                  <td className="table-cell"><Badge variant="default" size="sm">{r.dept}</Badge></td>
                  <td className="table-cell"><span className="text-xs font-mono text-slate-600 dark:text-slate-300">{r.model}</span></td>
                  <td className="table-cell"><span className="text-xs text-slate-500 dark:text-slate-400">{r.feature}</span></td>
                  <td className="table-cell text-xs text-violet-700 dark:text-violet-400 font-semibold">{r.inputTokens.toLocaleString()}</td>
                  <td className="table-cell text-xs text-brand-700 dark:text-brand-400 font-semibold">{r.outputTokens.toLocaleString()}</td>
                  <td className="table-cell text-xs font-bold text-slate-800 dark:text-slate-200">{r.total.toLocaleString()}</td>
                  <td className="table-cell text-xs text-slate-500 dark:text-slate-400">{r.responseTime}s</td>
                  <td className="table-cell text-xs text-slate-500 dark:text-slate-400">{formatDate(r.ts)}</td>
                  <td className="table-cell">
                    {r.status === 'success'
                      ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3 h-3" />OK</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-red-500"><XCircle className="w-3 h-3" />Failed</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRequests.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No requests found matching your filters.</div>}
        {filteredRequests.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination page={page} pageSize={pageSize} total={filteredRequests.length} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

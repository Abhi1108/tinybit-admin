'use client';
import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, AlertTriangle, CheckCircle2,
  Edit2, Shield, Users, BarChart3, Download,
  AlertCircle, Save, X,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Badge, Avatar, StatCard, Button, Tabs, cn } from '@/src/components/ui';
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
          <span className="font-semibold">${Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PricingRow { model: string; provider: string; inputPer1M: number; outputPer1M: number; currency: string; effectiveDate: string; }
interface Budget { dept: string; monthly: number; spent: number; }

// ─── Mock Data ────────────────────────────────────────────────────────────────
const DAILY_COST = [
  { date: 'Jun 9',  cost: 261.40, gpt4o: 138.60, gpt4omini: 55.80, claude: 52.80, gemini: 14.20 },
  { date: 'Jun 10', cost: 308.70, gpt4o: 163.50, gpt4omini: 65.90, claude: 62.30, gemini: 17.00 },
  { date: 'Jun 11', cost: 287.30, gpt4o: 152.10, gpt4omini: 61.40, claude: 57.90, gemini: 15.90 },
  { date: 'Jun 12', cost: 357.80, gpt4o: 189.40, gpt4omini: 76.40, claude: 72.10, gemini: 19.90 },
  { date: 'Jun 13', cost: 341.60, gpt4o: 180.90, gpt4omini: 72.90, claude: 68.90, gemini: 18.90 },
  { date: 'Jun 14', cost: 190.80, gpt4o: 101.10, gpt4omini: 40.80, claude: 38.50, gemini: 10.40 },
  { date: 'Jun 15', cost: 144.10, gpt4o: 76.30, gpt4omini: 30.80, claude: 29.10, gemini: 7.90 },
];

const WEEKLY_COST = [
  { date: 'Week 1', cost: 1748.20 }, { date: 'Week 2', cost: 1887.60 },
  { date: 'Week 3', cost: 1804.90 }, { date: 'Week 4', cost: 2807.30 },
];

const MONTHLY_COST = [
  { date: 'Jan', cost: 2840.50 }, { date: 'Feb', cost: 3124.20 }, { date: 'Mar', cost: 3489.80 },
  { date: 'Apr', cost: 3812.60 }, { date: 'May', cost: 4281.30 }, { date: 'Jun', cost: 6247.50 },
];

const MODEL_COSTS = [
  { model: 'GPT-4o', provider: 'OpenAI', inputTokens: 856000, outputTokens: 1284000, inputCost: 4.28, outputCost: 19.26, totalCost: 4234.80, pct: 51, color: '#6366f1' },
  { model: 'GPT-4o-mini', provider: 'OpenAI', inputTokens: 1928000, outputTokens: 2892000, inputCost: 0.29, outputCost: 1.74, totalCost: 1842.30, pct: 22, color: '#0284c7' },
  { model: 'Claude 3.5', provider: 'Anthropic', inputTokens: 432000, outputTokens: 648000, inputCost: 1.30, outputCost: 9.72, totalCost: 1680.90, pct: 20, color: '#f59e0b' },
  { model: 'Gemini 1.5 Pro', provider: 'Google', inputTokens: 164000, outputTokens: 246000, inputCost: 0.21, outputCost: 1.23, totalCost: 489.50, pct: 6, color: '#10b981' },
];

const USER_COSTS = [
  { name: 'Arjun Mehta', dept: 'Support', tokens: 421000, cost: 38.92, requests: 342, avgPerReq: 0.11 },
  { name: 'Priya Nair', dept: 'Clinical', tokens: 356000, cost: 53.40, requests: 289, avgPerReq: 0.18 },
  { name: 'Rohit Verma', dept: 'Support', tokens: 297000, cost: 26.93, requests: 241, avgPerReq: 0.11 },
  { name: 'Meera Krishnan', dept: 'Elder Care', tokens: 244000, cost: 36.60, requests: 198, avgPerReq: 0.18 },
  { name: 'Sanjay Patil', dept: 'Guardian', tokens: 214000, cost: 19.40, requests: 174, avgPerReq: 0.11 },
  { name: 'Kavya Reddy', dept: 'Clinical', tokens: 199000, cost: 29.85, requests: 162, avgPerReq: 0.18 },
  { name: 'Ankit Sharma', dept: 'Support', tokens: 176000, cost: 15.94, requests: 143, avgPerReq: 0.11 },
  { name: 'Divya Joshi', dept: 'Elder Care', tokens: 157000, cost: 23.55, requests: 128, avgPerReq: 0.18 },
];

const DEPT_COSTS = [
  { dept: 'Elder Care', cost: 3180.60, users: 412, tokens: 4200000, budget: 3500 },
  { dept: 'Support', cost: 1596.90, users: 189, tokens: 2100000, budget: 2000 },
  { dept: 'Clinical', cost: 964.80, users: 98, tokens: 1270000, budget: 1200 },
  { dept: 'Guardian Relations', cost: 505.20, users: 193, tokens: 880000, budget: 800 },
];

const INITIAL_BUDGETS: Budget[] = [
  { dept: 'Overall AI', monthly: 10000, spent: 8247.50 },
  { dept: 'Elder Care', monthly: 3500, spent: 3180.60 },
  { dept: 'Support', monthly: 2000, spent: 1596.90 },
  { dept: 'Clinical', monthly: 1200, spent: 964.80 },
  { dept: 'Guardian Relations', monthly: 800, spent: 505.20 },
];

const INITIAL_PRICING: PricingRow[] = [
  { model: 'GPT-4o', provider: 'OpenAI', inputPer1M: 5.00, outputPer1M: 15.00, currency: 'USD', effectiveDate: '2026-05-01' },
  { model: 'GPT-4o-mini', provider: 'OpenAI', inputPer1M: 0.15, outputPer1M: 0.60, currency: 'USD', effectiveDate: '2026-05-01' },
  { model: 'GPT-4', provider: 'OpenAI', inputPer1M: 30.00, outputPer1M: 60.00, currency: 'USD', effectiveDate: '2026-01-01' },
  { model: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPer1M: 3.00, outputPer1M: 15.00, currency: 'USD', effectiveDate: '2026-04-01' },
  { model: 'Gemini 1.5 Pro', provider: 'Google', inputPer1M: 1.25, outputPer1M: 5.00, currency: 'USD', effectiveDate: '2026-03-01' },
  { model: 'Whisper-1', provider: 'OpenAI', inputPer1M: 0.006, outputPer1M: 0.00, currency: 'USD/min', effectiveDate: '2026-01-01' },
  { model: 'TTS-1', provider: 'OpenAI', inputPer1M: 15.00, outputPer1M: 0.00, currency: 'USD', effectiveDate: '2026-01-01' },
];

const AUDIT_LOG = [
  { id: 'AUD-0018', user: 'Rajan Kumar', role: 'Super Admin', action: 'Updated GPT-4o-mini pricing', detail: '$0.12 → $0.15 per 1M input tokens', ts: '2026-06-12T14:30:00Z' },
  { id: 'AUD-0017', user: 'Amit Shah', role: 'AI Manager', action: 'Set Elder Care monthly budget', detail: '$3,000 → $3,500', ts: '2026-06-10T09:15:00Z' },
  { id: 'AUD-0016', user: 'Rajan Kumar', role: 'Super Admin', action: 'Added Gemini 1.5 Pro pricing', detail: 'New model — $1.25/$5.00 per 1M', ts: '2026-06-08T11:00:00Z' },
  { id: 'AUD-0015', user: 'Neha Singh', role: 'Analyst', action: 'Exported AI cost report (May 2026)', detail: 'PDF export downloaded', ts: '2026-06-01T16:45:00Z' },
  { id: 'AUD-0014', user: 'Amit Shah', role: 'AI Manager', action: 'Updated Clinical dept budget', detail: '$1,000 → $1,200', ts: '2026-05-28T10:00:00Z' },
];

const TOTAL_COST = 8247.50;
const TOTAL_BUDGET = 10000;

function fmtUSD(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function formatDate(iso: string) { return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

function AlertBadge({ pct }: { pct: number }) {
  if (pct >= 100) return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full"><AlertCircle className="w-3 h-3" />Over Budget</span>;
  if (pct >= 90) return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-full"><AlertTriangle className="w-3 h-3" />Critical</span>;
  if (pct >= 75) return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 rounded-full"><AlertTriangle className="w-3 h-3" />Warning</span>;
  if (pct >= 50) return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full"><AlertCircle className="w-3 h-3" />Notice</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full"><CheckCircle2 className="w-3 h-3" />On Track</span>;
}

function BudgetBar({ pct }: { pct: number }) {
  const color = pct >= 100 ? '#dc2626' : pct >= 90 ? '#ef4444' : pct >= 75 ? '#f59e0b' : pct >= 50 ? '#eab308' : '#10b981';
  return (
    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  );
}

export default function AICostsPage() {
  const theme = useChartTheme();
  const [mainTab, setMainTab] = useState('overview');
  const [trendPeriod, setTrendPeriod] = useState('daily');
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [editingBudget, setEditingBudget] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [pricing, setPricing] = useState<PricingRow[]>(INITIAL_PRICING);
  const [editingPricing, setEditingPricing] = useState<number | null>(null);
  const [pricingInputs, setPricingInputs] = useState<{ input: string; output: string }>({ input: '', output: '' });

  const overallPct = (TOTAL_COST / TOTAL_BUDGET) * 100;
  const TREND_DATA: Record<string, { date: string; cost: number; [key: string]: string | number }[]> = {
    daily: DAILY_COST, weekly: WEEKLY_COST, monthly: MONTHLY_COST,
  };

  function startBudgetEdit(i: number) { setEditingBudget(i); setBudgetInput(String(budgets[i].monthly)); }
  function saveBudget(i: number) {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) setBudgets(b => b.map((x, j) => j === i ? { ...x, monthly: val } : x));
    setEditingBudget(null);
  }
  function startPricingEdit(i: number) {
    setEditingPricing(i);
    setPricingInputs({ input: String(pricing[i].inputPer1M), output: String(pricing[i].outputPer1M) });
  }
  function savePricing(i: number) {
    const inp = parseFloat(pricingInputs.input), out = parseFloat(pricingInputs.output);
    if (!isNaN(inp) && !isNaN(out)) setPricing(p => p.map((x, j) => j === i ? { ...x, inputPer1M: inp, outputPer1M: out } : x));
    setEditingPricing(null);
  }

  function handleExport() {
    const csv = [
      ['Model', 'Provider', 'Input Tokens', 'Output Tokens', 'Input Cost ($)', 'Output Cost ($)', 'Total Cost ($)', 'Share'],
      ...MODEL_COSTS.map(m => [m.model, m.provider, m.inputTokens, m.outputTokens, (m.inputCost * (m.inputTokens / 1000)).toFixed(2), (m.outputCost * (m.outputTokens / 1000)).toFixed(2), m.totalCost.toFixed(2), m.pct + '%']),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ai-cost-report.csv'; a.click();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Cost Tracking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Monitor AI spending, budgets, and pricing across all models and departments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <Shield className="w-3.5 h-3.5 text-brand-500" />
            Role: <span className="font-semibold text-brand-700 dark:text-brand-400">Super Admin</span>
          </div>
          <select className="input-field w-32">
            <option>This Month</option><option>Last 7 Days</option><option>Last 30 Days</option><option>Custom</option>
          </select>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      {/* Budget Alert Banner */}
      {overallPct >= 75 && (
        <div className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium', overallPct >= 90 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300')}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Budget Alert:</span>
          <span className="font-normal">Overall AI spending is at {overallPct.toFixed(1)}% of monthly budget ({fmtUSD(TOTAL_COST)} of {fmtUSD(TOTAL_BUDGET)}). Projected month-end: {fmtUSD(TOTAL_COST * (30 / 15))}.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cost (Month)" value={fmtUSD(TOTAL_COST)} icon={<DollarSign className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" change={14} />
        <StatCard title="Today's Cost" value={fmtUSD(144.10)} icon={<DollarSign className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" change={-8} />
        <StatCard title="Weekly Cost" value={fmtUSD(1891.70)} icon={<BarChart3 className="w-5 h-5" />} gradient="bg-gradient-to-br from-teal-500 to-teal-700" change={6} />
        <StatCard title="Budget Utilization" value={`${overallPct.toFixed(1)}%`} icon={<AlertTriangle className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-amber-700" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Cost per Active User" value={fmtUSD(TOTAL_COST / 892)} icon={<Users className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" change={5} />
        <StatCard title="Cost per Request" value={fmtUSD(TOTAL_COST / 4380)} icon={<DollarSign className="w-5 h-5" />} gradient="bg-gradient-to-br from-rose-500 to-rose-700" change={2} />
        <StatCard title="Est. Month-End Spend" value={fmtUSD(9892.00)} icon={<TrendingUp className="w-5 h-5" />} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <StatCard title="Projected Annual" value="$118.7K" icon={<TrendingUp className="w-5 h-5" />} gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" />
      </div>

      {/* Main Tabs */}
      <div className="card overflow-hidden">
        <div className="px-6 pt-5 border-b border-slate-100 dark:border-slate-800">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Cost Overview' },
              { id: 'model', label: 'By Model' },
              { id: 'user', label: 'By User' },
              { id: 'department', label: 'By Department' },
              { id: 'budget', label: 'Budget Management' },
              { id: 'pricing', label: 'Pricing Config' },
            ]}
            active={mainTab}
            onChange={setMainTab}
          />
        </div>
        <div className="p-6">

          {/* ── Cost Overview ── */}
          {mainTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="section-title">Spending Trend</h3>
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
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} /><stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                  <XAxis dataKey="date" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="cost" name="Total Cost" stroke="#0284c7" strokeWidth={2.5} fill="url(#costGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="section-title mb-4">Cost by Model (This Month)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={MODEL_COSTS.map(m => ({ name: m.model, value: m.totalCost }))} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                        {MODEL_COSTS.map((m, i) => <Cell key={i} fill={m.color} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="section-title mb-4">Daily Stacked Cost by Model</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={DAILY_COST} barSize={14} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: theme.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="gpt4o" name="GPT-4o" stackId="a" fill="#6366f1" />
                      <Bar dataKey="gpt4omini" name="GPT-4o-mini" stackId="a" fill="#0284c7" />
                      <Bar dataKey="claude" name="Claude 3.5" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="gemini" name="Gemini 1.5" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── By Model ── */}
          {mainTab === 'model' && (
            <div className="space-y-4">
              <h3 className="section-title">Cost Breakdown by AI Model</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Model</th>
                      <th className="table-header">Provider</th>
                      <th className="table-header">Input Tokens</th>
                      <th className="table-header">Output Tokens</th>
                      <th className="table-header">Input Cost</th>
                      <th className="table-header">Output Cost</th>
                      <th className="table-header">Total Cost</th>
                      <th className="table-header">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODEL_COSTS.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">{m.model}</span>
                          </div>
                        </td>
                        <td className="table-cell"><Badge variant="default" size="sm">{m.provider}</Badge></td>
                        <td className="table-cell text-xs text-slate-500">{m.inputTokens.toLocaleString()}</td>
                        <td className="table-cell text-xs text-slate-500">{m.outputTokens.toLocaleString()}</td>
                        <td className="table-cell text-xs text-violet-700 dark:text-violet-400 font-mono">{fmtUSD(m.inputCost * (m.inputTokens / 1000))}</td>
                        <td className="table-cell text-xs text-brand-700 dark:text-brand-400 font-mono">{fmtUSD(m.outputCost * (m.outputTokens / 1000))}</td>
                        <td className="table-cell"><span className="font-bold text-slate-900 dark:text-white">{fmtUSD(m.totalCost)}</span></td>
                        <td className="table-cell min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                            </div>
                            <span className="text-xs text-slate-400 w-6">{m.pct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <td className="table-cell font-bold text-slate-700 dark:text-slate-300" colSpan={6}>Total</td>
                      <td className="table-cell font-bold text-brand-700 dark:text-brand-400 text-base">{fmtUSD(TOTAL_COST)}</td>
                      <td className="table-cell text-xs text-slate-400">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ── By User ── */}
          {mainTab === 'user' && (
            <div className="space-y-4">
              <h3 className="section-title">Cost Breakdown by User</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">User</th>
                      <th className="table-header">Department</th>
                      <th className="table-header">Tokens Used</th>
                      <th className="table-header">Requests</th>
                      <th className="table-header">Avg Cost / Req</th>
                      <th className="table-header">Total Cost</th>
                      <th className="table-header">Cost Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {USER_COSTS.map((u, i) => {
                      const totalUserCost = USER_COSTS.reduce((s, x) => s + x.cost, 0);
                      const share = (u.cost / totalUserCost) * 100;
                      return (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="table-cell">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={u.name} size="sm" />
                              <span className="font-medium text-sm text-slate-900 dark:text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="table-cell"><Badge variant="default" size="sm">{u.dept}</Badge></td>
                          <td className="table-cell text-xs text-slate-500">{u.tokens.toLocaleString()}</td>
                          <td className="table-cell font-semibold text-slate-700 dark:text-slate-300">{u.requests}</td>
                          <td className="table-cell text-xs font-mono text-slate-600 dark:text-slate-300">{fmtUSD(u.avgPerReq)}</td>
                          <td className="table-cell font-bold text-emerald-700 dark:text-emerald-400">{fmtUSD(u.cost)}</td>
                          <td className="table-cell min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, share * 4)}%` }} />
                              </div>
                              <span className="text-xs text-slate-400 w-8">{share.toFixed(1)}%</span>
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

          {/* ── By Department ── */}
          {mainTab === 'department' && (
            <div className="space-y-4">
              <h3 className="section-title">Cost Breakdown by Department</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Department</th>
                      <th className="table-header">Active Users</th>
                      <th className="table-header">Tokens Used</th>
                      <th className="table-header">Total Cost</th>
                      <th className="table-header">Cost / User</th>
                      <th className="table-header">Budget</th>
                      <th className="table-header">Utilization</th>
                      <th className="table-header">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEPT_COSTS.map((d, i) => {
                      const pct = (d.cost / d.budget) * 100;
                      return (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="table-cell font-semibold text-slate-900 dark:text-white">{d.dept}</td>
                          <td className="table-cell text-slate-500">{d.users}</td>
                          <td className="table-cell text-xs text-slate-500">{(d.tokens / 1000000).toFixed(2)}M</td>
                          <td className="table-cell font-bold text-brand-700 dark:text-brand-400">{fmtUSD(d.cost)}</td>
                          <td className="table-cell text-xs font-mono text-slate-600 dark:text-slate-300">{fmtUSD(d.cost / d.users)}</td>
                          <td className="table-cell text-slate-500">{fmtUSD(d.budget)}</td>
                          <td className="table-cell min-w-[140px]">
                            <div className="space-y-1">
                              <BudgetBar pct={pct} />
                              <span className="text-xs text-slate-400">{pct.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="table-cell"><AlertBadge pct={pct} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Budget Management ── */}
          {mainTab === 'budget' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="section-title">Budget Management</h3>
                <Badge variant="default" size="sm">Alerts trigger at 50% / 75% / 90% / 100%</Badge>
              </div>
              <div className="space-y-4">
                {budgets.map((b, i) => {
                  const pct = (b.spent / b.monthly) * 100;
                  const remaining = b.monthly - b.spent;
                  return (
                    <div key={b.dept} className={cn('p-5 rounded-xl border', pct >= 90 ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : pct >= 75 ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30')}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{b.dept}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{fmtUSD(b.spent)} spent of {fmtUSD(b.monthly)} budget</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertBadge pct={pct} />
                          {editingBudget === i ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-slate-400">$</span>
                              <input type="number" className="input-field w-28 text-sm py-1" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && saveBudget(i)} />
                              <button onClick={() => saveBudget(i)} className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"><Save className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setEditingBudget(null)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <button onClick={() => startBudgetEdit(i)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      </div>
                      <BudgetBar pct={pct} />
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span>{pct.toFixed(1)}% utilized</span>
                        <span className={remaining < 0 ? 'text-red-500 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                          {remaining >= 0 ? `${fmtUSD(remaining)} remaining` : `${fmtUSD(Math.abs(remaining))} over budget`}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-3">
                        {[50, 75, 90, 100].map(threshold => (
                          <div key={threshold} className={cn('flex items-center gap-1 text-xs', pct >= threshold ? 'text-red-500 dark:text-red-400 font-medium' : 'text-slate-300 dark:text-slate-600')}>
                            {pct >= threshold ? <AlertTriangle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                            {threshold}% alert
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Pricing Config ── */}
          {mainTab === 'pricing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="section-title">AI Pricing Configuration</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Keep model pricing accurate so cost reports remain correct. All edits are logged.</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Shield className="w-3.5 h-3.5" /> Super Admin only
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Model</th>
                      <th className="table-header">Provider</th>
                      <th className="table-header">Input (per 1M tokens)</th>
                      <th className="table-header">Output (per 1M tokens)</th>
                      <th className="table-header">Unit</th>
                      <th className="table-header">Effective Date</th>
                      <th className="table-header">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="table-cell font-semibold text-sm text-slate-900 dark:text-white">{p.model}</td>
                        <td className="table-cell"><Badge variant="default" size="sm">{p.provider}</Badge></td>
                        <td className="table-cell">
                          {editingPricing === i ? (
                            <input type="number" step="0.001" className="input-field w-24 text-sm py-1" value={pricingInputs.input} onChange={e => setPricingInputs(x => ({ ...x, input: e.target.value }))} autoFocus />
                          ) : (
                            <span className="font-mono text-sm text-violet-700 dark:text-violet-400">${p.inputPer1M < 1 ? p.inputPer1M.toFixed(3) : p.inputPer1M.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="table-cell">
                          {editingPricing === i ? (
                            <input type="number" step="0.001" className="input-field w-24 text-sm py-1" value={pricingInputs.output} onChange={e => setPricingInputs(x => ({ ...x, output: e.target.value }))} />
                          ) : (
                            <span className="font-mono text-sm text-brand-700 dark:text-brand-400">${p.outputPer1M < 1 ? p.outputPer1M.toFixed(3) : p.outputPer1M.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="table-cell text-xs text-slate-500">{p.currency}</td>
                        <td className="table-cell text-xs text-slate-500">{p.effectiveDate}</td>
                        <td className="table-cell">
                          {editingPricing === i ? (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => savePricing(i)} className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"><Save className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setEditingPricing(null)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <button onClick={() => startPricingEdit(i)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audit Log */}
              <div className="mt-6">
                <h3 className="section-title mb-4">Audit & Change History</h3>
                <div className="space-y-2">
                  {AUDIT_LOG.map(a => (
                    <div key={a.id} className="flex items-start gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                      <Avatar name={a.user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-slate-900 dark:text-white">{a.user}</span>
                          <Badge variant={a.role === 'Super Admin' ? 'danger' : 'default'} size="sm">{a.role}</Badge>
                          <span className="text-xs text-slate-400">{formatDate(a.ts)}</span>
                          <span className="font-mono text-xs text-slate-400">{a.id}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{a.action}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{a.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

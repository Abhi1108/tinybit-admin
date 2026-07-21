'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Hash, TrendingUp, Download, AlertCircle, Loader2, Bot,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Avatar, StatCard, Button, Tabs } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  getAdminAIConversations,
  getAdminAnalytics,
  type AIConversationRecord,
  type AdminAnalyticsResponse,
} from '@/src/services/adminApi';

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

function fmtK(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/**
 * Cost Tracking — dollar pricing/budgets are not stored server-side.
 * This page shows real Gemini token consumption only (no fabricated $).
 */
export default function AICostsPage() {
  const theme = useChartTheme();
  const [mainTab, setMainTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [conversations, setConversations] = useState<AIConversationRecord[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [analyticsRes, convRes] = await Promise.all([
          getAdminAnalytics(),
          getAdminAIConversations({ limit: 100 }),
        ]);
        setAnalytics(analyticsRes);
        setConversations(convRes.conversations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AI usage');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const daily = useMemo(() => {
    const ai = analytics?.ai_by_day;
    if (!ai?.labels) return [];
    return ai.labels.map((label, i) => ({
      date: label.slice(5),
      tokens: Number(ai.tokens?.[i]) || 0,
      prompt: Number(ai.prompt_tokens?.[i]) || 0,
      completion: Number(ai.completion_tokens?.[i]) || 0,
      messages: Number(ai.data?.[i]) || 0,
    }));
  }, [analytics]);

  const weekTokens = useMemo(() => daily.reduce((s, d) => s + d.tokens, 0), [daily]);
  const weekPrompt = useMemo(() => daily.reduce((s, d) => s + d.prompt, 0), [daily]);
  const weekCompletion = useMemo(() => daily.reduce((s, d) => s + d.completion, 0), [daily]);
  const weekMessages = useMemo(() => daily.reduce((s, d) => s + d.messages, 0), [daily]);

  const byUser = useMemo(() => {
    const map = new Map<string, { name: string; tokens: number; messages: number }>();
    for (const row of conversations) {
      const id = row.user_id || row.user_name || 'unknown';
      const cur = map.get(id) || { name: row.user_name || '—', tokens: 0, messages: 0 };
      cur.messages += 1;
      cur.tokens += Number(row.total_tokens) || 0;
      map.set(id, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.tokens - a.tokens || b.messages - a.messages);
  }, [conversations]);

  function handleExport() {
    const csv = [
      ['Date', 'Messages', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens'],
      ...daily.map(d => [d.date, d.messages, d.prompt, d.completion, d.tokens]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ai-token-usage.csv';
    a.click();
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Cost Tracking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gemini token consumption — dollar costs are not billed/stored in-app yet
          </p>
        </div>
        <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          No pricing, budgets, or USD spend are stored on the server. Figures below are real Gemini token counts only — cost ($) shows as —.
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tokens (7 days)" value={fmtK(weekTokens)} icon={<Hash className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" />
        <StatCard title="Prompt Tokens (7d)" value={fmtK(weekPrompt)} icon={<TrendingUp className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
        <StatCard title="Completion Tokens (7d)" value={fmtK(weekCompletion)} icon={<Bot className="w-5 h-5" />} gradient="bg-gradient-to-br from-teal-500 to-teal-700" />
        <StatCard title="Est. USD Cost" value="—" icon={<Hash className="w-5 h-5" />} gradient="bg-gradient-to-br from-slate-500 to-slate-700" subtitle="Not tracked" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 pt-5 border-b border-slate-100 dark:border-slate-800">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Token Overview' },
              { id: 'users', label: 'By User' },
              { id: 'pricing', label: 'Pricing & Budgets' },
            ]}
            active={mainTab}
            onChange={setMainTab}
          />
        </div>
        <div className="p-6">
          {mainTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="section-title">Daily Tokens — Last 7 Days</h3>
              {daily.every(d => d.tokens === 0) ? (
                <div className="py-16 text-center text-slate-400 text-sm">No tokenized Gemini usage in the last 7 days</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={daily} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tokGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                    <XAxis dataKey="date" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="prompt" name="Prompt" stroke="#6366f1" strokeWidth={2} fill="transparent" dot={false} />
                    <Area type="monotone" dataKey="completion" name="Completion" stroke="#0d9488" strokeWidth={2} fill="transparent" dot={false} />
                    <Area type="monotone" dataKey="tokens" name="Total" stroke="#0284c7" strokeWidth={2} fill="url(#tokGrad)" dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              <div>
                <h3 className="section-title mb-4">Messages per Day</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={daily} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="messages" name="User messages" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Model</th>
                      <th className="table-header">Provider</th>
                      <th className="table-header">Messages (7d)</th>
                      <th className="table-header">Prompt</th>
                      <th className="table-header">Completion</th>
                      <th className="table-header">Total Tokens</th>
                      <th className="table-header">USD Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="table-cell font-mono text-sm">gemini-3.1-flash-lite</td>
                      <td className="table-cell text-sm">Google Gemini</td>
                      <td className="table-cell font-semibold">{weekMessages.toLocaleString()}</td>
                      <td className="table-cell">{fmtK(weekPrompt)}</td>
                      <td className="table-cell">{fmtK(weekCompletion)}</td>
                      <td className="table-cell font-semibold text-brand-700 dark:text-brand-400">{fmtK(weekTokens)}</td>
                      <td className="table-cell text-slate-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {mainTab === 'users' && (
            <div>
              <h3 className="section-title mb-4">Token use by user (recent conversations)</h3>
              {byUser.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">No conversation data</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">User</th>
                      <th className="table-header">Messages</th>
                      <th className="table-header">Tokens</th>
                      <th className="table-header">USD Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byUser.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="table-cell">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={u.name} size="sm" />
                            <span className="text-sm font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="table-cell font-semibold">{u.messages.toLocaleString()}</td>
                        <td className="table-cell font-semibold text-brand-700 dark:text-brand-400">
                          {u.tokens ? fmtK(u.tokens) : '—'}
                        </td>
                        <td className="table-cell text-slate-400">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {mainTab === 'pricing' && (
            <div className="py-16 text-center text-slate-400 text-sm space-y-2">
              <p>Pricing rates and department budgets are not stored in tinybit-server.</p>
              <p>Only Gemini (`gemini-3.1-flash-lite`) is used; billable USD would need a new pricing config + aggregation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

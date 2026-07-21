'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Hash, Zap, Users, TrendingUp, Bot, Download, Search, AlertCircle, Loader2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Badge, Avatar, StatCard, Button, Tabs, Pagination } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  getAdminAIConversations,
  getAdminAnalytics,
  type AIConversationRecord,
  type AdminAnalyticsResponse,
} from '@/src/services/adminApi';

const PROVIDER_COLORS: Record<string, string> = {
  gemini: '#10b981',
  unknown: '#94a3b8',
};

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

function providerLabel(p: string | null | undefined) {
  if (!p) return 'unknown';
  return p.toLowerCase();
}

export default function AIAnalyticsPage() {
  const theme = useChartTheme();
  const [mainTab, setMainTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

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
        setError(err instanceof Error ? err.message : 'Failed to load AI analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const dailyTrend = useMemo(() => {
    const ai = analytics?.ai_by_day;
    if (!ai?.labels) return [];
    return ai.labels.map((label, i) => ({
      date: label.slice(5),
      input: Number(ai.prompt_tokens?.[i]) || 0,
      output: Number(ai.completion_tokens?.[i]) || 0,
      total: Number(ai.tokens?.[i]) || 0,
      messages: Number(ai.data?.[i]) || 0,
    }));
  }, [analytics]);

  const weekPrompt = useMemo(() => dailyTrend.reduce((s, d) => s + d.input, 0), [dailyTrend]);
  const weekCompletion = useMemo(() => dailyTrend.reduce((s, d) => s + d.output, 0), [dailyTrend]);
  const weekTokens = useMemo(() => dailyTrend.reduce((s, d) => s + d.total, 0), [dailyTrend]);
  const weekMessages = useMemo(() => dailyTrend.reduce((s, d) => s + d.messages, 0), [dailyTrend]);

  const providerBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of conversations) {
      const key = providerLabel(row.provider);
      map.set(key, (map.get(key) || 0) + (Number(row.total_tokens) || 0));
    }
    // If no tokenized rows yet, count messages by provider instead
    if (Array.from(map.values()).every(v => v === 0)) {
      map.clear();
      for (const row of conversations) {
        const key = providerLabel(row.provider);
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0) || 1;
    return Array.from(map.entries()).map(([provider, tokens]) => ({
      model: provider,
      tokens,
      pct: Math.round((tokens / total) * 100),
    }));
  }, [conversations]);

  const topUsers = useMemo(() => {
    const map = new Map<string, { name: string; messages: number; tokens: number; provider: string }>();
    for (const row of conversations) {
      const id = row.user_id || row.user_name || 'unknown';
      const cur = map.get(id) || {
        name: row.user_name || '—',
        messages: 0,
        tokens: 0,
        provider: providerLabel(row.provider),
      };
      cur.messages += 1;
      cur.tokens += Number(row.total_tokens) || 0;
      if (row.provider) cur.provider = providerLabel(row.provider);
      map.set(id, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.tokens - a.tokens || b.messages - a.messages).slice(0, 20);
  }, [conversations]);

  const activeUsers = useMemo(
    () => new Set(conversations.map(c => c.user_id).filter(Boolean)).size,
    [conversations],
  );

  const avgTokens = useMemo(() => {
    const withTokens = conversations.filter(c => c.total_tokens != null);
    if (!withTokens.length) return 0;
    const total = withTokens.reduce((s, c) => s + (Number(c.total_tokens) || 0), 0);
    return Math.round(total / withTokens.length);
  }, [conversations]);

  const filteredRequests = useMemo(() => {
    const q = search.toLowerCase();
    return conversations.filter(r => {
      const matchSearch = !q
        || r.id.toLowerCase().includes(q)
        || (r.user_name || '').toLowerCase().includes(q)
        || (r.content_preview || '').toLowerCase().includes(q);
      const matchRole = roleFilter === 'all' || r.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [conversations, search, roleFilter]);

  const paginatedRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize);
  const maxUserTokens = Math.max(1, ...topUsers.map(u => u.tokens || u.messages));

  function handleExport() {
    const csv = [
      ['ID', 'User', 'Role', 'Provider', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens', 'Created At'],
      ...conversations.map(r => [
        r.id,
        r.user_name,
        r.role,
        r.provider || '',
        r.prompt_tokens ?? '',
        r.completion_tokens ?? '',
        r.total_tokens ?? '',
        r.created_at,
      ]),
    ].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'token-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading analytics…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Token Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gemini token usage from ai_conversations (exact usageMetadata where available)
          </p>
        </div>
        <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tokens (7 days)" value={fmtK(weekTokens)} icon={<Hash className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" />
        <StatCard title="Prompt Tokens (7d)" value={fmtK(weekPrompt)} icon={<TrendingUp className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
        <StatCard title="Completion Tokens (7d)" value={fmtK(weekCompletion)} icon={<Zap className="w-5 h-5" />} gradient="bg-gradient-to-br from-teal-500 to-teal-700" />
        <StatCard title="Avg Tokens / Turn" value={avgTokens ? avgTokens.toLocaleString() : '—'} icon={<Bot className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-amber-700" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="User Messages (7d)" value={weekMessages.toLocaleString()} icon={<Bot className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <StatCard title="Active Users (recent)" value={String(activeUsers)} icon={<Users className="w-5 h-5" />} gradient="bg-gradient-to-br from-rose-500 to-rose-700" />
        <StatCard title="Provider" value="Gemini" icon={<Bot className="w-5 h-5" />} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <StatCard title="Model" value="gemini-3.1-flash-lite" icon={<Hash className="w-5 h-5" />} gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 pt-5 border-b border-slate-100 dark:border-slate-800">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'user', label: 'By User' },
              { id: 'feature', label: 'By Feature' },
              { id: 'department', label: 'By Department' },
            ]}
            active={mainTab}
            onChange={setMainTab}
          />
        </div>
        <div className="p-6">
          {mainTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="section-title">Token Usage — Last 7 Days</h3>
              {dailyTrend.every(d => d.total === 0 && d.messages === 0) ? (
                <div className="py-16 text-center text-slate-400 text-sm">No AI activity in the last 7 days</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={dailyTrend} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
                    <Area type="monotone" dataKey="input" name="Prompt Tokens" stroke="#6366f1" strokeWidth={2} fill="url(#inGrad)" dot={false} />
                    <Area type="monotone" dataKey="output" name="Completion Tokens" stroke="#0284c7" strokeWidth={2} fill="url(#outGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="section-title mb-4">By Provider</h3>
                  {providerBreakdown.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">No conversation rows yet</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={providerBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="tokens" nameKey="model">
                            {providerBreakdown.map((m, i) => (
                              <Cell key={i} fill={PROVIDER_COLORS[m.model] || PROVIDER_COLORS.unknown} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {providerBreakdown.map(m => (
                          <div key={m.model} className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PROVIDER_COLORS[m.model] || PROVIDER_COLORS.unknown }} />
                            <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 font-mono">{m.model}</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtK(m.tokens)}</span>
                            <span className="text-xs text-slate-400 w-8 text-right">{m.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <h3 className="section-title mb-4">Daily User Messages</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
                      <XAxis dataKey="date" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="messages" name="Messages" radius={[4, 4, 0, 0]} fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {mainTab === 'user' && (
            <div>
              <h3 className="section-title mb-4">Top Users (from recent conversations)</h3>
              {topUsers.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">No users yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="table-header">User</th>
                        <th className="table-header">Provider</th>
                        <th className="table-header">Messages</th>
                        <th className="table-header">Tokens</th>
                        <th className="table-header">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUsers.map((u, i) => {
                        const shareBase = u.tokens || u.messages;
                        return (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="table-cell">
                              <div className="flex items-center gap-2.5">
                                <Avatar name={u.name} size="sm" />
                                <span className="font-medium text-sm text-slate-900 dark:text-white">{u.name}</span>
                              </div>
                            </td>
                            <td className="table-cell"><span className="text-xs font-mono text-slate-600 dark:text-slate-300">{u.provider}</span></td>
                            <td className="table-cell font-semibold">{u.messages.toLocaleString()}</td>
                            <td className="table-cell font-semibold text-brand-700 dark:text-brand-400">
                              {u.tokens ? fmtK(u.tokens) : '—'}
                            </td>
                            <td className="table-cell min-w-[120px]">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(shareBase / maxUserTokens) * 100}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {mainTab === 'feature' && (
            <div className="py-16 text-center text-slate-400 text-sm">
              Feature-level AI usage is not tracked yet (no feature tag on ai_conversations).
            </div>
          )}

          {mainTab === 'department' && (
            <div className="py-16 text-center text-slate-400 text-sm">
              Department-level AI usage is not tracked yet.
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="section-title">Conversation Log</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">{conversations.length} recent rows</span>
        </div>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by user or content…"
              className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="input-field w-36">
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="assistant">Assistant</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">User</th>
                <th className="table-header">Role</th>
                <th className="table-header">Provider</th>
                <th className="table-header">Prompt</th>
                <th className="table-header">Completion</th>
                <th className="table-header">Total</th>
                <th className="table-header">Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="table-cell"><span className="font-mono text-xs text-brand-700 dark:text-brand-400">{r.id.slice(0, 8)}…</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.user_name || '—'} size="xs" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[110px]">{r.user_name || '—'}</span>
                    </div>
                  </td>
                  <td className="table-cell"><Badge variant={r.role === 'user' ? 'info' : 'default'} size="sm">{r.role}</Badge></td>
                  <td className="table-cell"><span className="text-xs font-mono text-slate-600 dark:text-slate-300">{r.provider || '—'}</span></td>
                  <td className="table-cell text-xs text-violet-700 dark:text-violet-400 font-semibold">
                    {r.prompt_tokens != null ? Number(r.prompt_tokens).toLocaleString() : '—'}
                  </td>
                  <td className="table-cell text-xs text-brand-700 dark:text-brand-400 font-semibold">
                    {r.completion_tokens != null ? Number(r.completion_tokens).toLocaleString() : '—'}
                  </td>
                  <td className="table-cell text-xs font-bold text-slate-800 dark:text-slate-200">
                    {r.total_tokens != null ? Number(r.total_tokens).toLocaleString() : '—'}
                  </td>
                  <td className="table-cell text-xs text-slate-500 dark:text-slate-400">
                    {r.created_at ? new Date(r.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRequests.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No conversations found</div>}
        {filteredRequests.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination page={page} pageSize={pageSize} total={filteredRequests.length} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

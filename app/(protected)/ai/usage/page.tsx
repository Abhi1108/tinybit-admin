'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Hash, ArrowDownToLine, ArrowUpFromLine, Gauge, AlertCircle, Loader2 } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { AIUsageChart } from '@/src/components/charts';
import { getAdminAIConversations, getAdminAnalytics } from '@/src/services/adminApi';

type TokenPoint = { name: string; tokens: number; prompt: number; completion: number };

export default function AIUsagePage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [chartData, setChartData] = useState<TokenPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [convRes, analyticsRes] = await Promise.all([
          getAdminAIConversations({ limit: 100 }),
          getAdminAnalytics(),
        ]);
        const rows = convRes?.conversations || [];
        setConversations(rows);

        const aiByDay = analyticsRes?.ai_by_day;
        if (aiByDay?.labels) {
          setChartData(
            aiByDay.labels.map((label: string, index: number) => ({
              name: label.slice(5),
              tokens: Number(aiByDay.tokens?.[index]) || 0,
              prompt: Number(aiByDay.prompt_tokens?.[index]) || 0,
              completion: Number(aiByDay.completion_tokens?.[index]) || 0,
            })),
          );
        }
      } catch (err) {
        console.error('Error fetching AI usage:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch AI usage');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const withTokens = useMemo(
    () => conversations.filter(c => c.total_tokens != null),
    [conversations],
  );
  const weekTokens = useMemo(
    () => chartData.reduce((sum, d) => sum + d.tokens, 0),
    [chartData],
  );
  const promptTokens = useMemo(
    () => chartData.reduce((sum, d) => sum + d.prompt, 0),
    [chartData],
  );
  const completionTokens = useMemo(
    () => chartData.reduce((sum, d) => sum + d.completion, 0),
    [chartData],
  );
  const avgTokens = useMemo(
    () => (withTokens.length
      ? Math.round(withTokens.reduce((sum, c) => sum + (Number(c.total_tokens) || 0), 0) / withTokens.length)
      : 0),
    [withTokens],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">AI Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Exact Gemini token usage from usageMetadata
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tokens (7 days)', value: loading ? '...' : weekTokens.toLocaleString(), icon: <Hash className="w-5 h-5" />, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
          { label: 'Prompt Tokens (7d)', value: loading ? '...' : promptTokens.toLocaleString(), icon: <ArrowUpFromLine className="w-5 h-5" />, color: 'text-teal-700', bg: 'bg-teal-50 dark:bg-teal-900/20' },
          { label: 'Completion Tokens (7d)', value: loading ? '...' : completionTokens.toLocaleString(), icon: <ArrowDownToLine className="w-5 h-5" />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Avg Tokens / Turn', value: loading ? '...' : (avgTokens ? avgTokens.toLocaleString() : '—'), icon: <Gauge className="w-5 h-5" />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map(s => (
          <div key={s.label} className={cn('card p-4', s.bg)}>
            <div className={cn('mb-2', s.color)}>{s.icon}</div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {!loading && withTokens.length === 0 && conversations.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            No exact token counts on these older rows yet. New Sathi chats persist Gemini usageMetadata after you run the
            DB patch and restart the server.
          </span>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="section-title">Daily Tokens — This Week</h2>
          <span className="text-xs text-slate-400">Click legend to toggle · drag brush to zoom</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Stacked prompt + completion bars, total line overlay
        </p>
        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : (
          <AIUsageChart data={chartData} height={300} showBrush />
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="section-title">Recent Tokenized Turns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">User</th>
                <th className="table-header">Role</th>
                <th className="table-header">Preview</th>
                <th className="table-header">Prompt</th>
                <th className="table-header">Completion</th>
                <th className="table-header">Total Tokens</th>
                <th className="table-header">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading token usage...
                    </div>
                  </td>
                </tr>
              ) : conversations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8 text-slate-500">
                    No AI conversations found.
                  </td>
                </tr>
              ) : (
                conversations.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="table-cell font-medium text-slate-900 dark:text-white text-sm">{s.user_name || '—'}</td>
                    <td className="table-cell">
                      <Badge variant={s.role === 'user' ? 'info' : 'default'} size="sm">{s.role}</Badge>
                    </td>
                    <td className="table-cell text-sm text-slate-500 dark:text-slate-400 max-w-md truncate" title={s.content}>
                      {s.content_preview || s.content}
                    </td>
                    <td className="table-cell text-sm text-slate-600 dark:text-slate-300">
                      {s.prompt_tokens != null ? Number(s.prompt_tokens).toLocaleString() : '—'}
                    </td>
                    <td className="table-cell text-sm text-slate-600 dark:text-slate-300">
                      {s.completion_tokens != null ? Number(s.completion_tokens).toLocaleString() : '—'}
                    </td>
                    <td className="table-cell text-sm font-medium text-teal-700 dark:text-teal-400">
                      {s.total_tokens != null ? Number(s.total_tokens).toLocaleString() : '—'}
                    </td>
                    <td className="table-cell text-xs text-slate-500">
                      {s.created_at ? new Date(s.created_at).toLocaleString('en-IN') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

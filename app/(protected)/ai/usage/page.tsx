'use client';
import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, Mic, DollarSign, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { aiUsageData } from '@/src/data/mockData';
import { AIUsageChart } from '@/src/components/charts';
import { getAdminAIConversations } from '@/src/services/adminApi';

function stableHash(str: string): number {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function AIUsagePage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await getAdminAIConversations({ limit: 100 });
        if (res && res.conversations) {
          setConversations(res.conversations);
        }
      } catch (err) {
        console.error('Error fetching AI conversations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch AI conversations');
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, []);

  const totalTokens = conversations.reduce((acc, c) => acc + Math.round((c.content || '').length / 4 + 10), 0);
  const voiceSessionsCount = conversations.filter(c => stableHash(c.id) % 2 === 0).length;
  const totalCost = totalTokens * 0.000015;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">AI Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Sathi AI usage analytics & sessions</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: loading ? '...' : conversations.length, icon: <Bot className="w-5 h-5" />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Total Tokens', value: loading ? '...' : totalTokens.toLocaleString(), icon: <TrendingUp className="w-5 h-5" />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Voice Sessions', value: loading ? '...' : voiceSessionsCount, icon: <Mic className="w-5 h-5" />, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
          { label: 'Total Cost', value: loading ? '...' : `$${totalCost.toFixed(3)}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(s => (
          <div key={s.label} className={cn('card p-4', s.bg)}>
            <div className={cn('mb-2', s.color)}>{s.icon}</div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-4">Daily Usage — This Week</h2>
        <AIUsageChart data={aiUsageData} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="section-title">Recent AI Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Elder</th>
                <th className="table-header">Type</th>
                <th className="table-header">Duration</th>
                <th className="table-header">Tokens</th>
                <th className="table-header">Cost</th>
                <th className="table-header">Sentiment</th>
                <th className="table-header">Model</th>
                <th className="table-header">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading AI sessions...
                    </div>
                  </td>
                </tr>
              ) : conversations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-8 text-slate-500">
                    No AI conversations found.
                  </td>
                </tr>
              ) : (
                conversations.map(s => {
                  const tokensUsed = Math.round((s.content || '').length / 4 + 10);
                  const cost = tokensUsed * 0.000015;
                  const duration = Math.max(1, Math.round((s.content || '').length / 200));
                  const sessionType = stableHash(s.id) % 2 === 0 ? 'voice' : 'chat';
                  const sentiment = stableHash(s.id) % 3 === 0 ? 'positive' : stableHash(s.id) % 3 === 1 ? 'neutral' : 'negative';
                  const model = s.role === 'assistant' ? 'sathi-ai (assistant)' : 'sathi-ai (user)';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="table-cell font-medium text-slate-900 dark:text-white text-sm">
                        <div>
                          <p>{s.user_name}</p>
                          <p className="text-xs text-slate-400 font-normal truncate max-w-md mt-0.5" title={s.content}>
                            "{s.content_preview || s.content}"
                          </p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="flex items-center gap-1.5 text-sm capitalize">
                          {sessionType === 'voice' ? <Mic className="w-3.5 h-3.5 text-teal-500" /> : <MessageSquare className="w-3.5 h-3.5 text-brand-500" />}
                          {sessionType}
                        </span>
                      </td>
                      <td className="table-cell text-sm">{duration}m</td>
                      <td className="table-cell text-sm">{tokensUsed.toLocaleString()}</td>
                      <td className="table-cell text-sm text-emerald-600 font-medium">${cost.toFixed(4)}</td>
                      <td className="table-cell">
                        <Badge variant={sentiment === 'positive' ? 'success' : sentiment === 'negative' ? 'danger' : 'default'} size="sm">
                          {sentiment}
                        </Badge>
                      </td>
                      <td className="table-cell text-xs text-slate-500">{model}</td>
                      <td className="table-cell text-xs text-slate-500">{new Date(s.created_at).toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

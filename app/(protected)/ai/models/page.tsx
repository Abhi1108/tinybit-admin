'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Cpu, AlertCircle, Loader2 } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import {
  getAdminAIConversations,
  getAdminAnalytics,
  type AIConversationRecord,
} from '@/src/services/adminApi';

/** Model IDs actually used by tinybit-server (gemini.service.js). */
const GEMINI_MODELS = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'gemini-3.1-flash-lite',
    provider: 'Google Gemini',
    useCase: 'Sathi chat, voice transcription, vision / health insights',
  },
] as const;

interface ModelStats {
  id: string;
  name: string;
  provider: string;
  useCase: string;
  status: 'active' | 'inactive';
  messages: number;
  users: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  weekMessages: number;
  weekTokens: number;
}

function sum(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0);
}

export default function AIModelsPage() {
  const [rows, setRows] = useState<AIConversationRecord[]>([]);
  const [weekMessages, setWeekMessages] = useState(0);
  const [weekTokens, setWeekTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [convRes, analytics] = await Promise.all([
          getAdminAIConversations({ limit: 100 }),
          getAdminAnalytics(),
        ]);
        setRows(convRes.conversations || []);
        const ai = analytics.ai_by_day;
        setWeekMessages(ai?.data ? sum(ai.data.map(Number)) : 0);
        setWeekTokens(ai?.tokens ? sum(ai.tokens.map(Number)) : 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AI model usage');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const models: ModelStats[] = useMemo(() => {
    const geminiRows = rows.filter(
      r => !r.provider || r.provider.toLowerCase().includes('gemini'),
    );
    const users = new Set(geminiRows.map(r => r.user_id).filter(Boolean));
    const withTokens = geminiRows.filter(r => r.total_tokens != null);
    return GEMINI_MODELS.map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      useCase: m.useCase,
      status: 'active' as const,
      messages: geminiRows.length,
      users: users.size,
      promptTokens: withTokens.reduce((s, r) => s + (Number(r.prompt_tokens) || 0), 0),
      completionTokens: withTokens.reduce((s, r) => s + (Number(r.completion_tokens) || 0), 0),
      totalTokens: withTokens.reduce((s, r) => s + (Number(r.total_tokens) || 0), 0),
      weekMessages,
      weekTokens,
    }));
  }, [rows, weekMessages, weekTokens]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-500" /> AI Models
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gemini models powering Sathi (from live conversation + analytics data)
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading models…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map(model => (
            <div key={model.id} className={cn('card p-5')}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">{model.name}</p>
                    <p className="text-xs text-slate-400">{model.provider}</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">{model.status}</Badge>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{model.useCase}</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Messages (7d)', value: model.weekMessages.toLocaleString() },
                  { label: 'Tokens (7d)', value: model.weekTokens.toLocaleString() },
                  { label: 'Users (recent)', value: model.users.toLocaleString() },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{stat.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-slate-400">Prompt (recent)</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {model.promptTokens ? model.promptTokens.toLocaleString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Completion (recent)</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {model.completionTokens ? model.completionTokens.toLocaleString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total (recent)</p>
                  <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                    {model.totalTokens ? model.totalTokens.toLocaleString() : '—'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

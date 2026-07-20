'use client';
import React, { useEffect, useState } from 'react';
import { MessageSquare, Loader2, AlertCircle, Search } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { getAdminAIConversations } from '@/src/services/adminApi';

interface ConversationRow {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  content: string;
  content_preview: string;
  created_at: string;
}

export default function AIConversationsPage() {
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminAIConversations({
          limit: 100,
          role: role === 'all' ? undefined : role,
        });
        if (res.success) setRows(res.conversations || []);
        else setError(res.error || 'Failed to load conversations');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role]);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return !q || r.user_name?.toLowerCase().includes(q) || r.content_preview?.toLowerCase().includes(q) || r.content?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><MessageSquare className="w-6 h-6 text-brand-500" /> AI Conversations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Read-only Sathi AI chat transcripts</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'user', 'assistant'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border',
              role === r ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
            )}
          >
            {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input className="bg-transparent text-sm outline-none w-48" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(row => (
              <button
                key={row.id}
                className="w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                onClick={() => setExpanded(expanded === row.id ? null : row.id)}
              >
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{row.user_name || '—'}</p>
                  <Badge variant={row.role === 'user' ? 'info' : 'default'} size="sm">{row.role}</Badge>
                  <span className="text-xs text-slate-400 ml-auto">{row.created_at ? new Date(row.created_at).toLocaleString() : ''}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {expanded === row.id ? row.content : (row.content_preview || row.content)}
                </p>
              </button>
            ))}
            {filtered.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">No conversations found</div>}
          </div>
        )}
      </div>
    </div>
  );
}

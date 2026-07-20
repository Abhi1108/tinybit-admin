'use client';
import React, { useEffect, useState } from 'react';
import { Share2, Loader2, AlertCircle, Search, ExternalLink } from 'lucide-react';
import { getAdminFamilyMessages, type FamilyMessageRecord } from '@/src/services/adminApi';

export default function SharedJournalsPage() {
  const [rows, setRows] = useState<FamilyMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminFamilyMessages({ limit: 100 });
        if (res.success) setRows(res.messages || []);
        else setError(res.error || 'Failed to load shared messages');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared messages');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return !q
      || r.sender_name?.toLowerCase().includes(q)
      || r.receiver_name?.toLowerCase().includes(q)
      || r.message?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Share2 className="w-6 h-6 text-brand-500" /> Shared Journals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Family chat messages (1:1). There is no shared-journal table yet — this is the closest live proxy.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="flex justify-end">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
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
              <div key={row.id} className="px-5 py-4">
                <button
                  className="w-full text-left"
                  onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{row.sender_name}</p>
                    <span className="text-xs text-slate-400">→</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{row.receiver_name}</p>
                    <span className="text-xs text-slate-400 ml-auto">{row.created_at ? new Date(row.created_at).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {expanded === row.id ? row.message : (row.message_preview || row.message)}
                  </p>
                </button>
                {row.audio_url && (
                  <a
                    href={row.audio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-brand-600 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Open audio
                  </a>
                )}
              </div>
            ))}
            {filtered.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">No shared messages found</div>}
          </div>
        )}
      </div>
    </div>
  );
}

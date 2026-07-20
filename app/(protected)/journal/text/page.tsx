'use client';
import React, { useEffect, useState } from 'react';
import { BookOpen, Loader2, AlertCircle, Search } from 'lucide-react';
import { getAdminJournalEntries, type JournalEntryRecord } from '@/src/services/adminApi';

export default function TextJournalsPage() {
  const [rows, setRows] = useState<JournalEntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminJournalEntries({ limit: 100, type: 'Written' });
        if (res.success) setRows(res.entries || []);
        else setError(res.error || 'Failed to load text journals');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load text journals');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return !q
      || r.user_name?.toLowerCase().includes(q)
      || r.content?.toLowerCase().includes(q)
      || r.prompt?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><BookOpen className="w-6 h-6 text-brand-500" /> Text Journals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Written memory journal entries</p>
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
              <button
                key={row.id}
                className="w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                onClick={() => setExpanded(expanded === row.id ? null : row.id)}
              >
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{row.user_name}</p>
                  {row.prompt && <span className="text-xs text-slate-400 truncate max-w-xs">{row.prompt}</span>}
                  <span className="text-xs text-slate-400 ml-auto">{row.created_at ? new Date(row.created_at).toLocaleString() : ''}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                  {expanded === row.id ? row.content : (row.content_preview || row.content)}
                </p>
              </button>
            ))}
            {filtered.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">No text journals found</div>}
          </div>
        )}
      </div>
    </div>
  );
}

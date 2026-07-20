'use client';
import React, { useEffect, useState } from 'react';
import { FileText, Loader2, AlertCircle, Search, MapPin } from 'lucide-react';
import { Badge } from '@/src/components/ui';
import { getAdminSosAlerts, type SosAlertRecord } from '@/src/services/adminApi';

export default function IncidentsPage() {
  const [rows, setRows] = useState<SosAlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminSosAlerts({
          limit: 100,
          status: status === 'all' ? undefined : status,
        });
        if (res.success) setRows(res.alerts || []);
        else setError(res.error || 'Failed to load incidents');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load incidents');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [status]);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return !q
      || r.user_name?.toLowerCase().includes(q)
      || r.location?.address?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><FileText className="w-6 h-6 text-brand-500" /> Incident Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">SOS alerts as incident history (same source as Emergency → SOS)</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'active', 'resolved', 'cancelled'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
              status === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
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
              <div key={row.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{row.user_name}</p>
                    <Badge
                      variant={row.status === 'active' ? 'danger' : row.status === 'resolved' ? 'success' : 'default'}
                      size="sm"
                    >
                      {row.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {row.location?.address
                      || (row.location ? `${row.location.latitude.toFixed(4)}, ${row.location.longitude.toFixed(4)}` : 'Location unavailable')}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>{row.triggered_at ? new Date(row.triggered_at).toLocaleString() : '—'}</p>
                  {row.resolved_at && <p className="mt-0.5">Resolved {new Date(row.resolved_at).toLocaleString()}</p>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">No incidents found</div>}
          </div>
        )}
      </div>
    </div>
  );
}

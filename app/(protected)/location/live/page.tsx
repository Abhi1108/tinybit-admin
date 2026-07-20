'use client';
import React, { useEffect, useState } from 'react';
import { Map, Loader2, AlertCircle, Search, MapPin, ExternalLink } from 'lucide-react';
import { Badge } from '@/src/components/ui';
import { getAdminElderLocations, type ElderLocationRecord } from '@/src/services/adminApi';

export default function LiveLocationPage() {
  const [rows, setRows] = useState<ElderLocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sharingOnly, setSharingOnly] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminElderLocations({
          limit: 100,
          sharing: sharingOnly ? 'true' : undefined,
        });
        if (res.success) setRows(res.locations || []);
        else setError(res.error || 'Failed to load locations');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load locations');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sharingOnly]);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return !q
      || r.user_name?.toLowerCase().includes(q)
      || r.address?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Map className="w-6 h-6 text-brand-500" /> Live Locations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Latest known elder locations (live snapshot, not history)</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSharingOnly(false)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
            !sharingOnly ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSharingOnly(true)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
            sharingOnly ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
          }`}
        >
          Sharing now
        </button>
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
            {filtered.map(row => {
              const mapsUrl = `https://www.google.com/maps?q=${row.latitude},${row.longitude}`;
              return (
                <div key={row.elder_id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{row.user_name}</p>
                      <Badge variant={row.is_sharing ? 'success' : 'default'} size="sm">
                        {row.is_sharing ? 'Sharing' : 'Not sharing'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {row.address || `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Updated {row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}
                      {row.accuracy != null ? ` · ±${Math.round(row.accuracy)}m` : ''}
                    </p>
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" /> Map
                  </a>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">No live locations found</div>}
          </div>
        )}
      </div>
    </div>
  );
}

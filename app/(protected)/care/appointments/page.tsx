'use client';
import React, { useEffect, useState } from 'react';
import { Calendar, Loader2, AlertCircle, Search } from 'lucide-react';
import { Badge } from '@/src/components/ui';
import { getAdminAppointments, type AppointmentRecord } from '@/src/services/adminApi';

export default function AppointmentsPage() {
  const [rows, setRows] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminAppointments({
          limit: 100,
          status: status === 'all' ? undefined : status,
        });
        if (res.success) setRows(res.appointments || []);
        else setError(res.error || 'Failed to load appointments');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load appointments');
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
      || r.doctor_name?.toLowerCase().includes(q)
      || r.specialty?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Calendar className="w-6 h-6 text-brand-500" /> Appointments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Doctor appointments booked by elders</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(s => (
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Elder</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Doctor</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">When</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">{row.user_name}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{row.doctor_name || '—'}</p>
                    <p className="text-xs text-slate-400">{row.specialty || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {[row.date, row.time].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={row.status === 'upcoming' ? 'info' : row.status === 'completed' ? 'success' : 'default'}
                      size="sm"
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-200">{row.fee || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">No appointments found</div>}
      </div>
    </div>
  );
}

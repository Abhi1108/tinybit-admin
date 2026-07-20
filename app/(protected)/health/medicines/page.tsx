'use client';
import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { Badge, Pagination, cn } from '@/src/components/ui';
import { getAdminMedicines } from '@/src/services/adminApi';

export default function MedicinesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [medsList, setMedsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 8;

  useEffect(() => {
    async function loadMedicines() {
      try {
        const res = await getAdminMedicines({ limit: 100 });
        if (res && res.medicines) {
          setMedsList(res.medicines);
        }
      } catch (err) {
        console.error('Error fetching medicines:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch medicines');
      } finally {
        setLoading(false);
      }
    }
    loadMedicines();
  }, []);

  const filtered = medsList.filter(m =>
    (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user_name || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const refillVariants = {
    ok: 'success' as const,
    low: 'warning' as const,
    empty: 'danger' as const,
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medicine Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {loading ? 'Loading...' : `${filtered.length} active prescriptions`}
          </p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> Add Medicine</button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Medicines', value: loading ? '—' : medsList.length, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'High Adherence (>90%)', value: '—', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Low Adherence (<70%)', value: '—', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Refill Needed', value: loading ? '—' : medsList.filter(m => (m.stock || 0) <= 5).length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(s => (
          <div key={s.label} className={cn('card p-4 rounded-xl', s.bg)}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search medicines or elders..." className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Medicine</th>
                <th className="table-header">Elder</th>
                <th className="table-header">Schedule</th>
                <th className="table-header">Adherence</th>
                <th className="table-header">Last Taken</th>
                <th className="table-header">Next Due</th>
                <th className="table-header">Refill</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading medicines...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-8 text-slate-500">
                    No medications found.
                  </td>
                </tr>
              ) : (
                paginated.map(med => {
                  const dosage = med.dosage || med.category || '—';
                  const schedule = med.schedule_time || med.frequency || '—';
                  const refillStatus = med.stock === 0 ? 'empty' : (med.stock || 0) <= 5 ? 'low' : 'ok';
                  const status = med.is_active ? 'active' : 'inactive';

                  return (
                    <tr key={med.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="table-cell">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{med.name}</p>
                        <p className="text-xs text-slate-500">{dosage}{med.frequency ? ` · ${med.frequency}` : ''}</p>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm">{med.user_name || '—'}</p>
                        <p className="text-xs text-slate-500">{med.prescribed_by || '—'}</p>
                      </td>
                      <td className="table-cell text-sm text-slate-600 dark:text-slate-400">{schedule}</td>
                      <td className="table-cell text-xs text-slate-500">—</td>
                      <td className="table-cell text-xs text-slate-500">—</td>
                      <td className="table-cell text-xs text-slate-500">—</td>
                      <td className="table-cell">
                        <Badge variant={refillVariants[refillStatus]} size="sm">{refillStatus}</Badge>
                      </td>
                      <td className="table-cell">
                        <Badge variant={status === 'active' ? 'success' : 'default'} size="sm">{status}</Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

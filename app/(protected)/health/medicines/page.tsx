'use client';
import React, { useState } from 'react';
import { Search, Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Badge, Pagination, ProgressBar, cn } from '@/src/components/ui';
import { medicines } from '@/src/data/mockData';

export default function MedicinesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.elderName.toLowerCase().includes(search.toLowerCase())
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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{filtered.length} active prescriptions</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> Add Medicine</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Medicines', value: medicines.length, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'High Adherence (>90%)', value: medicines.filter(m => m.adherenceRate >= 90).length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Low Adherence (<70%)', value: medicines.filter(m => m.adherenceRate < 70).length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Refill Needed', value: medicines.filter(m => m.refillStatus !== 'ok').length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
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
              {paginated.map(med => (
                <tr key={med.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{med.name}</p>
                    <p className="text-xs text-slate-500">{med.dosage} · {med.frequency}</p>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm">{med.elderName}</p>
                    <p className="text-xs text-slate-500">{med.prescribedBy}</p>
                  </td>
                  <td className="table-cell text-sm text-slate-600 dark:text-slate-400">{med.schedule}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2 min-w-28">
                      <ProgressBar value={med.adherenceRate} max={100} size="sm" color={med.adherenceRate >= 90 ? 'green' : med.adherenceRate >= 70 ? 'amber' : 'red'} />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">{med.adherenceRate}%</span>
                    </div>
                  </td>
                  <td className="table-cell text-xs text-slate-500">{med.lastTaken || '—'}</td>
                  <td className="table-cell text-xs text-slate-500">{med.nextDue || '—'}</td>
                  <td className="table-cell">
                    <Badge variant={refillVariants[med.refillStatus]} size="sm">{med.refillStatus}</Badge>
                  </td>
                  <td className="table-cell">
                    <Badge variant={med.status === 'active' ? 'success' : 'default'} size="sm">{med.status}</Badge>
                  </td>
                </tr>
              ))}
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

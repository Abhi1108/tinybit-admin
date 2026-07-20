'use client';
import React, { useEffect, useState } from 'react';
import { Phone, Loader2, AlertCircle, Search } from 'lucide-react';
import { getAdminEmergencyContacts, type EmergencyContactRecord } from '@/src/services/adminApi';

export default function EmergencyContactsPage() {
  const [rows, setRows] = useState<EmergencyContactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminEmergencyContacts({ limit: 100 });
        if (res.success) setRows(res.contacts || []);
        else setError(res.error || 'Failed to load emergency contacts');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load emergency contacts');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return !q
      || r.name?.toLowerCase().includes(q)
      || r.phone?.toLowerCase().includes(q)
      || r.user_name?.toLowerCase().includes(q)
      || r.role?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Phone className="w-6 h-6 text-brand-500" /> Emergency Contacts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Contacts saved by elders for emergency reach-out</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="flex items-center gap-2">
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
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Contact</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">{row.user_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{row.role || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{row.phone}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">No emergency contacts found</div>}
      </div>
    </div>
  );
}

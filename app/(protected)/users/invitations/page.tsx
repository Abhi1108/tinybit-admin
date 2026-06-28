'use client';

import React, { useEffect, useState } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Badge, Pagination } from '@/src/components/ui';
import {
  getAdminConnections,
  updateAdminConnection,
  deleteAdminConnection,
  type AdminConnection,
} from '@/src/services/adminApi';
import { formatJoined } from '@/src/utils/userDisplay';

export default function InvitationsPage() {
  const [connections, setConnections] = useState<AdminConnection[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 20;

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminConnections({ status: 'pending', search, page, limit: pageSize });
      setConnections(data.connections);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => void load(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, page]);

  async function handleStatus(id: string, status: 'connected' | 'declined') {
    try {
      await updateAdminConnection(id, status);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this invitation?')) return;
    try {
      await deleteAdminConnection(id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending Invitations</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} pending guardian invitations</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            className="bg-transparent text-sm outline-none w-full"
            placeholder="Search by elder email, parent name, relation..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Guardian</th>
                <th className="table-header">Elder email</th>
                <th className="table-header">Parent name</th>
                <th className="table-header">Relation</th>
                <th className="table-header">Sent</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="table-cell py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : connections.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="table-cell">
                    <p className="text-sm font-medium">{c.guardian_name}</p>
                    <p className="text-xs text-slate-500">{c.guardian_email}</p>
                  </td>
                  <td className="table-cell text-sm">{c.elder_email}</td>
                  <td className="table-cell text-sm">{c.parent_name}</td>
                  <td className="table-cell text-sm">{c.relation}</td>
                  <td className="table-cell text-xs text-slate-500">{formatJoined(c.created_at)}</td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"
                        title="Approve"
                        onClick={() => handleStatus(c.id, 'connected')}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                        title="Decline"
                        onClick={() => handleStatus(c.id, 'declined')}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="text-xs text-slate-400 hover:text-red-500 ml-1"
                        onClick={() => handleDelete(c.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && total === 0 && (
          <div className="py-16 text-center text-slate-400">No pending invitations</div>
        )}
        {!loading && total > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

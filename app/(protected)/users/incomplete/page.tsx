'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Avatar, Pagination } from '@/src/components/ui';
import { getIncompleteUsers, type AdminProfileUser } from '@/src/services/adminApi';
import { formatJoined } from '@/src/utils/userDisplay';

export default function IncompleteUsersPage() {
  const [users, setUsers] = useState<AdminProfileUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 20;

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const data = await getIncompleteUsers(page, pageSize);
        setUsers(data.users);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Incomplete Signups</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Users who signed in via OTP but have not finished profile setup ({total})
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Phone</th>
              <th className="table-header">Email</th>
              <th className="table-header">Signed up</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
            ) : users.map((u) => (
              <tr key={u.id}>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <Avatar name={u.mobile ?? '?'} size="sm" />
                    <span className="text-sm">{u.mobile ?? '—'}</span>
                  </div>
                </td>
                <td className="table-cell text-sm">{u.email ?? '—'}</td>
                <td className="table-cell text-xs text-slate-500">{formatJoined(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && total > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

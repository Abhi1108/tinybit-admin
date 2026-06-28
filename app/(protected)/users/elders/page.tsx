'use client';
import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, Download, UserPlus } from 'lucide-react';
import { Avatar, StatusBadge, Pagination, Badge } from '@/src/components/ui';
import { useUserList } from '@/src/hooks/useUserList';
import { UserRowActions } from '@/src/components/users/UserRowActions';
import { UserFormModal } from '@/src/components/users/UserFormModal';
import {
  createAdminUser,
  downloadCsv,
  exportAdminUsers,
} from '@/src/services/adminApi';
import {
  displayName,
  formatJoined,
  formatLastActive,
  profileStatus,
} from '@/src/utils/userDisplay';

export default function EldersPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { users, total, page, setPage, search, setSearch, loading, error, pageSize, refetch } = useUserList({
    role: 'elder',
    status: statusFilter,
    pageSize: 20,
  });

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportAdminUsers('elder', statusFilter);
      downloadCsv(`tinybit-elders-${Date.now()}.csv`, csv);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Elder Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {loading ? 'Loading...' : `${total} elders registered`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button type="button" className="btn-primary" onClick={() => setShowCreate(true)}>
            <UserPlus className="w-4 h-4" /> Add Elder
          </button>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
          className="input-field w-40"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header rounded-tl-xl">Elder</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Age / Country</th>
                <th className="table-header">Guardians</th>
                <th className="table-header">Status</th>
                <th className="table-header">Last Active</th>
                <th className="table-header">Joined</th>
                <th className="table-header rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="table-cell py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading elders...
                  </td>
                </tr>
              ) : (
                users.map((elder) => {
                  const name = displayName(elder.full_name, elder.email);
                  return (
                    <tr key={elder.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} size="sm" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm">{name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{elder.email ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-sm">{elder.mobile ?? '—'}</td>
                      <td className="table-cell">
                        <p className="text-sm">{elder.age != null ? `${elder.age} yrs` : '—'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{elder.country ?? '—'}</p>
                      </td>
                      <td className="table-cell">
                        <Badge variant="info" size="sm">{elder.guardian_count ?? 0}</Badge>
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={profileStatus(elder.is_banned)} />
                      </td>
                      <td className="table-cell text-xs text-slate-500 dark:text-slate-400">
                        {formatLastActive(elder.last_active)}
                      </td>
                      <td className="table-cell text-xs text-slate-500 dark:text-slate-400">
                        {formatJoined(elder.created_at)}
                      </td>
                      <td className="table-cell">
                        <UserRowActions
                          user={elder}
                          detailPath={`/users/elders/${elder.id}`}
                          onChanged={refetch}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && total === 0 && (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500">No elders found.</div>
        )}
        {!loading && total > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </div>
        )}
      </div>

      <UserFormModal
        open={showCreate}
        mode="create"
        role="elder"
        onClose={() => setShowCreate(false)}
        onSubmit={async (payload) => {
          await createAdminUser(payload as Parameters<typeof createAdminUser>[0]);
          refetch();
        }}
      />
    </div>
  );
}

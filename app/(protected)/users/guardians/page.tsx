'use client';
import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, Download, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Avatar, StatusBadge, Pagination, Badge, Tabs } from '@/src/components/ui';
import { useUserList } from '@/src/hooks/useUserList';
import { UserRowActions } from '@/src/components/users/UserRowActions';
import { UserFormModal } from '@/src/components/users/UserFormModal';
import { createAdminUser, downloadCsv, exportAdminUsers } from '@/src/services/adminApi';
import {
  displayName,
  formatJoined,
  formatLastActive,
  profileStatus,
} from '@/src/utils/userDisplay';

export default function GuardiansPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [view, setView] = useState<'active' | 'trash'>('active');
  const [showCreate, setShowCreate] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { users, total, page, setPage, search, setSearch, loading, error, pageSize, refetch } = useUserList({
    role: 'guardian',
    status: statusFilter,
    deleted: view === 'trash' ? 'only' : undefined,
    pageSize: 20,
  });

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportAdminUsers('guardian', statusFilter);
      downloadCsv(`tinybit-guardians-${Date.now()}.csv`, csv);
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
          <h1 className="page-title">Guardian Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {loading ? 'Loading...' : `${total} guardians registered`}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4" /> Export
          </button>
          <button type="button" className="btn-primary" onClick={() => setShowCreate(true)}>
            <UserPlus className="w-4 h-4" /> Add Guardian
          </button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'active', label: 'Guardians' },
          { id: 'trash', label: 'Trash' },
        ]}
        active={view}
        onChange={(id) => setView(id as 'active' | 'trash')}
      />

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search guardians..."
            className="bg-transparent text-sm outline-none w-full"
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
                <th className="table-header">Guardian</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Linked Elders</th>
                <th className="table-header">Country</th>
                <th className="table-header">Status</th>
                {view === 'trash' ? (
                  <th className="table-header">Deleted</th>
                ) : (
                  <th className="table-header">Last Active</th>
                )}
                <th className="table-header">Joined</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="table-cell py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading guardians...
                  </td>
                </tr>
              ) : (
                users.map((guardian) => {
                  const name = displayName(guardian.full_name, guardian.email);
                  return (
                    <tr key={guardian.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="table-cell">
                        <Link href={`/users/guardians/${guardian.id}`} className="flex items-center gap-3">
                          <Avatar name={name} size="sm" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm">{name}</p>
                            <p className="text-xs text-slate-500">{guardian.email ?? '—'}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="table-cell text-sm">{guardian.mobile ?? '—'}</td>
                      <td className="table-cell">
                        <Badge variant="info" size="sm">{guardian.linked_elder_count ?? 0}</Badge>
                      </td>
                      <td className="table-cell text-sm">{guardian.country ?? '—'}</td>
                      <td className="table-cell"><StatusBadge status={profileStatus(guardian.is_banned)} /></td>
                      {view === 'trash' ? (
                        <td className="table-cell text-xs text-slate-500">
                          {formatLastActive(guardian.deleted_at)}
                          {guardian.deleted_by ? <span className="block">by {guardian.deleted_by}</span> : null}
                        </td>
                      ) : (
                        <td className="table-cell text-xs text-slate-500">{formatLastActive(guardian.last_active)}</td>
                      )}
                      <td className="table-cell text-xs text-slate-500">{formatJoined(guardian.created_at)}</td>
                      <td className="table-cell">
                        <UserRowActions
                          user={guardian}
                          detailPath={`/users/guardians/${guardian.id}`}
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
        {!loading && total > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </div>
        )}
      </div>

      <UserFormModal
        open={showCreate}
        mode="create"
        role="guardian"
        onClose={() => setShowCreate(false)}
        onSubmit={async (payload) => {
          await createAdminUser(payload as Parameters<typeof createAdminUser>[0]);
          refetch();
        }}
      />
    </div>
  );
}

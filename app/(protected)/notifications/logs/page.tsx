'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, Download, RefreshCw, Bell, Eye, Mail,
} from 'lucide-react';
import { Avatar, StatCard, Button, Pagination, Badge, cn } from '@/src/components/ui';
import { getAdminNotifications, type AdminNotification } from '@/src/services/adminApi';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DeliveryLogsPage() {
  const [rows, setRows] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminNotifications({
        limit: 100,
        type: typeFilter === 'all' ? undefined : typeFilter,
        search: search.trim() || undefined,
      });
      if (res.success) setRows(res.notifications || []);
      else setError(res.error || 'Failed to load notifications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadLogs, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, search]);

  const filtered = useMemo(() => rows.filter((n) => {
    if (readFilter === 'read' && !n.read) return false;
    if (readFilter === 'unread' && n.read) return false;
    return true;
  }), [rows, readFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const total = filtered.length;
  const readCount = filtered.filter((n) => n.read).length;
  const unreadCount = total - readCount;
  const readRate = total ? Math.round((readCount / total) * 1000) / 10 : 0;

  const types = useMemo(
    () => Array.from(new Set(rows.map((n) => n.type).filter(Boolean))).sort(),
    [rows],
  );

  function handleExport() {
    const csv = [
      ['ID', 'User', 'Type', 'Title', 'Body', 'Read', 'Created At'],
      ...filtered.map((n) => [
        n.id,
        n.user_name || n.user_id,
        n.type,
        `"${(n.title || '').replace(/"/g, '""')}"`,
        `"${(n.body || '').replace(/"/g, '""')}"`,
        n.read ? 'yes' : 'no',
        n.created_at,
      ]),
    ].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'notification-inbox-log.csv';
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            In-app notification inbox rows (read/unread) — not email/SMS/push delivery receipts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary flex items-center gap-1.5" onClick={loadLogs}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh
          </button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Rows" value={loading ? '—' : total.toLocaleString()} icon={<Bell className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" />
        <StatCard title="Read" value={loading ? '—' : readCount.toLocaleString()} icon={<Eye className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <StatCard title="Unread" value={loading ? '—' : unreadCount.toLocaleString()} icon={<Mail className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-amber-700" />
        <StatCard title="Read Rate" value={loading ? '—' : `${readRate}%`} icon={<Eye className="w-5 h-5" />} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search title, body, user..."
              className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="input-field w-40"
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            {!types.includes('announcement') && <option value="announcement">announcement</option>}
          </select>
          <select
            value={readFilter}
            onChange={(e) => { setReadFilter(e.target.value); setPage(1); }}
            className="input-field w-36"
          >
            <option value="all">All Status</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>
        </div>

        {error && (
          <div className="px-5 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">User</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Title</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar name={n.user_name || 'User'} size="xs" />
                          <span className="text-xs">{n.user_name || '—'}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <Badge variant="default" size="sm">{n.type || '—'}</Badge>
                      </td>
                      <td className="table-cell max-w-[280px]">
                        <p className="text-xs font-medium truncate">{n.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{n.body}</p>
                      </td>
                      <td className="table-cell">
                        <Badge variant={n.read ? 'success' : 'warning'} size="sm">
                          {n.read ? 'read' : 'unread'}
                        </Badge>
                      </td>
                      <td className="table-cell text-xs text-slate-500 whitespace-nowrap">
                        {n.created_at ? fmtDate(n.created_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-16 text-center text-sm text-slate-400">No notification rows found.</div>
              )}
            </div>
            {filtered.length > pageSize && (
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Download, Search, CheckCircle, XCircle, AlertCircle, AlertTriangle, LogIn, UserPlus, Edit2, Trash2, Ban, RotateCcw, Bell, Loader2 } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { format } from 'date-fns';
import { getAuditLogs, exportAuditLogs, downloadCsv, type AuditLogEntry } from '@/src/services/adminApi';

const actionMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'auth.login': { label: 'Login', icon: <LogIn className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
  'auth.login_failed': { label: 'Login Failed', icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-600' },
  'user.create': { label: 'User Created', icon: <UserPlus className="w-3.5 h-3.5" />, color: 'text-brand-600' },
  'user.update': { label: 'User Updated', icon: <Edit2 className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  'user.ban': { label: 'User Suspended', icon: <Ban className="w-3.5 h-3.5" />, color: 'text-red-600' },
  'user.unban': { label: 'User Reactivated', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
  'user.trash': { label: 'User Trashed', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-red-600' },
  'user.restore': { label: 'User Restored', icon: <RotateCcw className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
  'user.purge': { label: 'User Purged', icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-red-600' },
  'notification.broadcast': { label: 'Broadcast Sent', icon: <Bell className="w-3.5 h-3.5" />, color: 'text-blue-600' },
  'doctor.create': { label: 'Doctor Created', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-teal-600' },
  'doctor.update': { label: 'Doctor Updated', icon: <Edit2 className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  'doctor.delete': { label: 'Doctor Deleted', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-red-600' },
  'mood_media.create': { label: 'Media Created', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-teal-600' },
  'mood_media.update': { label: 'Media Updated', icon: <Edit2 className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  'mood_media.delete': { label: 'Media Deleted', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-red-600' },
  'quiz.create': { label: 'Quiz Created', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-teal-600' },
  'quiz.update': { label: 'Quiz Updated', icon: <Edit2 className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  'quiz.delete': { label: 'Quiz Deleted', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-red-600' },
  'inspiration.create': { label: 'Inspiration Created', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-teal-600' },
  'inspiration.update': { label: 'Inspiration Updated', icon: <Edit2 className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  'inspiration.delete': { label: 'Inspiration Deleted', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-red-600' },
  'admin.create': { label: 'Admin Created', icon: <UserPlus className="w-3.5 h-3.5" />, color: 'text-violet-600' },
  'admin.update': { label: 'Admin Updated', icon: <Edit2 className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  'admin.password_reset': { label: 'Admin Password Reset', icon: <RotateCcw className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  'admin.delete': { label: 'Admin Deleted', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-red-600' },
  'role.create': { label: 'Role Created', icon: <UserPlus className="w-3.5 h-3.5" />, color: 'text-violet-600' },
  'role.update': { label: 'Role Updated', icon: <Edit2 className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  'role.delete': { label: 'Role Deleted', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-red-600' },
};

const ALL_ACTIONS = ['All Actions', ...Object.keys(actionMeta)] as const;

const moduleForTargetType: Record<string, string> = {
  auth: 'Auth',
  user: 'User Management',
  admin_user: 'Admin Management',
  admin_role: 'Admin Management',
  notification: 'Notifications',
  doctor: 'Content Management',
  mood_media: 'Content Management',
  quiz_question: 'Content Management',
  inspiration: 'Content Management',
};

const ALL_MODULES = ['All Modules', 'Auth', 'User Management', 'Admin Management', 'Content Management', 'Notifications'];

const statusBadge: Record<string, { variant: 'success' | 'danger' | 'warning'; label: string }> = {
  success: { variant: 'success', label: 'Success' },
  failed: { variant: 'danger', label: 'Failed' },
  warning: { variant: 'warning', label: 'Warning' },
};

function logStatus(log: AuditLogEntry): 'success' | 'failed' {
  return log.action === 'auth.login_failed' ? 'failed' : 'success';
}

function logModule(log: AuditLogEntry): string {
  return moduleForTargetType[log.target_type] ?? log.target_type;
}

function formatDetails(log: AuditLogEntry): string {
  const target = log.target_id ? `${log.target_type} #${log.target_id.slice(0, 8)}` : log.target_type;
  const d = log.details;
  if (!d) return target;

  if (log.action === 'user.purge') {
    const files = typeof d.deletedObjectCount === 'number' ? `${d.deletedObjectCount} file(s) removed` : '';
    const failures = Array.isArray(d.s3Failures) && d.s3Failures.length ? `, ${d.s3Failures.length} S3 failure(s)` : '';
    return `${target} — ${files}${failures}`;
  }
  if (log.action === 'notification.broadcast') {
    return `"${d.title ?? ''}" sent to ${d.sent ?? '?'} user(s)`;
  }
  if (Array.isArray(d.fields)) {
    return `${target} — updated: ${(d.fields as string[]).join(', ')}`;
  }
  if (typeof d.username === 'string' && d.username) {
    return `username: ${d.username}`;
  }
  const label = d.title ?? d.name ?? d.author;
  if (typeof label === 'string' && label) {
    return `${target} — "${label}"`;
  }
  return `${target} — ${JSON.stringify(d)}`;
}

function formatTimestamp(value: string): string {
  try {
    return format(new Date(value), 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return value;
  }
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAuditLogs({ limit: 500 });
        if (!cancelled) setLogs(data.logs ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load audit logs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportAuditLogs();
      downloadCsv(`tinybit-audit-log-${Date.now()}.csv`, csv);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  const filtered = useMemo(() => logs.filter(log => {
    const q = search.toLowerCase();
    const details = formatDetails(log).toLowerCase();
    const matchSearch = !q || log.actor.toLowerCase().includes(q) || details.includes(q) || (log.ip ?? '').includes(q);
    const matchAction = actionFilter === 'All Actions' || log.action === actionFilter;
    const matchModule = moduleFilter === 'All Modules' || logModule(log) === moduleFilter;
    const matchStatus = statusFilter === 'all' || logStatus(log) === statusFilter;
    return matchSearch && matchAction && matchModule && matchStatus;
  }), [logs, search, actionFilter, moduleFilter, statusFilter]);

  const counts = {
    success: logs.filter(l => logStatus(l) === 'success').length,
    failed: logs.filter(l => logStatus(l) === 'failed').length,
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><ClipboardList className="w-6 h-6 text-brand-500" /> Activity Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Complete audit trail of all admin actions</p>
        </div>
        <button className="btn-secondary" onClick={handleExport} disabled={exporting || loading}>
          <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Events', value: logs.length, icon: <ClipboardList className="w-4 h-4" />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Successful', value: counts.success, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Failed / Warnings', value: counts.failed, icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(card => (
          <div key={card.label} className="card p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', card.bg)}>
              <span className={card.color}>{card.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input-field pl-9" placeholder="Search admin, details, IP..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            {ALL_ACTIONS.map(a => <option key={a} value={a}>{a === 'All Actions' ? a : actionMeta[a]?.label ?? a}</option>)}
          </select>
          <select className="input-field" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
            {ALL_MODULES.map(m => <option key={m}>{m}</option>)}
          </select>
          <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Admin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Module</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-xs">Details</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">IP Address</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading logs...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">{logs.length === 0 ? 'No audit events recorded yet' : 'No logs match your filters'}</td></tr>
              )}
              {!loading && filtered.map(log => {
                const meta = actionMeta[log.action];
                const sb = statusBadge[logStatus(log)];
                const isSystem = log.actor.startsWith('system:');
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {log.actor.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{log.actor}</p>
                          <p className="text-[10px] text-slate-400">{isSystem ? 'System' : 'Admin'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('flex items-center gap-1.5 text-xs font-medium whitespace-nowrap', meta?.color ?? 'text-slate-600')}>
                        {meta?.icon}
                        {meta?.label ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{logModule(log)}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{formatDetails(log)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded whitespace-nowrap">{log.ip ?? '—'}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatTimestamp(log.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={sb.variant} size="sm">{sb.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500">Showing {filtered.length} of {logs.length} events</p>
        </div>
      </div>
    </div>
  );
}

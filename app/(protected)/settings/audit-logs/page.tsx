'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollText, Search, Download, Loader2, AlertCircle } from 'lucide-react';
import { Badge, Pagination } from '@/src/components/ui';
import {
  getAuditLogs,
  exportAuditLogs,
  downloadCsv,
  type AuditLogEntry,
} from '@/src/services/adminApi';

const moduleForTargetType: Record<string, string> = {
  auth: 'Auth',
  user: 'User Management',
  notification: 'Notifications',
  doctor: 'Content Management',
  mood_media: 'Content Management',
  quiz_question: 'Content Management',
  inspiration: 'Content Management',
  admin: 'Admin Management',
  admin_role: 'Admin Management',
  role: 'Admin Management',
  payment_refund: 'Billing',
  payment_pricing_tier: 'Billing',
  help_faq: 'Content Management',
  help_tutorial: 'Content Management',
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

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(log => {
      if (!q) return true;
      return (
        log.actor?.toLowerCase().includes(q)
        || log.action.toLowerCase().includes(q)
        || logModule(log).toLowerCase().includes(q)
        || formatDetails(log).toLowerCase().includes(q)
      );
    });
  }, [logs, search]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportAuditLogs();
      downloadCsv('tinybit-audit-log.csv', csv);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><ScrollText className="w-6 h-6 text-brand-500" /> Audit Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All admin actions tracked for compliance</p>
        </div>
        <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export Logs
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="card p-4 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by admin, action, module..."
            className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Admin</th>
                    <th className="table-header">Action</th>
                    <th className="table-header">Module</th>
                    <th className="table-header">Details</th>
                    <th className="table-header">IP Address</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(log => {
                    const status = logStatus(log);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="table-cell font-medium text-slate-900 dark:text-white text-sm">{log.actor}</td>
                        <td className="table-cell">
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300">
                            {log.action}
                          </code>
                        </td>
                        <td className="table-cell text-sm text-slate-600 dark:text-slate-400">{logModule(log)}</td>
                        <td className="table-cell text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate" title={formatDetails(log)}>
                          {formatDetails(log)}
                        </td>
                        <td className="table-cell">
                          <code className="text-xs text-slate-500 font-mono">{log.ip || '—'}</code>
                        </td>
                        <td className="table-cell">
                          <Badge variant={status === 'success' ? 'success' : 'danger'} size="sm">{status}</Badge>
                        </td>
                        <td className="table-cell text-xs text-slate-500">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    );
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No audit logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
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

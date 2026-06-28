'use client';
import React, { useState } from 'react';
import { ScrollText, Search, Filter, Download } from 'lucide-react';
import { Badge, RoleBadge, Pagination } from '@/src/components/ui';
import { auditLogs } from '@/src/data/mockData';

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = auditLogs.filter(log =>
    log.adminName.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.module.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><ScrollText className="w-6 h-6 text-brand-500" /> Audit Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All admin actions tracked for compliance</p>
        </div>
        <button className="btn-secondary"><Download className="w-4 h-4" /> Export Logs</button>
      </div>

      <div className="card p-4 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by admin, action, module..." className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <button className="btn-secondary"><Filter className="w-4 h-4" /> Filters</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Admin</th>
                <th className="table-header">Role</th>
                <th className="table-header">Action</th>
                <th className="table-header">Module</th>
                <th className="table-header">Details</th>
                <th className="table-header">IP Address</th>
                <th className="table-header">Status</th>
                <th className="table-header">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="table-cell font-medium text-slate-900 dark:text-white text-sm">{log.adminName}</td>
                  <td className="table-cell"><RoleBadge role={log.adminRole} /></td>
                  <td className="table-cell">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300">
                      {log.action}
                    </code>
                  </td>
                  <td className="table-cell text-sm text-slate-600 dark:text-slate-400">{log.module}</td>
                  <td className="table-cell text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate" title={log.details}>{log.details}</td>
                  <td className="table-cell">
                    <code className="text-xs text-slate-500 font-mono">{log.ipAddress}</code>
                  </td>
                  <td className="table-cell">
                    <Badge variant={log.status === 'success' ? 'success' : 'danger'} size="sm">{log.status}</Badge>
                  </td>
                  <td className="table-cell text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
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

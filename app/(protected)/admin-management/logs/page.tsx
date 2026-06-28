'use client';
import React, { useState } from 'react';
import { ClipboardList, Download, Search, Filter, CheckCircle, XCircle, AlertCircle, LogIn, LogOut, UserPlus, Settings, Edit2, Trash2, Shield, Bell, CreditCard, Bot } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

type ActionType =
  | 'login' | 'logout' | 'login_failed'
  | 'admin_created' | 'admin_updated' | 'admin_deleted' | 'admin_disabled'
  | 'role_created' | 'role_updated' | 'permission_changed'
  | 'content_created' | 'content_updated' | 'content_deleted'
  | 'payment_refunded' | 'subscription_updated'
  | 'notification_sent' | 'settings_updated'
  | 'user_suspended' | 'user_updated';

interface LogEntry {
  id: string;
  admin: string;
  adminEmail: string;
  adminRole: string;
  action: ActionType;
  module: string;
  details: string;
  ip: string;
  status: 'success' | 'failed' | 'warning';
  timestamp: string;
}

const actionMeta: Record<ActionType, { label: string; icon: React.ReactNode; color: string }> = {
  login: { label: 'Login', icon: <LogIn className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
  logout: { label: 'Logout', icon: <LogOut className="w-3.5 h-3.5" />, color: 'text-slate-500' },
  login_failed: { label: 'Login Failed', icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-600' },
  admin_created: { label: 'Admin Created', icon: <UserPlus className="w-3.5 h-3.5" />, color: 'text-brand-600' },
  admin_updated: { label: 'Admin Updated', icon: <Edit2 className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  admin_deleted: { label: 'Admin Deleted', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-red-600' },
  admin_disabled: { label: 'Admin Disabled', icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-600' },
  role_created: { label: 'Role Created', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-violet-600' },
  role_updated: { label: 'Role Updated', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-violet-600' },
  permission_changed: { label: 'Permission Changed', icon: <Settings className="w-3.5 h-3.5" />, color: 'text-violet-600' },
  content_created: { label: 'Content Created', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-teal-600' },
  content_updated: { label: 'Content Updated', icon: <Edit2 className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  content_deleted: { label: 'Content Deleted', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-red-600' },
  payment_refunded: { label: 'Payment Refunded', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  subscription_updated: { label: 'Subscription Updated', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-brand-600' },
  notification_sent: { label: 'Notification Sent', icon: <Bell className="w-3.5 h-3.5" />, color: 'text-blue-600' },
  settings_updated: { label: 'Settings Updated', icon: <Settings className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  user_suspended: { label: 'User Suspended', icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-red-600' },
  user_updated: { label: 'User Updated', icon: <Edit2 className="w-3.5 h-3.5" />, color: 'text-amber-600' },
};

const mockLogs: LogEntry[] = [
  { id: 'l001', admin: 'Raj Sharma', adminEmail: 'raj@tinybit.app', adminRole: 'Super Admin', action: 'login', module: 'Auth', details: 'Successful login from Chrome/Windows', ip: '103.21.56.87', status: 'success', timestamp: '2026-06-10 09:42:15' },
  { id: 'l002', admin: 'Priya Mehta', adminEmail: 'priya@tinybit.app', adminRole: 'Operations Admin', action: 'admin_created', module: 'Admin Management', details: 'Created admin: support@tinybit.app (Support Manager)', ip: '103.21.56.90', status: 'success', timestamp: '2026-06-10 09:38:04' },
  { id: 'l003', admin: 'Ankit Joshi', adminEmail: 'ankit@tinybit.app', adminRole: 'Content Manager', action: 'content_created', module: 'Content Management', details: 'Uploaded video: "Morning Yoga for Seniors" (12 min)', ip: '49.36.112.44', status: 'success', timestamp: '2026-06-10 09:31:50' },
  { id: 'l004', admin: 'Unknown', adminEmail: 'hacker@evil.com', adminRole: '—', action: 'login_failed', module: 'Auth', details: 'Invalid credentials — 3 failed attempts. Account locked.', ip: '45.138.72.9', status: 'failed', timestamp: '2026-06-10 09:28:33' },
  { id: 'l005', admin: 'Raj Sharma', adminEmail: 'raj@tinybit.app', adminRole: 'Super Admin', action: 'permission_changed', module: 'Admin Management', details: 'Updated Moderator role: added "Support Management > View Tickets"', ip: '103.21.56.87', status: 'success', timestamp: '2026-06-10 09:15:11' },
  { id: 'l006', admin: 'Deepa Nair', adminEmail: 'deepa@tinybit.app', adminRole: 'Support Manager', action: 'user_suspended', module: 'User Management', details: 'Suspended user ID #3892 — reason: abusive behaviour', ip: '27.109.8.13', status: 'warning', timestamp: '2026-06-10 08:59:07' },
  { id: 'l007', admin: 'Priya Mehta', adminEmail: 'priya@tinybit.app', adminRole: 'Operations Admin', action: 'notification_sent', module: 'Notifications', details: 'Sent push to 2841 users: "New wellness video available!"', ip: '103.21.56.90', status: 'success', timestamp: '2026-06-10 08:45:22' },
  { id: 'l008', admin: 'Raj Sharma', adminEmail: 'raj@tinybit.app', adminRole: 'Super Admin', action: 'settings_updated', module: 'Settings', details: 'Changed AI daily budget limit from ₹500 to ₹750', ip: '103.21.56.87', status: 'success', timestamp: '2026-06-10 08:30:00' },
  { id: 'l009', admin: 'Ankit Joshi', adminEmail: 'ankit@tinybit.app', adminRole: 'Content Manager', action: 'content_deleted', module: 'Content Management', details: 'Deleted FAQ: "How do I reset my PIN?" (id: faq_0041)', ip: '49.36.112.44', status: 'success', timestamp: '2026-06-09 17:22:40' },
  { id: 'l010', admin: 'Priya Mehta', adminEmail: 'priya@tinybit.app', adminRole: 'Operations Admin', action: 'payment_refunded', module: 'Subscription & Payments', details: 'Issued refund ₹499 to user #1204 — subscription cancellation', ip: '103.21.56.90', status: 'success', timestamp: '2026-06-09 16:55:18' },
  { id: 'l011', admin: 'Raj Sharma', adminEmail: 'raj@tinybit.app', adminRole: 'Super Admin', action: 'role_created', module: 'Admin Management', details: 'Created new role: "Finance Analyst" with Payment Management access', ip: '103.21.56.87', status: 'success', timestamp: '2026-06-09 16:10:05' },
  { id: 'l012', admin: 'Deepa Nair', adminEmail: 'deepa@tinybit.app', adminRole: 'Support Manager', action: 'login', module: 'Auth', details: 'Successful login from Safari/iPhone', ip: '49.36.98.201', status: 'success', timestamp: '2026-06-09 14:30:44' },
  { id: 'l013', admin: 'Raj Sharma', adminEmail: 'raj@tinybit.app', adminRole: 'Super Admin', action: 'admin_disabled', module: 'Admin Management', details: 'Disabled admin: contractor@agency.com — contract ended', ip: '103.21.56.87', status: 'warning', timestamp: '2026-06-09 12:18:29' },
  { id: 'l014', admin: 'Priya Mehta', adminEmail: 'priya@tinybit.app', adminRole: 'Operations Admin', action: 'user_updated', module: 'User Management', details: 'Updated elder profile #2891: corrected phone number', ip: '103.21.56.90', status: 'success', timestamp: '2026-06-09 11:04:17' },
  { id: 'l015', admin: 'Ankit Joshi', adminEmail: 'ankit@tinybit.app', adminRole: 'Content Manager', action: 'content_updated', module: 'Content Management', details: 'Edited FAQ: "Subscription plans" — updated pricing info', ip: '49.36.112.44', status: 'success', timestamp: '2026-06-09 10:48:52' },
];

const ALL_ACTIONS = ['All Actions', 'login', 'login_failed', 'admin_created', 'admin_updated', 'admin_deleted', 'admin_disabled', 'role_created', 'permission_changed', 'content_created', 'content_updated', 'content_deleted', 'payment_refunded', 'notification_sent', 'settings_updated', 'user_suspended', 'user_updated'] as const;

const ALL_MODULES = ['All Modules', 'Auth', 'Admin Management', 'User Management', 'Content Management', 'Notifications', 'Settings', 'Subscription & Payments'];

const statusBadge: Record<string, { variant: 'success' | 'danger' | 'warning'; label: string }> = {
  success: { variant: 'success', label: 'Success' },
  failed: { variant: 'danger', label: 'Failed' },
  warning: { variant: 'warning', label: 'Warning' },
};

export default function ActivityLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockLogs.filter(log => {
    const q = search.toLowerCase();
    const matchSearch = !q || log.admin.toLowerCase().includes(q) || log.details.toLowerCase().includes(q) || log.ip.includes(q);
    const matchAction = actionFilter === 'All Actions' || log.action === actionFilter;
    const matchModule = moduleFilter === 'All Modules' || log.module === moduleFilter;
    const matchStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchSearch && matchAction && matchModule && matchStatus;
  });

  const counts = { success: mockLogs.filter(l => l.status === 'success').length, failed: mockLogs.filter(l => l.status === 'failed').length, warning: mockLogs.filter(l => l.status === 'warning').length };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><ClipboardList className="w-6 h-6 text-brand-500" /> Activity Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Complete audit trail of all admin actions</p>
        </div>
        <button className="btn-secondary">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Events', value: mockLogs.length, icon: <ClipboardList className="w-4 h-4" />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Successful', value: counts.success, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Failed / Warnings', value: counts.failed + counts.warning, icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
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
            {ALL_ACTIONS.map(a => <option key={a}>{a === 'All Actions' ? a : actionMeta[a as ActionType]?.label ?? a}</option>)}
          </select>
          <select className="input-field" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
            {ALL_MODULES.map(m => <option key={m}>{m}</option>)}
          </select>
          <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

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
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No logs match your filters</td></tr>
              )}
              {filtered.map(log => {
                const meta = actionMeta[log.action];
                const sb = statusBadge[log.status];
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {log.admin.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{log.admin}</p>
                          <p className="text-[10px] text-slate-400">{log.adminRole}</p>
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
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{log.module}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{log.details}</p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded whitespace-nowrap">{log.ip}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{log.timestamp}</span>
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
          <p className="text-xs text-slate-500">Showing {filtered.length} of {mockLogs.length} events</p>
        </div>
      </div>
    </div>
  );
}

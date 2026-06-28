'use client';
import React, { useState, useMemo } from 'react';
import {
  ScrollText, Search, Filter, Download, CheckCircle2, XCircle,
  AlertTriangle, Clock, Mail, Smartphone, MessageSquare, Bell,
  RefreshCw, BarChart3, Send, TrendingUp, Eye,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Badge, Avatar, StatCard, Button, Tabs, Pagination, cn } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';

function useChartTheme() {
  const { isDark } = useTheme();
  return { grid: isDark ? '#1e293b' : '#f1f5f9', text: isDark ? '#94a3b8' : '#64748b', bg: isDark ? '#1e293b' : '#ffffff', border: isDark ? '#334155' : '#e2e8f0', fg: isDark ? '#f1f5f9' : '#1e293b' };
}
function CT({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  const t = useChartTheme();
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg shadow-xl px-3 py-2 border text-xs" style={{ background: t.bg, borderColor: t.border, color: t.fg }}>{label && <p className="font-semibold mb-1 opacity-60">{label}</p>}{payload.map((p, i) => <div key={i} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: p.color }} /><span className="opacity-75">{p.name}:</span><span className="font-semibold">{p.value.toLocaleString()}</span></div>)}</div>;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type DeliveryStatus = 'delivered' | 'failed' | 'bounced' | 'pending' | 'opened' | 'clicked' | 'unsubscribed';
type Channel = 'push' | 'email' | 'sms' | 'in-app';

interface DeliveryLog {
  id: string;
  scheduleId: string;
  scheduleTitle: string;
  channel: Channel;
  recipientName: string;
  recipientEmail: string;
  status: DeliveryStatus;
  sentAt: string;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  device: string;
  errorCode: string | null;
  errorMessage: string | null;
  retries: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_LOGS: DeliveryLog[] = [
  { id: 'LOG-0001', scheduleId: 'SCH-001', scheduleTitle: 'Daily Medicine Reminder', channel: 'push', recipientName: 'Ramesh Kumar', recipientEmail: 'ramesh.k@email.com', status: 'delivered', sentAt: '2026-06-15T09:00:12Z', deliveredAt: '2026-06-15T09:00:14Z', openedAt: '2026-06-15T09:03:22Z', clickedAt: null, device: 'Android 13', errorCode: null, errorMessage: null, retries: 0 },
  { id: 'LOG-0002', scheduleId: 'SCH-001', scheduleTitle: 'Daily Medicine Reminder', channel: 'push', recipientName: 'Savita Devi', recipientEmail: 'savita.d@email.com', status: 'opened', sentAt: '2026-06-15T09:00:13Z', deliveredAt: '2026-06-15T09:00:15Z', openedAt: '2026-06-15T09:01:47Z', clickedAt: '2026-06-15T09:01:52Z', device: 'iOS 17', errorCode: null, errorMessage: null, retries: 0 },
  { id: 'LOG-0003', scheduleId: 'SCH-002', scheduleTitle: 'Weekly Health Check-In', channel: 'email', recipientName: 'Priya Sharma', recipientEmail: 'priya.s@email.com', status: 'delivered', sentAt: '2026-06-09T10:00:08Z', deliveredAt: '2026-06-09T10:00:21Z', openedAt: '2026-06-09T10:18:34Z', clickedAt: null, device: 'Gmail Web', errorCode: null, errorMessage: null, retries: 0 },
  { id: 'LOG-0004', scheduleId: 'SCH-004', scheduleTitle: 'Subscription Renewal Reminder', channel: 'email', recipientName: 'Mohan Lal', recipientEmail: 'mohan.l@email.com', status: 'bounced', sentAt: '2026-06-15T11:00:05Z', deliveredAt: null, openedAt: null, clickedAt: null, device: '—', errorCode: 'SMTP_550', errorMessage: 'Mailbox does not exist', retries: 2 },
  { id: 'LOG-0005', scheduleId: 'SCH-005', scheduleTitle: 'Sathi AI Feature Launch', channel: 'push', recipientName: 'Geeta Verma', recipientEmail: 'geeta.v@email.com', status: 'failed', sentAt: '2026-06-15T12:00:09Z', deliveredAt: null, openedAt: null, clickedAt: null, device: 'Android 12', errorCode: 'FCM_INVALID_TOKEN', errorMessage: 'Device token expired', retries: 3 },
  { id: 'LOG-0006', scheduleId: 'SCH-005', scheduleTitle: 'Sathi AI Feature Launch', channel: 'in-app', recipientName: 'Baldev Singh', recipientEmail: 'baldev.s@email.com', status: 'clicked', sentAt: '2026-06-15T12:00:10Z', deliveredAt: '2026-06-15T12:00:11Z', openedAt: '2026-06-15T12:02:18Z', clickedAt: '2026-06-15T12:02:29Z', device: 'iOS 16', errorCode: null, errorMessage: null, retries: 0 },
  { id: 'LOG-0007', scheduleId: 'SCH-003', scheduleTitle: 'Monthly Wellness Report', channel: 'email', recipientName: 'Arjun Mehta', recipientEmail: 'arjun.m@email.com', status: 'unsubscribed', sentAt: '2026-06-01T08:00:14Z', deliveredAt: '2026-06-01T08:00:28Z', openedAt: '2026-06-01T09:14:02Z', clickedAt: null, device: 'Outlook Desktop', errorCode: null, errorMessage: null, retries: 0 },
  { id: 'LOG-0008', scheduleId: 'SCH-008', scheduleTitle: 'Blood Pressure Check Alert', channel: 'push', recipientName: 'Sunita Rao', recipientEmail: 'sunita.r@email.com', status: 'delivered', sentAt: '2026-06-15T08:00:08Z', deliveredAt: '2026-06-15T08:00:10Z', openedAt: null, clickedAt: null, device: 'Android 14', errorCode: null, errorMessage: null, retries: 0 },
  { id: 'LOG-0009', scheduleId: 'SCH-004', scheduleTitle: 'Subscription Renewal Reminder', channel: 'push', recipientName: 'Kavya Reddy', recipientEmail: 'kavya.r@email.com', status: 'opened', sentAt: '2026-06-15T11:00:06Z', deliveredAt: '2026-06-15T11:00:08Z', openedAt: '2026-06-15T11:04:33Z', clickedAt: '2026-06-15T11:04:41Z', device: 'iOS 17', errorCode: null, errorMessage: null, retries: 0 },
  { id: 'LOG-0010', scheduleId: 'SCH-007', scheduleTitle: 'Guardian Engagement Nudge', channel: 'email', recipientName: 'Rohit Verma', recipientEmail: 'rohit.v@email.com', status: 'pending', sentAt: '2026-06-15T14:00:00Z', deliveredAt: null, openedAt: null, clickedAt: null, device: '—', errorCode: null, errorMessage: null, retries: 0 },
  { id: 'LOG-0011', scheduleId: 'SCH-010', scheduleTitle: 'Emergency Contact Update', channel: 'in-app', recipientName: 'Kamala Bai', recipientEmail: 'kamala.b@email.com', status: 'failed', sentAt: '2026-06-10T09:00:11Z', deliveredAt: null, openedAt: null, clickedAt: null, device: 'Android 11', errorCode: 'APP_OFFLINE', errorMessage: 'User app not active', retries: 3 },
  { id: 'LOG-0012', scheduleId: 'SCH-011', scheduleTitle: 'App Version Upgrade Prompt', channel: 'push', recipientName: 'Dinesh Patel', recipientEmail: 'dinesh.p@email.com', status: 'delivered', sentAt: '2026-06-14T10:00:07Z', deliveredAt: '2026-06-14T10:00:09Z', openedAt: '2026-06-14T10:22:16Z', clickedAt: null, device: 'iOS 15', errorCode: null, errorMessage: null, retries: 0 },
  { id: 'LOG-0013', scheduleId: 'SCH-002', scheduleTitle: 'Weekly Health Check-In', channel: 'push', recipientName: 'Meera Krishnan', recipientEmail: 'meera.k@email.com', status: 'clicked', sentAt: '2026-06-09T10:00:10Z', deliveredAt: '2026-06-09T10:00:12Z', openedAt: '2026-06-09T10:05:48Z', clickedAt: '2026-06-09T10:05:54Z', device: 'Android 13', errorCode: null, errorMessage: null, retries: 0 },
  { id: 'LOG-0014', scheduleId: 'SCH-008', scheduleTitle: 'Blood Pressure Check Alert', channel: 'push', recipientName: 'Baljit Kaur', recipientEmail: 'baljit.k@email.com', status: 'bounced', sentAt: '2026-06-15T08:00:09Z', deliveredAt: null, openedAt: null, clickedAt: null, device: '—', errorCode: 'FCM_QUOTA_EXCEEDED', errorMessage: 'Daily send limit reached', retries: 1 },
  { id: 'LOG-0015', scheduleId: 'SCH-009', scheduleTitle: 'New Year Health Goals', channel: 'email', recipientName: 'Sanjay Patil', recipientEmail: 'sanjay.p@email.com', status: 'opened', sentAt: '2026-01-01T07:00:15Z', deliveredAt: '2026-01-01T07:00:32Z', openedAt: '2026-01-01T09:42:11Z', clickedAt: null, device: 'Gmail Mobile', errorCode: null, errorMessage: null, retries: 0 },
];

const TREND_DATA = [
  { date: 'Jun 9',  sent: 4280, delivered: 4198, failed: 82 },
  { date: 'Jun 10', sent: 5120, delivered: 5034, failed: 86 },
  { date: 'Jun 11', sent: 3890, delivered: 3812, failed: 78 },
  { date: 'Jun 12', sent: 6240, delivered: 6142, failed: 98 },
  { date: 'Jun 13', sent: 5840, delivered: 5748, failed: 92 },
  { date: 'Jun 14', sent: 4120, delivered: 4058, failed: 62 },
  { date: 'Jun 15', sent: 7840, delivered: 7692, failed: 148 },
];

const CHANNEL_STATS = [
  { channel: 'Push', delivered: 28420, failed: 840, open: 9847, click: 3241, openRate: 34.6, clickRate: 11.4 },
  { channel: 'Email', delivered: 18640, failed: 392, open: 5218, click: 1847, openRate: 28.0, clickRate: 9.9 },
  { channel: 'In-App', delivered: 12380, failed: 124, open: 6190, click: 2476, openRate: 50.0, clickRate: 20.0 },
  { channel: 'SMS', delivered: 3840, failed: 48, open: 0, click: 0, openRate: 0, clickRate: 0 },
];

function fmtDate(iso: string) { return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }

const CHANNEL_ICONS: Record<Channel, React.ReactNode> = {
  push: <Smartphone className="w-3 h-3" />, email: <Mail className="w-3 h-3" />,
  sms: <MessageSquare className="w-3 h-3" />, 'in-app': <Bell className="w-3 h-3" />,
};

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const cfg: Record<DeliveryStatus, { label: string; icon: React.ReactNode; color: string }> = {
    delivered:    { label: 'Delivered',    icon: <CheckCircle2 className="w-3 h-3" />,   color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
    opened:       { label: 'Opened',       icon: <Eye className="w-3 h-3" />,             color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
    clicked:      { label: 'Clicked',      icon: <TrendingUp className="w-3 h-3" />,      color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20' },
    pending:      { label: 'Pending',      icon: <Clock className="w-3 h-3" />,           color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
    failed:       { label: 'Failed',       icon: <XCircle className="w-3 h-3" />,         color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' },
    bounced:      { label: 'Bounced',      icon: <AlertTriangle className="w-3 h-3" />,   color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' },
    unsubscribed: { label: 'Unsubscribed', icon: <XCircle className="w-3 h-3" />,         color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700' },
  };
  const c = cfg[status];
  return <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', c.color)}>{c.icon}{c.label}</span>;
}

export default function DeliveryLogsPage() {
  const theme = useChartTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [tab, setTab] = useState('logs');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => MOCK_LOGS.filter(l => {
    const q = search.toLowerCase();
    const ms = !q || l.recipientName.toLowerCase().includes(q) || l.id.toLowerCase().includes(q) || l.scheduleTitle.toLowerCase().includes(q) || l.recipientEmail.toLowerCase().includes(q);
    const mst = statusFilter === 'all' || l.status === statusFilter;
    const mch = channelFilter === 'all' || l.channel === channelFilter;
    const msc = scheduleFilter === 'all' || l.scheduleId === scheduleFilter;
    return ms && mst && mch && msc;
  }), [search, statusFilter, channelFilter, scheduleFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalSent = MOCK_LOGS.length;
  const totalDelivered = MOCK_LOGS.filter(l => ['delivered', 'opened', 'clicked'].includes(l.status)).length;
  const totalFailed = MOCK_LOGS.filter(l => l.status === 'failed').length;
  const totalOpened = MOCK_LOGS.filter(l => ['opened', 'clicked'].includes(l.status)).length;
  const totalClicked = MOCK_LOGS.filter(l => l.status === 'clicked').length;
  const totalBounced = MOCK_LOGS.filter(l => l.status === 'bounced').length;

  function handleExport() {
    const csv = [
      ['Log ID', 'Schedule ID', 'Schedule Title', 'Channel', 'Recipient', 'Email', 'Status', 'Sent At', 'Delivered At', 'Opened At', 'Device', 'Error Code', 'Error Message', 'Retries'],
      ...MOCK_LOGS.map(l => [l.id, l.scheduleId, l.scheduleTitle, l.channel, l.recipientName, l.recipientEmail, l.status, l.sentAt, l.deliveredAt || '', l.openedAt || '', l.device, l.errorCode || '', l.errorMessage || '', l.retries]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'delivery-logs.csv'; a.click();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track delivery status, open rates, and failures across all notification channels</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Refresh</button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sent" value={(63280).toLocaleString()} icon={<Send className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" change={12} />
        <StatCard title="Delivered" value={(62083).toLocaleString()} icon={<CheckCircle2 className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" change={11} />
        <StatCard title="Failed" value="1,404" icon={<XCircle className="w-5 h-5" />} gradient="bg-gradient-to-br from-red-500 to-red-700" change={-3} />
        <StatCard title="Bounced" value="793" icon={<AlertTriangle className="w-5 h-5" />} gradient="bg-gradient-to-br from-orange-500 to-orange-700" change={-5} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Open Rate" value="34.2%" icon={<Eye className="w-5 h-5" />} gradient="bg-gradient-to-br from-blue-500 to-blue-700" change={2} />
        <StatCard title="Click-Through Rate" value="11.8%" icon={<TrendingUp className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" change={4} />
        <StatCard title="Delivery Success Rate" value="98.1%" icon={<BarChart3 className="w-5 h-5" />} gradient="bg-gradient-to-br from-teal-500 to-teal-700" change={1} />
        <StatCard title="Unsubscribe Rate" value="0.4%" icon={<XCircle className="w-5 h-5" />} gradient="bg-gradient-to-br from-slate-500 to-slate-700" />
      </div>

      {/* Main Card with Tabs */}
      <div className="card overflow-hidden">
        <div className="px-6 pt-5 border-b border-slate-100 dark:border-slate-800">
          <Tabs tabs={[{ id: 'logs', label: 'Delivery Logs' }, { id: 'analytics', label: 'Channel Analytics' }, { id: 'trend', label: 'Delivery Trend' }]} active={tab} onChange={t => { setTab(t); setPage(1); }} />
        </div>
        <div className="p-6">

          {/* ── Logs Tab ── */}
          {tab === 'logs' && (
            <>
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2 flex-1 min-w-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input type="text" placeholder="Search by log ID, recipient, schedule..." className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-36">
                  <option value="all">All Status</option>
                  {(['delivered','opened','clicked','pending','failed','bounced','unsubscribed'] as DeliveryStatus[]).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <select value={channelFilter} onChange={e => { setChannelFilter(e.target.value); setPage(1); }} className="input-field w-32">
                  <option value="all">All Channels</option>
                  <option value="push">Push</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="in-app">In-App</option>
                </select>
                <select value={scheduleFilter} onChange={e => { setScheduleFilter(e.target.value); setPage(1); }} className="input-field w-44">
                  <option value="all">All Schedules</option>
                  {Array.from(new Set(MOCK_LOGS.map(l => l.scheduleId))).map(id => {
                    const title = MOCK_LOGS.find(l => l.scheduleId === id)?.scheduleTitle || id;
                    return <option key={id} value={id}>{id} — {title.slice(0, 20)}{title.length > 20 ? '…' : ''}</option>;
                  })}
                </select>
                <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>Date Range</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Log ID</th>
                      <th className="table-header">Schedule</th>
                      <th className="table-header">Channel</th>
                      <th className="table-header">Recipient</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Sent At</th>
                      <th className="table-header">Delivered At</th>
                      <th className="table-header">Opened At</th>
                      <th className="table-header">Device</th>
                      <th className="table-header">Retries</th>
                      <th className="table-header">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="table-cell"><span className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-400">{l.id}</span></td>
                        <td className="table-cell max-w-[150px]">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{l.scheduleTitle}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{l.scheduleId}</p>
                        </td>
                        <td className="table-cell">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                            {CHANNEL_ICONS[l.channel]}{l.channel === 'in-app' ? 'In-App' : l.channel.charAt(0).toUpperCase() + l.channel.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar name={l.recipientName} size="xs" />
                            <div>
                              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{l.recipientName}</p>
                              <p className="text-[10px] text-slate-400">{l.recipientEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell"><StatusBadge status={l.status} /></td>
                        <td className="table-cell text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(l.sentAt)}</td>
                        <td className="table-cell text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{l.deliveredAt ? fmtDate(l.deliveredAt) : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                        <td className="table-cell text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{l.openedAt ? fmtDate(l.openedAt) : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                        <td className="table-cell text-xs text-slate-500 dark:text-slate-400">{l.device}</td>
                        <td className="table-cell text-center">
                          {l.retries > 0 ? <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{l.retries}×</span> : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                        <td className="table-cell max-w-[140px]">
                          {l.errorCode ? (
                            <div>
                              <span className="text-[10px] font-mono text-red-600 dark:text-red-400">{l.errorCode}</span>
                              <p className="text-[10px] text-slate-400 truncate">{l.errorMessage}</p>
                            </div>
                          ) : <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div className="py-16 text-center text-sm text-slate-400">No logs found matching your filters.</div>}
              </div>
              {filtered.length > pageSize && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
                </div>
              )}
            </>
          )}

          {/* ── Channel Analytics Tab ── */}
          {tab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="section-title">Performance by Channel</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Channel</th>
                      <th className="table-header">Delivered</th>
                      <th className="table-header">Failed</th>
                      <th className="table-header">Delivery Rate</th>
                      <th className="table-header">Opened</th>
                      <th className="table-header">Open Rate</th>
                      <th className="table-header">Clicked</th>
                      <th className="table-header">Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CHANNEL_STATS.map((c, i) => {
                      const total = c.delivered + c.failed;
                      const deliveryRate = Math.round((c.delivered / total) * 100);
                      return (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="table-cell">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-sm text-slate-900 dark:text-white">
                              {c.channel === 'Push' ? <Smartphone className="w-4 h-4 text-brand-500" /> : c.channel === 'Email' ? <Mail className="w-4 h-4 text-violet-500" /> : c.channel === 'In-App' ? <Bell className="w-4 h-4 text-teal-500" /> : <MessageSquare className="w-4 h-4 text-amber-500" />}
                              {c.channel}
                            </span>
                          </td>
                          <td className="table-cell font-semibold text-emerald-700 dark:text-emerald-400">{c.delivered.toLocaleString()}</td>
                          <td className="table-cell font-semibold text-red-600 dark:text-red-400">{c.failed.toLocaleString()}</td>
                          <td className="table-cell min-w-[130px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${deliveryRate}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8">{deliveryRate}%</span>
                            </div>
                          </td>
                          <td className="table-cell font-semibold text-blue-700 dark:text-blue-400">{c.open > 0 ? c.open.toLocaleString() : '—'}</td>
                          <td className="table-cell">
                            {c.openRate > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, c.openRate * 2)}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-10">{c.openRate}%</span>
                              </div>
                            ) : <span className="text-slate-300 dark:text-slate-600 text-xs">N/A</span>}
                          </td>
                          <td className="table-cell font-semibold text-violet-700 dark:text-violet-400">{c.click > 0 ? c.click.toLocaleString() : '—'}</td>
                          <td className="table-cell">
                            {c.clickRate > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(100, c.clickRate * 5)}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-10">{c.clickRate}%</span>
                              </div>
                            ) : <span className="text-slate-300 dark:text-slate-600 text-xs">N/A</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="section-title mb-3">Delivery Rate by Channel</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={CHANNEL_STATS.map(c => ({ channel: c.channel, delivered: c.delivered, failed: c.failed }))} barSize={36} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                      <XAxis dataKey="channel" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                      <Tooltip content={<CT />} />
                      <Bar dataKey="delivered" name="Delivered" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="failed" name="Failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="section-title mb-3">Open Rate vs Click Rate</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={CHANNEL_STATS.filter(c => c.openRate > 0).map(c => ({ channel: c.channel, openRate: c.openRate, clickRate: c.clickRate }))} barSize={28} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                      <XAxis dataKey="channel" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CT />} />
                      <Bar dataKey="openRate" name="Open Rate %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="clickRate" name="Click Rate %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── Delivery Trend Tab ── */}
          {tab === 'trend' && (
            <div className="space-y-6">
              <h3 className="section-title">7-Day Delivery Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} /><stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="delivGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                  <XAxis dataKey="date" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CT />} />
                  <Area type="monotone" dataKey="sent" name="Sent" stroke="#0284c7" strokeWidth={2} fill="url(#sentGrad)" dot={false} />
                  <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#10b981" strokeWidth={2} fill="url(#delivGrad)" dot={false} />
                  <Area type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={1.5} fill="transparent" dot={false} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-4">
                {[
                  { label: 'Peak Day', value: 'Jun 15', sub: '7,840 notifications sent', color: 'text-brand-600 dark:text-brand-400' },
                  { label: 'Avg Daily Sent', value: '5,333', sub: 'Over the past 7 days', color: 'text-slate-700 dark:text-slate-200' },
                  { label: 'Avg Failure Rate', value: '1.9%', sub: '7-day rolling average', color: 'text-red-600 dark:text-red-400' },
                ].map((s, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                    <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

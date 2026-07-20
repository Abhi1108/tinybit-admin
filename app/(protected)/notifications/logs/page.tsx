'use client';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Search, Download, CheckCircle2, XCircle,
  AlertTriangle, Clock, Mail, Smartphone, MessageSquare, Bell,
  RefreshCw, BarChart3, Send, TrendingUp, Eye,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Avatar, StatCard, Button, Tabs, Pagination, cn } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getAdminNotifications, type AdminNotification } from '@/src/services/adminApi';

function useChartTheme() {
  const { isDark } = useTheme();
  return { grid: isDark ? '#1e293b' : '#f1f5f9', text: isDark ? '#94a3b8' : '#64748b', bg: isDark ? '#1e293b' : '#ffffff', border: isDark ? '#334155' : '#e2e8f0', fg: isDark ? '#f1f5f9' : '#1e293b' };
}
function CT({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  const t = useChartTheme();
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg shadow-xl px-3 py-2 border text-xs" style={{ background: t.bg, borderColor: t.border, color: t.fg }}>{label && <p className="font-semibold mb-1 opacity-60">{label}</p>}{payload.map((p, i) => <div key={i} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: p.color }} /><span className="opacity-75">{p.name}:</span><span className="font-semibold">{p.value.toLocaleString()}</span></div>)}</div>;
}

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

function mapNotification(n: AdminNotification): DeliveryLog {
  const channel: Channel = n.type === 'announcement' ? 'push' : 'in-app';
  const status: DeliveryStatus = n.read ? 'opened' : 'delivered';
  return {
    id: n.id.slice(0, 8).toUpperCase(),
    scheduleId: n.type || 'inbox',
    scheduleTitle: n.title,
    channel,
    recipientName: n.user_name || '—',
    recipientEmail: n.user_id?.slice(0, 8) || '—',
    status,
    sentAt: n.created_at,
    deliveredAt: n.created_at,
    openedAt: n.read ? n.created_at : null,
    clickedAt: null,
    device: '—',
    errorCode: null,
    errorMessage: null,
    retries: 0,
  };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const CHANNEL_ICONS: Record<Channel, React.ReactNode> = {
  push: <Smartphone className="w-3 h-3" />,
  email: <Mail className="w-3 h-3" />,
  sms: <MessageSquare className="w-3 h-3" />,
  'in-app': <Bell className="w-3 h-3" />,
};

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const cfg: Record<DeliveryStatus, { label: string; icon: React.ReactNode; color: string }> = {
    delivered: { label: 'Delivered', icon: <CheckCircle2 className="w-3 h-3" />, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
    opened: { label: 'Opened', icon: <Eye className="w-3 h-3" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
    clicked: { label: 'Clicked', icon: <TrendingUp className="w-3 h-3" />, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20' },
    pending: { label: 'Pending', icon: <Clock className="w-3 h-3" />, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
    failed: { label: 'Failed', icon: <XCircle className="w-3 h-3" />, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' },
    bounced: { label: 'Bounced', icon: <AlertTriangle className="w-3 h-3" />, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' },
    unsubscribed: { label: 'Unsubscribed', icon: <XCircle className="w-3 h-3" />, color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700' },
  };
  const c = cfg[status];
  return <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', c.color)}>{c.icon}{c.label}</span>;
}

export default function DeliveryLogsPage() {
  const theme = useChartTheme();
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [tab, setTab] = useState('logs');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await getAdminNotifications({ limit: 100 });
      if (res.success) setLogs((res.notifications || []).map(mapNotification));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = useMemo(() => logs.filter(l => {
    const q = search.toLowerCase();
    const ms = !q || l.recipientName.toLowerCase().includes(q) || l.id.toLowerCase().includes(q) || l.scheduleTitle.toLowerCase().includes(q) || l.recipientEmail.toLowerCase().includes(q);
    const mst = statusFilter === 'all' || l.status === statusFilter;
    const mch = channelFilter === 'all' || l.channel === channelFilter;
    const msc = scheduleFilter === 'all' || l.scheduleId === scheduleFilter;
    return ms && mst && mch && msc;
  }), [logs, search, statusFilter, channelFilter, scheduleFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalSent = logs.length;
  const totalDelivered = logs.filter(l => ['delivered', 'opened', 'clicked'].includes(l.status)).length;
  const totalFailed = logs.filter(l => l.status === 'failed').length;
  const totalOpened = logs.filter(l => ['opened', 'clicked'].includes(l.status)).length;
  const openRate = totalSent ? Math.round((totalOpened / totalSent) * 1000) / 10 : 0;
  const deliveryRate = totalSent ? Math.round((totalDelivered / totalSent) * 1000) / 10 : 0;

  const channelStats = useMemo(() => {
    const channels: Channel[] = ['push', 'in-app', 'email', 'sms'];
    return channels.map(channel => {
      const rows = logs.filter(l => l.channel === channel);
      const delivered = rows.filter(l => ['delivered', 'opened', 'clicked'].includes(l.status)).length;
      const failed = rows.filter(l => l.status === 'failed').length;
      const open = rows.filter(l => ['opened', 'clicked'].includes(l.status)).length;
      return {
        channel: channel === 'in-app' ? 'In-App' : channel.charAt(0).toUpperCase() + channel.slice(1),
        delivered,
        failed,
        open,
        openRate: rows.length ? Math.round((open / rows.length) * 1000) / 10 : 0,
      };
    }).filter(c => c.delivered + c.failed > 0);
  }, [logs]);

  const trendData = useMemo(() => {
    const byDay = new Map<string, { date: string; sent: number; delivered: number; failed: number }>();
    for (const l of logs) {
      const key = new Date(l.sentAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const row = byDay.get(key) || { date: key, sent: 0, delivered: 0, failed: 0 };
      row.sent += 1;
      if (['delivered', 'opened', 'clicked'].includes(l.status)) row.delivered += 1;
      if (l.status === 'failed') row.failed += 1;
      byDay.set(key, row);
    }
    return Array.from(byDay.values()).slice(-7);
  }, [logs]);

  function handleExport() {
    const csv = [
      ['Log ID', 'Type', 'Title', 'Channel', 'Recipient', 'Status', 'Sent At'],
      ...logs.map(l => [l.id, l.scheduleId, l.scheduleTitle, l.channel, l.recipientName, l.status, l.sentAt]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'delivery-logs.csv';
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track delivery status across notification channels</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-1.5" onClick={loadLogs}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh
          </button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sent" value={totalSent.toLocaleString()} icon={<Send className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" />
        <StatCard title="Delivered" value={totalDelivered.toLocaleString()} icon={<CheckCircle2 className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <StatCard title="Failed" value={totalFailed.toLocaleString()} icon={<XCircle className="w-5 h-5" />} gradient="bg-gradient-to-br from-red-500 to-red-700" />
        <StatCard title="Opened" value={totalOpened.toLocaleString()} icon={<Eye className="w-5 h-5" />} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Open Rate" value={`${openRate}%`} icon={<Eye className="w-5 h-5" />} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
        <StatCard title="Click-Through Rate" value="—" icon={<TrendingUp className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
        <StatCard title="Delivery Success Rate" value={`${deliveryRate}%`} icon={<BarChart3 className="w-5 h-5" />} gradient="bg-gradient-to-br from-teal-500 to-teal-700" />
        <StatCard title="Unsubscribe Rate" value="—" icon={<XCircle className="w-5 h-5" />} gradient="bg-gradient-to-br from-slate-500 to-slate-700" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 pt-5 border-b border-slate-100 dark:border-slate-800">
          <Tabs tabs={[{ id: 'logs', label: 'Delivery Logs' }, { id: 'analytics', label: 'Channel Analytics' }, { id: 'trend', label: 'Delivery Trend' }]} active={tab} onChange={t => { setTab(t); setPage(1); }} />
        </div>
        <div className="p-6">
          {tab === 'logs' && (
            <>
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2 flex-1 min-w-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-36">
                  <option value="all">All Status</option>
                  {(['delivered', 'opened', 'clicked', 'pending', 'failed', 'bounced', 'unsubscribed'] as DeliveryStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={channelFilter} onChange={e => { setChannelFilter(e.target.value); setPage(1); }} className="input-field w-32">
                  <option value="all">All Channels</option>
                  <option value="push">Push</option>
                  <option value="in-app">In-App</option>
                </select>
                <select value={scheduleFilter} onChange={e => { setScheduleFilter(e.target.value); setPage(1); }} className="input-field w-44">
                  <option value="all">All Types</option>
                  {Array.from(new Set(logs.map(l => l.scheduleId))).map(id => <option key={id} value={id}>{id}</option>)}
                </select>
              </div>
              {loading ? (
                <div className="py-16 text-center text-sm text-slate-400">Loading logs…</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="table-header">Log ID</th>
                          <th className="table-header">Title</th>
                          <th className="table-header">Channel</th>
                          <th className="table-header">Recipient</th>
                          <th className="table-header">Status</th>
                          <th className="table-header">Sent At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map(l => (
                          <tr key={l.id + l.sentAt} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="table-cell"><span className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-400">{l.id}</span></td>
                            <td className="table-cell max-w-[180px]">
                              <p className="text-xs font-medium truncate">{l.scheduleTitle}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{l.scheduleId}</p>
                            </td>
                            <td className="table-cell">
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                                {CHANNEL_ICONS[l.channel]}{l.channel}
                              </span>
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <Avatar name={l.recipientName} size="xs" />
                                <span className="text-xs">{l.recipientName}</span>
                              </div>
                            </td>
                            <td className="table-cell"><StatusBadge status={l.status} /></td>
                            <td className="table-cell text-xs text-slate-500 whitespace-nowrap">{fmtDate(l.sentAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filtered.length === 0 && <div className="py-16 text-center text-sm text-slate-400">No logs found.</div>}
                  </div>
                  {filtered.length > pageSize && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="section-title">Performance by Channel</h3>
              {channelStats.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">No channel data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={channelStats.map(c => ({ channel: c.channel, delivered: c.delivered, failed: c.failed }))} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                    <XAxis dataKey="channel" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CT />} />
                    <Bar dataKey="delivered" name="Delivered" stackId="a" fill="#10b981" />
                    <Bar dataKey="failed" name="Failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {tab === 'trend' && (
            <div className="space-y-6">
              <h3 className="section-title">Delivery Trend</h3>
              {trendData.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">No trend data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                    <XAxis dataKey="date" tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CT />} />
                    <Area type="monotone" dataKey="sent" name="Sent" stroke="#0284c7" strokeWidth={2} fill="transparent" />
                    <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#10b981" strokeWidth={2} fill="transparent" />
                    <Area type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={1.5} fill="transparent" strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

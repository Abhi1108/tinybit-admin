'use client';
import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, ShieldAlert, Bot,
  Activity, CreditCard, DollarSign, Headphones, Loader2, AlertCircle,
} from 'lucide-react';
import { StatCard, cn } from '@/src/components/ui';
import { UserGrowthChart, SOSChart, AIUsageChart } from '@/src/components/charts';
import { getAdminStats, getAdminAnalytics, getAuditLogs, type AuditLogEntry } from '@/src/services/adminApi';

function auditDotColor(action: string): string {
  if (action.includes('failed') || action.includes('ban') || action.includes('purge') || action.includes('trash')) {
    return 'bg-red-500';
  }
  if (action.startsWith('auth.')) return 'bg-emerald-500';
  if (action.startsWith('user.')) return 'bg-brand-500';
  if (action.startsWith('notification.')) return 'bg-indigo-500';
  return 'bg-teal-500';
}

function auditSeverity(action: string): 'critical' | 'warning' | 'info' {
  if (action.includes('failed') || action.includes('purge') || action.includes('ban')) return 'critical';
  if (action.includes('trash') || action.includes('delete')) return 'warning';
  return 'info';
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  info: 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800',
};

function formatAuditLine(log: AuditLogEntry): string {
  const d = log.details;
  if (log.action === 'notification.broadcast' && d) {
    return `"${d.title ?? ''}" broadcast to ${d.sent ?? '?'} user(s)`;
  }
  if (typeof d?.username === 'string' && d.username) {
    return `${log.action} · ${d.username}`;
  }
  const label = d?.title ?? d?.name ?? d?.author;
  if (typeof label === 'string' && label) {
    return `${log.action} · ${label}`;
  }
  return log.target_id ? `${log.action} · ${log.target_type} #${log.target_id.slice(0, 8)}` : log.action;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, analyticsRes, logsRes] = await Promise.all([
          getAdminStats(),
          getAdminAnalytics(),
          getAuditLogs({ limit: 10 }),
        ]);
        if (statsRes) setStats(statsRes);
        if (analyticsRes) setAnalytics(analyticsRes);
        setLogs(logsRes.logs || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalElders = stats ? stats.elders : 0;
  const activeElders = stats ? stats.elders : 0;
  const totalGuardians = stats ? stats.guardians : 0;
  const activeGuardians = stats ? stats.guardians : 0;
  const dailyActiveUsers = stats ? stats.check_ins_today : 0;
  const monthlyActiveUsers = stats ? (stats.elders + stats.guardians) : 0;
  const sosTriggeredToday = stats && stats.sos_today !== undefined ? stats.sos_today : 0;
  const activeSubscriptions = stats?.active_subscriptions ?? 0;
  const monthlyRevenue = stats?.month_revenue ?? 0;
  const totalAIRequestsToday = stats ? stats.ai_messages_today : 0;
  const activeAIUsers = stats?.active_ai_users ?? 0;

  const growthData = analytics && analytics.user_growth
    ? analytics.user_growth.labels.map((label: string, index: number) => ({
        name: label.slice(5),
        elders: analytics.user_growth.data[index] || 0,
        guardians: Math.round((analytics.user_growth.data[index] || 0) * 0.8),
      }))
    : [];

  const sosData = analytics && analytics.sos_by_day
    ? analytics.sos_by_day.labels.map((label: string, index: number) => ({
        name: label.slice(5),
        alerts: Number(analytics.sos_by_day.alerts?.[index]) || 0,
        resolved: Number(analytics.sos_by_day.resolved?.[index]) || 0,
        cancelled: Number(analytics.sos_by_day.cancelled?.[index]) || 0,
      }))
    : [];

  const aiUsage = analytics && analytics.ai_by_day
    ? analytics.ai_by_day.labels.map((label: string, index: number) => ({
        name: label.slice(5),
        tokens: Number(analytics.ai_by_day.tokens?.[index]) || 0,
        prompt: Number(analytics.ai_by_day.prompt_tokens?.[index]) || 0,
        completion: Number(analytics.ai_by_day.completion_tokens?.[index]) || 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">TinyBit Healthcare Platform — Executive Overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live · Updated just now
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Elders"
          value={loading ? '...' : totalElders.toLocaleString()}
          change={8.2}
          gradient="stat-card-gradient-blue"
          icon={<Users className="w-5 h-5" />}
          subtitle={loading ? 'Loading...' : `${activeElders.toLocaleString()} active`}
        />
        <StatCard
          title="Total Guardians"
          value={loading ? '...' : totalGuardians.toLocaleString()}
          change={5.4}
          gradient="stat-card-gradient-teal"
          icon={<UserCheck className="w-5 h-5" />}
          subtitle={loading ? 'Loading...' : `${activeGuardians.toLocaleString()} active`}
        />
        <StatCard
          title="Active Users"
          value={loading ? '...' : dailyActiveUsers.toLocaleString()}
          change={3.8}
          gradient="stat-card-gradient-emerald"
          icon={<Activity className="w-5 h-5" />}
          subtitle={loading ? 'Loading...' : `${monthlyActiveUsers.toLocaleString()} MAU`}
        />
        <StatCard
          title="SOS Today"
          value={loading ? '...' : sosTriggeredToday.toString()}
          change={-12.5}
          gradient="stat-card-gradient-red"
          icon={<ShieldAlert className="w-5 h-5" />}
          subtitle="Triggered today"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={loading ? '...' : activeSubscriptions.toLocaleString()}
          gradient="stat-card-gradient-indigo"
          icon={<CreditCard className="w-5 h-5" />}
          subtitle="Guardians on active plan"
        />
        <StatCard
          title="Monthly Revenue"
          value={loading ? '...' : `₹${Number(monthlyRevenue).toLocaleString('en-IN')}`}
          gradient="stat-card-gradient-purple"
          icon={<DollarSign className="w-5 h-5" />}
          subtitle="Captured this month"
        />
        <StatCard
          title="Open Support Tickets"
          value="—"
          gradient="stat-card-gradient-amber"
          icon={<Headphones className="w-5 h-5" />}
          subtitle="No ticketing system yet"
        />
        <StatCard
          title="AI Requests Today"
          value={loading ? '...' : totalAIRequestsToday.toLocaleString()}
          gradient="stat-card-gradient-rose"
          icon={<Bot className="w-5 h-5" />}
          subtitle={loading ? 'Loading...' : `${activeAIUsers.toLocaleString()} active users`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">User Growth</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Last 30 days</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-[220px]">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <UserGrowthChart data={growthData} />
          )}
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">SOS Alerts Trend</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Last 7 days</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-[220px]">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <SOSChart data={sosData} />
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="section-title">AI Tokens</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">This week · click legend to toggle</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-[260px]">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <AIUsageChart data={aiUsage} height={260} showBrush={false} />
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Live Activity Feed</h2>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Admin audit log
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500 text-sm">
            <span>No recent admin activity</span>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const severity = auditSeverity(log.action);
              return (
                <div
                  key={log.id}
                  className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', severityColors[severity])}
                >
                  <span className={cn('mt-1.5 w-2 h-2 rounded-full flex-shrink-0', auditDotColor(log.action))} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {formatAuditLine(log)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {log.actor}
                      {log.ip ? ` · ${log.ip}` : ''}
                      {' · '}
                      {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

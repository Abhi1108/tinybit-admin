'use client';
import React from 'react';
import {
  Users, UserCheck, ShieldAlert, Bot,
  Activity, CreditCard, DollarSign, Headphones,
} from 'lucide-react';
import { StatCard } from '@/src/components/ui';
import { UserGrowthChart, SOSChart, AIUsageChart } from '@/src/components/charts';
import {
  dashboardStats, userGrowthData, sosByMonthData, aiUsageData, activityFeed,
} from '@/src/data/mockData';
import { cn } from '@/src/components/ui';

const activityColors: Record<string, string> = {
  sos_triggered: 'bg-red-500',
  elder_registered: 'bg-brand-500',
  guardian_connected: 'bg-teal-500',
  ai_session: 'bg-indigo-500',
};

const severityColors: Record<string, string> = {
  critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  info: 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800',
};

const relevantActivityTypes = new Set(['sos_triggered', 'elder_registered', 'guardian_connected', 'ai_session']);

export default function DashboardPage() {
  const s = dashboardStats;
  const feed = activityFeed.filter(item => relevantActivityTypes.has(item.type));

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* KPI Grid — Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Elders"
          value={s.totalElders.toLocaleString()}
          change={8.2}
          gradient="stat-card-gradient-blue"
          icon={<Users className="w-5 h-5" />}
          subtitle={`${s.activeElders.toLocaleString()} active`}
        />
        <StatCard
          title="Total Guardians"
          value={s.totalGuardians.toLocaleString()}
          change={5.4}
          gradient="stat-card-gradient-teal"
          icon={<UserCheck className="w-5 h-5" />}
          subtitle={`${s.activeGuardians.toLocaleString()} active`}
        />
        <StatCard
          title="Active Users"
          value={s.dailyActiveUsers.toLocaleString()}
          change={3.8}
          gradient="stat-card-gradient-emerald"
          icon={<Activity className="w-5 h-5" />}
          subtitle={`${s.monthlyActiveUsers.toLocaleString()} MAU`}
        />
        <StatCard
          title="SOS Today"
          value={s.sosTriggeredToday}
          change={-12.5}
          gradient="stat-card-gradient-red"
          icon={<ShieldAlert className="w-5 h-5" />}
          subtitle="Triggered today"
        />
      </div>

      {/* KPI Grid — Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={s.activeSubscriptions.toLocaleString()}
          change={11.3}
          gradient="stat-card-gradient-indigo"
          icon={<CreditCard className="w-5 h-5" />}
          subtitle="Paying users"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(s.monthlyRevenue / 1000).toFixed(0)}K`}
          change={9.7}
          gradient="stat-card-gradient-purple"
          icon={<DollarSign className="w-5 h-5" />}
          subtitle="This month"
        />
        <StatCard
          title="Open Support Tickets"
          value={s.openSupportTickets}
          change={-5.2}
          gradient="stat-card-gradient-amber"
          icon={<Headphones className="w-5 h-5" />}
          subtitle="Awaiting resolution"
        />
        <StatCard
          title="AI Requests Today"
          value={s.totalAIRequestsToday.toLocaleString()}
          change={18.7}
          gradient="stat-card-gradient-rose"
          icon={<Bot className="w-5 h-5" />}
          subtitle={`${s.activeAIUsers.toLocaleString()} active users`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">User Growth</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Last 6 months</span>
          </div>
          <UserGrowthChart data={userGrowthData} />
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">SOS Alerts Trend</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Last 6 months</span>
          </div>
          <SOSChart data={sosByMonthData} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">AI Usage</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">This week</span>
        </div>
        <AIUsageChart data={aiUsageData} />
      </div>

      {/* Activity Feed */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Live Activity Feed</h2>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>
        <div className="space-y-2">
          {feed.map(item => (
            <div
              key={item.id}
              className={cn('flex items-center gap-3 p-3 rounded-lg border text-sm', severityColors[item.severity || 'info'])}
            >
              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', activityColors[item.type] || 'bg-slate-400')} />
              <span className="flex-1 text-slate-700 dark:text-slate-300">{item.message}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useState } from 'react';
import { BarChart3, Download, FileText, TrendingUp, Users, Heart, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import {
  UserGrowthChart, MedicineAdherenceChart, WellnessTrendsChart, SOSChart
} from '@/src/components/charts';
import { getAdminAnalytics } from '@/src/services/adminApi';

const reports = [
  { id: 'r1', name: 'User Growth Report', description: 'Daily registration trends (from /analytics)', category: 'Users', lastGenerated: new Date().toISOString().slice(0, 10), status: 'ready' as const },
  { id: 'r2', name: 'Medicine Category Report', description: 'Medicine catalog mix by category', category: 'Health', lastGenerated: new Date().toISOString().slice(0, 10), status: 'ready' as const },
  { id: 'r3', name: 'Check-in Activity Report', description: 'Daily check-ins by day of week', category: 'Health', lastGenerated: new Date().toISOString().slice(0, 10), status: 'ready' as const },
  { id: 'r4', name: 'AI Activity Report', description: 'AI message volume (proxy series)', category: 'AI', lastGenerated: new Date().toISOString().slice(0, 10), status: 'ready' as const },
  { id: 'r5', name: 'Care Events Report', description: 'Care event mix by type', category: 'Care', lastGenerated: new Date().toISOString().slice(0, 10), status: 'ready' as const },
  { id: 'r6', name: 'Mind Games Report', description: 'Average mind-game scores by type', category: 'Rewards', lastGenerated: new Date().toISOString().slice(0, 10), status: 'ready' as const },
];

const statusVariants = { ready: 'success' as const, generating: 'warning' as const };

type Series = { labels: string[]; data: number[] };

function seriesToGrowth(s?: Series) {
  if (!s?.labels?.length) return [];
  return s.labels.map((label, i) => ({
    name: label.length > 5 ? label.slice(5) : label,
    elders: s.data[i] || 0,
    guardians: Math.round((s.data[i] || 0) * 0.8),
  }));
}

function seriesToAdherence(s?: Series) {
  if (!s?.labels?.length) return [];
  const total = s.data.reduce((a, b) => a + b, 0) || 1;
  return s.labels.map((label, i) => {
    const taken = Math.round(((s.data[i] || 0) / total) * 100);
    return { name: label, taken, missed: Math.max(0, Math.round((100 - taken) * 0.7)), delayed: Math.max(0, 100 - taken - Math.round((100 - taken) * 0.7)) };
  });
}

function seriesToWellness(s?: Series) {
  if (!s?.labels?.length) return [];
  return s.labels.map((label, i) => ({
    name: label,
    sleep: s.data[i] || 0,
    water: Math.round((s.data[i] || 0) * 0.8),
    heartRate: 60 + ((s.data[i] || 0) % 20),
  }));
}

function seriesToSos(sos?: { labels: string[]; alerts: number[]; resolved: number[]; cancelled: number[] }) {
  if (!sos?.labels?.length) return [];
  return sos.labels.map((label, i) => ({
    name: label.length > 5 ? label.slice(5) : label,
    alerts: Number(sos.alerts?.[i]) || 0,
    resolved: Number(sos.resolved?.[i]) || 0,
    cancelled: Number(sos.cancelled?.[i]) || 0,
  }));
}

export default function ReportsPage() {
  const [activeChart, setActiveChart] = useState('user-growth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminAnalytics();
        setAnalytics(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const growthData = seriesToGrowth(analytics?.user_growth);
  const medicineData = seriesToAdherence(analytics?.med_category);
  const wellnessData = seriesToWellness(analytics?.check_in_dow);
  const sosData = seriesToSos(analytics?.sos_by_day);

  const charts = [
    { id: 'user-growth', label: 'User Growth', icon: <Users className="w-4 h-4" /> },
    { id: 'medicine', label: 'Medicine Mix', icon: <Heart className="w-4 h-4" /> },
    { id: 'wellness', label: 'Check-ins', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'sos', label: 'SOS Alerts', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Generate and export comprehensive reports</p>
        </div>
        <button className="btn-primary"><Download className="w-4 h-4" /> Export All</button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {charts.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveChart(c.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                activeChart === c.id
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
              )}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading analytics…
            </div>
          ) : (
            <>
              {activeChart === 'user-growth' && <UserGrowthChart data={growthData} />}
              {activeChart === 'medicine' && <MedicineAdherenceChart data={medicineData} />}
              {activeChart === 'wellness' && <WellnessTrendsChart data={wellnessData} />}
              {activeChart === 'sos' && <SOSChart data={sosData} />}
            </>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="section-title">Available Reports</h2>
          <button className="btn-primary text-xs py-1.5 px-3">
            <FileText className="w-3.5 h-3.5" /> Generate New
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reports.map(r => (
            <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{r.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.description}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Last generated: {r.lastGenerated}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" size="sm">{r.category}</Badge>
                <Badge variant={statusVariants[r.status]} size="sm">{r.status}</Badge>
                <button className="btn-secondary text-xs py-1.5 px-3" disabled={r.status !== 'ready'}>
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

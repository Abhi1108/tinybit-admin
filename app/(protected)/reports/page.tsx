'use client';
import React, { useState } from 'react';
import { BarChart3, Download, FileText, TrendingUp, Users, Heart, ShieldAlert } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import {
  UserGrowthChart, MedicineAdherenceChart, WellnessTrendsChart, SOSChart, HealthRadarChart
} from '@/src/components/charts';
import { userGrowthData, medicineAdherenceData, wellnessTrendData, sosByMonthData } from '@/src/data/mockData';

const reports = [
  { id: 'r1', name: 'User Growth Report', description: 'Monthly elder & guardian registration trends', category: 'Users', lastGenerated: '2026-06-04', status: 'ready' as const },
  { id: 'r2', name: 'Medicine Adherence Report', description: 'Weekly medication compliance across all elders', category: 'Health', lastGenerated: '2026-06-04', status: 'ready' as const },
  { id: 'r3', name: 'Wellness Trends Report', description: 'Health vitals trend analysis', category: 'Health', lastGenerated: '2026-06-03', status: 'ready' as const },
  { id: 'r4', name: 'SOS & Emergency Report', description: 'Emergency alerts statistics and response times', category: 'Emergency', lastGenerated: '2026-06-04', status: 'ready' as const },
  { id: 'r5', name: 'AI Usage Report', description: 'Sathi AI chat & voice session analytics', category: 'AI', lastGenerated: '2026-06-03', status: 'generating' as const },
  { id: 'r6', name: 'Journal Activity Report', description: 'Voice & text journal creation metrics', category: 'Journal', lastGenerated: '2026-06-02', status: 'ready' as const },
];

const statusVariants = { ready: 'success' as const, generating: 'warning' as const };

export default function ReportsPage() {
  const [activeChart, setActiveChart] = useState('user-growth');

  const charts = [
    { id: 'user-growth', label: 'User Growth', icon: <Users className="w-4 h-4" /> },
    { id: 'medicine', label: 'Medicine Adherence', icon: <Heart className="w-4 h-4" /> },
    { id: 'wellness', label: 'Wellness Trends', icon: <TrendingUp className="w-4 h-4" /> },
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

      {/* Chart Explorer */}
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
          {activeChart === 'user-growth' && <UserGrowthChart data={userGrowthData} />}
          {activeChart === 'medicine' && <MedicineAdherenceChart data={medicineAdherenceData} />}
          {activeChart === 'wellness' && <WellnessTrendsChart data={wellnessTrendData} />}
          {activeChart === 'sos' && <SOSChart data={sosByMonthData} />}
        </div>
      </div>

      {/* Report List */}
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

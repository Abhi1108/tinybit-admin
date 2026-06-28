'use client';
import React, { useState } from 'react';
import { ShieldAlert, MapPin, Clock, User, Phone, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import { Badge, SeverityBadge, StatusBadge, cn } from '@/src/components/ui';
import { sosAlerts } from '@/src/data/mockData';

const statusConfig = {
  active: { label: 'Active', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', dot: 'bg-red-500 animate-pulse' },
  escalated: { label: 'Escalated', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  false_alarm: { label: 'False Alarm', bg: 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
};

export default function SOSAlertsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = sosAlerts.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter;
    const matchSearch = s.elderName.toLowerCase().includes(search.toLowerCase()) ||
      s.location.address.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: sosAlerts.length,
    active: sosAlerts.filter(s => s.status === 'active').length,
    escalated: sosAlerts.filter(s => s.status === 'escalated').length,
    resolved: sosAlerts.filter(s => s.status === 'resolved').length,
    false_alarm: sosAlerts.filter(s => s.status === 'false_alarm').length,
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" /> SOS Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {counts.active} active · {counts.escalated} escalated
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'active', 'escalated', 'resolved', 'false_alarm'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
              filter === s
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
            )}
          >
            {s === 'all' ? 'All' : s === 'false_alarm' ? 'False Alarm' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none w-40 text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.map(alert => {
          const config = statusConfig[alert.status];
          return (
            <div key={alert.id} className={cn('card border p-5 rounded-xl', config.bg)}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    <span className={cn('w-3 h-3 rounded-full inline-block', config.dot)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{alert.elderName}</h3>
                      <SeverityBadge severity={alert.severity} />
                      <Badge variant={alert.status === 'active' ? 'danger' : alert.status === 'resolved' ? 'success' : alert.status === 'escalated' ? 'warning' : 'default'}>
                        {config.label}
                      </Badge>
                    </div>
                    {alert.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{alert.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {alert.location.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {new Date(alert.time).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Guardian: {alert.guardianName}
                      </span>
                    </div>
                    {alert.resolvedAt && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        ✓ Resolved at {new Date(alert.resolvedAt).toLocaleTimeString()} by {alert.resolvedBy}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {alert.status === 'active' && (
                    <>
                      <button className="btn-danger text-xs py-1.5 px-3">Escalate</button>
                      <button className="btn-secondary text-xs py-1.5 px-3 border-emerald-300 text-emerald-700 hover:bg-emerald-50">Resolve</button>
                    </>
                  )}
                  <button className="btn-secondary text-xs py-1.5 px-3">
                    <MapPin className="w-3.5 h-3.5" /> Map
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card py-16 text-center text-slate-400">No alerts found</div>
        )}
      </div>
    </div>
  );
}

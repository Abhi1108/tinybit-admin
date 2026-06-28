'use client';
import React from 'react';
import { Bot, MessageSquare, Mic, DollarSign, TrendingUp } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { aiSessions, aiUsageData } from '@/src/data/mockData';
import { AIUsageChart } from '@/src/components/charts';

export default function AIUsagePage() {
  const totalCost = aiSessions.reduce((s, a) => s + a.cost, 0);
  const totalTokens = aiSessions.reduce((s, a) => s + a.tokensUsed, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">AI Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Sathi AI usage analytics & sessions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: aiSessions.length, icon: <Bot className="w-5 h-5" />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Total Tokens', value: totalTokens.toLocaleString(), icon: <TrendingUp className="w-5 h-5" />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Voice Sessions', value: aiSessions.filter(a => a.sessionType === 'voice').length, icon: <Mic className="w-5 h-5" />, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
          { label: 'Total Cost', value: `$${totalCost.toFixed(2)}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(s => (
          <div key={s.label} className={cn('card p-4', s.bg)}>
            <div className={cn('mb-2', s.color)}>{s.icon}</div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-4">Daily Usage — This Week</h2>
        <AIUsageChart data={aiUsageData} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="section-title">Recent AI Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Elder</th>
                <th className="table-header">Type</th>
                <th className="table-header">Duration</th>
                <th className="table-header">Tokens</th>
                <th className="table-header">Cost</th>
                <th className="table-header">Sentiment</th>
                <th className="table-header">Model</th>
                <th className="table-header">Time</th>
              </tr>
            </thead>
            <tbody>
              {aiSessions.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="table-cell font-medium text-slate-900 dark:text-white text-sm">{s.elderName}</td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1.5 text-sm">
                      {s.sessionType === 'voice' ? <Mic className="w-3.5 h-3.5 text-teal-500" /> : <MessageSquare className="w-3.5 h-3.5 text-brand-500" />}
                      {s.sessionType}
                    </span>
                  </td>
                  <td className="table-cell text-sm">{s.duration}m</td>
                  <td className="table-cell text-sm">{s.tokensUsed.toLocaleString()}</td>
                  <td className="table-cell text-sm text-emerald-600 font-medium">${s.cost.toFixed(2)}</td>
                  <td className="table-cell">
                    <Badge variant={s.sentiment === 'positive' ? 'success' : s.sentiment === 'negative' ? 'danger' : 'default'} size="sm">
                      {s.sentiment}
                    </Badge>
                  </td>
                  <td className="table-cell text-xs text-slate-500">{s.model}</td>
                  <td className="table-cell text-xs text-slate-500">{new Date(s.startTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

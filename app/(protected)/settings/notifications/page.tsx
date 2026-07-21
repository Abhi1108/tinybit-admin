'use client';

import React, { useState } from 'react';
import { Bell, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/src/components/ui';

export default function NotificationSettingsPage() {
  const [push, setPush] = useState({ sos: true, userRegistration: true, paymentFailed: true, lowTokens: false });
  const [email, setEmail] = useState({ weeklyReport: true, paymentReceipt: true, supportEscalation: true, systemAlerts: false });
  const [senderName, setSenderName] = useState('TinyBit Health');
  const [senderEmail, setSenderEmail] = useState('no-reply@tinybit.care');

  function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn('relative w-11 h-6 rounded-full transition-colors duration-200', value ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700')}
      >
        <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200', value && 'translate-x-5')} />
      </button>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-500" /> Notification Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure when and how admin notifications are sent
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Settings are not persisted</p>
          <p className="mt-1 text-amber-700 dark:text-amber-400">
            There is no admin notification-config table yet. Toggles below are UI-only and reset on refresh.
          </p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-4">Admin Push Alerts</h2>
        <div className="space-y-0">
          {[
            { key: 'sos', label: 'New SOS Alert', desc: 'Immediately notify on every new SOS event' },
            { key: 'userRegistration', label: 'New User Registered', desc: 'Daily digest of new user sign-ups' },
            { key: 'paymentFailed', label: 'Payment Failed', desc: 'Alert when a subscription payment fails' },
            { key: 'lowTokens', label: 'AI Token Threshold', desc: 'Alert when monthly token usage exceeds 80%' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <Toggle
                value={push[item.key as keyof typeof push]}
                onToggle={() => setPush((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-4">Admin Email Alerts</h2>
        <div className="space-y-0">
          {[
            { key: 'weeklyReport', label: 'Weekly Platform Report', desc: 'Summary of KPIs, SOS events, and revenue' },
            { key: 'paymentReceipt', label: 'Payment Receipts', desc: 'Send receipt emails to users on successful payment' },
            { key: 'supportEscalation', label: 'Support Escalations', desc: 'Email admin when a ticket is escalated' },
            { key: 'systemAlerts', label: 'System Alerts', desc: 'Server downtime and API error notifications' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <Toggle
                value={email[item.key as keyof typeof email]}
                onToggle={() => setEmail((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-4">Email Sender Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sender Name</label>
            <input className="input-field" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sender Email</label>
            <input className="input-field" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
          </div>
        </div>
      </div>

      <button type="button" className="btn-primary opacity-60 cursor-not-allowed" disabled title="Not persisted yet">
        <Save className="w-4 h-4" /> Save Settings (unavailable)
      </button>
    </div>
  );
}

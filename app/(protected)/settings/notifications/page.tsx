'use client';
import React, { useState } from 'react';
import { Bell, Save } from 'lucide-react';
import { cn } from '@/src/components/ui';

export default function NotificationSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [push, setPush] = useState({ sos: true, userRegistration: true, paymentFailed: true, lowTokens: false });
  const [email, setEmail] = useState({ weeklyReport: true, paymentReceipt: true, supportEscalation: true, systemAlerts: false });
  const [senderName, setSenderName] = useState('TinyBit Health');
  const [senderEmail, setSenderEmail] = useState('no-reply@tinybit.care');

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
    return (
      <button
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
        <h1 className="page-title flex items-center gap-2"><Bell className="w-6 h-6 text-amber-500" /> Notification Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure when and how admin notifications are sent</p>
      </div>

      {/* Push Notifications */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Admin Push Alerts</h2>
        <div className="space-y-0">
          {[
            { key: 'sos', label: 'New SOS Alert', desc: 'Immediately notify on every new SOS event' },
            { key: 'userRegistration', label: 'New User Registered', desc: 'Daily digest of new user sign-ups' },
            { key: 'paymentFailed', label: 'Payment Failed', desc: 'Alert when a subscription payment fails' },
            { key: 'lowTokens', label: 'AI Token Threshold', desc: 'Alert when monthly token usage exceeds 80%' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <Toggle value={push[item.key as keyof typeof push]} onToggle={() => setPush(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Email Notifications */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Admin Email Alerts</h2>
        <div className="space-y-0">
          {[
            { key: 'weeklyReport', label: 'Weekly Platform Report', desc: 'Summary of KPIs, SOS events, and revenue' },
            { key: 'paymentReceipt', label: 'Payment Receipts', desc: 'Send receipt emails to users on successful payment' },
            { key: 'supportEscalation', label: 'Support Escalations', desc: 'Email admin when a ticket is escalated' },
            { key: 'systemAlerts', label: 'System Alerts', desc: 'Server downtime and API error notifications' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <Toggle value={email[item.key as keyof typeof email]} onToggle={() => setEmail(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Sender Config */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Email Sender Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sender Name</label>
            <input type="text" className="input-field" value={senderName} onChange={e => setSenderName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sender Email</label>
            <input type="email" className="input-field" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary px-6">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

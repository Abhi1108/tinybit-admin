'use client';
import React, { useState } from 'react';
import { Bell, Plus, Send, Users } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { notifications } from '@/src/data/mockData';

const pushNotifications = notifications.filter(n => n.type === 'push');

const statusVariants: Record<string, 'success' | 'info' | 'default' | 'danger'> = {
  sent: 'success',
  scheduled: 'info',
  draft: 'default',
  failed: 'danger',
};

export default function PushNotificationsPage() {
  const [compose, setCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Bell className="w-6 h-6 text-brand-500" /> Push Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Send and manage mobile push notifications</p>
        </div>
        <button className="btn-primary" onClick={() => setCompose(true)}>
          <Plus className="w-4 h-4" /> Send Notification
        </button>
      </div>

      {/* Compose Panel */}
      {compose && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
          <h2 className="section-title mb-4">New Push Notification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
              <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Audience</label>
              <select className="input-field" value={target} onChange={e => setTarget(e.target.value)}>
                <option value="all">All Users</option>
                <option value="elders">Elders Only</option>
                <option value="guardians">Guardians Only</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
            <textarea className="input-field h-24 resize-none" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your notification message..." />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setCompose(false)}>Cancel</button>
            <button className="btn-primary"><Send className="w-4 h-4" /> Send Now</button>
          </div>
        </div>
      )}

      {/* Notification History */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="section-title">Push History</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {pushNotifications.map(n => (
            <div key={n.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{n.title}</p>
                      <Badge variant={statusVariants[n.status]} size="sm">{n.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1.5">{n.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {n.recipientCount.toLocaleString()} recipients</span>
                      {n.openRate && <span className="text-emerald-600 font-medium">{n.openRate}% open rate</span>}
                      <span>{n.sentAt ? `Sent ${new Date(n.sentAt).toLocaleDateString('en-IN')}` : 'Draft'}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">by {n.createdBy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

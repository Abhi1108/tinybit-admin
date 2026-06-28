'use client';
import React, { useState } from 'react';
import { Mail, Plus, Send, Users } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { notifications } from '@/src/data/mockData';

const emailNotifications = notifications.filter(n => n.type === 'email');

const statusVariants: Record<string, 'success' | 'info' | 'default' | 'danger'> = {
  sent: 'success',
  scheduled: 'info',
  draft: 'default',
  failed: 'danger',
};

export default function EmailManagementPage() {
  const [compose, setCompose] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Mail className="w-6 h-6 text-brand-500" /> Email Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Transactional and broadcast email management</p>
        </div>
        <button className="btn-primary" onClick={() => setCompose(true)}>
          <Plus className="w-4 h-4" /> Compose Email
        </button>
      </div>

      {compose && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
          <h2 className="section-title mb-4">New Email</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
              <input type="text" className="input-field" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Recipients</label>
              <select className="input-field" value={target} onChange={e => setTarget(e.target.value)}>
                <option value="all">All Users</option>
                <option value="elders">Elders Only</option>
                <option value="guardians">Guardians Only</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Body</label>
            <textarea className="input-field h-32 resize-none" value={body} onChange={e => setBody(e.target.value)} placeholder="Write your email content..." />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setCompose(false)}>Cancel</button>
            <button className="btn-secondary">Save as Draft</button>
            <button className="btn-primary"><Send className="w-4 h-4" /> Send Now</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="section-title">Email History</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {emailNotifications.map(n => (
            <div key={n.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
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
                      <span>{n.sentAt ? `Sent ${new Date(n.sentAt).toLocaleDateString('en-IN')}` : n.scheduledAt ? `Scheduled ${new Date(n.scheduledAt).toLocaleDateString('en-IN')}` : 'Draft'}</span>
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

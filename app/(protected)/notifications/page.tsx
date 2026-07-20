'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Plus, Send, Clock, Mail, MessageSquare, Users, Loader2, AlertCircle } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import {
  broadcastMessage,
  getAdminNotifications,
  type AdminNotification,
} from '@/src/services/adminApi';

const typeIcons: Record<string, React.ReactNode> = {
  push: <Bell className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
  announcement: <Bell className="w-4 h-4" />,
  in_app: <Bell className="w-4 h-4" />,
};

interface HistoryItem {
  id: string;
  title: string;
  message: string;
  type: string;
  status: 'sent' | 'scheduled' | 'draft' | 'failed';
  recipientCount: number;
  sentAt: string | null;
  createdBy: string;
}

function groupBroadcasts(rows: AdminNotification[]): HistoryItem[] {
  const map = new Map<string, HistoryItem>();
  for (const n of rows) {
    const key = `${n.title}||${n.body}||${n.created_at?.slice(0, 16) || ''}`;
    const existing = map.get(key);
    if (existing) {
      existing.recipientCount += 1;
      continue;
    }
    map.set(key, {
      id: n.id,
      title: n.title,
      message: n.body,
      type: n.type === 'announcement' ? 'push' : n.type || 'push',
      status: 'sent',
      recipientCount: 1,
      sentAt: n.created_at,
      createdBy: 'Admin',
    });
  }
  return Array.from(map.values());
}

export default function NotificationsPage() {
  const [compose, setCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [type, setType] = useState('push');
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminNotifications({ limit: 100 });
      if (res.success) setItems(groupBroadcasts(res.notifications || []));
      else setError(res.error || 'Failed to load notifications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      setError('Please fill in both title and message.');
      return;
    }
    if (type !== 'push') {
      setError('Only push broadcasts are supported today (email/SMS not wired).');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await broadcastMessage(message, title);
      if (res.success) {
        setCompose(false);
        setTitle('');
        setMessage('');
        await load();
      } else {
        setError('Failed to broadcast notification.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending broadcast.');
    } finally {
      setSending(false);
    }
  }

  const visible = useMemo(() => items, [items]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage push, email & SMS notifications</p>
        </div>
        <button className="btn-primary" onClick={() => { setCompose(true); setError(null); }}>
          <Plus className="w-4 h-4" /> Compose Notification
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      {compose && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
          <h2 className="section-title mb-4">New Notification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
              <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..." />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                  <option value="push">Push</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target</label>
                <select className="input-field" value={target} onChange={e => setTarget(e.target.value)}>
                  <option value="all">All Users</option>
                  <option value="elders">Elders Only</option>
                  <option value="guardians">Guardians Only</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
            <textarea className="input-field h-24 resize-none" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your notification message..." />
          </div>
          {target !== 'all' && (
            <p className="text-xs text-amber-600 mb-3">Audience filters are not applied yet — broadcasts go to all users.</p>
          )}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setCompose(false)}>Cancel</button>
            <button className="btn-secondary" disabled title="Scheduling not available yet">
              <Clock className="w-4 h-4" /> Schedule
            </button>
            <button className="btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Now
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="section-title">Notification History</h2>
        </div>
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map(n => (
              <div key={n.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                      {typeIcons[n.type] || typeIcons.push}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{n.title}</p>
                        <Badge variant="success" size="sm">{n.status}</Badge>
                        <Badge variant="default" size="sm">{n.type}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1.5">{n.message}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className={cn('flex items-center gap-1')}><Users className="w-3 h-3" /> {n.recipientCount.toLocaleString()} recipients</span>
                        <span>{n.sentAt ? `Sent ${new Date(n.sentAt).toLocaleDateString()}` : '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">by {n.createdBy}</span>
                  </div>
                </div>
              </div>
            ))}
            {visible.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">No notifications found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

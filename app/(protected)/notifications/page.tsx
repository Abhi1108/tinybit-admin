'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Plus, Send, Users, Loader2, AlertCircle } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import {
  broadcastMessage,
  getAdminNotifications,
  type AdminNotification,
} from '@/src/services/adminApi';

interface HistoryItem {
  id: string;
  title: string;
  message: string;
  type: string;
  status: 'sent';
  recipientCount: number;
  readCount: number;
  sentAt: string | null;
}

function groupBroadcasts(rows: AdminNotification[]): HistoryItem[] {
  const map = new Map<string, HistoryItem>();
  for (const n of rows) {
    const key = `${n.title}||${n.body}||${n.created_at?.slice(0, 16) || ''}`;
    const existing = map.get(key);
    if (existing) {
      existing.recipientCount += 1;
      if (n.read) existing.readCount += 1;
      continue;
    }
    map.set(key, {
      id: n.id,
      title: n.title,
      message: n.body,
      type: n.type || 'announcement',
      status: 'sent',
      recipientCount: 1,
      readCount: n.read ? 1 : 0,
      sentAt: n.created_at,
    });
  }
  return Array.from(map.values());
}

export default function NotificationsPage() {
  const [compose, setCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'elders' | 'guardians'>('all');
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminNotifications({ limit: 100, type: 'announcement' });
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
    setSending(true);
    setError(null);
    try {
      const res = await broadcastMessage(message, title, target);
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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            In-app inbox broadcasts (email/SMS not available)
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setCompose(true); setError(null); }}>
          <Plus className="w-4 h-4" /> Compose Broadcast
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      {compose && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
          <h2 className="section-title mb-4">New In-App Broadcast</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
              <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target</label>
              <select className="input-field" value={target} onChange={(e) => setTarget(e.target.value as typeof target)}>
                <option value="all">All Users</option>
                <option value="elders">Elders Only</option>
                <option value="guardians">Guardians Only</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
            <textarea className="input-field h-24 resize-none" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your notification message..." />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setCompose(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Now
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="section-title">Broadcast History</h2>
        </div>
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((n) => {
              const readRate = n.recipientCount
                ? Math.round((n.readCount / n.recipientCount) * 100)
                : 0;
              return (
                <div key={n.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{n.title}</p>
                          <Badge variant="success" size="sm">{n.status}</Badge>
                          <Badge variant="default" size="sm">{n.type}</Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1.5">{n.message}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className={cn('flex items-center gap-1')}>
                            <Users className="w-3 h-3" /> {n.recipientCount.toLocaleString()} recipients
                          </span>
                          <span>{readRate}% read</span>
                          <span>{n.sentAt ? `Sent ${new Date(n.sentAt).toLocaleString()}` : '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {visible.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">No notifications found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

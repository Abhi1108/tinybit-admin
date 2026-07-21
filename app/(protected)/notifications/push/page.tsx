'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Plus, Send, Users, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/src/components/ui';
import { broadcastMessage, getAdminNotifications, type AdminNotification } from '@/src/services/adminApi';

interface HistoryItem {
  id: string;
  title: string;
  message: string;
  status: string;
  sentAt: string;
  recipientCount: number;
  readCount: number;
}

function groupBroadcasts(rows: AdminNotification[]): HistoryItem[] {
  const map = new Map<string, HistoryItem>();
  for (const n of rows) {
    const bucket = `${n.title}::${(n.created_at || '').slice(0, 16)}`;
    const existing = map.get(bucket);
    if (existing) {
      existing.recipientCount += 1;
      if (n.read) existing.readCount += 1;
    } else {
      map.set(bucket, {
        id: n.id,
        title: n.title,
        message: n.body,
        status: 'sent',
        sentAt: n.created_at,
        recipientCount: 1,
        readCount: n.read ? 1 : 0,
      });
    }
  }
  return Array.from(map.values());
}

export default function PushNotificationsPage() {
  const [compose, setCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'elders' | 'guardians'>('all');
  const [localNotifications, setLocalNotifications] = useState<HistoryItem[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getAdminNotifications({ limit: 100, type: 'announcement' });
      if (res.success) {
        setLocalNotifications(groupBroadcasts(res.notifications || []));
      }
    } catch (err) {
      console.error('Failed to load notification history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      setError('Please fill in both title and message.');
      return;
    }
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await broadcastMessage(message, title, target);
      if (res && res.success) {
        setSuccess(`In-app broadcast sent to ${res.sent.toLocaleString()} user(s) (${res.audience || target}).`);
        setCompose(false);
        setTitle('');
        setMessage('');
        await loadHistory();
      } else {
        setError('Failed to broadcast notification.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending broadcast.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-500" /> Push Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Broadcast in-app inbox announcements (not Expo device push)
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => { setCompose(true); setError(null); setSuccess(null); }}
        >
          <Plus className="w-4 h-4" /> Send Broadcast
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
        <span>
          Admin broadcast writes rows to the <code className="text-xs">notifications</code> inbox for
          each user. Device push (Expo) is used for SOS and other app events, not this admin send.
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
          <span>{success}</span>
        </div>
      )}

      {compose && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
          <h2 className="section-title mb-4">New In-App Broadcast</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
              <input
                type="text"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title..."
                disabled={sending}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Audience</label>
              <select
                className="input-field"
                value={target}
                onChange={(e) => setTarget(e.target.value as typeof target)}
                disabled={sending}
              >
                <option value="all">All Users</option>
                <option value="elders">Elders Only</option>
                <option value="guardians">Guardians Only</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
            <textarea
              className="input-field h-24 resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification message..."
              disabled={sending}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setCompose(false)} disabled={sending}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Now</>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="section-title">Broadcast History</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading && (
            <div className="px-5 py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading history…
            </div>
          )}
          {!loading && localNotifications.map((n) => {
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
                        <Badge variant="default" size="sm">in-app</Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1.5">{n.message}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
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
          {!loading && localNotifications.length === 0 && (
            <div className="px-5 py-12 text-center text-slate-400 text-sm">No broadcasts yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

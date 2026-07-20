'use client';
import React, { useEffect, useState } from 'react';
import { Gift, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Badge, Modal, Button, Input } from '@/src/components/ui';
import {
  getAdminCareEvents,
  createAdminCareEvent,
  deleteAdminCareEvent,
  getAdminUsers,
} from '@/src/services/adminApi';

interface CareEvent {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  sub: string;
  time: string;
  type: string;
  date: number;
  month: string;
  year: number;
  created_at: string;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function FamilyEventsPage() {
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [elders, setElders] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formUserId, setFormUserId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSub, setFormSub] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eldersRes, eventsRes] = await Promise.all([
        getAdminUsers({ role: 'elder', limit: 100 }),
        getAdminCareEvents({ limit: 100, type: 'Family' }),
      ]);
      setElders((eldersRes.users || []).map((u: any) => ({ id: u.id, full_name: u.full_name || 'Unknown' })));
      setEvents(eventsRes.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId || !formTitle || !formDate) return;
    setSaving(true);
    try {
      const d = new Date(formDate);
      await createAdminCareEvent({
        user_id: formUserId,
        title: formTitle,
        sub: formSub,
        time: formTime,
        type: 'Family',
        color: '#4A90E2',
        emoji: '❤️',
        date: d.getDate(),
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        timestamp: d.getTime(),
      });
      setShowAdd(false);
      setFormTitle('');
      setFormSub('');
      setFormDate('');
      setFormTime('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this family event?')) return;
    await deleteAdminCareEvent(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Gift className="w-6 h-6 text-brand-500" /> Family Events</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Care calendar events of type Family</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Event</button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.map(ev => (
              <div key={ev.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{ev.title}</p>
                    <Badge variant="info" size="sm">Family</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{ev.user_name} · {ev.month} {ev.date}, {ev.year} {ev.time && `· ${ev.time}`}</p>
                  {ev.sub && <p className="text-xs text-slate-400 mt-0.5">{ev.sub}</p>}
                </div>
                <button className="p-2 hover:bg-red-50 rounded" onClick={() => handleDelete(ev.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
            {events.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">No family events</div>}
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Family Event">
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Elder</label>
            <select className="input-field" value={formUserId} onChange={e => setFormUserId(e.target.value)} required>
              <option value="">Select elder…</option>
              {elders.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
          </div>
          <Input label="Title" value={formTitle} onChange={e => setFormTitle(e.target.value)} required />
          <Input label="Subtitle" value={formSub} onChange={e => setFormSub(e.target.value)} />
          <Input label="Date" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
          <Input label="Time" value={formTime} onChange={e => setFormTime(e.target.value)} placeholder="10:00 AM" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

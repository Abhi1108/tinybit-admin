'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Clock, Plus, Trash2, Loader2, AlertCircle,
  Heart, Activity as ActivityIcon, Stethoscope, User, HelpCircle, BellRing
} from 'lucide-react';
import {
  Modal, Button, Input
} from '@/src/components/ui';
import {
  getAdminCareEvents,
  createAdminCareEvent,
  deleteAdminCareEvent,
  getAdminUsers
} from '@/src/services/adminApi';

interface CareEvent {
  id: string;
  user_id: string;
  title: string;
  sub: string;
  time: string;
  type: string;
  color: string;
  emoji: string;
  date: number;
  month: string;
  year: number;
  timestamp: number;
  created_at: string;
  user_name: string;
}

interface ElderUser {
  id: string;
  full_name: string;
  email: string;
}

const CATEGORIES = [
  { type: 'Doctor', color: '#DB5461', emoji: '🏥', icon: Stethoscope },
  { type: 'Family', color: '#4A90E2', emoji: '❤️', icon: Heart },
  { type: 'Therapy', color: '#9B5DE5', emoji: '🧘', icon: HelpCircle },
  { type: 'Activity', color: '#2EC4B6', emoji: '🏃‍♂️', icon: ActivityIcon }
];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CareCalendarPage() {
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [elders, setElders] = useState<ElderUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedElderId, setSelectedElderId] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formUserId, setFormUserId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSub, setFormSub] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formType, setFormType] = useState('Doctor');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch connected elders for selection dropdown
      const eldersRes = await getAdminUsers({ role: 'elder', limit: 100 });
      const mappedElders = (eldersRes.users || []).map((u: any) => ({
        id: u.id,
        full_name: u.full_name || 'Unknown Elder',
        email: u.email || 'no-email@example.com'
      }));
      setElders(mappedElders);

      // 2. Fetch care events
      const eventsRes = await getAdminCareEvents({
        limit: 100,
        user_id: selectedElderId === 'All' ? undefined : selectedElderId,
        type: selectedType === 'All' ? undefined : selectedType
      });
      setEvents(eventsRes.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred loading calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedElderId, selectedType]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this care event? Elder and Guardians will receive a cancellation alert.')) return;
    try {
      const res = await deleteAdminCareEvent(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Failed to delete event');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting event');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId || !formTitle || !formDate || !formTime) {
      alert('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const categoryObj = CATEGORIES.find(c => c.type === formType) || CATEGORIES[0];
      const parsedDate = new Date(formDate);
      const eventPayload = {
        user_id: formUserId,
        title: formTitle,
        sub: formSub,
        time: formTime,
        type: formType,
        color: categoryObj.color,
        emoji: categoryObj.emoji,
        date: parsedDate.getDate(),
        month: monthNames[parsedDate.getMonth()],
        year: parsedDate.getFullYear(),
        timestamp: parsedDate.getTime()
      };

      const res = await createAdminCareEvent(eventPayload);
      if (res.success) {
        setShowAddModal(false);
        // Reset form
        setFormUserId('');
        setFormTitle('');
        setFormSub('');
        setFormDate('');
        setFormTime('');
        setFormType('Doctor');
        loadData();
      } else {
        alert(res.error || 'Failed to create care event');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-500" /> Care Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Add, update, and manage health checkups, family visits, activities, and therapy schedules.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Care Event
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-5 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Elder Profile</label>
          <select
            className="input-field"
            value={selectedElderId}
            onChange={e => setSelectedElderId(e.target.value)}
          >
            <option value="All">All Elders</option>
            {elders.map(el => (
              <option key={el.id} value={el.id}>{el.full_name} ({el.email})</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-64">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Event Category</label>
          <select
            className="input-field"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Doctor">Doctor (🏥)</option>
            <option value="Family">Family (❤️)</option>
            <option value="Therapy">Therapy (🧘)</option>
            <option value="Activity">Activity (🏃‍♂️)</option>
            <option value="Medicine">Medicine (💊)</option>
            <option value="Wellness">Wellness (🍏)</option>
          </select>
        </div>
      </div>

      {/* Events Listing */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="table-header rounded-tl-xl">Elder</th>
                <th className="table-header">Category</th>
                <th className="table-header">Schedule Time</th>
                <th className="table-header">Title & Event Description</th>
                <th className="table-header">Date Logged</th>
                <th className="table-header rounded-tr-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="table-cell py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading care events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell py-16 text-center text-slate-400 dark:text-slate-500">
                    No scheduled care events found.
                  </td>
                </tr>
              ) : (
                events.map(ev => {
                  const categoryInfo = CATEGORIES.find(c => c.type === ev.type);
                  const IconComponent = categoryInfo?.icon || HelpCircle;

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="table-cell font-semibold text-slate-800 dark:text-slate-200">
                        {ev.user_name}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="p-1 rounded text-white flex items-center justify-center text-xs"
                            style={{ backgroundColor: ev.color || '#94A3B8' }}
                          >
                            {ev.emoji || '📅'}
                          </span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {ev.type}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                          <Clock className="w-3.5 h-3.5" /> {ev.time || '—'}
                        </div>
                      </td>
                      <td className="table-cell">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{ev.title}</p>
                        {ev.sub && <p className="text-xs text-slate-400 mt-0.5">{ev.sub}</p>}
                      </td>
                      <td className="table-cell text-sm text-slate-500">
                        {ev.month} {ev.date}, {ev.year}
                      </td>
                      <td className="table-cell text-right">
                        <button
                          type="button"
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 transition-colors"
                          onClick={() => handleDelete(ev.id)}
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Schedule New Care Event"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Scheduling...' : 'Create Event'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg text-xs text-brand-700 flex items-start gap-2">
              <BellRing className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Instant Alert:</strong> Creating this event will immediately generate a push-alert & notification record in the feeds of the selected Elder and all connected Guardians.
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Assign to Elder *
              </label>
              <select
                className="input-field"
                required
                value={formUserId}
                onChange={e => setFormUserId(e.target.value)}
              >
                <option value="">Select Elder Profile...</option>
                {elders.map(el => (
                  <option key={el.id} value={el.id}>{el.full_name} ({el.email})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Category *
                </label>
                <select
                  className="input-field"
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                >
                  <option value="Doctor">Doctor Visit (🏥)</option>
                  <option value="Family">Family Event (❤️)</option>
                  <option value="Therapy">Therapy (🧘)</option>
                  <option value="Activity">Activity / Exercise (🏃‍♂️)</option>
                </select>
              </div>

              <Input
                label="Scheduled Time * (e.g. 10:00 AM)"
                required
                value={formTime}
                onChange={e => setFormTime(e.target.value)}
                placeholder="10:00 AM"
              />
            </div>

            <Input
              label="Event Title * (e.g. Cardiologist Appointment)"
              required
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="e.g. Doctor Checkup / Board Game Evening"
            />

            <Input
              label="Details / Subtitle (Optional)"
              value={formSub}
              onChange={e => setFormSub(e.target.value)}
              placeholder="e.g. Routine checkup / Walk in Central Park"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Scheduled Date *
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

'use client';
import React, { useState, useMemo } from 'react';
import {
  Clock, Plus, Search, Filter, Download, Bell, Mail, MessageSquare,
  Smartphone, Users, Calendar, RefreshCw, ChevronRight, ChevronLeft,
  Copy, Pause, Play, X, Trash2, Send, Edit2, MoreVertical,
  CheckCircle2, XCircle, AlertTriangle, Info, Zap, BarChart3,
  Globe, Shield, Eye, Save,
} from 'lucide-react';
import { Badge, Avatar, StatCard, Button, Tabs, Pagination, Modal, cn } from '@/src/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────
type ScheduleStatus = 'draft' | 'scheduled' | 'processing' | 'sent' | 'completed' | 'failed' | 'cancelled' | 'paused';
type NotifType = 'Announcement' | 'Promotion' | 'Reminder' | 'Alert' | 'System' | 'Maintenance' | 'Custom';
type RecurrenceType = 'One-Time' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'Custom';
type Channel = 'push' | 'email' | 'sms' | 'in-app';

interface Schedule {
  id: string;
  title: string;
  description: string;
  type: NotifType;
  channels: Channel[];
  audience: string;
  audienceCount: number;
  scheduledAt: string;
  recurrence: RecurrenceType;
  recurrenceDetail: string;
  status: ScheduleStatus;
  createdBy: string;
  createdAt: string;
  sent: number;
  delivered: number;
  failed: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timezone: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SCHEDULES: Schedule[] = [
  { id: 'SCH-001', title: 'Daily Medicine Reminder', description: 'Remind elders to take their morning medications', type: 'Reminder', channels: ['push', 'in-app'], audience: 'All Elder Users', audienceCount: 892, scheduledAt: '2026-06-16T09:00:00Z', recurrence: 'Daily', recurrenceDetail: 'Every day at 9:00 AM', status: 'scheduled', createdBy: 'Rajan Kumar', createdAt: '2026-06-10T11:00:00Z', sent: 17840, delivered: 17622, failed: 218, priority: 'high', timezone: 'Asia/Kolkata' },
  { id: 'SCH-002', title: 'Weekly Health Check-In Prompt', description: 'Encourage elders to complete their weekly health check-in', type: 'Reminder', channels: ['push', 'email'], audience: 'Elder Users', audienceCount: 712, scheduledAt: '2026-06-17T10:00:00Z', recurrence: 'Weekly', recurrenceDetail: 'Every Monday at 10:00 AM', status: 'scheduled', createdBy: 'Amit Shah', createdAt: '2026-06-09T09:00:00Z', sent: 2848, delivered: 2793, failed: 55, priority: 'normal', timezone: 'Asia/Kolkata' },
  { id: 'SCH-003', title: 'Monthly Wellness Report', description: 'Share personalized wellness summary with all users', type: 'Announcement', channels: ['email'], audience: 'All Users', audienceCount: 2840, scheduledAt: '2026-07-01T08:00:00Z', recurrence: 'Monthly', recurrenceDetail: 'First day of every month at 8:00 AM', status: 'scheduled', createdBy: 'Neha Singh', createdAt: '2026-06-08T14:00:00Z', sent: 5680, delivered: 5612, failed: 68, priority: 'normal', timezone: 'Asia/Kolkata' },
  { id: 'SCH-004', title: 'Subscription Renewal Reminder', description: 'Alert users whose subscription expires in 7 days', type: 'Alert', channels: ['push', 'email', 'in-app'], audience: 'Expiring Subscribers', audienceCount: 142, scheduledAt: '2026-06-16T11:00:00Z', recurrence: 'Daily', recurrenceDetail: 'Daily for expiring users (7-day window)', status: 'processing', createdBy: 'Rajan Kumar', createdAt: '2026-06-01T10:00:00Z', sent: 710, delivered: 688, failed: 22, priority: 'urgent', timezone: 'Asia/Kolkata' },
  { id: 'SCH-005', title: 'Sathi AI Feature Launch', description: 'Announce new Sathi AI voice features to all users', type: 'Promotion', channels: ['push', 'email', 'in-app'], audience: 'All Users', audienceCount: 2840, scheduledAt: '2026-06-15T12:00:00Z', recurrence: 'One-Time', recurrenceDetail: '—', status: 'completed', createdBy: 'Neha Singh', createdAt: '2026-06-12T09:00:00Z', sent: 2840, delivered: 2791, failed: 49, priority: 'high', timezone: 'Asia/Kolkata' },
  { id: 'SCH-006', title: 'Server Maintenance Notice', description: 'Inform users about scheduled maintenance window', type: 'Maintenance', channels: ['push', 'in-app'], audience: 'All Users', audienceCount: 2840, scheduledAt: '2026-06-20T02:00:00Z', recurrence: 'One-Time', recurrenceDetail: '—', status: 'scheduled', createdBy: 'Rajan Kumar', createdAt: '2026-06-14T16:00:00Z', sent: 0, delivered: 0, failed: 0, priority: 'urgent', timezone: 'Asia/Kolkata' },
  { id: 'SCH-007', title: 'Guardian Engagement Nudge', description: 'Remind guardians who haven\'t logged in for 7 days', type: 'Reminder', channels: ['push', 'email'], audience: 'Inactive Guardians', audienceCount: 89, scheduledAt: '2026-06-16T14:00:00Z', recurrence: 'Weekly', recurrenceDetail: 'Every Tuesday at 2:00 PM', status: 'scheduled', createdBy: 'Amit Shah', createdAt: '2026-06-11T10:00:00Z', sent: 267, delivered: 261, failed: 6, priority: 'low', timezone: 'Asia/Kolkata' },
  { id: 'SCH-008', title: 'Blood Pressure Check Alert', description: 'Daily reminder for elders with hypertension to log BP', type: 'Alert', channels: ['push'], audience: 'Hypertension Group', audienceCount: 318, scheduledAt: '2026-06-16T08:00:00Z', recurrence: 'Daily', recurrenceDetail: 'Every day at 8:00 AM', status: 'scheduled', createdBy: 'Neha Singh', createdAt: '2026-06-05T09:00:00Z', sent: 3498, delivered: 3421, failed: 77, priority: 'high', timezone: 'Asia/Kolkata' },
  { id: 'SCH-009', title: 'New Year Health Goals', description: 'Motivational message for new year health planning', type: 'Announcement', channels: ['push', 'email'], audience: 'All Users', audienceCount: 2840, scheduledAt: '2026-01-01T07:00:00Z', recurrence: 'Yearly', recurrenceDetail: 'January 1st at 7:00 AM', status: 'sent', createdBy: 'Rajan Kumar', createdAt: '2025-12-20T12:00:00Z', sent: 2762, delivered: 2694, failed: 68, priority: 'normal', timezone: 'Asia/Kolkata' },
  { id: 'SCH-010', title: 'Emergency Contact Update Reminder', description: 'Ask users to verify their emergency contacts', type: 'System', channels: ['in-app', 'email'], audience: 'Incomplete Profiles', audienceCount: 412, scheduledAt: '2026-06-10T09:00:00Z', recurrence: 'One-Time', recurrenceDetail: '—', status: 'failed', createdBy: 'Amit Shah', createdAt: '2026-06-08T10:00:00Z', sent: 289, delivered: 201, failed: 88, priority: 'high', timezone: 'Asia/Kolkata' },
  { id: 'SCH-011', title: 'App Version Upgrade Prompt', description: 'Prompt users running outdated app versions to update', type: 'System', channels: ['push', 'in-app'], audience: 'Outdated App Users', audienceCount: 234, scheduledAt: '2026-06-14T10:00:00Z', recurrence: 'One-Time', recurrenceDetail: '—', status: 'completed', createdBy: 'Rajan Kumar', createdAt: '2026-06-13T14:00:00Z', sent: 234, delivered: 228, failed: 6, priority: 'normal', timezone: 'Asia/Kolkata' },
  { id: 'SCH-012', title: 'Premium Plan Upsell', description: 'Offer free trial of Premium plan to Basic subscribers', type: 'Promotion', channels: ['email', 'in-app'], audience: 'Basic Subscribers', audienceCount: 1240, scheduledAt: '2026-06-25T09:00:00Z', recurrence: 'One-Time', recurrenceDetail: '—', status: 'draft', createdBy: 'Neha Singh', createdAt: '2026-06-15T11:00:00Z', sent: 0, delivered: 0, failed: 0, priority: 'normal', timezone: 'Asia/Kolkata' },
  { id: 'SCH-013', title: 'SOS Alert Test (Internal)', description: 'Internal test of SOS notification pipeline', type: 'Custom', channels: ['push'], audience: 'Support Team', audienceCount: 12, scheduledAt: '2026-06-16T15:00:00Z', recurrence: 'One-Time', recurrenceDetail: '—', status: 'scheduled', createdBy: 'Rajan Kumar', createdAt: '2026-06-15T14:00:00Z', sent: 0, delivered: 0, failed: 0, priority: 'normal', timezone: 'Asia/Kolkata' },
  { id: 'SCH-014', title: 'Quarterly Feedback Survey', description: 'Send survey link for quarterly user satisfaction review', type: 'Custom', channels: ['email', 'in-app'], audience: 'Active Users (>30 days)', audienceCount: 2104, scheduledAt: '2026-07-01T10:00:00Z', recurrence: 'Quarterly', recurrenceDetail: 'First day of each quarter at 10:00 AM', status: 'scheduled', createdBy: 'Amit Shah', createdAt: '2026-06-14T09:00:00Z', sent: 2104, delivered: 2056, failed: 48, priority: 'low', timezone: 'Asia/Kolkata' },
  { id: 'SCH-015', title: 'Profile Completion Reminder', description: 'Nudge users with incomplete profiles to add missing info', type: 'Reminder', channels: ['push', 'email'], audience: 'Incomplete Profiles', audienceCount: 412, scheduledAt: '2026-06-18T11:00:00Z', recurrence: 'Weekly', recurrenceDetail: 'Every Wednesday at 11:00 AM', status: 'paused', createdBy: 'Neha Singh', createdAt: '2026-06-07T10:00:00Z', sent: 824, delivered: 806, failed: 18, priority: 'low', timezone: 'Asia/Kolkata' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) { return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function fmtDateShort(iso: string) { return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }

const CHANNEL_ICONS: Record<Channel, React.ReactNode> = {
  push: <Smartphone className="w-3 h-3" />,
  email: <Mail className="w-3 h-3" />,
  sms: <MessageSquare className="w-3 h-3" />,
  'in-app': <Bell className="w-3 h-3" />,
};
const CHANNEL_LABELS: Record<Channel, string> = { push: 'Push', email: 'Email', sms: 'SMS', 'in-app': 'In-App' };

function StatusBadge({ status }: { status: ScheduleStatus }) {
  const cfg: Record<ScheduleStatus, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
    scheduled: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    processing: { label: 'Processing', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    sent: { label: 'Sent', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    completed: { label: 'Completed', color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
    failed: { label: 'Failed', color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
    paused: { label: 'Paused', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  };
  const c = cfg[status];
  return <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', c.color)}>
    {status === 'processing' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
    {c.label}
  </span>;
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = { low: 'bg-slate-400', normal: 'bg-brand-500', high: 'bg-amber-500', urgent: 'bg-red-500' };
  return <span className={cn('w-2 h-2 rounded-full inline-block', colors[priority])} title={priority} />;
}

const DYNAMIC_VARS = ['{{UserName}}', '{{Email}}', '{{Department}}', '{{Date}}', '{{CompanyName}}', '{{AppName}}', '{{SupportPhone}}'];

const RECURRENCE_OPTIONS = ['One-Time', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Custom'];
const TYPE_OPTIONS: NotifType[] = ['Announcement', 'Promotion', 'Reminder', 'Alert', 'System', 'Maintenance', 'Custom'];
const AUDIENCE_OPTIONS = ['All Users', 'Elder Users', 'Guardian Users', 'Support Team', 'Active Users (>30 days)', 'Inactive Guardians', 'Incomplete Profiles', 'Basic Subscribers', 'Expiring Subscribers', 'Custom Audience'];
const TIMEZONE_OPTIONS = ['Asia/Kolkata', 'UTC', 'Asia/Dubai', 'Europe/London', 'America/New_York'];

// ─── Create Schedule Modal ────────────────────────────────────────────────────
interface ModalState {
  step: number;
  title: string; description: string; category: string; type: NotifType; priority: string;
  channels: Channel[];
  audience: string; audienceCount: string;
  scheduleType: 'one-time' | 'recurring';
  date: string; time: string; timezone: string;
  recurrence: string; recurrenceDetail: string;
  msgTitle: string; msgSubject: string; msgBody: string;
  previewTab: 'push' | 'email' | 'desktop';
}

const EMPTY_MODAL: ModalState = {
  step: 1, title: '', description: '', category: '', type: 'Announcement', priority: 'normal',
  channels: ['push'], audience: 'All Users', audienceCount: '2840',
  scheduleType: 'one-time', date: '', time: '09:00', timezone: 'Asia/Kolkata',
  recurrence: 'Daily', recurrenceDetail: 'Every day at 9:00 AM',
  msgTitle: '', msgSubject: '', msgBody: '', previewTab: 'push',
};

function CreateModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (s: Partial<Schedule>) => void }) {
  const [m, setM] = useState<ModalState>({ ...EMPTY_MODAL });
  const set = (k: Partial<ModalState>) => setM(x => ({ ...x, ...k }));
  const steps = ['Basic Info', 'Audience & Channels', 'Scheduling', 'Message & Preview'];

  function insertVar(v: string) { set({ msgBody: m.msgBody + ' ' + v }); }
  function toggleChannel(c: Channel) { set({ channels: m.channels.includes(c) ? m.channels.filter(x => x !== c) : [...m.channels, c] }); }

  function handleSave() {
    const now = new Date().toISOString();
    onSave({
      title: m.title || 'Untitled Notification', description: m.description, type: m.type,
      channels: m.channels, audience: m.audience, audienceCount: parseInt(m.audienceCount) || 0,
      scheduledAt: m.date ? new Date(`${m.date}T${m.time}`).toISOString() : now,
      recurrence: (m.scheduleType === 'one-time' ? 'One-Time' : m.recurrence) as RecurrenceType,
      recurrenceDetail: m.scheduleType === 'one-time' ? '—' : m.recurrenceDetail,
      status: 'draft', createdBy: 'Rajan Kumar', createdAt: now,
      priority: m.priority as Schedule['priority'], timezone: m.timezone, sent: 0, delivered: 0, failed: 0,
    });
    setM({ ...EMPTY_MODAL });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Scheduled Notification" size="xl">
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-6">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <button onClick={() => set({ step: i + 1 })} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', m.step === i + 1 ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' : m.step > i + 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')}>
              <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold', m.step === i + 1 ? 'bg-brand-600 text-white' : m.step > i + 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500')}>
                {m.step > i + 1 ? '✓' : i + 1}
              </span>
              {s}
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {m.step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Notification Title *</label>
              <input className="input-field" placeholder="e.g. Daily Medicine Reminder" value={m.title} onChange={e => set({ title: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="form-label">Description</label>
              <textarea className="input-field resize-none" rows={2} placeholder="Brief description of this notification..." value={m.description} onChange={e => set({ description: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Notification Type</label>
              <select className="input-field" value={m.type} onChange={e => set({ type: e.target.value as NotifType })}>
                {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select className="input-field" value={m.priority} onChange={e => set({ priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Audience & Channels */}
      {m.step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="form-label mb-2">Delivery Channels (select one or more)</label>
            <div className="grid grid-cols-2 gap-3">
              {(['push', 'email', 'sms', 'in-app'] as Channel[]).map(c => (
                <button key={c} onClick={() => toggleChannel(c)} className={cn('flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left', m.channels.includes(c) ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600')}>
                  <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center', m.channels.includes(c) ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500')}>
                    {CHANNEL_ICONS[c]}
                  </span>
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{CHANNEL_LABELS[c]}</p>
                    <p className="text-xs text-slate-400">{c === 'push' ? 'Mobile devices' : c === 'email' ? 'Inbox delivery' : c === 'sms' ? 'Text message' : 'App banner'}</p>
                  </div>
                  {m.channels.includes(c) && <CheckCircle2 className="w-4 h-4 text-brand-500 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Target Audience</label>
              <select className="input-field" value={m.audience} onChange={e => set({ audience: e.target.value })}>
                {AUDIENCE_OPTIONS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Estimated Reach</label>
              <div className="input-field bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <input type="number" className="bg-transparent outline-none flex-1 text-sm text-slate-700 dark:text-slate-200" value={m.audienceCount} onChange={e => set({ audienceCount: e.target.value })} />
                <span className="text-xs text-slate-400">users</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['Country', 'User Type', 'Activity Status'] as const).map(f => (
              <div key={f}>
                <label className="form-label">{f} Filter</label>
                <select className="input-field"><option>All</option><option>India</option><option>UAE</option></select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Scheduling */}
      {m.step === 3 && (
        <div className="space-y-5">
          <div className="flex gap-3">
            {(['one-time', 'recurring'] as const).map(t => (
              <button key={t} onClick={() => set({ scheduleType: t })} className={cn('flex-1 p-3 rounded-xl border-2 transition-all', m.scheduleType === t ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700')}>
                {t === 'one-time' ? <><Calendar className="w-5 h-5 mx-auto mb-1 text-brand-500" /><p className="text-sm font-medium text-slate-900 dark:text-white">One-Time</p><p className="text-xs text-slate-400">Send once at a specific time</p></> : <><RefreshCw className="w-5 h-5 mx-auto mb-1 text-brand-500" /><p className="text-sm font-medium text-slate-900 dark:text-white">Recurring</p><p className="text-xs text-slate-400">Send on a repeating schedule</p></>}
              </button>
            ))}
          </div>
          {m.scheduleType === 'one-time' ? (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">Date</label>
                <input type="date" className="input-field" value={m.date} onChange={e => set({ date: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Time</label>
                <input type="time" className="input-field" value={m.time} onChange={e => set({ time: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Time Zone</label>
                <select className="input-field" value={m.timezone} onChange={e => set({ timezone: e.target.value })}>
                  {TIMEZONE_OPTIONS.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Frequency</label>
                  <select className="input-field" value={m.recurrence} onChange={e => set({ recurrence: e.target.value })}>
                    {RECURRENCE_OPTIONS.filter(r => r !== 'One-Time').map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Time</label>
                  <input type="time" className="input-field" value={m.time} onChange={e => set({ time: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Time Zone</label>
                  <select className="input-field" value={m.timezone} onChange={e => set({ timezone: e.target.value })}>
                    {TIMEZONE_OPTIONS.map(z => <option key={z}>{z}</option>)}
                  </select>
                </div>
              </div>
              {m.recurrence === 'Custom' && (
                <div>
                  <label className="form-label">Custom Cron Expression</label>
                  <input className="input-field font-mono" placeholder="e.g. 0 9 * * MON-FRI" value={m.recurrenceDetail} onChange={e => set({ recurrenceDetail: e.target.value })} />
                  <p className="text-xs text-slate-400 mt-1">Format: minute hour day month weekday</p>
                </div>
              )}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Next 3 Occurrences</p>
                {['Tomorrow at 9:00 AM IST', 'Day after at 9:00 AM IST', 'In 3 days at 9:00 AM IST'].map((o, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 py-1">
                    <Clock className="w-3 h-3 text-brand-500" /> {o}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Message & Preview */}
      {m.step === 4 && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="form-label">Notification Title</label>
              <input className="input-field" placeholder="Short, attention-grabbing title" value={m.msgTitle} onChange={e => set({ msgTitle: e.target.value })} />
            </div>
            {m.channels.includes('email') && (
              <div>
                <label className="form-label">Email Subject Line</label>
                <input className="input-field" placeholder="Email subject..." value={m.msgSubject} onChange={e => set({ msgSubject: e.target.value })} />
              </div>
            )}
            <div>
              <label className="form-label">Message Body</label>
              <textarea className="input-field resize-none font-mono text-sm" rows={5} placeholder="Write your notification message..." value={m.msgBody} onChange={e => set({ msgBody: e.target.value })} />
            </div>
            <div>
              <p className="form-label mb-2">Dynamic Variables</p>
              <div className="flex flex-wrap gap-1.5">
                {DYNAMIC_VARS.map(v => (
                  <button key={v} onClick={() => insertVar(v)} className="px-2 py-1 text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 rounded-lg border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition-colors font-mono">
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="flex gap-1 mb-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {(['push', 'email', 'desktop'] as const).map(t => (
                <button key={t} onClick={() => set({ previewTab: t })} className={cn('flex-1 py-1 rounded-md text-xs font-medium capitalize transition-colors', m.previewTab === t ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-slate-500')}>
                  {t === 'push' ? 'Mobile Push' : t === 'email' ? 'Email' : 'Desktop'}
                </button>
              ))}
            </div>
            {m.previewTab === 'push' && (
              <div className="bg-slate-900 rounded-2xl p-4 mx-auto max-w-[260px]">
                <div className="bg-slate-800 rounded-xl p-3 mb-3">
                  <p className="text-slate-400 text-[10px] mb-2">09:00 AM • TinyBit</p>
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0"><Bell className="w-4 h-4 text-white" /></div>
                    <div>
                      <p className="text-white text-xs font-semibold">{m.msgTitle || 'Notification Title'}</p>
                      <p className="text-slate-300 text-[10px] mt-0.5 line-clamp-2">{m.msgBody || 'Your message preview will appear here...'}</p>
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 text-[9px] text-center">Mobile Push Preview</p>
              </div>
            )}
            {m.previewTab === 'email' && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500">From: <span className="text-slate-700 dark:text-slate-300">TinyBit &lt;noreply@tinybit.care&gt;</span></p>
                  <p className="text-slate-500">Subject: <span className="font-medium text-slate-700 dark:text-slate-300">{m.msgSubject || m.msgTitle || '(No subject)'}</span></p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900">
                  <div className="bg-brand-600 text-white text-center py-3 rounded-lg mb-3"><p className="font-bold">TinyBit</p></div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">{m.msgTitle || 'Notification Title'}</p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{m.msgBody || 'Your email message preview will appear here.'}</p>
                  <div className="mt-4 text-center"><button className="bg-brand-600 text-white text-xs px-4 py-2 rounded-lg">Open TinyBit App</button></div>
                </div>
              </div>
            )}
            {m.previewTab === 'desktop' && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-lg max-w-xs mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0"><Bell className="w-5 h-5 text-white" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{m.msgTitle || 'Notification'}</p>
                      <p className="text-[10px] text-slate-400">now</p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{m.msgBody || 'Preview message...'}</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 text-center">Desktop Notification Preview</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {m.step > 1 && <Button variant="secondary" icon={<ChevronLeft className="w-4 h-4" />} onClick={() => set({ step: m.step - 1 })}>Back</Button>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {m.step < 4
            ? <Button variant="primary" onClick={() => set({ step: m.step + 1 })}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
            : <>
                <Button variant="secondary" icon={<Save className="w-4 h-4" />} onClick={handleSave}>Save Draft</Button>
                <Button variant="primary" icon={<Calendar className="w-4 h-4" />} onClick={handleSave}>Schedule</Button>
              </>
          }
        </div>
      </div>
    </Modal>
  );
}

// ─── Row Actions Dropdown ─────────────────────────────────────────────────────
function RowActions({ schedule, onAction }: { schedule: Schedule; onAction: (action: string, id: string) => void }) {
  const [open, setOpen] = useState(false);
  const canPause = ['scheduled', 'processing'].includes(schedule.status);
  const canResume = schedule.status === 'paused';
  const canCancel = ['scheduled', 'processing', 'paused'].includes(schedule.status);
  const canDelete = ['draft', 'completed', 'failed', 'cancelled'].includes(schedule.status);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 text-sm">
            {[
              { icon: <Eye className="w-3.5 h-3.5" />, label: 'View Details', action: 'view', show: true },
              { icon: <Edit2 className="w-3.5 h-3.5" />, label: 'Edit', action: 'edit', show: ['draft', 'scheduled'].includes(schedule.status) },
              { icon: <Copy className="w-3.5 h-3.5" />, label: 'Duplicate', action: 'duplicate', show: true },
              { icon: <Send className="w-3.5 h-3.5" />, label: 'Send Now', action: 'send-now', show: ['draft', 'scheduled', 'paused'].includes(schedule.status) },
              { icon: <Pause className="w-3.5 h-3.5" />, label: 'Pause', action: 'pause', show: canPause },
              { icon: <Play className="w-3.5 h-3.5" />, label: 'Resume', action: 'resume', show: canResume },
              { icon: <X className="w-3.5 h-3.5" />, label: 'Cancel', action: 'cancel', show: canCancel },
              { icon: <Trash2 className="w-3.5 h-3.5" />, label: 'Delete', action: 'delete', show: canDelete, danger: true },
            ].filter(a => a.show).map(a => (
              <button key={a.action} onClick={() => { onAction(a.action, schedule.id); setOpen(false); }} className={cn('w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left', a.danger ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300')}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ScheduledNotificationsPage() {
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => schedules.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.audience.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    const matchChannel = channelFilter === 'all' || s.channels.includes(channelFilter as Channel);
    const matchTab = tab === 'all' || (tab === 'upcoming' ? s.status === 'scheduled' : tab === 'recurring' ? s.recurrence !== 'One-Time' : tab === 'failed' ? s.status === 'failed' : true);
    return matchSearch && matchStatus && matchType && matchChannel && matchTab;
  }), [schedules, search, statusFilter, typeFilter, channelFilter, tab]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    total: schedules.length,
    upcoming: schedules.filter(s => s.status === 'scheduled').length,
    sentToday: schedules.filter(s => ['sent', 'completed'].includes(s.status)).length,
    failed: schedules.filter(s => s.status === 'failed').length,
    pending: schedules.filter(s => ['draft', 'scheduled'].includes(s.status)).length,
    recurring: schedules.filter(s => s.recurrence !== 'One-Time').length,
    processing: schedules.filter(s => s.status === 'processing').length,
    totalSent: schedules.reduce((a, s) => a + s.sent, 0),
  }), [schedules]);

  function handleAction(action: string, id: string) {
    setSchedules(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (action === 'pause') return { ...s, status: 'paused' };
      if (action === 'resume') return { ...s, status: 'scheduled' };
      if (action === 'cancel') return { ...s, status: 'cancelled' };
      if (action === 'send-now') return { ...s, status: 'completed', sent: s.audienceCount, delivered: Math.round(s.audienceCount * 0.98), failed: Math.round(s.audienceCount * 0.02) };
      if (action === 'delete') return { ...s, status: 'cancelled' };
      if (action === 'duplicate') { setSchedules(p => [...p, { ...s, id: `SCH-${String(p.length + 1).padStart(3, '0')}`, title: s.title + ' (Copy)', status: 'draft', sent: 0, delivered: 0, failed: 0 }]); return s; }
      return s;
    }));
  }

  function handleExport() {
    const csv = [
      ['Schedule ID', 'Title', 'Type', 'Channels', 'Audience', 'Audience Count', 'Scheduled At', 'Recurrence', 'Status', 'Sent', 'Delivered', 'Failed', 'Created By', 'Created At'],
      ...schedules.map(s => [s.id, s.title, s.type, s.channels.join('+'), s.audience, s.audienceCount, s.scheduledAt, s.recurrence, s.status, s.sent, s.delivered, s.failed, s.createdBy, s.createdAt]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'scheduled-notifications.csv'; a.click();
  }

  const successRate = stats.totalSent > 0
    ? Math.round((schedules.reduce((a, s) => a + s.delivered, 0) / stats.totalSent) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Scheduled Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Create, schedule, and monitor automated notification campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>New Schedule</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Schedules" value={String(stats.total)} icon={<Calendar className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" />
        <StatCard title="Upcoming" value={String(stats.upcoming)} icon={<Clock className="w-5 h-5" />} gradient="bg-gradient-to-br from-blue-500 to-blue-700" change={3} />
        <StatCard title="Recurring Campaigns" value={String(stats.recurring)} icon={<RefreshCw className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
        <StatCard title="Failed Deliveries" value={String(stats.failed)} icon={<AlertTriangle className="w-5 h-5" />} gradient="bg-gradient-to-br from-red-500 to-red-700" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Notifications Sent" value={stats.totalSent.toLocaleString()} icon={<Send className="w-5 h-5" />} gradient="bg-gradient-to-br from-teal-500 to-teal-700" change={8} />
        <StatCard title="Pending / Draft" value={String(stats.pending)} icon={<Info className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-amber-700" />
        <StatCard title="Processing Now" value={String(stats.processing)} icon={<Zap className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <StatCard title="Delivery Success Rate" value={`${successRate}%`} icon={<BarChart3 className="w-5 h-5" />} gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" change={2} />
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        <div className="px-6 pt-5 border-b border-slate-100 dark:border-slate-800">
          <Tabs
            tabs={[
              { id: 'all', label: `All (${schedules.length})` },
              { id: 'upcoming', label: `Upcoming (${stats.upcoming})` },
              { id: 'recurring', label: `Recurring (${stats.recurring})` },
              { id: 'failed', label: `Failed (${stats.failed})` },
            ]}
            active={tab}
            onChange={t => { setTab(t); setPage(1); }}
          />
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input type="text" placeholder="Search by title, ID, audience..." className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-36">
            <option value="all">All Status</option>
            {(['draft','scheduled','processing','sent','completed','failed','cancelled','paused'] as ScheduleStatus[]).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="input-field w-36">
            <option value="all">All Types</option>
            {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={channelFilter} onChange={e => { setChannelFilter(e.target.value); setPage(1); }} className="input-field w-32">
            <option value="all">All Channels</option>
            <option value="push">Push</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="in-app">In-App</option>
          </select>
          <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>More Filters</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Title</th>
                <th className="table-header">Type</th>
                <th className="table-header">Channels</th>
                <th className="table-header">Audience</th>
                <th className="table-header">Scheduled</th>
                <th className="table-header">Recurrence</th>
                <th className="table-header">Status</th>
                <th className="table-header">Delivery Stats</th>
                <th className="table-header">Created By</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <PriorityDot priority={s.priority} />
                      <span className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-400">{s.id}</span>
                    </div>
                  </td>
                  <td className="table-cell max-w-[180px]">
                    <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{s.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{s.description}</p>
                  </td>
                  <td className="table-cell">
                    <Badge variant="default" size="sm">{s.type}</Badge>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {s.channels.map(c => (
                        <span key={c} className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                          {CHANNEL_ICONS[c]}{CHANNEL_LABELS[c]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{s.audienceCount.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[100px]">{s.audience}</p>
                  </td>
                  <td className="table-cell text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmtDateShort(s.scheduledAt)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      {s.recurrence !== 'One-Time' && <RefreshCw className="w-3 h-3" />}
                      <span>{s.recurrence}</span>
                    </div>
                  </td>
                  <td className="table-cell"><StatusBadge status={s.status} /></td>
                  <td className="table-cell text-xs">
                    {s.sent > 0 ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3" />{s.delivered.toLocaleString()}</div>
                        {s.failed > 0 && <div className="flex items-center gap-1 text-red-500"><XCircle className="w-3 h-3" />{s.failed.toLocaleString()}</div>}
                      </div>
                    ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar name={s.createdBy} size="xs" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[80px]">{s.createdBy}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <RowActions schedule={s} onAction={handleAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-16 text-center text-sm text-slate-400">No schedules found matching your filters.</div>}
        </div>

        {filtered.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Permissions Note */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <Shield className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Access Control: </span>
          Super Admin — full access (create, edit, schedule, delete) • Notification Manager — create/edit/schedule • Viewer — read-only
        </div>
      </div>

      <CreateModal open={showCreate} onClose={() => setShowCreate(false)} onSave={s => {
        const id = `SCH-${String(schedules.length + 1).padStart(3, '0')}`;
        setSchedules(prev => [{ id, ...s } as Schedule, ...prev]);
      }} />
    </div>
  );
}

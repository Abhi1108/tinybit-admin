'use client';
import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, AlertTriangle, Eye, Bell, Shield, Flame, AlertCircle, Send } from 'lucide-react';
import { Badge, Avatar, StatCard, Button, Modal, Input, Select, Pagination, cn } from '@/src/components/ui';

type EscLevel = 1 | 2 | 3;
type EscPriority = 'low' | 'medium' | 'high' | 'critical';
type EscStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface EscComment { id: string; author: string; text: string; createdAt: string; }
interface EscTimeline { action: string; by: string; at: string; }

interface Escalation {
  id: string; queryId: string; userName: string; userEmail: string;
  subject: string; description: string; level: EscLevel; priority: EscPriority;
  status: EscStatus; assignedTo: string | null; createdAt: string; updatedAt: string;
  slaDeadline: string; slaBreached: boolean; comments: EscComment[]; timeline: EscTimeline[];
}

const AGENTS = ['Priya Sharma', 'Rohan Verma', 'Sunita Patel', 'Ankit Joshi', 'Meera Nair', 'Kiran Bose'];
const MANAGERS = ['Rajesh Kumar (Manager)', 'Neeha Agrawal (Admin)'];

const MOCK_ESCALATIONS: Escalation[] = [
  { id: 'ESC-0011', queryId: 'QRY-0041', userName: 'Ramesh Gupta', userEmail: 'ramesh.gupta@email.com', subject: 'Medicine reminders completely broken after update', description: "User unable to receive any medicine reminder notifications for 5+ days. Critical patient safety concern — user's father has a heart condition.", level: 3, priority: 'critical', status: 'open', assignedTo: null, createdAt: '2026-06-15T09:00:00Z', updatedAt: '2026-06-15T09:00:00Z', slaDeadline: '2026-06-15T13:00:00Z', slaBreached: false, comments: [], timeline: [{ action: 'Escalation created automatically from QRY-0041', by: 'System', at: '2026-06-15T09:00:00Z' }] },
  { id: 'ESC-0010', queryId: 'QRY-0038', userName: 'Kavita Nair', userEmail: 'kavita.nair@email.com', subject: 'User charged but subscription not activated', description: 'Payment of ₹4,999 processed but subscription plan still showing as expired. User without service for 3 days.', level: 2, priority: 'high', status: 'in_progress', assignedTo: 'Sunita Patel', createdAt: '2026-06-14T10:00:00Z', updatedAt: '2026-06-14T14:00:00Z', slaDeadline: '2026-06-15T10:00:00Z', slaBreached: false, comments: [{ id: 'c1', author: 'Sunita Patel', text: 'Raised ticket with payment gateway team. Waiting for payment confirmation webhook.', createdAt: '2026-06-14T14:00:00Z' }], timeline: [{ action: 'Escalation created from QRY-0038', by: 'Ankit Joshi', at: '2026-06-14T10:00:00Z' }, { action: 'Assigned to Sunita Patel', by: 'Rajesh Kumar', at: '2026-06-14T10:30:00Z' }, { action: 'Status changed to In Progress', by: 'Sunita Patel', at: '2026-06-14T14:00:00Z' }] },
  { id: 'ESC-0009', queryId: 'QRY-0030', userName: 'Meena Joshi', userEmail: 'meena.joshi@email.com', subject: 'SOS alerts not reaching emergency contacts', description: "Emergency contacts not receiving SOS SMS or calls. Critical safety failure — SOS system is failing for this user.", level: 3, priority: 'critical', status: 'in_progress', assignedTo: 'Ankit Joshi', createdAt: '2026-06-14T08:00:00Z', updatedAt: '2026-06-14T11:00:00Z', slaDeadline: '2026-06-14T12:00:00Z', slaBreached: true, comments: [{ id: 'c2', author: 'Ankit Joshi', text: 'Found that the SMS provider had an outage. Switching to backup provider now.', createdAt: '2026-06-14T10:30:00Z' }, { id: 'c3', author: 'Rajesh Kumar', text: 'SLA breached. Escalating to critical watch. Need resolution within 2 hours.', createdAt: '2026-06-14T12:15:00Z' }], timeline: [{ action: 'Escalation created from QRY-0030', by: 'Meera Nair', at: '2026-06-14T08:00:00Z' }, { action: 'Level raised from L2 to L3', by: 'Rajesh Kumar', at: '2026-06-14T09:00:00Z' }, { action: 'Assigned to Ankit Joshi', by: 'Rajesh Kumar', at: '2026-06-14T09:05:00Z' }, { action: 'SLA breached', by: 'System', at: '2026-06-14T12:00:00Z' }] },
  { id: 'ESC-0008', queryId: 'QRY-0034', userName: 'Deepa Sharma', userEmail: 'deepa.sharma@email.com', subject: 'Account deletion request – legal compliance', description: "User invoked right to erasure under PDPB 2023. All personal data and medical records must be deleted within 30 days. Legal team must sign off.", level: 2, priority: 'high', status: 'in_progress', assignedTo: 'Meera Nair', createdAt: '2026-06-13T09:00:00Z', updatedAt: '2026-06-13T16:00:00Z', slaDeadline: '2026-06-30T23:59:00Z', slaBreached: false, comments: [{ id: 'c4', author: 'Meera Nair', text: 'Initiated data deletion workflow. Legal team confirmation pending.', createdAt: '2026-06-13T16:00:00Z' }], timeline: [{ action: 'Escalation created manually', by: 'Meera Nair', at: '2026-06-13T09:00:00Z' }, { action: 'Assigned to Meera Nair', by: 'Neeha Agrawal', at: '2026-06-13T09:30:00Z' }] },
  { id: 'ESC-0007', queryId: 'QRY-0035', userName: 'Vijay Reddy', userEmail: 'vijay.reddy@email.com', subject: 'Daily check-in data loss — 4 consecutive days', description: "User's daily check-in submissions not persisting to the database. 4 days of wellness data lost. Possible backend sync bug.", level: 1, priority: 'medium', status: 'open', assignedTo: null, createdAt: '2026-06-13T11:00:00Z', updatedAt: '2026-06-13T11:00:00Z', slaDeadline: '2026-06-16T11:00:00Z', slaBreached: false, comments: [], timeline: [{ action: 'Escalation created from QRY-0035', by: 'Rohan Verma', at: '2026-06-13T11:00:00Z' }] },
  { id: 'ESC-0006', queryId: 'QRY-0031', userName: 'Suresh Patel', userEmail: 'suresh.patel@email.com', subject: 'Duplicate payment charge — refund required', description: "User charged twice for same subscription. ₹2,499 duplicate charge confirmed. User threatening legal action if not resolved.", level: 2, priority: 'high', status: 'resolved', assignedTo: 'Sunita Patel', createdAt: '2026-06-12T10:00:00Z', updatedAt: '2026-06-13T14:00:00Z', slaDeadline: '2026-06-13T10:00:00Z', slaBreached: false, comments: [{ id: 'c5', author: 'Sunita Patel', text: 'Refund of ₹2,499 processed. User notified. Should reflect in 5-7 business days.', createdAt: '2026-06-13T14:00:00Z' }], timeline: [{ action: 'Escalation created from QRY-0031', by: 'Ankit Joshi', at: '2026-06-12T10:00:00Z' }, { action: 'Assigned to Sunita Patel', by: 'Rajesh Kumar', at: '2026-06-12T10:30:00Z' }, { action: 'Refund processed', by: 'Sunita Patel', at: '2026-06-13T14:00:00Z' }, { action: 'Status set to Resolved', by: 'Sunita Patel', at: '2026-06-13T14:05:00Z' }] },
  { id: 'ESC-0005', queryId: 'QRY-0032', userName: 'Anjali Singh', userEmail: 'anjali.singh@email.com', subject: 'Gujarati voice transcription failing — no workaround', description: "Gujarati language voice journal transcription completely broken. Affects ~200+ users. Engineering team needs to be looped in.", level: 1, priority: 'medium', status: 'in_progress', assignedTo: 'Rohan Verma', createdAt: '2026-06-11T14:00:00Z', updatedAt: '2026-06-12T10:00:00Z', slaDeadline: '2026-06-18T14:00:00Z', slaBreached: false, comments: [{ id: 'c6', author: 'Rohan Verma', text: 'Engineering confirmed bug in Whisper language routing for Gujarati. Fix expected in v2.4.2.', createdAt: '2026-06-12T10:00:00Z' }], timeline: [{ action: 'Escalation created from QRY-0032', by: 'Priya Sharma', at: '2026-06-11T14:00:00Z' }, { action: 'Assigned to Rohan Verma', by: 'Rajesh Kumar', at: '2026-06-11T15:00:00Z' }] },
  { id: 'ESC-0004', queryId: 'QRY-0033', userName: 'Ravi Krishnan', userEmail: 'ravi.krishnan@email.com', subject: 'Location tracking failure on Android 15', description: "Background location permissions API changed in Android 15. App not requesting new permission correctly.", level: 1, priority: 'low', status: 'closed', assignedTo: 'Rohan Verma', createdAt: '2026-06-10T09:00:00Z', updatedAt: '2026-06-11T16:00:00Z', slaDeadline: '2026-06-17T09:00:00Z', slaBreached: false, comments: [{ id: 'c7', author: 'Rohan Verma', text: 'App update v2.4.0 includes Android 15 permission fixes. User confirmed working.', createdAt: '2026-06-11T16:00:00Z' }], timeline: [{ action: 'Escalation created from QRY-0033', by: 'Rohan Verma', at: '2026-06-10T09:00:00Z' }, { action: 'Fix deployed in v2.4.0', by: 'System', at: '2026-06-11T12:00:00Z' }, { action: 'Status set to Closed', by: 'Rohan Verma', at: '2026-06-11T16:00:00Z' }] },
];

const PRIORITY_CLASSES: Record<EscPriority, string> = {
  critical: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  medium: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const LEVEL_CLASSES: Record<EscLevel, string> = {
  1: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  2: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  3: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_VARIANT: Record<EscStatus, 'warning' | 'info' | 'success' | 'default'> = {
  open: 'warning', in_progress: 'info', resolved: 'success', closed: 'default',
};

const STATUS_LABELS: Record<EscStatus, string> = {
  open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed',
};

function PriorityBadge({ priority }: { priority: EscPriority }) {
  const icons = { critical: <Flame className="w-2.5 h-2.5" />, high: <AlertTriangle className="w-2.5 h-2.5" />, medium: <AlertCircle className="w-2.5 h-2.5" />, low: <Shield className="w-2.5 h-2.5" /> };
  const labels = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
  return <span className={cn('badge inline-flex items-center gap-1', PRIORITY_CLASSES[priority])}>{icons[priority]}{labels[priority]}</span>;
}

function LevelBadge({ level }: { level: EscLevel }) {
  return <span className={cn('badge text-xs font-semibold', LEVEL_CLASSES[level])}>Level {level}</span>;
}

function SLABadge({ deadline, breached }: { deadline: string; breached: boolean }) {
  if (breached) return <Badge variant="danger" dot>SLA Breached</Badge>;
  const h = Math.round((new Date(deadline).getTime() - Date.now()) / 3600000);
  if (h < 0) return <Badge variant="danger" dot>Overdue</Badge>;
  if (h < 4) return <Badge variant="warning" dot>{h}h left</Badge>;
  return <Badge variant="success" dot>On Track</Badge>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function EscDetailModal({ esc, onClose, onUpdate }: { esc: Escalation; onClose: () => void; onUpdate: (e: Escalation) => void }) {
  const [status, setStatus] = useState<EscStatus>(esc.status);
  const [priority, setPriority] = useState<EscPriority>(esc.priority);
  const [level, setLevel] = useState<EscLevel>(esc.level);
  const [assigned, setAssigned] = useState(esc.assignedTo ?? '');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<EscComment[]>(esc.comments);
  const [timeline, setTimeline] = useState<EscTimeline[]>(esc.timeline);

  function addComment() {
    if (!commentText.trim()) return;
    const c: EscComment = { id: `c${Date.now()}`, author: 'Arjun Mehta', text: commentText, createdAt: new Date().toISOString() };
    setComments(prev => [...prev, c]);
    setTimeline(prev => [...prev, { action: 'Comment added', by: 'Arjun Mehta', at: new Date().toISOString() }]);
    setCommentText('');
  }

  function handleSave() {
    onUpdate({ ...esc, status, priority, level, assignedTo: assigned || null, comments, timeline });
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={`Escalation ${esc.id}`} size="2xl"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSave}>Save Changes</Button></>}
    >
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={esc.userName} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">{esc.userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{esc.userEmail}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <LevelBadge level={esc.level} />
                <PriorityBadge priority={esc.priority} />
                {esc.slaBreached && <Badge variant="danger">SLA Breached</Badge>}
              </div>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{esc.subject}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{esc.description}</p>
            <p className="text-xs text-slate-400 mt-2">Linked query: <span className="font-mono text-brand-700 dark:text-brand-400">{esc.queryId}</span></p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Timeline</p>
            <div className="relative space-y-3 pl-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
              {timeline.map((t, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[15px] w-2 h-2 rounded-full bg-brand-500 mt-1" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">{t.action}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{t.by} · {formatDate(t.at)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Comments & Updates</p>
            {comments.length === 0 && <p className="text-xs text-slate-400 italic mb-3">No comments yet.</p>}
            <div className="space-y-2 mb-3">
              {comments.map(c => (
                <div key={c.id} className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                  <p className="text-xs font-medium text-brand-700 dark:text-brand-400">{c.author} · {formatDate(c.createdAt)}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" className="input-field flex-1 text-sm" placeholder="Add comment or update..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} />
              <Button variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />} onClick={addComment}>Post</Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Escalation ID</p>
            <p className="font-mono text-sm font-semibold text-brand-700 dark:text-brand-400">{esc.id}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Created</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{formatDate(esc.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">SLA Deadline</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">{formatDate(esc.slaDeadline)}</p>
            <SLABadge deadline={esc.slaDeadline} breached={esc.slaBreached} />
          </div>
          <Select label="Status" value={status} onChange={e => setStatus(e.target.value as EscStatus)} options={[{ value: 'open', label: 'Open' }, { value: 'in_progress', label: 'In Progress' }, { value: 'resolved', label: 'Resolved' }, { value: 'closed', label: 'Closed' }]} />
          <Select label="Priority" value={priority} onChange={e => setPriority(e.target.value as EscPriority)} options={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
          <Select label="Level" value={String(level)} onChange={e => setLevel(Number(e.target.value) as EscLevel)} options={[{ value: '1', label: 'Level 1' }, { value: '2', label: 'Level 2' }, { value: '3', label: 'Level 3' }]} />
          <Select label="Assigned To" value={assigned} onChange={e => setAssigned(e.target.value)}
            options={[{ value: '', label: 'Unassigned' }, ...AGENTS.map(a => ({ value: a, label: a })), ...MANAGERS.map(m => ({ value: m, label: m }))]}
          />
        </div>
      </div>
    </Modal>
  );
}

function CreateEscalationModal({ onClose, onCreate }: { onClose: () => void; onCreate: (e: Escalation) => void }) {
  const [form, setForm] = useState({ userName: '', userEmail: '', queryId: '', subject: '', description: '', level: '1', priority: 'medium', assignedTo: '' });

  function handleCreate() {
    if (!form.userName.trim() || !form.subject.trim()) return;
    const now = new Date().toISOString();
    const slaHours = form.level === '3' ? 4 : form.level === '2' ? 24 : 72;
    const sla = new Date(Date.now() + slaHours * 3600000).toISOString();
    onCreate({
      id: `ESC-${String(MOCK_ESCALATIONS.length + 12).padStart(4, '0')}`,
      queryId: form.queryId || 'N/A', userName: form.userName, userEmail: form.userEmail,
      subject: form.subject, description: form.description,
      level: Number(form.level) as EscLevel, priority: form.priority as EscPriority,
      status: 'open', assignedTo: form.assignedTo || null,
      createdAt: now, updatedAt: now, slaDeadline: sla, slaBreached: false,
      comments: [], timeline: [{ action: 'Escalation created manually', by: 'Arjun Mehta', at: now }],
    });
    onClose();
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open onClose={onClose} title="Create New Escalation" size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleCreate}>Create Escalation</Button></>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="User Name *" value={form.userName} onChange={set('userName')} placeholder="Full name" />
          <Input label="User Email" value={form.userEmail} onChange={set('userEmail')} placeholder="email@example.com" />
        </div>
        <Input label="Related Query ID" value={form.queryId} onChange={set('queryId')} placeholder="QRY-0000" />
        <Input label="Subject *" value={form.subject} onChange={set('subject')} placeholder="Brief description of the issue" />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
          <textarea className="input-field resize-none" rows={3} placeholder="Detailed description, context, and impact..." value={form.description} onChange={set('description')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Select label="Level" value={form.level} onChange={set('level')} options={[{ value: '1', label: 'Level 1' }, { value: '2', label: 'Level 2' }, { value: '3', label: 'Level 3' }]} />
          <Select label="Priority" value={form.priority} onChange={set('priority')} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]} />
          <Select label="Assign To" value={form.assignedTo} onChange={set('assignedTo')}
            options={[{ value: '', label: 'Unassigned' }, ...AGENTS.map(a => ({ value: a, label: a })), ...MANAGERS.map(m => ({ value: m, label: m }))]}
          />
        </div>
      </div>
    </Modal>
  );
}

export default function EscalationManagementPage() {
  const [escalations, setEscalations] = useState<Escalation[]>(MOCK_ESCALATIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedEsc, setSelectedEsc] = useState<Escalation | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const pageSize = 8;

  const filtered = useMemo(() => escalations.filter(e => {
    const s = search.toLowerCase();
    const matchSearch = !s || e.id.toLowerCase().includes(s) || e.userName.toLowerCase().includes(s) || e.subject.toLowerCase().includes(s);
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || e.priority === priorityFilter;
    const matchLevel = levelFilter === 'all' || e.level === Number(levelFilter);
    return matchSearch && matchStatus && matchPriority && matchLevel;
  }), [escalations, search, statusFilter, priorityFilter, levelFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    open: escalations.filter(e => e.status === 'open').length,
    critical: escalations.filter(e => e.priority === 'critical').length,
    l3: escalations.filter(e => e.level === 3).length,
    breached: escalations.filter(e => e.slaBreached).length,
  }), [escalations]);

  function handleUpdate(updated: Escalation) {
    setEscalations(prev => prev.map(e => e.id === updated.id ? updated : e));
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Escalation Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {stats.open} open · {stats.breached} SLA breached
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>New Escalation</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Escalations" value={stats.open} icon={<Bell className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
        <StatCard title="Critical Priority" value={stats.critical} icon={<Flame className="w-5 h-5" />} gradient="bg-gradient-to-br from-red-500 to-red-700" />
        <StatCard title="Level 3 (Highest)" value={stats.l3} icon={<Shield className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-amber-700" />
        <StatCard title="SLA Breached" value={stats.breached} icon={<AlertTriangle className="w-5 h-5" />} gradient="bg-gradient-to-br from-rose-500 to-rose-700" />
      </div>

      {stats.breached > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{stats.breached} escalation{stats.breached > 1 ? 's have' : ' has'} breached SLA and require{stats.breached === 1 ? 's' : ''} immediate attention.</p>
        </div>
      )}

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-56 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input type="text" placeholder="Search by ID, user, subject..." className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-36">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} className="input-field w-36">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={levelFilter} onChange={e => { setLevelFilter(e.target.value); setPage(1); }} className="input-field w-32">
          <option value="all">All Levels</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
        </select>
        <button className="btn-secondary"><Filter className="w-4 h-4" /> More</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Esc. ID</th>
                <th className="table-header">User</th>
                <th className="table-header">Subject</th>
                <th className="table-header">Level</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Assigned To</th>
                <th className="table-header">Status</th>
                <th className="table-header">SLA</th>
                <th className="table-header">Created</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(esc => (
                <tr key={esc.id} className={cn('hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors', esc.slaBreached && 'bg-red-50/50 dark:bg-red-900/10')}>
                  <td className="table-cell"><span className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-400">{esc.id}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={esc.userName} size="sm" />
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">{esc.userName}</p>
                        <p className="text-xs text-slate-400">{esc.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell max-w-[200px]">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{esc.subject}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">Query: {esc.queryId}</p>
                  </td>
                  <td className="table-cell"><LevelBadge level={esc.level} /></td>
                  <td className="table-cell"><PriorityBadge priority={esc.priority} /></td>
                  <td className="table-cell">
                    {esc.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={esc.assignedTo} size="xs" />
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[80px]">{esc.assignedTo.split(' ')[0]}</span>
                      </div>
                    ) : <span className="text-xs text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="table-cell"><Badge variant={STATUS_VARIANT[esc.status]} dot>{STATUS_LABELS[esc.status]}</Badge></td>
                  <td className="table-cell"><SLABadge deadline={esc.slaDeadline} breached={esc.slaBreached} /></td>
                  <td className="table-cell text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(esc.createdAt)}</td>
                  <td className="table-cell">
                    <button onClick={() => setSelectedEsc(esc)} className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-brand-600 transition-colors" title="View details">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">No escalations found matching your filters.</div>}
        {filtered.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>
        )}
      </div>

      {selectedEsc && (
        <EscDetailModal esc={selectedEsc} onClose={() => setSelectedEsc(null)} onUpdate={e => { handleUpdate(e); setSelectedEsc(null); }} />
      )}
      {showCreate && (
        <CreateEscalationModal onClose={() => setShowCreate(false)} onCreate={e => { setEscalations(prev => [e, ...prev]); }} />
      )}
    </div>
  );
}

'use client';
import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Download, MessageSquare, Eye, Clock,
  CheckCircle2, AlertCircle, XCircle, Mail, Phone, Plus,
} from 'lucide-react';
import {
  Badge, Avatar, StatCard, Button, Modal, Input, Select,
  Pagination, cn,
} from '@/src/components/ui';

type QueryStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

interface QueryNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface UserQuery {
  id: string;
  userName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: QueryStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  notes: QueryNote[];
  category: string;
  queryId: string;
}

const AGENTS = ['Priya Sharma', 'Rohan Verma', 'Sunita Patel', 'Ankit Joshi', 'Meera Nair'];

const MOCK_QUERIES: UserQuery[] = [
  { id: '1', queryId: 'QRY-0041', userName: 'Ramesh Gupta', email: 'ramesh.gupta@email.com', phone: '+91 9876543210', subject: 'Medicine reminder not working', message: "The medicine reminder notifications stopped coming after the last app update. I haven't received any reminders for 3 days. My father needs to take his blood pressure medication on time.", status: 'pending', createdAt: '2026-06-15T08:30:00Z', updatedAt: '2026-06-15T08:30:00Z', assignedTo: null, notes: [], category: 'Technical Issue' },
  { id: '2', queryId: 'QRY-0040', userName: 'Sunita Desai', email: 'sunita.desai@email.com', phone: '+91 9988776655', subject: 'Unable to add family member', message: "I'm trying to add my daughter as a guardian but the app keeps showing an error 'Invitation failed'. I've tried multiple times over the past week.", status: 'in_progress', createdAt: '2026-06-14T14:20:00Z', updatedAt: '2026-06-14T16:45:00Z', assignedTo: 'Priya Sharma', notes: [{ id: 'n1', author: 'Priya Sharma', text: 'Checked the account – invitation quota reached. Working on increasing the limit.', createdAt: '2026-06-14T17:00:00Z' }], category: 'Account Issue' },
  { id: '3', queryId: 'QRY-0039', userName: 'Mohan Iyer', email: 'mohan.iyer@email.com', phone: '+91 8765432109', subject: 'SOS button triggered by mistake', message: "The SOS button was accidentally triggered by my elderly mother. We want to know how to cancel false alarms quickly and if there is a confirmation step we can enable.", status: 'resolved', createdAt: '2026-06-13T11:00:00Z', updatedAt: '2026-06-13T15:30:00Z', assignedTo: 'Rohan Verma', notes: [{ id: 'n2', author: 'Rohan Verma', text: 'Explained the 5-second cancellation window. Shared tutorial link via email.', createdAt: '2026-06-13T15:00:00Z' }], category: 'Usage Help' },
  { id: '4', queryId: 'QRY-0038', userName: 'Kavita Nair', email: 'kavita.nair@email.com', phone: '+91 7654321098', subject: 'Subscription renewal issue', message: "My annual subscription was supposed to auto-renew on June 10th but my account now shows 'Expired'. I was charged but the plan is not active.", status: 'in_progress', createdAt: '2026-06-12T09:15:00Z', updatedAt: '2026-06-12T11:00:00Z', assignedTo: 'Sunita Patel', notes: [], category: 'Billing' },
  { id: '5', queryId: 'QRY-0037', userName: 'Arjun Mehta', email: 'arjun.mehta@email.com', phone: '+91 6543210987', subject: 'AI companion not responding in Hindi', message: "The Sathi AI assistant responds only in English even after I selected Hindi as my language preference. My elderly father does not understand English.", status: 'pending', createdAt: '2026-06-11T16:40:00Z', updatedAt: '2026-06-11T16:40:00Z', assignedTo: null, notes: [], category: 'Technical Issue' },
  { id: '6', queryId: 'QRY-0036', userName: 'Priya Kapoor', email: 'priya.kapoor@email.com', phone: '+91 5432109876', subject: 'Health vault documents not uploading', message: "I have been trying to upload my mother's medical reports (PDF) to Health Vault for 2 days. The upload keeps failing with a generic error.", status: 'closed', createdAt: '2026-06-10T13:20:00Z', updatedAt: '2026-06-11T10:00:00Z', assignedTo: 'Ankit Joshi', notes: [{ id: 'n3', author: 'Ankit Joshi', text: 'File size limit was the issue. Raised limit to 20MB. Informed user.', createdAt: '2026-06-11T09:30:00Z' }], category: 'Technical Issue' },
  { id: '7', queryId: 'QRY-0035', userName: 'Vijay Reddy', email: 'vijay.reddy@email.com', phone: '+91 4321098765', subject: 'Daily check-in not saving', message: 'The daily wellness check-in form submits successfully but data does not appear in history. This has been happening for 4 days.', status: 'pending', createdAt: '2026-06-09T10:10:00Z', updatedAt: '2026-06-09T10:10:00Z', assignedTo: null, notes: [], category: 'Technical Issue' },
  { id: '8', queryId: 'QRY-0034', userName: 'Deepa Sharma', email: 'deepa.sharma@email.com', phone: '+91 3210987654', subject: 'Account deletion request', message: 'I would like to permanently delete my account and all associated data including medical records and conversation history.', status: 'in_progress', createdAt: '2026-06-08T09:00:00Z', updatedAt: '2026-06-08T11:30:00Z', assignedTo: 'Meera Nair', notes: [{ id: 'n4', author: 'Meera Nair', text: 'Sent account deletion form. Waiting for user confirmation.', createdAt: '2026-06-08T11:00:00Z' }], category: 'Account Issue' },
  { id: '9', queryId: 'QRY-0033', userName: 'Ravi Krishnan', email: 'ravi.krishnan@email.com', phone: '+91 2109876543', subject: 'Location tracking not updating', message: "The live location shows my mother's last location as 3 hours ago even though she is moving. Location hasn't updated since this morning.", status: 'resolved', createdAt: '2026-06-07T14:30:00Z', updatedAt: '2026-06-08T09:00:00Z', assignedTo: 'Rohan Verma', notes: [{ id: 'n5', author: 'Rohan Verma', text: 'Background location permissions were denied on Android. Walked user through enabling permissions.', createdAt: '2026-06-08T08:30:00Z' }], category: 'Technical Issue' },
  { id: '10', queryId: 'QRY-0032', userName: 'Anjali Singh', email: 'anjali.singh@email.com', phone: '+91 1098765432', subject: 'Voice journal not transcribing', message: 'The voice journal feature records audio but text transcription is either blank or incorrect. Using it in Gujarati language.', status: 'pending', createdAt: '2026-06-06T11:45:00Z', updatedAt: '2026-06-06T11:45:00Z', assignedTo: null, notes: [], category: 'Technical Issue' },
  { id: '11', queryId: 'QRY-0031', userName: 'Suresh Patel', email: 'suresh.patel@email.com', phone: '+91 0987654321', subject: 'Refund request for duplicate charge', message: "I was charged twice for the same subscription renewal on June 5th. I see two identical transactions. Please process a refund for the duplicate charge.", status: 'closed', createdAt: '2026-06-05T16:00:00Z', updatedAt: '2026-06-06T14:00:00Z', assignedTo: 'Sunita Patel', notes: [{ id: 'n6', author: 'Sunita Patel', text: 'Duplicate charge confirmed. Refund of ₹2,499 initiated. 5-7 business days for processing.', createdAt: '2026-06-06T13:30:00Z' }], category: 'Billing' },
  { id: '12', queryId: 'QRY-0030', userName: 'Meena Joshi', email: 'meena.joshi@email.com', phone: '+91 9876012345', subject: 'Emergency contact not receiving SOS alerts', message: "When SOS is triggered, my son listed as emergency contact is not receiving the SMS or call. He has checked his phone and there is no block.", status: 'in_progress', createdAt: '2026-06-04T08:20:00Z', updatedAt: '2026-06-04T10:00:00Z', assignedTo: 'Ankit Joshi', notes: [], category: 'Account Issue' },
];

const STATUS_CONFIG: Record<QueryStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'default' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function QueryStatusBadge({ status }: { status: QueryStatus }) {
  const c = STATUS_CONFIG[status];
  return <Badge variant={c.variant} dot>{c.label}</Badge>;
}

function QueryDetailModal({ query, onClose, onUpdate }: {
  query: UserQuery;
  onClose: () => void;
  onUpdate: (q: UserQuery) => void;
}) {
  const [status, setStatus] = useState<QueryStatus>(query.status);
  const [assigned, setAssigned] = useState(query.assignedTo ?? '');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<QueryNote[]>(query.notes);

  function handleSave() {
    onUpdate({ ...query, status, assignedTo: assigned || null, notes, updatedAt: new Date().toISOString() });
    onClose();
  }

  function addNote() {
    if (!noteText.trim()) return;
    setNotes(prev => [...prev, { id: `n${Date.now()}`, author: 'Arjun Mehta', text: noteText, createdAt: new Date().toISOString() }]);
    setNoteText('');
  }

  return (
    <Modal open onClose={onClose} title={`Query ${query.queryId}`} size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <Avatar name={query.userName} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white">{query.userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5"><Mail className="w-3 h-3" /> {query.email}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" /> {query.phone}</p>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <Badge variant="default" size="sm">{query.category}</Badge>
              <QueryStatusBadge status={query.status} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Subject</p>
            <p className="font-semibold text-slate-900 dark:text-white">{query.subject}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Message</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 leading-relaxed">{query.message}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Internal Notes</p>
            {notes.length === 0 && <p className="text-xs text-slate-400 italic mb-3">No notes yet.</p>}
            <div className="space-y-2 mb-3">
              {notes.map(n => (
                <div key={n.id} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-400">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">{n.author} · {formatDate(n.createdAt)}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1 text-sm"
                placeholder="Add internal note..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNote()}
              />
              <Button variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={addNote}>Add</Button>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Query ID</p>
            <p className="font-mono text-sm font-semibold text-brand-700 dark:text-brand-400">{query.queryId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Created</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{formatDate(query.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Last Updated</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{formatDate(query.updatedAt)}</p>
          </div>
          <Select label="Status" value={status} onChange={e => setStatus(e.target.value as QueryStatus)}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
          <Select label="Assigned To" value={assigned} onChange={e => setAssigned(e.target.value)}
            options={[{ value: '', label: 'Unassigned' }, ...AGENTS.map(a => ({ value: a, label: a }))]}
          />
        </div>
      </div>
    </Modal>
  );
}

export default function UserQueriesPage() {
  const [queries, setQueries] = useState<UserQuery[]>(MOCK_QUERIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState<UserQuery | null>(null);
  const pageSize = 8;

  const filtered = useMemo(() => queries.filter(q => {
    const s = search.toLowerCase();
    const matchSearch = !s || q.queryId.toLowerCase().includes(s) || q.userName.toLowerCase().includes(s) ||
      q.email.toLowerCase().includes(s) || q.subject.toLowerCase().includes(s);
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    const matchCat = categoryFilter === 'all' || q.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  }), [queries, search, statusFilter, categoryFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    total: queries.length,
    pending: queries.filter(q => q.status === 'pending').length,
    inProgress: queries.filter(q => q.status === 'in_progress').length,
    resolved: queries.filter(q => q.status === 'resolved' || q.status === 'closed').length,
  }), [queries]);

  function handleUpdate(updated: UserQuery) {
    setQueries(prev => prev.map(q => q.id === updated.id ? updated : q));
  }

  function handleExport() {
    const csv = [
      ['Query ID', 'User Name', 'Email', 'Phone', 'Subject', 'Category', 'Status', 'Assigned To', 'Created At'],
      ...queries.map(q => [q.queryId, q.userName, q.email, q.phone, q.subject, q.category, q.status, q.assignedTo ?? '', q.createdAt]),
    ].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'queries.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Queries</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{queries.length} total queries</p>
        </div>
        <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Queries" value={stats.total} icon={<MessageSquare className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" change={12} />
        <StatCard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-amber-700" />
        <StatCard title="In Progress" value={stats.inProgress} icon={<AlertCircle className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
        <StatCard title="Resolved / Closed" value={stats.resolved} icon={<CheckCircle2 className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" change={8} />
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-56 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input type="text" placeholder="Search by ID, name, email, subject..." className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-36">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="input-field w-40">
          <option value="all">All Categories</option>
          <option value="Technical Issue">Technical Issue</option>
          <option value="Account Issue">Account Issue</option>
          <option value="Billing">Billing</option>
          <option value="Usage Help">Usage Help</option>
        </select>
        <button className="btn-secondary"><Filter className="w-4 h-4" /> More Filters</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Query ID</th>
                <th className="table-header">User</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Subject</th>
                <th className="table-header">Category</th>
                <th className="table-header">Date & Time</th>
                <th className="table-header">Status</th>
                <th className="table-header">Assigned To</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(q => (
                <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="table-cell"><span className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-400">{q.queryId}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={q.userName} size="sm" />
                      <span className="font-medium text-sm text-slate-900 dark:text-white">{q.userName}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-xs text-slate-600 dark:text-slate-300">{q.email}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{q.phone}</p>
                  </td>
                  <td className="table-cell max-w-[200px]">
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">{q.subject}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{q.message.slice(0, 55)}…</p>
                  </td>
                  <td className="table-cell"><Badge variant="default" size="sm">{q.category}</Badge></td>
                  <td className="table-cell text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(q.createdAt)}</td>
                  <td className="table-cell"><QueryStatusBadge status={q.status} /></td>
                  <td className="table-cell">
                    {q.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={q.assignedTo} size="xs" />
                        <span className="text-xs text-slate-600 dark:text-slate-300">{q.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <button onClick={() => setSelectedQuery(q)} className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-brand-600 transition-colors" title="View & manage">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">No queries found matching your filters.</div>
        )}
        {filtered.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>
        )}
      </div>

      {selectedQuery && (
        <QueryDetailModal query={selectedQuery} onClose={() => setSelectedQuery(null)} onUpdate={q => { handleUpdate(q); setSelectedQuery(null); }} />
      )}
    </div>
  );
}

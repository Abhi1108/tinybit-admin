'use client';
import React, { useState } from 'react';
import { Ticket, Search, Clock, User, AlertTriangle, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

interface SupportTicket {
  id: string;
  subject: string;
  userName: string;
  userType: 'Elder' | 'Guardian';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  lastUpdated: string;
  assignedTo?: string;
}

const tickets: SupportTicket[] = [
  { id: 'T001', subject: 'Cannot connect guardian to elder profile', userName: 'Ankit Patel', userType: 'Guardian', category: 'Account', priority: 'high', status: 'open', createdAt: '2026-06-04T08:30:00Z', lastUpdated: '2026-06-04T09:00:00Z' },
  { id: 'T002', subject: 'SOS button not responding', userName: 'Savita Devi', userType: 'Elder', category: 'SOS', priority: 'critical', status: 'in_progress', createdAt: '2026-06-04T07:15:00Z', lastUpdated: '2026-06-04T08:30:00Z', assignedTo: 'Rohit V.' },
  { id: 'T003', subject: 'AI companion not available in Tamil', userName: 'Geeta Verma', userType: 'Elder', category: 'AI', priority: 'medium', status: 'open', createdAt: '2026-06-03T15:00:00Z', lastUpdated: '2026-06-03T15:00:00Z' },
  { id: 'T004', subject: 'Subscription renewal payment failed', userName: 'Neha Singh', userType: 'Guardian', category: 'Payment', priority: 'high', status: 'resolved', createdAt: '2026-06-03T10:00:00Z', lastUpdated: '2026-06-03T14:00:00Z', assignedTo: 'Priya N.' },
  { id: 'T005', subject: 'Video not loading on slow connection', userName: 'Mohan Lal', userType: 'Elder', category: 'Content', priority: 'low', status: 'closed', createdAt: '2026-06-02T09:00:00Z', lastUpdated: '2026-06-02T16:00:00Z', assignedTo: 'Meera K.' },
  { id: 'T006', subject: 'Cannot update emergency contact', userName: 'Baldev Singh', userType: 'Elder', category: 'Account', priority: 'medium', status: 'open', createdAt: '2026-06-04T06:00:00Z', lastUpdated: '2026-06-04T06:00:00Z' },
  { id: 'T007', subject: 'App crashing on older Android phones', userName: 'Sunita Rao', userType: 'Elder', category: 'App', priority: 'high', status: 'in_progress', createdAt: '2026-06-03T12:00:00Z', lastUpdated: '2026-06-04T08:00:00Z', assignedTo: 'Arjun M.' },
  { id: 'T008', subject: 'Notification not received for missed medicine', userName: 'Kamala Bai', userType: 'Elder', category: 'Notifications', priority: 'medium', status: 'open', createdAt: '2026-06-04T05:00:00Z', lastUpdated: '2026-06-04T05:00:00Z' },
];

const priorityConfig: Record<string, { variant: 'danger' | 'warning' | 'info' | 'default'; label: string }> = {
  critical: { variant: 'danger', label: 'Critical' },
  high: { variant: 'warning', label: 'High' },
  medium: { variant: 'info', label: 'Medium' },
  low: { variant: 'default', label: 'Low' },
};

const statusConfig: Record<string, { variant: 'danger' | 'warning' | 'success' | 'default'; label: string }> = {
  open: { variant: 'danger', label: 'Open' },
  in_progress: { variant: 'warning', label: 'In Progress' },
  resolved: { variant: 'success', label: 'Resolved' },
  closed: { variant: 'default', label: 'Closed' },
};

export default function SupportTicketsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = tickets.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter;
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.userName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Ticket className="w-6 h-6 text-amber-500" /> Support Tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {counts.open} open · {counts.in_progress} in progress · {counts.resolved} resolved
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
              filter === s
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
            )}
          >
            {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search tickets..." className="bg-transparent text-sm outline-none w-44 text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-2">
        {filtered.map(ticket => (
          <div key={ticket.id} className="card p-4 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-slate-400">{ticket.id}</span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{ticket.subject}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ticket.userName} ({ticket.userType})</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{ticket.category}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
                    {ticket.assignedTo && <span className="text-brand-500">Assigned: {ticket.assignedTo}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={priorityConfig[ticket.priority].variant} size="sm">{priorityConfig[ticket.priority].label}</Badge>
                <Badge variant={statusConfig[ticket.status].variant} size="sm">{statusConfig[ticket.status].label}</Badge>
                {ticket.status === 'open' && (
                  <button className="btn-secondary text-xs py-1 px-2.5" title="Assign">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card py-16 text-center text-slate-400 text-sm">No tickets found</div>
        )}
      </div>
    </div>
  );
}

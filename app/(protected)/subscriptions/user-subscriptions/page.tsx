'use client';
import React, { useState } from 'react';
import { Users, Search, CreditCard, Calendar, RefreshCw } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

interface UserSub {
  id: string;
  userName: string;
  userType: 'Elder' | 'Guardian';
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  renewalDate: string;
  amount: number;
}

const subscriptions: UserSub[] = [
  { id: 'us001', userName: 'Ramesh Kumar', userType: 'Elder', plan: 'Premium', status: 'active', startDate: '2026-01-01', renewalDate: '2026-07-01', amount: 999 },
  { id: 'us002', userName: 'Ankit Patel', userType: 'Guardian', plan: 'Standard', status: 'active', startDate: '2026-02-15', renewalDate: '2026-07-15', amount: 599 },
  { id: 'us003', userName: 'Savita Devi', userType: 'Elder', plan: 'Basic', status: 'active', startDate: '2025-12-01', renewalDate: '2026-07-01', amount: 299 },
  { id: 'us004', userName: 'Neha Singh', userType: 'Guardian', plan: 'Premium', status: 'active', startDate: '2026-03-01', renewalDate: '2026-09-01', amount: 999 },
  { id: 'us005', userName: 'Priya Sharma', userType: 'Elder', plan: 'Standard', status: 'expired', startDate: '2025-06-01', renewalDate: '2025-12-01', amount: 599 },
  { id: 'us006', userName: 'Ratan Gupta', userType: 'Elder', plan: 'Basic', status: 'cancelled', startDate: '2025-08-01', renewalDate: '2026-02-01', amount: 299 },
  { id: 'us007', userName: 'Vikram Mehta', userType: 'Guardian', plan: 'Basic', status: 'active', startDate: '2026-04-10', renewalDate: '2026-07-10', amount: 299 },
  { id: 'us008', userName: 'Kavita Reddy', userType: 'Guardian', plan: 'Standard', status: 'active', startDate: '2026-01-20', renewalDate: '2026-07-20', amount: 599 },
];

const statusVariants: Record<string, 'success' | 'danger' | 'default'> = {
  active: 'success',
  expired: 'danger',
  cancelled: 'default',
};

export default function UserSubscriptionsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = subscriptions.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter;
    const matchSearch = s.userName.toLowerCase().includes(search.toLowerCase()) || s.plan.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    expired: subscriptions.filter(s => s.status === 'expired').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Users className="w-6 h-6 text-brand-500" /> User Subscriptions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{counts.active} active · {counts.expired} expired · {counts.cancelled} cancelled</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'active', 'expired', 'cancelled'] as const).map(s => (
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
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search user or plan..." className="bg-transparent text-sm outline-none w-44 text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">User</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Plan</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Start Date</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Renewal</th>
              <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Amount</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(sub => (
              <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {sub.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{sub.userName}</p>
                      <p className="text-xs text-slate-400">{sub.userType}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-brand-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{sub.plan}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariants[sub.status]} size="sm">{sub.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  {new Date(sub.startDate).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(sub.renewalDate).toLocaleDateString('en-IN')}
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">₹{sub.amount}</span>
                </td>
                <td className="px-4 py-3">
                  {sub.status === 'active' && (
                    <button className="btn-secondary text-xs py-1 px-2.5">
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">No subscriptions found</div>
        )}
      </div>
    </div>
  );
}

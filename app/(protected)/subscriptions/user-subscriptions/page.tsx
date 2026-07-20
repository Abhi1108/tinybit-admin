'use client';
import React, { useEffect, useState } from 'react';
import { Users, Search, CreditCard, Calendar, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { getAdminUserSubscriptions, type UserSubscriptionRecord } from '@/src/services/adminApi';

interface UserSub {
  id: string;
  userName: string;
  userType: 'Elder' | 'Guardian' | string;
  plan: string;
  status: string;
  startDate: string;
  renewalDate: string;
  amount: number;
}

const statusVariants: Record<string, 'success' | 'danger' | 'default'> = {
  active: 'success',
  expired: 'danger',
  cancelled: 'default',
  inactive: 'default',
};

function mapSub(s: UserSubscriptionRecord): UserSub {
  return {
    id: s.id,
    userName: s.user_name,
    userType: s.user_type,
    plan: s.plan || 'free',
    status: (s.status || 'inactive').toLowerCase(),
    startDate: s.start_date || '',
    renewalDate: s.renewal_date || '',
    amount: s.amount || 0,
  };
}

export default function UserSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminUserSubscriptions({ limit: 100 });
        if (res.success) setSubscriptions((res.subscriptions || []).map(mapSub));
        else setError(res.error || 'Failed to load subscriptions');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

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
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>
        ) : (
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
                    <Badge variant={statusVariants[sub.status] || 'default'} size="sm">{sub.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString('en-IN') : '—'}
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
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">No subscriptions found</div>
        )}
      </div>
    </div>
  );
}

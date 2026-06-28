'use client';
import React, { useState } from 'react';
import { Wallet, Search, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

interface Payment {
  id: string;
  txnId: string;
  userName: string;
  plan: string;
  amount: number;
  method: 'UPI' | 'Card' | 'Net Banking' | 'Wallet';
  status: 'success' | 'failed' | 'pending';
  date: string;
}

const payments: Payment[] = [
  { id: 'pay001', txnId: 'TXN20260604001', userName: 'Ramesh Kumar', plan: 'Premium', amount: 999, method: 'UPI', status: 'success', date: '2026-06-04T09:30:00Z' },
  { id: 'pay002', txnId: 'TXN20260604002', userName: 'Ankit Patel', plan: 'Standard', amount: 599, method: 'Card', status: 'success', date: '2026-06-04T08:15:00Z' },
  { id: 'pay003', txnId: 'TXN20260603001', userName: 'Savita Devi', plan: 'Basic', amount: 299, method: 'UPI', status: 'success', date: '2026-06-03T14:00:00Z' },
  { id: 'pay004', txnId: 'TXN20260603002', userName: 'Neha Singh', plan: 'Premium', amount: 999, method: 'Net Banking', status: 'failed', date: '2026-06-03T10:30:00Z' },
  { id: 'pay005', txnId: 'TXN20260602001', userName: 'Vikram Mehta', plan: 'Basic', amount: 299, method: 'Wallet', status: 'success', date: '2026-06-02T16:45:00Z' },
  { id: 'pay006', txnId: 'TXN20260602002', userName: 'Kavita Reddy', plan: 'Standard', amount: 599, method: 'UPI', status: 'pending', date: '2026-06-02T11:00:00Z' },
  { id: 'pay007', txnId: 'TXN20260601001', userName: 'Priya Sharma', plan: 'Standard', amount: 599, method: 'Card', status: 'success', date: '2026-06-01T09:00:00Z' },
  { id: 'pay008', txnId: 'TXN20260601002', userName: 'Arun Sharma', plan: 'Premium', amount: 999, method: 'Net Banking', status: 'success', date: '2026-06-01T07:30:00Z' },
];

const statusIcon = {
  success: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
  failed: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  pending: <Clock className="w-3.5 h-3.5 text-amber-500" />,
};

const statusVariants: Record<string, 'success' | 'danger' | 'warning'> = {
  success: 'success',
  failed: 'danger',
  pending: 'warning',
};

const methodColors: Record<string, string> = {
  UPI: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
  Card: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  'Net Banking': 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300',
  Wallet: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = payments.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter;
    const matchSearch = p.userName.toLowerCase().includes(search.toLowerCase()) || p.txnId.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalRevenue = payments.filter(p => p.status === 'success').reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Wallet className="w-6 h-6 text-brand-500" /> Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Transaction history and payment records</p>
        </div>
        <button className="btn-secondary">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue (Shown)', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-emerald-600' },
          { label: 'Successful', value: payments.filter(p => p.status === 'success').length, color: 'text-brand-600' },
          { label: 'Failed / Pending', value: payments.filter(p => p.status !== 'success').length, color: 'text-red-500' },
        ].map(item => (
          <div key={item.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'success', 'failed', 'pending'] as const).map(s => (
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
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search user or TXN ID..." className="bg-transparent text-sm outline-none w-48 text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Transaction ID</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">User</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Plan</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Method</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Date</th>
              <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(pay => (
              <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-3">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{pay.txnId}</span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{pay.userName}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{pay.plan}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', methodColors[pay.method])}>{pay.method}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {statusIcon[pay.status]}
                    <Badge variant={statusVariants[pay.status]} size="sm">{pay.status}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  {new Date(pay.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={cn('text-sm font-semibold', pay.status === 'success' ? 'text-emerald-600' : 'text-slate-400')}>
                    ₹{pay.amount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">No transactions found</div>
        )}
      </div>
    </div>
  );
}

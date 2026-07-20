'use client';
import React, { useEffect, useState } from 'react';
import { Wallet, Search, Download, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { getPaymentOrders, type PaymentOrder } from '@/src/services/adminApi';

interface Payment {
  id: string;
  txnId: string;
  userName: string;
  plan: string;
  amount: number;
  method: string;
  status: 'success' | 'failed' | 'pending';
  date: string;
}

function mapMethod(method: string | null | undefined): string {
  if (!method) return '—';
  const m = method.toLowerCase();
  if (m.includes('upi')) return 'UPI';
  if (m.includes('card') || m === 'debit' || m === 'credit') return 'Card';
  if (m.includes('netbanking') || m.includes('net_banking') || m.includes('nb')) return 'Net Banking';
  if (m.includes('wallet')) return 'Wallet';
  return method;
}

function mapStatus(order: PaymentOrder): 'success' | 'failed' | 'pending' {
  const ps = order.payment?.status;
  if (ps === 'captured' || order.status === 'paid') return 'success';
  if (ps === 'failed' || order.status === 'cancelled' || order.status === 'expired') return 'failed';
  return 'pending';
}

function mapOrder(order: PaymentOrder): Payment {
  return {
    id: order.id,
    txnId: order.payment?.razorpay_payment_id || order.razorpay_order_id || order.id,
    userName: order.guardian_name || order.guardian_id?.slice(0, 8) || '—',
    plan: `${order.elder_count_at_purchase} elder${order.elder_count_at_purchase === 1 ? '' : 's'} · ${order.interval_days}d`,
    amount: Number(order.payment?.status === 'captured' ? order.amount : order.amount),
    method: mapMethod(order.payment?.method),
    status: mapStatus(order),
    date: order.payment?.captured_at || order.created_at,
  };
}

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
  '—': 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getPaymentOrders({ limit: 100 });
        if (res.success) {
          setPayments((res.orders || []).map(mapOrder));
        } else {
          setError(res.error || 'Failed to load payments');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = payments.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter;
    const matchSearch = p.userName.toLowerCase().includes(search.toLowerCase()) || p.txnId.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalRevenue = payments.filter(p => p.status === 'success').reduce((a, p) => a + p.amount, 0);

  const handleExport = () => {
    const csv = [
      ['Transaction ID', 'User', 'Plan', 'Method', 'Status', 'Date', 'Amount'],
      ...filtered.map(p => [p.txnId, p.userName, p.plan, p.method, p.status, p.date, String(p.amount)]),
    ].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'payments.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Wallet className="w-6 h-6 text-brand-500" /> Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Transaction history and payment records</p>
        </div>
        <button className="btn-secondary" onClick={handleExport}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

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

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading payments…
          </div>
        ) : (
          <>
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
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', methodColors[pay.method] || methodColors['—'])}>{pay.method}</span>
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
          </>
        )}
      </div>
    </div>
  );
}

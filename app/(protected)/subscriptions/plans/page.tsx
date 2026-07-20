'use client';
import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit2, Trash2, Check, Users, Loader2, AlertCircle } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import {
  getPricingTiers,
  createPricingTier,
  updatePricingTier,
  deletePricingTier,
  type PricingTier,
} from '@/src/services/adminApi';

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  userCount: number;
  features: string[];
  status: 'active' | 'inactive';
  highlight?: boolean;
  country_code: string;
  elder_count: number;
  currency: string;
  interval_days: number;
}

function mapTier(t: PricingTier, index: number): Plan {
  const yearly = t.interval_days >= 300;
  return {
    id: t.id,
    name: `${t.country_code === '*' ? 'Default' : t.country_code} · ${t.elder_count} elder${t.elder_count === 1 ? '' : 's'}`,
    price: t.amount,
    billingCycle: yearly ? 'yearly' : 'monthly',
    userCount: t.elder_count,
    features: [
      `Country: ${t.country_code}`,
      `Covers ${t.elder_count} elder${t.elder_count === 1 ? '' : 's'}`,
      `Interval: ${t.interval_days} days`,
      `Currency: ${t.currency}`,
    ],
    status: t.is_active ? 'active' : 'inactive',
    highlight: index === 0,
    country_code: t.country_code,
    elder_count: t.elder_count,
    currency: t.currency,
    interval_days: t.interval_days,
  };
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ country_code: '*', elder_count: 1, amount: 0, currency: 'INR', interval_days: 365, is_active: true });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPricingTiers();
      if (res.success) setPlans((res.tiers || []).map(mapTier));
      else setError(res.error || 'Failed to load pricing tiers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pricing tiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ country_code: '*', elder_count: 1, amount: 0, currency: 'INR', interval_days: 365, is_active: true });
    setShowForm(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      country_code: plan.country_code,
      elder_count: plan.elder_count,
      amount: plan.price,
      currency: plan.currency,
      interval_days: plan.interval_days,
      is_active: plan.status === 'active',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = editing
        ? await updatePricingTier(editing.id, form)
        : await createPricingTier(form);
      if (res.success) {
        setShowForm(false);
        await load();
      } else setError(res.error || 'Failed to save tier');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pricing tier?')) return;
    try {
      const res = await deletePricingTier(id);
      if (res.success) await load();
      else setError(res.error || 'Failed to delete tier');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tier');
    }
  };

  const avgPrice = plans.length ? Math.round(plans.reduce((a, p) => a + p.price, 0) / plans.length) : 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Package className="w-6 h-6 text-brand-500" /> Subscription Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage pricing tiers and plan features</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
        </div>
      )}

      {showForm && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800 space-y-3">
          <h2 className="section-title">{editing ? 'Edit Pricing Tier' : 'New Pricing Tier'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Country code</label>
              <input className="input-field" value={form.country_code} onChange={e => setForm({ ...form, country_code: e.target.value })} placeholder="* or IN" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Elder count</label>
              <input type="number" min={1} className="input-field" value={form.elder_count} onChange={e => setForm({ ...form, elder_count: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Amount</label>
              <input type="number" min={0} className="input-field" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Currency</label>
              <input className="input-field" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Interval days</label>
              <input type="number" min={1} className="input-field" value={form.interval_days} onChange={e => setForm({ ...form, interval_days: Number(e.target.value) })} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Plans', value: plans.filter(p => p.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Total Tiers', value: plans.length, color: 'text-brand-600' },
          { label: 'Avg. Tier Price', value: `₹${avgPrice.toLocaleString()}`, color: 'text-violet-600' },
        ].map(item => (
          <div key={item.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading tiers…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={cn(
                'card p-5 flex flex-col relative cursor-pointer transition-all',
                plan.highlight && 'ring-2 ring-brand-500',
                selected === plan.id && 'ring-2 ring-teal-500',
                plan.status === 'inactive' && 'opacity-60'
              )}
              onClick={() => setSelected(plan.id === selected ? null : plan.id)}
            >
              {plan.highlight && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-brand-500 text-white px-2 py-0.5 rounded-full">Popular</span>
              )}
              <div className="mb-4">
                <p className="font-bold text-slate-900 dark:text-white text-base">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-brand-600">₹{plan.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4 text-sm">
                <span className="flex items-center gap-1 text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  {plan.userCount.toLocaleString()} elders
                </span>
                <Badge variant={plan.status === 'active' ? 'success' : 'default'} size="sm">{plan.status}</Badge>
              </div>

              <ul className="space-y-1.5 flex-1 mb-5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 mt-auto">
                <button className="btn-secondary flex-1 text-xs py-1.5" onClick={e => { e.stopPropagation(); openEdit(plan); }}>
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button className="btn-secondary text-xs py-1.5 px-3 text-red-500 hover:bg-red-50 border-red-200" onClick={e => { e.stopPropagation(); handleDelete(plan.id); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 text-sm">No pricing tiers yet</div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Check, Users, DollarSign } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  userCount: number;
  features: string[];
  status: 'active' | 'inactive';
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    id: 'p001', name: 'Basic', price: 299, billingCycle: 'monthly', userCount: 842,
    features: ['Elder Profile', 'Guardian Access', 'Up to 5 Medicines', 'SOS Button', 'Email Support'],
    status: 'active',
  },
  {
    id: 'p002', name: 'Standard', price: 599, billingCycle: 'monthly', userCount: 654, highlight: true,
    features: ['Everything in Basic', 'SOS Alerts & Notifications', 'AI Companion (50 msgs/mo)', 'Health Vault', 'Care Calendar', 'Priority Support'],
    status: 'active',
  },
  {
    id: 'p003', name: 'Premium', price: 999, billingCycle: 'monthly', userCount: 346,
    features: ['Everything in Standard', 'Unlimited AI Companion', 'Location Tracking', 'Family Events', 'Dedicated Support Manager', 'Advanced Analytics'],
    status: 'active',
  },
  {
    id: 'p004', name: 'Annual Basic', price: 2999, billingCycle: 'yearly', userCount: 0,
    features: ['Basic Plan features', '2 months free', 'Annual billing'],
    status: 'inactive',
  },
];

export default function SubscriptionPlansPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Package className="w-6 h-6 text-brand-500" /> Subscription Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage pricing tiers and plan features</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Plans', value: plans.filter(p => p.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Total Subscribers', value: plans.reduce((a, p) => a + p.userCount, 0).toLocaleString(), color: 'text-brand-600' },
          { label: 'Avg. Revenue / User', value: '₹623', color: 'text-violet-600' },
        ].map(item => (
          <div key={item.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Plans Grid */}
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
                {plan.userCount.toLocaleString()} users
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
              <button className="btn-secondary flex-1 text-xs py-1.5" onClick={e => e.stopPropagation()}>
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button className="btn-secondary text-xs py-1.5 px-3 text-red-500 hover:bg-red-50 border-red-200" onClick={e => e.stopPropagation()}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

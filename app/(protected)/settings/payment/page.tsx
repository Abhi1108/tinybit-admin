'use client';
import React, { useState } from 'react';
import { CreditCard, Save, CheckCircle } from 'lucide-react';
import { cn } from '@/src/components/ui';

export default function PaymentGatewayPage() {
  const [saved, setSaved] = useState(false);
  const [gateway, setGateway] = useState('razorpay');
  const [currency, setCurrency] = useState('INR');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [testMode, setTestMode] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const gateways = [
    { id: 'razorpay', name: 'Razorpay', logo: 'RZ', description: 'Recommended for Indian payments', active: true },
    { id: 'stripe', name: 'Stripe', logo: 'ST', description: 'International payments support', active: false },
    { id: 'cashfree', name: 'Cashfree', logo: 'CF', description: 'UPI and wallet payments', active: false },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title flex items-center gap-2"><CreditCard className="w-6 h-6 text-brand-500" /> Payment Gateway</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure payment providers and billing settings</p>
      </div>

      {/* Gateway Selection */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Active Gateway</h2>
        <div className="space-y-2">
          {gateways.map(gw => (
            <button
              key={gw.id}
              onClick={() => setGateway(gw.id)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors text-left',
                gateway === gw.id
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {gw.logo}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{gw.name}</p>
                <p className="text-xs text-slate-400">{gw.description}</p>
              </div>
              {gateway === gw.id && <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="card p-5">
        <h2 className="section-title mb-4">API Credentials</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">API Key</label>
            <input type="password" className="input-field font-mono" defaultValue="rzp_live_••••••••••••••••" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Secret Key</label>
            <input type="password" className="input-field font-mono" defaultValue="••••••••••••••••••••••••" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Webhook Secret</label>
            <input type="password" className="input-field font-mono" defaultValue="whsec_••••••••••••••••" />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Billing Settings</h2>
        <div className="space-y-3">
          {[
            { key: 'tax', label: 'GST / Tax Inclusive', desc: 'Include 18% GST in subscription prices', value: taxEnabled, toggle: () => setTaxEnabled(v => !v) },
            { key: 'test', label: 'Test Mode', desc: 'Use sandbox credentials for testing (no real charges)', value: testMode, toggle: () => setTestMode(v => !v) },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={item.toggle}
                className={cn('relative w-11 h-6 rounded-full transition-colors duration-200', item.value ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700')}
              >
                <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200', item.value && 'translate-x-5')} />
              </button>
            </div>
          ))}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Default Currency</label>
            <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary px-6">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

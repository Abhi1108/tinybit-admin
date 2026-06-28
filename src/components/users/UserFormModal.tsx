'use client';

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import type { CreateUserPayload, UpdateUserPayload } from '@/src/services/adminApi';

interface UserFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  role: 'elder' | 'guardian';
  initial?: UpdateUserPayload & { id?: string; phone?: string };
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload | UpdateUserPayload) => Promise<void>;
}

export function UserFormModal({ open, mode, role, initial, onClose, onSubmit }: UserFormModalProps) {
  const [fullName, setFullName] = useState(initial?.full_name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? initial?.mobile ?? '');
  const [country, setCountry] = useState(initial?.country ?? '');
  const [age, setAge] = useState(initial?.age != null ? String(initial.age) : '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'create') {
        await onSubmit({
          phone,
          countryCode: '+91',
          fullName: fullName || undefined,
          email: email || undefined,
          password: password || undefined,
          role,
          country: country || undefined,
          age: age ? parseInt(age, 10) : undefined,
        });
      } else {
        await onSubmit({
          full_name: fullName || undefined,
          email: email || undefined,
          mobile: phone || undefined,
          country: country || undefined,
          age: age ? parseInt(age, 10) : undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {mode === 'create' ? `Add ${role}` : 'Edit user'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="block text-xs font-semibold mb-1">Full name</label>
            <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Phone {mode === 'create' && '*'}</label>
            <input
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={mode === 'create'}
              disabled={mode === 'edit'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Country</label>
              <input className="input-field" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Age</label>
              <input type="number" className="input-field" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>

          {mode === 'create' && (
            <div>
              <label className="block text-xs font-semibold mb-1">Password (optional)</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty for OTP-only account"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

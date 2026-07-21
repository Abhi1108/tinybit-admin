'use client';
import React, { useCallback, useEffect, useState } from 'react';
import {
  UserCog, Plus, Search, Trash2, RotateCcw,
  Eye, EyeOff, Lock, Unlock, Loader2, AlertCircle, ShieldCheck,
} from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  getAdminRoles,
  resetAdminAccountPassword,
  updateAdminAccount,
  type AdminRoleRecord,
  type ManagedAdminAccount,
} from '@/src/services/adminApi';

export default function AdminAccountsPage() {
  const { isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<ManagedAdminAccount[]>([]);
  const [roles, setRoles] = useState<AdminRoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  const assignableRoles = roles.filter((r) => r.name !== 'super_admin' && r.status === 'active');

  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role_id: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [adminsRes, rolesRes] = await Promise.all([
        getAdminAccounts({ status: filterStatus }),
        getAdminRoles(),
      ]);
      setAdmins(adminsRes.admins || []);
      setRoles(rolesRes.roles || []);
      setForm((f) => {
        if (f.role_id) return f;
        const defaultRole = (rolesRes.roles || []).find((r) => r.name === 'operations_admin');
        return { ...f, role_id: defaultRole?.id || '' };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, filterStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = admins.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q)
      || u.email.toLowerCase().includes(q)
      || u.username.toLowerCase().includes(q)
      || (u.role?.label || '').toLowerCase().includes(q)
    );
  });

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.username.trim()) errors.username = 'Username is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Valid email required';
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!form.role_id) errors.role_id = 'Role is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate() {
    if (!validateForm()) return;
    setSaving(true);
    setActionError(null);
    try {
      await createAdminAccount({
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        role_id: form.role_id,
      });
      setShowCreate(false);
      setForm((f) => ({
        name: '',
        email: '',
        username: '',
        password: '',
        role_id: f.role_id,
      }));
      setFormErrors({});
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(admin: ManagedAdminAccount) {
    setActionError(null);
    try {
      await updateAdminAccount(admin.id, {
        status: admin.status === 'active' ? 'inactive' : 'active',
      });
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  async function changeRole(admin: ManagedAdminAccount, roleId: string) {
    setActionError(null);
    try {
      await updateAdminAccount(admin.id, { role_id: roleId });
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update role');
    }
  }

  async function handleResetPassword(id: string) {
    if (resetPassword.length < 8) {
      setActionError('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      await resetAdminAccountPassword(id, resetPassword);
      setResetId(null);
      setResetPassword('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(admin: ManagedAdminAccount) {
    if (!window.confirm(`Delete admin “${admin.name}” (${admin.username})? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteAdminAccount(admin.id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete admin');
    }
  }

  const counts = {
    total: admins.length,
    active: admins.filter((u) => u.status === 'active').length,
    inactive: admins.filter((u) => u.status === 'inactive').length,
  };

  if (!isSuperAdmin) {
    return (
      <div className="card p-8 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
        <h1 className="page-title">Admin Accounts</h1>
        <p className="text-sm text-slate-500">Only Super Admin can manage admin accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><UserCog className="w-6 h-6 text-brand-500" /> Admin Accounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Create managed admins and assign dynamic roles. Super Admin uses the shared env credential.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Create Admin
        </button>
      </div>

      {(error || actionError) && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error || actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Managed Admins', value: counts.total, color: 'text-brand-600' },
          { label: 'Active', value: counts.active, color: 'text-emerald-600' },
          { label: 'Inactive', value: counts.inactive, color: 'text-slate-400' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2"><Plus className="w-4 h-4" /> New Admin Account</h2>
            <button onClick={() => { setShowCreate(false); setFormErrors({}); }} className="text-slate-400">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Full Name *</label>
              <input className={cn('input-field', formErrors.name && 'border-red-400')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Username *</label>
              <input className={cn('input-field', formErrors.username && 'border-red-400')} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} autoComplete="off" />
              {formErrors.username && <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Email *</label>
              <input type="email" className={cn('input-field', formErrors.email && 'border-red-400')} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Role *</label>
              <select className={cn('input-field', formErrors.role_id && 'border-red-400')} value={form.role_id} onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}>
                <option value="">Select role…</option>
                {assignableRoles.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              {formErrors.role_id && <p className="text-xs text-red-500 mt-1">{formErrors.role_id}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={cn('input-field pr-10', formErrors.password && 'border-red-400')}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowCreate(false)} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={() => void handleCreate()} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Admin
            </button>
          </div>
        </div>
      )}

      {resetId && (
        <div className="card p-5 border border-amber-200 dark:border-amber-800">
          <h2 className="section-title mb-3">Reset Password</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-semibold mb-1.5">New password</label>
              <input type="password" className="input-field" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
            </div>
            <button className="btn-primary" disabled={saving} onClick={() => void handleResetPassword(resetId)}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Save Password
            </button>
            <button className="btn-secondary" onClick={() => { setResetId(null); setResetPassword(''); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search…"
            className="bg-transparent text-sm outline-none w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field py-2 text-sm w-36" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} admin{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Admin</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Username</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Last Login</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading…
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">No managed admin accounts yet</td>
              </tr>
            ) : (
              filtered.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{admin.name}</p>
                    <p className="text-xs text-slate-400">{admin.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{admin.username}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input-field py-1 text-xs w-44"
                      value={admin.role_id}
                      onChange={(e) => void changeRole(admin, e.target.value)}
                    >
                      {assignableRoles.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                      {admin.role && !assignableRoles.some((r) => r.id === admin.role_id) && (
                        <option value={admin.role_id}>{admin.role.label}</option>
                      )}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={admin.status === 'active' ? 'success' : 'default'} size="sm">
                      {admin.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {admin.last_login_at
                      ? new Date(admin.last_login_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setResetId(admin.id); setResetPassword(''); }} className="p-1.5 rounded text-slate-400 hover:text-amber-600" title="Reset Password">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => void toggleStatus(admin)} className="p-1.5 rounded text-slate-400 hover:text-amber-600" title={admin.status === 'active' ? 'Disable' : 'Enable'}>
                        {admin.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => void handleDelete(admin)} className="p-1.5 rounded text-slate-400 hover:text-red-500" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

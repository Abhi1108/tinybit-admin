'use client';
import React, { useState } from 'react';
import {
  UserCog, Plus, Search, Edit2, Trash2, RotateCcw, Mail,
  CheckCircle, XCircle, ShieldCheck, Eye, EyeOff, Send,
  MoreVertical, Lock, Unlock,
} from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  status: 'active' | 'inactive' | 'locked';
  lastLogin: string;
  createdAt: string;
  twoFAEnabled: boolean;
}

const adminUsers: AdminUser[] = [
  { id: 'adm-001', name: 'Arjun Mehta', email: 'arjun.mehta@tinybit.care', role: 'super_admin', roleLabel: 'Super Admin', status: 'active', lastLogin: '2026-06-10T09:30:00Z', createdAt: '2025-01-01', twoFAEnabled: true },
  { id: 'adm-002', name: 'Priya Nair', email: 'priya.nair@tinybit.care', role: 'operations_admin', roleLabel: 'Operations Admin', status: 'active', lastLogin: '2026-06-10T08:45:00Z', createdAt: '2025-03-15', twoFAEnabled: true },
  { id: 'adm-003', name: 'Rohit Verma', email: 'rohit.verma@tinybit.care', role: 'support_manager', roleLabel: 'Support Manager', status: 'active', lastLogin: '2026-06-09T16:20:00Z', createdAt: '2025-06-01', twoFAEnabled: false },
  { id: 'adm-004', name: 'Meera Krishnan', email: 'meera.k@tinybit.care', role: 'content_manager', roleLabel: 'Content Manager', status: 'active', lastLogin: '2026-06-10T07:30:00Z', createdAt: '2025-04-20', twoFAEnabled: false },
  { id: 'adm-005', name: 'Sanjay Patil', email: 'sanjay.p@tinybit.care', role: 'moderator', roleLabel: 'Moderator', status: 'inactive', lastLogin: '2026-06-03T14:00:00Z', createdAt: '2025-07-10', twoFAEnabled: false },
  { id: 'adm-006', name: 'Divya Shah', email: 'divya.shah@tinybit.care', role: 'support_manager', roleLabel: 'Support Manager', status: 'active', lastLogin: '2026-06-10T10:15:00Z', createdAt: '2025-09-05', twoFAEnabled: true },
  { id: 'adm-007', name: 'Karan Bose', email: 'karan.b@tinybit.care', role: 'moderator', roleLabel: 'Moderator', status: 'locked', lastLogin: '2026-06-01T11:00:00Z', createdAt: '2025-10-12', twoFAEnabled: false },
];

const roleColors: Record<string, string> = {
  super_admin: 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300',
  operations_admin: 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300',
  support_manager: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  content_manager: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300',
  moderator: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const statusVariants: Record<string, 'success' | 'default' | 'danger'> = {
  active: 'success',
  inactive: 'default',
  locked: 'danger',
};

const ROLES = ['Super Admin', 'Operations Admin', 'Content Manager', 'Support Manager', 'Moderator'];

export default function AdminAccountsPage() {
  const [users, setUsers] = useState(adminUsers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Create form state
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Support Manager', sendCredentials: true });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.roleLabel === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Valid email required';
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleCreate() {
    if (!validateForm()) return;
    setShowCreate(false);
    setForm({ name: '', email: '', password: '', role: 'Support Manager', sendCredentials: true });
    setFormErrors({});
  }

  function toggleStatus(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    setOpenMenu(null);
  }

  function unlockAccount(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u));
    setOpenMenu(null);
  }

  const counts = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    locked: users.filter(u => u.status === 'locked').length,
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><UserCog className="w-6 h-6 text-brand-500" /> Admin Accounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Create and manage admin panel users</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Create Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Admins', value: counts.total, color: 'text-brand-600' },
          { label: 'Active', value: counts.active, color: 'text-emerald-600' },
          { label: 'Inactive', value: counts.inactive, color: 'text-slate-400' },
          { label: 'Locked', value: counts.locked, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create Admin Panel */}
      {showCreate && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2"><Plus className="w-4 h-4" /> New Admin Account</h2>
            <button onClick={() => { setShowCreate(false); setFormErrors({}); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={cn('input-field', formErrors.name && 'border-red-400 dark:border-red-500')}
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                className={cn('input-field', formErrors.email && 'border-red-400 dark:border-red-500')}
                placeholder="admin@tinybit.care"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={cn('input-field pr-10', formErrors.password && 'border-red-400 dark:border-red-500')}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
              {form.password.length >= 8 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className={cn('h-1 flex-1 rounded', form.password.length >= 8 ? 'bg-emerald-400' : 'bg-slate-200')} />
                  <div className={cn('h-1 flex-1 rounded', form.password.length >= 10 ? 'bg-emerald-400' : 'bg-slate-200')} />
                  <div className={cn('h-1 flex-1 rounded', /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 'bg-emerald-400' : 'bg-slate-200')} />
                  <span className="text-[10px] text-slate-400">
                    {form.password.length < 8 ? 'Weak' : form.password.length < 10 ? 'Fair' : 'Strong'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Assigned Role <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-6 mb-5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-brand-600"
                checked={form.sendCredentials}
                onChange={e => setForm(f => ({ ...f, sendCredentials: e.target.checked }))}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Send login credentials via email</span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => { setShowCreate(false); setFormErrors({}); }}>Cancel</button>
            <button className="btn-primary" onClick={handleCreate}>
              <Send className="w-4 h-4" /> Create & Send Credentials
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search name or email..." className="bg-transparent text-sm outline-none w-48 text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field py-2 text-sm w-44" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="input-field py-2 text-sm w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="locked">Locked</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} admin{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Admin</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">2FA</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Last Login</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(admin => (
              <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {admin.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{admin.name}</p>
                      <p className="text-xs text-slate-400">{admin.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', roleColors[admin.role] || 'bg-slate-100 text-slate-600')}>
                    {admin.roleLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariants[admin.status]} size="sm">
                    {admin.status === 'locked' ? '🔒 Locked' : admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {admin.twoFAEnabled
                    ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /> Enabled</span>
                    : <span className="flex items-center gap-1 text-xs text-slate-400"><XCircle className="w-3.5 h-3.5" /> Off</span>
                  }
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                  {new Date(admin.lastLogin).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                  {new Date(admin.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <div className="relative flex items-center gap-1 justify-end">
                    {admin.role !== 'super_admin' && (
                      <>
                        <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-600 transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-600 transition-colors" title="Reset Password">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors" title="Send Credentials">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        {admin.status === 'locked'
                          ? <button onClick={() => unlockAccount(admin.id)} className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-red-400 hover:text-emerald-600 transition-colors" title="Unlock">
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          : <button onClick={() => toggleStatus(admin.id)} className={cn('p-1.5 rounded transition-colors text-slate-400', admin.status === 'active' ? 'hover:bg-amber-50 hover:text-amber-600' : 'hover:bg-emerald-50 hover:text-emerald-600')} title={admin.status === 'active' ? 'Disable' : 'Enable'}>
                              {admin.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                        }
                        <button className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {admin.role === 'super_admin' && (
                      <span className="text-xs text-slate-400 italic">Protected</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">No admin accounts found</div>
        )}
      </div>
    </div>
  );
}

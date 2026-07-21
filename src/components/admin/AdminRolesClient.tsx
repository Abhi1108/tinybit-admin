'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { UserCog, Plus, Edit2, Trash2, Shield, Check, X, Save, Loader2, AlertCircle } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  createAdminRole,
  deleteAdminRole,
  getAdminRoles,
  updateAdminRole,
  type AdminRoleRecord,
} from '@/src/services/adminApi';

const DEFAULT_CATALOG = [
  'All Modules', 'Dashboard', 'Dashboard (Read)', 'User Management', 'Users (Read)',
  'Admin Management', 'Content Management', 'FAQ Management', 'SOS Management', 'SOS (Read)',
  'Support Tickets', 'User Queries', 'Chat Support', 'Escalation', 'Notifications',
  'Notifications (Read)', 'Billing', 'AI Management', 'Settings', 'Leaderboard & Rewards',
];

export function AdminRolesClient({ readOnly = false }: { readOnly?: boolean }) {
  const { isSuperAdmin } = useAuth();
  const canMutate = isSuperAdmin && !readOnly;

  const [roles, setRoles] = useState<AdminRoleRecord[]>([]);
  const [catalog, setCatalog] = useState<string[]>(DEFAULT_CATALOG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminRoleRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    label: '',
    description: '',
    permissions: [] as string[],
    status: 'active' as 'active' | 'inactive',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminRoles();
      setRoles(res.roles || []);
      if (res.permission_catalog?.length) setCatalog(res.permission_catalog);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function togglePerm(list: string[], perm: string) {
    return list.includes(perm) ? list.filter((p) => p !== perm) : [...list, perm];
  }

  async function handleCreate() {
    if (!form.label.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createAdminRole({
        label: form.label.trim(),
        description: form.description,
        permissions: form.permissions,
        status: form.status,
      });
      setShowCreate(false);
      setForm({ label: '', description: '', permissions: [], status: 'active' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      await updateAdminRole(editing.id, {
        label: editing.label,
        description: editing.description,
        permissions: editing.name === 'super_admin' ? ['*'] : editing.permissions,
        status: editing.status,
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(role: AdminRoleRecord) {
    if (!window.confirm(`Delete role “${role.label}”?`)) return;
    setError(null);
    try {
      await deleteAdminRole(role.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    }
  }

  const totalAssigned = roles.reduce((a, r) => a + (r.user_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><UserCog className="w-6 h-6 text-brand-500" /> Role Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {loading ? 'Loading…' : `${roles.length} roles · ${totalAssigned} admins assigned`}
          </p>
        </div>
        {canMutate && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> Create Role
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showCreate && canMutate && (
        <div className="card p-5 border-2 border-brand-200 dark:border-brand-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">New Role</h2>
            <button onClick={() => setShowCreate(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Label</label>
              <input className="input-field" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. Regional Manager" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Status</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Description</label>
            <input className="input-field" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2">Permissions</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {catalog.filter((p) => p !== 'All Modules').map((perm) => (
                <label key={perm} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(perm)}
                    onChange={() => setForm((f) => ({ ...f, permissions: togglePerm(f.permissions, perm) }))}
                  />
                  {perm}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn-primary" disabled={saving} onClick={() => void handleCreate()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </div>
        </div>
      )}

      {editing && canMutate && (
        <div className="card p-5 border-2 border-amber-200 dark:border-amber-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Edit {editing.label}</h2>
            <button onClick={() => setEditing(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Label</label>
              <input className="input-field" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
            </div>
            {editing.name !== 'super_admin' && (
              <div>
                <label className="block text-xs font-semibold mb-1.5">Status</label>
                <select
                  className="input-field"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Description</label>
            <input className="input-field" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          {editing.name === 'super_admin' ? (
            <p className="text-xs text-slate-500">Super Admin always has full access (`*`). Permissions are locked.</p>
          ) : (
            <div>
              <label className="block text-xs font-semibold mb-2">Permissions</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {catalog.filter((p) => p !== 'All Modules').map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.permissions.includes(perm)}
                      onChange={() => setEditing({
                        ...editing,
                        permissions: togglePerm(editing.permissions, perm),
                      })}
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-primary" disabled={saving} onClick={() => void handleSaveEdit()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading roles…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className={cn('card p-5 cursor-pointer transition-all', selected === role.id && 'ring-2 ring-brand-500')}
              onClick={() => setSelected(role.id === selected ? null : role.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{role.label}</p>
                    <p className="text-xs text-slate-400">{role.user_count} admin{role.user_count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Badge variant={role.status === 'active' ? 'success' : 'default'} size="sm">{role.status}</Badge>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{role.description || '—'}</p>

              <div className="space-y-1.5 mb-4 max-h-32 overflow-y-auto">
                {(role.permissions.includes('*') ? ['All Modules'] : role.permissions).map((p) => (
                  <div key={p} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    {p}
                  </div>
                ))}
              </div>

              {canMutate && (
                <div className="flex gap-2">
                  <button
                    className="btn-secondary flex-1 text-xs py-1.5"
                    onClick={(e) => { e.stopPropagation(); setEditing(role); setShowCreate(false); }}
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Role
                  </button>
                  {!role.is_system && (
                    <button
                      className="btn-secondary text-xs py-1.5 px-3 text-red-500 hover:bg-red-50 border-red-200"
                      onClick={(e) => { e.stopPropagation(); void handleDelete(role); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Check, Users, X, Save } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

interface Role {
  id: string;
  name: string;
  label: string;
  description: string;
  color: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

const initialRoles: Role[] = [
  {
    id: 'r001', name: 'super_admin', label: 'Super Admin', color: 'violet',
    description: 'Full unrestricted access to all modules, settings, and user management.',
    userCount: 2, isSystem: true,
    permissions: ['*'],
  },
  {
    id: 'r002', name: 'operations_admin', label: 'Operations Admin', color: 'brand',
    description: 'Manages daily platform operations, user accounts, and SOS events.',
    userCount: 3, isSystem: true,
    permissions: ['User Management', 'SOS Management', 'Support Tickets', 'Notifications', 'Dashboard'],
  },
  {
    id: 'r003', name: 'content_manager', label: 'Content Manager', color: 'teal',
    description: 'Full control over videos, FAQs, and all published content.',
    userCount: 3, isSystem: true,
    permissions: ['Content Management', 'FAQ Management', 'Notifications (Read)', 'Dashboard'],
  },
  {
    id: 'r004', name: 'support_manager', label: 'Support Manager', color: 'amber',
    description: 'Handles all support tickets, user queries, and escalations.',
    userCount: 8, isSystem: true,
    permissions: ['Support Tickets', 'User Queries', 'Chat Support', 'Escalation', 'Dashboard'],
  },
  {
    id: 'r005', name: 'moderator', label: 'Moderator', color: 'slate',
    description: 'Read-only access with limited moderation capabilities.',
    userCount: 4, isSystem: true,
    permissions: ['Dashboard (Read)', 'Users (Read)', 'Content (Read)'],
  },
];

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', ring: 'ring-violet-400' },
  brand: { bg: 'bg-brand-50 dark:bg-brand-900/20', text: 'text-brand-700 dark:text-brand-300', ring: 'ring-brand-400' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-300', ring: 'ring-teal-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-400' },
  slate: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', ring: 'ring-slate-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-400' },
};

const ALL_PERMISSIONS = [
  'Dashboard', 'User Management', 'Admin Management', 'Subscription Management',
  'Payment Management', 'Content Management', 'FAQ Management', 'Support Management',
  'AI Management', 'Notification Management', 'Email Management',
  'Leaderboard & Rewards', 'Settings',
];

export default function RoleManagementPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({ label: '', description: '', color: 'brand', permissions: [] as string[] });

  function toggleNewPerm(perm: string) {
    setNewRole(r => ({
      ...r,
      permissions: r.permissions.includes(perm) ? r.permissions.filter(p => p !== perm) : [...r.permissions, perm],
    }));
  }

  function toggleEditPerm(perm: string) {
    if (!editingRole) return;
    setEditingRole(r => r ? ({
      ...r,
      permissions: r.permissions.includes(perm) ? r.permissions.filter(p => p !== perm) : [...r.permissions, perm],
    }) : null);
  }

  function handleCreate() {
    if (!newRole.label.trim()) return;
    const role: Role = {
      id: `r${Date.now()}`,
      name: newRole.label.toLowerCase().replace(/\s+/g, '_'),
      label: newRole.label,
      description: newRole.description,
      color: newRole.color,
      userCount: 0,
      permissions: newRole.permissions,
      isSystem: false,
    };
    setRoles(prev => [...prev, role]);
    setNewRole({ label: '', description: '', color: 'brand', permissions: [] });
    setShowCreate(false);
  }

  function handleSaveEdit() {
    if (!editingRole) return;
    setRoles(prev => prev.map(r => r.id === editingRole.id ? editingRole : r));
    setEditingRole(null);
  }

  function deleteRole(id: string) {
    setRoles(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Shield className="w-6 h-6 text-brand-500" /> Role Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{roles.length} roles · {roles.reduce((a, r) => a + r.userCount, 0)} admins assigned</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      {/* Create Role Panel */}
      {showCreate && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">New Role</h2>
            <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Role Name <span className="text-red-500">*</span></label>
              <input type="text" className="input-field" placeholder="e.g. Finance Manager" value={newRole.label} onChange={e => setNewRole(r => ({ ...r, label: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Color</label>
              <div className="flex gap-2">
                {Object.entries(colorMap).map(([key, val]) => (
                  <button key={key} onClick={() => setNewRole(r => ({ ...r, color: key }))}
                    className={cn('w-7 h-7 rounded-full border-2 transition-all', val.bg, newRole.color === key ? `border-slate-800 dark:border-white scale-110` : 'border-transparent')} />
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <input type="text" className="input-field" placeholder="Brief description of this role's responsibilities" value={newRole.description} onChange={e => setNewRole(r => ({ ...r, description: e.target.value }))} />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Module Access</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {ALL_PERMISSIONS.map(perm => (
                <button key={perm} onClick={() => toggleNewPerm(perm)}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left',
                    newRole.permissions.includes(perm)
                      ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/20 dark:border-brand-700 dark:text-brand-300'
                      : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                  )}>
                  <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                    newRole.permissions.includes(perm) ? 'bg-brand-500 border-brand-500' : 'border-slate-300 dark:border-slate-600'
                  )}>
                    {newRole.permissions.includes(perm) && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  {perm}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleCreate}><Save className="w-4 h-4" /> Create Role</button>
          </div>
        </div>
      )}

      {/* Edit Permissions Panel */}
      {editingRole && (
        <div className="card p-6 border-2 border-teal-200 dark:border-teal-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Edit Permissions — {editingRole.label}</h2>
            <button onClick={() => setEditingRole(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-5">
            {ALL_PERMISSIONS.map(perm => (
              <button key={perm} onClick={() => toggleEditPerm(perm)}
                className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left',
                  editingRole.permissions.includes(perm) || editingRole.permissions.includes('*')
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                )}>
                <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                  editingRole.permissions.includes(perm) || editingRole.permissions.includes('*') ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                )}>
                  {(editingRole.permissions.includes(perm) || editingRole.permissions.includes('*')) && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                {perm}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setEditingRole(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveEdit}><Save className="w-4 h-4" /> Save Permissions</button>
          </div>
        </div>
      )}

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map(role => {
          const colors = colorMap[role.color] || colorMap.slate;
          return (
            <div key={role.id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg)}>
                    <Shield className={cn('w-5 h-5', colors.text)} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{role.label}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">{role.userCount} admin{role.userCount !== 1 ? 's' : ''}</span>
                      {role.isSystem && <Badge variant="default" size="sm">System</Badge>}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex-1">{role.description}</p>

              <div className="mb-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Module Access</p>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.includes('*')
                    ? <span className="text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 px-2 py-0.5 rounded-full font-medium">All Modules</span>
                    : role.permissions.map(p => (
                        <span key={p} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{p}</span>
                      ))
                  }
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  className="btn-secondary flex-1 text-xs py-1.5"
                  onClick={() => setEditingRole(role)}
                  disabled={role.permissions.includes('*')}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Permissions
                </button>
                {!role.isSystem && (
                  <button className="btn-secondary text-xs py-1.5 px-3 text-red-500 hover:bg-red-50 border-red-200" onClick={() => deleteRole(role.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

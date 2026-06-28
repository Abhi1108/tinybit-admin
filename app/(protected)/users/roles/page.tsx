'use client';
import React, { useState } from 'react';
import { UserCog, Plus, Edit2, Trash2, Shield, Check } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

interface Role {
  id: string;
  name: string;
  label: string;
  description: string;
  userCount: number;
  permissions: string[];
  status: 'active' | 'inactive';
}

const roles: Role[] = [
  {
    id: 'r001', name: 'super_admin', label: 'Super Admin', description: 'Full access to all modules and settings',
    userCount: 2, permissions: ['All Modules', 'Settings', 'User Management', 'Billing', 'AI Management'],
    status: 'active',
  },
  {
    id: 'r002', name: 'operations_admin', label: 'Operations Admin', description: 'Manages daily operations, users, and SOS events',
    userCount: 5, permissions: ['User Management', 'SOS Management', 'Support Tickets', 'Notifications'],
    status: 'active',
  },
  {
    id: 'r003', name: 'content_manager', label: 'Content Manager', description: 'Manages videos, FAQs, and content library',
    userCount: 3, permissions: ['Content Management', 'FAQ Management', 'Notifications (Read)'],
    status: 'active',
  },
  {
    id: 'r004', name: 'support_manager', label: 'Support Manager', description: 'Handles all support tickets and user queries',
    userCount: 8, permissions: ['Support Tickets', 'User Queries', 'Chat Support', 'Escalation'],
    status: 'active',
  },
  {
    id: 'r005', name: 'moderator', label: 'Moderator', description: 'Read-only access with basic moderation actions',
    userCount: 4, permissions: ['Dashboard (Read)', 'Users (Read)', 'SOS (Read)'],
    status: 'active',
  },
];

export default function RoleManagementPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><UserCog className="w-6 h-6 text-brand-500" /> Role Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Create, edit, and assign permissions to admin roles</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map(role => (
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
                  <p className="text-xs text-slate-400">{role.userCount} admin{role.userCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <Badge variant="success" size="sm">{role.status}</Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{role.description}</p>

            <div className="space-y-1.5 mb-4">
              {role.permissions.map(p => (
                <div key={p} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="btn-secondary flex-1 text-xs py-1.5" onClick={e => e.stopPropagation()}>
                <Edit2 className="w-3.5 h-3.5" /> Edit Role
              </button>
              {role.name !== 'super_admin' && (
                <button className="btn-secondary text-xs py-1.5 px-3 text-red-500 hover:bg-red-50 border-red-200" onClick={e => e.stopPropagation()}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

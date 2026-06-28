'use client';
import React, { useState } from 'react';
import { Key, Save, Check, Shield } from 'lucide-react';
import { cn } from '@/src/components/ui';

const ROLES = ['Super Admin', 'Operations Admin', 'Content Manager', 'Support Manager', 'Moderator'];

const MODULES = [
  'Dashboard',
  'User Management',
  'Admin Management',
  'Subscription Management',
  'Payment Management',
  'Content Management',
  'FAQ Management',
  'Support Management',
  'AI Management',
  'Notification Management',
  'Email Management',
  'SOS Management',
  'Leaderboard & Rewards',
  'Settings',
];

const PERMISSION_LEVELS = ['View', 'Create', 'Edit', 'Delete', 'Export', 'Manage'] as const;
type PermLevel = typeof PERMISSION_LEVELS[number];

type PermMatrix = Record<string, Record<string, Record<PermLevel, boolean>>>;

function buildDefault(): PermMatrix {
  const matrix: PermMatrix = {};
  for (const role of ROLES) {
    matrix[role] = {};
    for (const mod of MODULES) {
      matrix[role][mod] = { View: false, Create: false, Edit: false, Delete: false, Export: false, Manage: false };
    }
  }

  // Super Admin — all
  for (const mod of MODULES) {
    for (const p of PERMISSION_LEVELS) matrix['Super Admin'][mod][p] = true;
  }

  // Operations Admin
  const opsModules: Record<string, PermLevel[]> = {
    'Dashboard': ['View'],
    'User Management': ['View', 'Edit', 'Create'],
    'Support Management': ['View', 'Edit', 'Create', 'Manage'],
    'Notification Management': ['View', 'Create'],
    'SOS Management': ['View', 'Manage'],
  };
  for (const [mod, perms] of Object.entries(opsModules)) {
    for (const p of perms) matrix['Operations Admin'][mod][p] = true;
  }

  // Content Manager
  const contentModules: Record<string, PermLevel[]> = {
    'Dashboard': ['View'],
    'Content Management': ['View', 'Create', 'Edit', 'Delete', 'Manage'],
    'FAQ Management': ['View', 'Create', 'Edit', 'Delete'],
    'Notification Management': ['View'],
  };
  for (const [mod, perms] of Object.entries(contentModules)) {
    for (const p of perms) matrix['Content Manager'][mod][p] = true;
  }

  // Support Manager
  const supportModules: Record<string, PermLevel[]> = {
    'Dashboard': ['View'],
    'User Management': ['View'],
    'Support Management': ['View', 'Create', 'Edit', 'Delete', 'Manage'],
    'Notification Management': ['View'],
  };
  for (const [mod, perms] of Object.entries(supportModules)) {
    for (const p of perms) matrix['Support Manager'][mod][p] = true;
  }

  // Moderator
  for (const mod of ['Dashboard', 'User Management', 'Content Management', 'SOS Management']) {
    matrix['Moderator'][mod]['View'] = true;
  }

  return matrix;
}

const permColors: Record<PermLevel, string> = {
  View: 'bg-blue-500',
  Create: 'bg-emerald-500',
  Edit: 'bg-amber-500',
  Delete: 'bg-red-500',
  Export: 'bg-violet-500',
  Manage: 'bg-brand-500',
};

export default function PermissionsPage() {
  const [activeRole, setActiveRole] = useState('Operations Admin');
  const [matrix, setMatrix] = useState(buildDefault);
  const [saved, setSaved] = useState(false);

  const isSuper = activeRole === 'Super Admin';

  function toggle(mod: string, perm: PermLevel) {
    if (isSuper) return;
    setMatrix(prev => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [mod]: { ...prev[activeRole][mod], [perm]: !prev[activeRole][mod][perm] },
      },
    }));
  }

  function toggleRow(mod: string) {
    if (isSuper) return;
    const allOn = PERMISSION_LEVELS.every(p => matrix[activeRole][mod][p]);
    setMatrix(prev => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [mod]: Object.fromEntries(PERMISSION_LEVELS.map(p => [p, !allOn])) as Record<PermLevel, boolean>,
      },
    }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const roleGrants = matrix[activeRole];
  const totalGranted = Object.values(roleGrants).reduce((a, m) => a + Object.values(m).filter(Boolean).length, 0);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Key className="w-6 h-6 text-brand-500" /> Permission Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Fine-grained module-level permissions per role</p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {PERMISSION_LEVELS.map(p => (
          <span key={p} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className={cn('w-2.5 h-2.5 rounded-sm', permColors[p])} />
            {p}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Role Selector */}
        <div className="card p-3 space-y-1 h-fit">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Select Role</p>
          {ROLES.map(role => {
            const grants = Object.values(matrix[role]).reduce((a, m) => a + Object.values(m).filter(Boolean).length, 0);
            return (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={cn('sidebar-link w-full text-sm', activeRole === role && 'active')}
              >
                <Shield className="w-4 h-4" />
                <span className="flex-1 text-left truncate">{role}</span>
                <span className="text-[10px] text-slate-400">{grants}</span>
              </button>
            );
          })}
        </div>

        {/* Permission Matrix */}
        <div className="xl:col-span-4 space-y-3">
          {isSuper && (
            <div className="card p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
              <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Super Admin has all {MODULES.length * PERMISSION_LEVELS.length} permissions. This cannot be changed.</p>
            </div>
          )}
          <div className="card overflow-hidden">
            {/* Header */}
            <div className="grid bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-4 py-2.5" style={{ gridTemplateColumns: '1fr repeat(6, 80px) 40px' }}>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Module</span>
              {PERMISSION_LEVELS.map(p => (
                <span key={p} className="text-[10px] font-bold text-center uppercase tracking-wide" style={{ color: '' }}>
                  <span className={cn('px-1.5 py-0.5 rounded text-white', permColors[p])}>{p}</span>
                </span>
              ))}
              <span className="text-xs text-center text-slate-400">All</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MODULES.map(mod => {
                const modPerms = roleGrants[mod];
                const allOn = PERMISSION_LEVELS.every(p => modPerms[p]);
                const someOn = PERMISSION_LEVELS.some(p => modPerms[p]);
                return (
                  <div key={mod} className={cn('grid items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors', isSuper && 'opacity-70')} style={{ gridTemplateColumns: '1fr repeat(6, 80px) 40px' }}>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{mod}</span>
                    {PERMISSION_LEVELS.map(perm => (
                      <div key={perm} className="flex justify-center">
                        <button
                          onClick={() => toggle(mod, perm)}
                          disabled={isSuper}
                          className={cn(
                            'w-6 h-6 rounded border-2 flex items-center justify-center transition-all',
                            modPerms[perm]
                              ? `${permColors[perm]} border-transparent`
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-400',
                            isSuper && 'cursor-default'
                          )}
                        >
                          {modPerms[perm] && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleRow(mod)}
                        disabled={isSuper}
                        className={cn(
                          'w-6 h-6 rounded border-2 flex items-center justify-center transition-all',
                          allOn ? 'bg-slate-700 dark:bg-white border-transparent' : someOn ? 'bg-slate-300 dark:bg-slate-600 border-transparent' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-400',
                          isSuper && 'cursor-default'
                        )}
                      >
                        {allOn && <Check className="w-3 h-3 text-white dark:text-slate-900" />}
                        {someOn && !allOn && <span className="w-2 h-0.5 bg-white dark:bg-slate-300 rounded" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer summary */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">{activeRole}</span>
              <span className="text-xs font-semibold text-brand-600">{totalGranted} of {MODULES.length * PERMISSION_LEVELS.length} permissions granted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

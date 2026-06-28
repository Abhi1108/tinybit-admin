'use client';
import React, { useState } from 'react';
import { Shield, Check, Save } from 'lucide-react';
import { cn } from '@/src/components/ui';

const ROLES = ['Super Admin', 'Operations Admin', 'Content Manager', 'Support Manager', 'Moderator'];

const PERMISSIONS: Record<string, string[]> = {
  'Dashboard': ['View Dashboard'],
  'User Management': ['View Users', 'Edit Users', 'Suspend Users', 'Delete Users'],
  'Subscription & Payments': ['View Subscriptions', 'Edit Plans', 'View Payments', 'Issue Refunds'],
  'Content Management': ['View Content', 'Upload Videos', 'Edit FAQs', 'Delete Content'],
  'Support Management': ['View Tickets', 'Reply to Tickets', 'Assign Tickets', 'Close Tickets'],
  'AI Management': ['View AI Stats', 'Configure Models', 'Set Budgets'],
  'SOS Management': ['View SOS Alerts', 'Resolve Alerts', 'View Incidents'],
  'Notifications': ['View Notifications', 'Send Push', 'Send Email'],
  'Leaderboard': ['View Leaderboard', 'Manage Streaks'],
  'Settings': ['View Settings', 'Edit Settings', 'Manage Roles'],
};

const DEFAULT_GRANTS: Record<string, Record<string, boolean>> = {
  'Super Admin': Object.fromEntries(Object.values(PERMISSIONS).flat().map(p => [p, true])),
  'Operations Admin': Object.fromEntries(Object.values(PERMISSIONS).flat().map(p => [p, ['View Dashboard', 'View Users', 'Edit Users', 'Suspend Users', 'View Subscriptions', 'View Tickets', 'Reply to Tickets', 'Assign Tickets', 'View SOS Alerts', 'Resolve Alerts', 'View Incidents', 'View Notifications', 'Send Push'].includes(p)])),
  'Content Manager': Object.fromEntries(Object.values(PERMISSIONS).flat().map(p => [p, ['View Dashboard', 'View Content', 'Upload Videos', 'Edit FAQs', 'Delete Content', 'View Notifications'].includes(p)])),
  'Support Manager': Object.fromEntries(Object.values(PERMISSIONS).flat().map(p => [p, ['View Dashboard', 'View Users', 'View Tickets', 'Reply to Tickets', 'Assign Tickets', 'Close Tickets', 'View Notifications'].includes(p)])),
  'Moderator': Object.fromEntries(Object.values(PERMISSIONS).flat().map(p => [p, ['View Dashboard', 'View Users', 'View SOS Alerts', 'View Tickets'].includes(p)])),
};

export default function RolePermissionsPage() {
  const [activeRole, setActiveRole] = useState('Operations Admin');
  const [grants, setGrants] = useState(DEFAULT_GRANTS);
  const [saved, setSaved] = useState(false);

  const isSuper = activeRole === 'Super Admin';

  function toggle(perm: string) {
    if (isSuper) return;
    setGrants(g => ({ ...g, [activeRole]: { ...g[activeRole], [perm]: !g[activeRole][perm] } }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Shield className="w-6 h-6 text-brand-500" /> Role Permissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Fine-grained permission control per admin role</p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Role List */}
        <div className="card p-3 space-y-1 h-fit">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={cn(
                'sidebar-link w-full text-sm',
                activeRole === role && 'active'
              )}
            >
              <Shield className="w-4 h-4" />
              <span className="flex-1 text-left truncate">{role}</span>
            </button>
          ))}
        </div>

        {/* Permission Matrix */}
        <div className="xl:col-span-3 space-y-4">
          {isSuper && (
            <div className="card p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Super Admin has all permissions by default and cannot be restricted.</p>
            </div>
          )}
          {Object.entries(PERMISSIONS).map(([module, perms]) => (
            <div key={module} className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{module}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {perms.map(perm => {
                  const granted = grants[activeRole]?.[perm] ?? false;
                  return (
                    <button
                      key={perm}
                      onClick={() => toggle(perm)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left',
                        granted
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500',
                        isSuper && 'cursor-default'
                      )}
                    >
                      <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0', granted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600')}>
                        {granted && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      {perm}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

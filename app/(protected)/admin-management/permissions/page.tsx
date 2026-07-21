'use client';
import { AdminRolesClient } from '@/src/components/admin/AdminRolesClient';
import { useAuth } from '@/src/contexts/AuthContext';
import { Key } from 'lucide-react';

export default function PermissionsPage() {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return (
      <div className="card p-8 text-center space-y-3">
        <Key className="w-10 h-10 text-slate-400 mx-auto" />
        <h1 className="page-title">Permissions</h1>
        <p className="text-sm text-slate-500">Only Super Admin can view role permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-500 dark:text-slate-400 px-1">
        Permissions are managed per role. Use Role Management to edit grants.
      </p>
      <AdminRolesClient readOnly />
    </div>
  );
}

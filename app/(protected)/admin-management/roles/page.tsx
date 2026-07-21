'use client';
import { AdminRolesClient } from '@/src/components/admin/AdminRolesClient';
import { useAuth } from '@/src/contexts/AuthContext';
import { Shield } from 'lucide-react';

export default function RoleManagementPage() {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return (
      <div className="card p-8 text-center space-y-3">
        <Shield className="w-10 h-10 text-slate-400 mx-auto" />
        <h1 className="page-title">Role Management</h1>
        <p className="text-sm text-slate-500">Only Super Admin can manage roles.</p>
      </div>
    );
  }

  return <AdminRolesClient />;
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Ban, Trash2, Loader2 } from 'lucide-react';
import { banAdminUser, deleteAdminUser } from '@/src/services/adminApi';
import type { AdminProfileUser } from '@/src/services/adminApi';
import { profileStatus } from '@/src/utils/userDisplay';

interface UserRowActionsProps {
  user: AdminProfileUser;
  detailPath: string;
  onChanged: () => void;
}

export function UserRowActions({ user, detailPath, onChanged }: UserRowActionsProps) {
  const [loading, setLoading] = useState<'ban' | 'delete' | null>(null);
  const isSuspended = profileStatus(user.is_banned) === 'suspended';

  async function handleBan() {
    const action = isSuspended ? 'reactivate' : 'suspend';
    if (!confirm(`${action === 'suspend' ? 'Suspend' : 'Reactivate'} this user?`)) return;
    setLoading('ban');
    try {
      await banAdminUser(user.id, !isSuspended);
      onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm('Permanently delete this user and all related data?')) return;
    setLoading('delete');
    try {
      await deleteAdminUser(user.id);
      onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Link href={detailPath}>
        <button
          type="button"
          className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-brand-600 transition-colors"
          title="View profile"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </Link>
      <button
        type="button"
        onClick={handleBan}
        disabled={!!loading}
        className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 transition-colors"
        title={isSuspended ? 'Reactivate' : 'Suspend'}
      >
        {loading === 'ban' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={!!loading}
        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
        title="Delete"
      >
        {loading === 'delete' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

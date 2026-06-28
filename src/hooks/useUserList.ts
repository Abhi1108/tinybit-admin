'use client';

import { useEffect, useState } from 'react';
import { getAdminUsers, type AdminProfileUser } from '@/src/services/adminApi';

interface UseUserListOptions {
  role: 'elder' | 'guardian';
  status?: 'all' | 'active' | 'suspended';
  pageSize?: number;
}

export function useUserList({ role, status = 'all', pageSize = 20 }: UseUserListOptions) {
  const [users, setUsers] = useState<AdminProfileUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    setPage(1);
  }, [search, status, role]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAdminUsers({ role, search, status, page, limit: pageSize });
        if (cancelled) return;
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        if (cancelled) return;
        setUsers([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [role, search, status, page, pageSize, reloadKey]);

  return {
    users,
    total,
    page,
    setPage,
    search,
    setSearch,
    loading,
    error,
    pageSize,
    refetch,
  };
}

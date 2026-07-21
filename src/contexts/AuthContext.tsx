'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AdminUser } from '../types';
import {
  adminLogin,
  adminLogout,
  getAdminToken,
  setAdminToken,
  setAuthExpiredHandler,
  type AdminLoginUser,
} from '../services/adminApi';
import { hasAnyPermission, isSuperAdminPermissions } from '../utils/adminPermissions';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  hasPermission: (...keys: string[]) => boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  requiresTwoFactor: boolean;
  verifyOtp: (otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  permissions: [],
  hasPermission: () => false,
  login: async () => ({ ok: false }),
  logout: () => {},
  requiresTwoFactor: false,
  verifyOtp: async () => false,
});

function toAdminUser(apiUser: AdminLoginUser): AdminUser {
  const permissions = Array.isArray(apiUser.permissions)
    ? apiUser.permissions
    : (apiUser.role === 'super_admin' ? ['*'] : []);
  return {
    id: apiUser.id,
    name: apiUser.name || apiUser.username,
    email: apiUser.email || apiUser.username,
    username: apiUser.username,
    role: apiUser.role,
    roleId: apiUser.role_id ?? null,
    lastLogin: new Date().toISOString(),
    status: 'active',
    permissions,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (typeof window === 'undefined') return null;
    const token = getAdminToken();
    const saved = sessionStorage.getItem('tb-admin-user');
    if (token && saved) {
      try {
        return JSON.parse(saved) as AdminUser;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    setAuthExpiredHandler(() => {
      setUser(null);
    });
    return () => setAuthExpiredHandler(null);
  }, []);

  const login = async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const result = await adminLogin(username, password);
      if (!result.success || !result.token || !result.user) {
        return { ok: false, error: result.error || 'Invalid credentials' };
      }

      const adminUser = toAdminUser(result.user);
      setAdminToken(result.token);
      setUser(adminUser);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tb-admin-user', JSON.stringify(adminUser));
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  };

  const verifyOtp = async (_otp: string): Promise<boolean> => false;

  const logout = () => {
    void adminLogout();
    setUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tb-admin-user');
    }
  };

  const permissions = user?.permissions ?? [];
  const isSuperAdmin = isSuperAdminPermissions(permissions, user?.role);
  const hasPermission = useMemo(
    () => (...keys: string[]) => hasAnyPermission(permissions, ...keys),
    [permissions],
  );

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user && !!getAdminToken(),
      isSuperAdmin,
      permissions,
      hasPermission,
      login,
      logout,
      requiresTwoFactor: false,
      verifyOtp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

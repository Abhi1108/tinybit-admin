'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AdminUser } from '../types';
import {
  adminLogin,
  adminLogout,
  getAdminToken,
  setAdminToken,
  setAuthExpiredHandler,
} from '../services/adminApi';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  requiresTwoFactor: boolean;
  verifyOtp: (otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  requiresTwoFactor: false,
  verifyOtp: async () => false,
});

function toAdminUser(username: string): AdminUser {
  return {
    id: 'admin',
    name: username,
    email: username,
    role: 'super_admin',
    lastLogin: new Date().toISOString(),
    status: 'active',
    permissions: ['*'],
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

  const login = async (username: string, password: string): Promise<boolean> => {
    const result = await adminLogin(username, password);
    if (!result.success || !result.token) {
      return false;
    }

    const adminUser = toAdminUser(result.user?.username ?? username);
    setAdminToken(result.token);
    setUser(adminUser);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tb-admin-user', JSON.stringify(adminUser));
    }
    return true;
  };

  const verifyOtp = async (_otp: string): Promise<boolean> => false;

  const logout = () => {
    void adminLogout();
    setUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tb-admin-user');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user && !!getAdminToken(),
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

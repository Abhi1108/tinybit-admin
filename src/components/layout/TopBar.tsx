'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Sun, Moon, ChevronDown, Settings, User, LogOut, X, AlertTriangle, UserPlus, Pill, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../ui';

const NOTIFICATIONS = [
  { id: 1, type: 'sos', title: 'SOS Alert', message: 'Ramesh Kumar triggered SOS in Mumbai', time: '2 min ago', read: false, icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500 bg-red-50 dark:bg-red-900/30' },
  { id: 2, type: 'user', title: 'New Elder Registered', message: 'Savita Devi (78) registered from Delhi', time: '8 min ago', read: false, icon: <UserPlus className="w-4 h-4" />, color: 'text-brand-500 bg-brand-50 dark:bg-brand-900/30' },
  { id: 3, type: 'medicine', title: 'Missed Medication', message: '23 elders missed morning dose', time: '1 hr ago', read: false, icon: <Pill className="w-4 h-4" />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' },
  { id: 4, type: 'sos', title: 'SOS Resolved', message: "Geeta Verma's SOS alert resolved", time: '1 hr ago', read: true, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' },
  { id: 5, type: 'user', title: 'Guardian Invitation', message: '12 pending guardian invitations', time: '2 hr ago', read: true, icon: <UserPlus className="w-4 h-4" />, color: 'text-brand-500 bg-brand-50 dark:bg-brand-900/30' },
];

const QUICK_SEARCH = [
  { label: 'Elders', href: '/users/elders' },
  { label: 'Guardians', href: '/users/guardians' },
  { label: 'SOS Alerts', href: '/emergency/sos' },
  { label: 'Medicine Management', href: '/health/medicines' },
  { label: 'AI Analytics', href: '/ai/analytics' },
  { label: 'Audit Logs', href: '/settings/audit-logs' },
];

interface TopBarProps {
  sidebarCollapsed: boolean;
}

export function TopBar({ sidebarCollapsed }: TopBarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredSearch = searchQuery
    ? QUICK_SEARCH.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : QUICK_SEARCH;

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    operations_admin: 'Operations Admin',
    healthcare_admin: 'Healthcare Admin',
    content_manager: 'Content Manager',
    support_manager: 'Support Manager',
    moderator: 'Moderator',
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3 transition-all duration-300',
        sidebarCollapsed ? 'left-[68px]' : 'left-[260px]'
      )}
    >
      {/* Search */}
      <div ref={searchRef} className="flex-1 max-w-xl relative">
        <div
          className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-text"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search elders, guardians, alerts..."
            className="bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none w-full"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>

        {searchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Navigation</p>
            </div>
            {filteredSearch.map(item => (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); setSearchOpen(false); setSearchQuery(''); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                {item.label}
              </button>
            ))}
            {filteredSearch.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-slate-400">No results for &quot;{searchQuery}&quot;</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(p => !p); setUserMenuOpen(false); }}
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unread > 0 && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">{unread}</span>}
                  <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Mark all read</button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={cn('flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors', !n.read && 'bg-brand-50/50 dark:bg-brand-900/10')}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', n.color)}>
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                        {!n.read && <span className="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                <button className="text-xs text-brand-600 hover:text-brand-700 font-medium w-full text-center">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserMenuOpen(p => !p); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{user?.name?.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{roleLabels[user?.role || '']}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <User className="w-4 h-4 text-slate-400" /> Profile
                </button>
                <button onClick={() => { router.push('/settings/general'); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Settings className="w-4 h-4 text-slate-400" /> Settings
                </button>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

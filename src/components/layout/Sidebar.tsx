'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, Bot, MessageSquare,
  Video, Bell, BarChart3, Settings, LogOut,
  ChevronDown, ChevronRight, ChevronLeft, Inbox,
  TrendingUp, Trophy,
  Zap, Film, HelpCircle, ScrollText,
  DollarSign, Users2,
  CreditCard, Package, Wallet,
  Headphones, Ticket, MessageCircle, ArrowUpRight,
  Cpu, Activity, Medal,
  Clock, Mail, Shield,
  UserCog, ShieldCheck, Key, ClipboardList,
  Wind, Sparkles, Music,
} from 'lucide-react';
import { cn } from '../ui';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: { text: string; variant: 'danger' | 'warning' | 'info' };
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
    path: '/dashboard',
  },
  {
    id: 'admin-management',
    label: 'Admin Management',
    icon: <ShieldCheck className="w-4 h-4" />,
    children: [
      { id: 'admin-accounts', label: 'Admin Accounts', icon: <UserCog className="w-4 h-4" />, path: '/admin-management/accounts' },
      { id: 'role-management', label: 'Role Management', icon: <Shield className="w-4 h-4" />, path: '/admin-management/roles' },
      { id: 'permissions', label: 'Permissions', icon: <Key className="w-4 h-4" />, path: '/admin-management/permissions' },
      { id: 'activity-logs', label: 'Activity Logs', icon: <ClipboardList className="w-4 h-4" />, path: '/admin-management/logs' },
    ],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <Users className="w-4 h-4" />,
    children: [
      { id: 'elders', label: 'Elders', icon: <Users2 className="w-4 h-4" />, path: '/users/elders' },
      { id: 'guardians', label: 'Guardians', icon: <UserCheck className="w-4 h-4" />, path: '/users/guardians' },
      { id: 'invitations', label: 'Invitations', icon: <Inbox className="w-4 h-4" />, path: '/users/invitations' },
      { id: 'family-circle', label: 'Family Circles', icon: <Users className="w-4 h-4" />, path: '/users/family-circle' },
      { id: 'incomplete', label: 'Incomplete Signups', icon: <Clock className="w-4 h-4" />, path: '/users/incomplete' },
    ],
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    icon: <Activity className="w-4 h-4" />,
    children: [
      { id: 'medicines', label: 'Medications', icon: <ScrollText className="w-4 h-4" />, path: '/health/medicines' },
      { id: 'checkins', label: 'Daily Check-ins', icon: <ClipboardList className="w-4 h-4" />, path: '/health/checkins' },
      { id: 'wellness', label: 'Wellness Metrics', icon: <Activity className="w-4 h-4" />, path: '/health/wellness' },
      { id: 'conditions', label: 'Mood Logs', icon: <MessageSquare className="w-4 h-4" />, path: '/health/conditions' },
      { id: 'vault', label: 'Health Vault', icon: <Shield className="w-4 h-4" />, path: '/health/vault' },
    ],
  },
  {
    id: 'care',
    label: 'Care Circle',
    icon: <Users2 className="w-4 h-4" />,
    children: [
      { id: 'doctors', label: 'Doctors Directory', icon: <UserCog className="w-4 h-4" />, path: '/care/doctors' },
      { id: 'appointments', label: 'Appointments', icon: <Clock className="w-4 h-4" />, path: '/care/appointments' },
      { id: 'calendar', label: 'Care Calendar', icon: <ClipboardList className="w-4 h-4" />, path: '/care/calendar' },
      { id: 'family-events', label: 'Family Events', icon: <Users className="w-4 h-4" />, path: '/care/family-events' },
    ],
  },
  {
    id: 'emergency',
    label: 'Emergency (SOS)',
    icon: <Bell className="w-4 h-4" />,
    children: [
      { id: 'sos', label: 'SOS Alarm Logs', icon: <Bell className="w-4 h-4" />, path: '/emergency/sos' },
      { id: 'incidents', label: 'Incident Reports', icon: <ScrollText className="w-4 h-4" />, path: '/emergency/incidents' },
      { id: 'contacts', label: 'Emergency Contacts', icon: <Users className="w-4 h-4" />, path: '/emergency/contacts' },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Subscription & Payments',
    icon: <CreditCard className="w-4 h-4" />,
    children: [
      { id: 'plans', label: 'Subscription Plans', icon: <Package className="w-4 h-4" />, path: '/subscriptions/plans' },
      { id: 'user-subscriptions', label: 'User Subscriptions', icon: <Users className="w-4 h-4" />, path: '/subscriptions/user-subscriptions' },
      { id: 'payments', label: 'Payments', icon: <Wallet className="w-4 h-4" />, path: '/subscriptions/payments' },
      { id: 'revenue', label: 'Revenue Reports', icon: <BarChart3 className="w-4 h-4" />, path: '/subscriptions/revenue' },
    ],
  },
  {
    id: 'content',
    label: 'Content Management',
    icon: <Video className="w-4 h-4" />,
    children: [
      { id: 'videos', label: 'Video Management', icon: <Film className="w-4 h-4" />, path: '/content/videos' },
      { id: 'breathing', label: 'Breathing Programs', icon: <Wind className="w-4 h-4" />, path: '/content/breathing' },
      { id: 'mood-media', label: 'Mood Media', icon: <Music className="w-4 h-4" />, path: '/content/mood-media' },
      { id: 'quizzes', label: 'Daily Quizzes', icon: <Trophy className="w-4 h-4" />, path: '/content/quizzes' },
      { id: 'inspirations', label: 'Daily Inspirations', icon: <Sparkles className="w-4 h-4" />, path: '/content/inspirations' },
      { id: 'faqs', label: 'FAQ Management', icon: <HelpCircle className="w-4 h-4" />, path: '/content/faqs' },
    ],
  },
  {
    id: 'support',
    label: 'Support Management',
    icon: <Headphones className="w-4 h-4" />,
    children: [
      { id: 'tickets', label: 'Support Tickets', icon: <Ticket className="w-4 h-4" />, path: '/support/tickets', badge: { text: '23', variant: 'warning' } },
      { id: 'queries', label: 'User Queries', icon: <MessageSquare className="w-4 h-4" />, path: '/support/queries' },
      { id: 'chat-support', label: 'Chat Support', icon: <MessageCircle className="w-4 h-4" />, path: '/support/chat' },
      { id: 'escalation', label: 'Escalation Management', icon: <ArrowUpRight className="w-4 h-4" />, path: '/support/escalation' },
    ],
  },
  {
    id: 'ai',
    label: 'AI Management',
    icon: <Bot className="w-4 h-4" />,
    children: [
      { id: 'ai-usage', label: 'AI Usage Dashboard', icon: <Activity className="w-4 h-4" />, path: '/ai/usage' },
      { id: 'ai-analytics', label: 'Token Analytics', icon: <TrendingUp className="w-4 h-4" />, path: '/ai/analytics' },
      { id: 'ai-models', label: 'AI Models', icon: <Cpu className="w-4 h-4" />, path: '/ai/models' },
      { id: 'ai-costs', label: 'Cost Tracking', icon: <DollarSign className="w-4 h-4" />, path: '/ai/costs' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications & Email',
    icon: <Bell className="w-4 h-4" />,
    children: [
      { id: 'push-notifications', label: 'Push Notifications', icon: <Bell className="w-4 h-4" />, path: '/notifications/push' },
      { id: 'scheduled', label: 'Scheduled', icon: <Clock className="w-4 h-4" />, path: '/notifications/scheduled' },
      { id: 'email-management', label: 'Email Management', icon: <Mail className="w-4 h-4" />, path: '/notifications/email' },
      { id: 'delivery-logs', label: 'Delivery Logs', icon: <ScrollText className="w-4 h-4" />, path: '/notifications/logs' },
    ],
  },
  {
    id: 'rewards',
    label: 'Leaderboard & Rewards',
    icon: <Trophy className="w-4 h-4" />,
    children: [
      { id: 'leaderboard', label: 'Leaderboard', icon: <Medal className="w-4 h-4" />, path: '/rewards/leaderboard' },
      { id: 'streaks', label: 'Streak Management', icon: <Zap className="w-4 h-4" />, path: '/rewards/streaks' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    children: [
      { id: 'general-settings', label: 'General Settings', icon: <Settings className="w-4 h-4" />, path: '/settings/general' },
      { id: 'payment-gateway', label: 'Payment Gateway', icon: <CreditCard className="w-4 h-4" />, path: '/settings/payment' },
      { id: 'notification-settings', label: 'Notification Settings', icon: <Bell className="w-4 h-4" />, path: '/settings/notifications' },
      { id: 'ai-settings', label: 'AI Settings', icon: <Bot className="w-4 h-4" />, path: '/settings/ai' },
      { id: 'role-permissions', label: 'Role Permissions', icon: <Shield className="w-4 h-4" />, path: '/settings/roles' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const set = new Set<string>();
    NAV_ITEMS.forEach(item => {
      if (item.children?.some(child => pathname === child.path || pathname.startsWith((child.path || '') + '/'))) {
        set.add(item.id);
      }
    });
    return set;
  });

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function isActiveParent(item: NavItem): boolean {
    return item.children?.some(child => pathname === child.path || pathname.startsWith((child.path || '') + '/')) ?? false;
  }

  function isActivePath(path: string): boolean {
    return pathname === path || pathname.startsWith(path + '/');
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
    <aside className={cn(
      'fixed left-0 top-0 h-screen z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out',
      collapsed ? 'w-[68px]' : 'w-[260px]'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">TB</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">TinyBit</span>
              <span className="ml-1.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded">ADMIN</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn('p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors', collapsed && 'hidden')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isOpen = openSections.has(item.id);
          const isActive = isActiveParent(item);

          if (!item.children) {
            const active = isActivePath(item.path!);
            return (
              <Link
                key={item.id}
                href={item.path!}
                title={collapsed ? item.label : undefined}
                className={cn('sidebar-link', active && 'active')}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', item.badge.variant === 'danger' ? 'bg-red-500 text-white' : item.badge.variant === 'warning' ? 'bg-amber-500 text-white' : 'bg-brand-500 text-white')}>
                    {item.badge.text}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <div key={item.id}>
              <button
                onClick={() => !collapsed && toggleSection(item.id)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'sidebar-link w-full',
                  isActive && !isOpen && 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400',
                  collapsed && 'justify-center'
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-left">{item.label}</span>
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0', isOpen && 'rotate-180')} />
                  </>
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="ml-3 mt-0.5 pl-3 border-l border-slate-200 dark:border-slate-700 space-y-0.5 animate-fade-in">
                  {item.children.map(child => {
                    const childActive = isActivePath(child.path!);
                    return (
                      <Link
                        key={child.id}
                        href={child.path!}
                        className={cn('sidebar-link text-xs py-1.5', childActive && 'active')}
                      >
                        <span className="flex-shrink-0 opacity-70">{child.icon}</span>
                        <span className="flex-1 truncate">{child.label}</span>
                        {child.badge && (
                          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', child.badge.variant === 'danger' ? 'bg-red-500 text-white' : child.badge.variant === 'warning' ? 'bg-amber-500 text-white' : 'bg-brand-500 text-white')}>
                            {child.badge.text}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className={cn('flex-shrink-0 border-t border-slate-200 dark:border-slate-800 p-3', collapsed ? 'flex flex-col items-center gap-2' : '')}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{roleLabels[user.role]}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={logout}
          title="Logout"
          className={cn('sidebar-link w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600', collapsed && 'justify-center')}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

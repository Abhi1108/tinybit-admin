'use client';
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '../ui';

export function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      <TopBar sidebarCollapsed={collapsed} />
      <main
        className={cn(
          'transition-all duration-300 pt-16 min-h-screen',
          collapsed ? 'ml-[68px]' : 'ml-[260px]'
        )}
      >
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

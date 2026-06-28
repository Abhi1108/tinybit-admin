'use client';
import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function Placeholder({ title, description = 'This section is under development.', icon }: PlaceholderProps) {
  return (
    <div className="space-y-4">
      <h1 className="page-title">{title}</h1>
      <div className="card py-24 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-4">
          {icon || <Construction className="w-8 h-8 text-brand-400" />}
        </div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{title}</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-md">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
          <Construction className="w-3.5 h-3.5" /> Coming Soon
        </span>
      </div>
    </div>
  );
}

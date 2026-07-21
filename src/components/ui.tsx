'use client';
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TrendingUp, TrendingDown, Minus, X, ChevronUp, ChevronDown } from 'lucide-react';

export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}

// ── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'teal';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export function Badge({ variant = 'default', children, size = 'md', dot, className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
    purple: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  };

  const dotColors = {
    default: 'bg-slate-400', success: 'bg-emerald-500', warning: 'bg-amber-500',
    danger: 'bg-red-500', info: 'bg-brand-500', purple: 'bg-violet-500', teal: 'bg-teal-500',
  };

  return (
    <span className={cn(
      'badge',
      variants[variant],
      size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AVATAR_COLORS = [
  'bg-brand-500', 'bg-teal-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500',
];

function stringToIndex(str: string) {
  return str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base', xl: 'w-14 h-14 text-lg' };
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colorClass = AVATAR_COLORS[stringToIndex(name)];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)}
      />
    );
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0', sizes[size], colorClass, className)}>
      {initials}
    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  gradient: string;
  suffix?: string;
  subtitle?: string;
}

export function StatCard({ title, value, change, icon, gradient, suffix, subtitle }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNeutral = change === 0;

  return (
    <div className={cn('rounded-xl p-5 text-white relative overflow-hidden shadow-lg', gradient)}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white" />
      </div>
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm')}>
              {isNeutral ? <Minus className="w-3 h-3" /> : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="mt-1">
          <div className="text-2xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-lg font-normal ml-1 opacity-80">{suffix}</span>}
          </div>
          <div className="text-sm font-medium opacity-90 mt-0.5">{title}</div>
          {subtitle && <div className="text-xs opacity-70 mt-0.5">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className, title, subtitle, action, noPadding }: CardProps) {
  return (
    <div className={cn('card', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            {title && <h3 className="section-title">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2 ml-4">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'teal';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({ variant = 'secondary', size = 'md', loading, icon, iconRight, children, className, disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'inline-flex items-center gap-2 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors',
    teal: 'inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
  };

  const sizes = {
    xs: '!px-2 !py-1 !text-xs',
    sm: '!px-3 !py-1.5 !text-xs',
    md: '',
    lg: '!px-5 !py-2.5 !text-base',
  };

  return (
    <button
      className={cn(variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
      {iconRight}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({ label, error, icon, suffix, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">{icon}</div>}
        <input
          id={inputId}
          className={cn('input-field', !!icon && 'pl-9', !!suffix && 'pr-10', !!error && 'border-red-400 focus:ring-red-400', className)}
          {...props}
        />
        {suffix && <div className="absolute inset-y-0 right-3 flex items-center">{suffix}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({ label, options, error, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <select
        id={selectId}
        className={cn('input-field appearance-none cursor-pointer', error && 'border-red-400', className)}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', '2xl': 'max-w-6xl' };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      <div
        className={cn('relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full animate-fade-in border border-slate-200 dark:border-slate-700', sizes[size])}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">{footer}</div>}
      </div>
    </div>
  );
}

// ── Table ────────────────────────────────────────────────────────────────────
export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function Table<T>({ columns, data, keyField, loading, onRowClick, emptyMessage = 'No data found', sortKey, sortDir, onSort }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key as string} className={cn('table-header', col.width)} style={col.width ? { width: col.width } : {}}>
                {col.sortable && onSort ? (
                  <button
                    onClick={() => onSort(col.key as string)}
                    className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {col.header}
                    <span className="flex flex-col">
                      <ChevronUp className={cn('w-2.5 h-2.5 -mb-0.5', sortKey === col.key && sortDir === 'asc' ? 'text-brand-600' : 'text-slate-300 dark:text-slate-600')} />
                      <ChevronDown className={cn('w-2.5 h-2.5', sortKey === col.key && sortDir === 'desc' ? 'text-brand-600' : 'text-slate-300 dark:text-slate-600')} />
                    </span>
                  </button>
                ) : col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key as string} className="table-cell">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={cn('group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors', onRowClick && 'cursor-pointer')}
              >
                {columns.map(col => (
                  <td key={col.key as string} className="table-cell">
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key as string] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>Showing <span className="font-medium text-slate-700 dark:text-slate-200">{start}–{end}</span> of <span className="font-medium text-slate-700 dark:text-slate-200">{total.toLocaleString()}</span></span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            className="input-field !w-auto !py-1 text-xs"
          >
            {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={page === 1} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-500 dark:text-slate-400 transition-colors text-xs font-medium px-2">First</button>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = page - 2 + i;
          if (p < 1) p = i + 1;
          if (p > totalPages) p = totalPages - (4 - i);
          return p;
        }).filter((p, i, arr) => p >= 1 && p <= totalPages && arr.indexOf(p) === i).map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn('w-8 h-8 rounded text-xs font-medium transition-colors', p === page ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300')}
          >
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-500 dark:text-slate-400 transition-colors text-xs font-medium px-2">Last</button>
      </div>
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
export function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-base">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            active === tab.id
              ? 'border-brand-600 text-brand-700 dark:text-brand-400 dark:border-brand-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn('px-1.5 py-0.5 rounded-full text-xs', active === tab.id ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'blue', size = 'md', showLabel }: { value: number; max?: number; color?: 'blue' | 'teal' | 'green' | 'red' | 'amber'; size?: 'sm' | 'md'; showLabel?: boolean }) {
  const pct = Math.round((value / max) * 100);
  const colors = { blue: 'bg-brand-500', teal: 'bg-teal-500', green: 'bg-emerald-500', red: 'bg-red-500', amber: 'bg-amber-500' };
  const heights = { sm: 'h-1.5', md: 'h-2.5' };

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={cn('flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden', heights[size])}>
        <div className={cn('h-full rounded-full transition-all duration-500', colors[color])} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-8 text-right">{pct}%</span>}
    </div>
  );
}

// ── RoleBadge ─────────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  super_admin: { label: 'Super Admin', variant: 'danger' },
  operations_admin: { label: 'Operations', variant: 'info' },
  content_manager: { label: 'Content Mgr', variant: 'purple' },
  support_manager: { label: 'Support Mgr', variant: 'warning' },
  moderator: { label: 'Moderator', variant: 'default' },
};

export function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] || { label: role, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// ── HealthRiskBadge ───────────────────────────────────────────────────────────
export function HealthRiskBadge({ score }: { score: number }) {
  if (score >= 80) return <Badge variant="danger" dot>Critical {score}</Badge>;
  if (score >= 60) return <Badge variant="warning" dot>High {score}</Badge>;
  if (score >= 40) return <Badge variant="info" dot>Medium {score}</Badge>;
  return <Badge variant="success" dot>Low {score}</Badge>;
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    suspended: { variant: 'danger', label: 'Suspended' },
    verified: { variant: 'success', label: 'Verified' },
    pending: { variant: 'warning', label: 'Pending' },
    rejected: { variant: 'danger', label: 'Rejected' },
    resolved: { variant: 'success', label: 'Resolved' },
    escalated: { variant: 'danger', label: 'Escalated' },
    false_alarm: { variant: 'default', label: 'False Alarm' },
    sent: { variant: 'success', label: 'Sent' },
    scheduled: { variant: 'info', label: 'Scheduled' },
    draft: { variant: 'default', label: 'Draft' },
    failed: { variant: 'danger', label: 'Failed' },
    processing: { variant: 'warning', label: 'Processing' },
    ok: { variant: 'success', label: 'OK' },
    low: { variant: 'warning', label: 'Low Stock' },
    empty: { variant: 'danger', label: 'Empty' },
  };

  const c = config[status] || { variant: 'default' as const, label: status };
  return <Badge variant={c.variant} dot>{c.label}</Badge>;
}

// ── InfoRow ───────────────────────────────────────────────────────────────────
export function InfoRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-4 py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0', className)}>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[140px] pt-0.5">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-200 flex-1">{value}</span>
    </div>
  );
}

// ── SeverityBadge ─────────────────────────────────────────────────────────────
export function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, BadgeProps['variant']> = {
    critical: 'danger', high: 'warning', medium: 'info', low: 'success',
  };
  return <Badge variant={config[severity] || 'default'} dot>{severity.charAt(0).toUpperCase() + severity.slice(1)}</Badge>;
}

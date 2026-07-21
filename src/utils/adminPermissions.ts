/** Permission keys used for nav gating (aligned with server catalog). */

export function hasAnyPermission(
  permissions: string[] | undefined | null,
  ...required: string[]
): boolean {
  const perms = permissions ?? [];
  if (perms.includes('*') || perms.includes('All Modules')) return true;
  return required.some((key) => perms.includes(key));
}

export function isSuperAdminPermissions(permissions: string[] | undefined | null, role?: string): boolean {
  if (role === 'super_admin') return true;
  return hasAnyPermission(permissions, '*', 'All Modules');
}

/** Path prefix → permission keys (OR). */
export const PATH_PERMISSIONS: Array<{ prefix: string; anyOf: string[] }> = [
  { prefix: '/dashboard', anyOf: ['Dashboard', 'Dashboard (Read)'] },
  { prefix: '/admin-management', anyOf: ['Admin Management'] },
  { prefix: '/users', anyOf: ['User Management', 'Users (Read)'] },
  { prefix: '/health', anyOf: ['User Management', 'Users (Read)'] },
  { prefix: '/care', anyOf: ['Content Management', 'User Management', 'Users (Read)'] },
  { prefix: '/emergency', anyOf: ['SOS Management', 'SOS (Read)'] },
  { prefix: '/location', anyOf: ['User Management', 'Users (Read)'] },
  { prefix: '/journal', anyOf: ['User Management', 'Users (Read)'] },
  { prefix: '/subscriptions', anyOf: ['Billing'] },
  { prefix: '/content', anyOf: ['Content Management', 'FAQ Management'] },
  { prefix: '/support', anyOf: ['Support Tickets', 'User Queries', 'Chat Support', 'Escalation'] },
  { prefix: '/ai', anyOf: ['AI Management'] },
  { prefix: '/notifications', anyOf: ['Notifications', 'Notifications (Read)'] },
  { prefix: '/rewards', anyOf: ['Leaderboard & Rewards'] },
  { prefix: '/settings', anyOf: ['Settings'] },
  { prefix: '/reports', anyOf: ['Dashboard', 'Dashboard (Read)', 'Settings'] },
];

export function canAccessPath(permissions: string[] | undefined | null, path: string): boolean {
  if (hasAnyPermission(permissions, '*', 'All Modules')) return true;
  const match = PATH_PERMISSIONS.find(
    (entry) => path === entry.prefix || path.startsWith(`${entry.prefix}/`),
  );
  if (!match) return true;
  return hasAnyPermission(permissions, ...match.anyOf);
}

/** Super-admin-only management screens inside Admin Management. */
export const SUPER_ADMIN_MANAGEMENT_PATHS = new Set([
  '/admin-management/accounts',
  '/admin-management/roles',
  '/admin-management/permissions',
]);

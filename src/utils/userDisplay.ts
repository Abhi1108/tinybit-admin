import { format, formatDistanceToNow } from 'date-fns';

export function displayName(fullName: string | null | undefined, email: string | null | undefined): string {
  if (fullName?.trim()) return fullName.trim();
  if (email?.trim()) return email.trim();
  return 'Unnamed user';
}

export function profileStatus(isBanned: boolean): 'active' | 'suspended' {
  return isBanned ? 'suspended' : 'active';
}

export function formatLastActive(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return '—';
  }
}

export function formatJoined(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return format(new Date(value), 'dd MMM yyyy');
  } catch {
    return '—';
  }
}

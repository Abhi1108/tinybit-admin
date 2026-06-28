'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Pencil, Users } from 'lucide-react';
import { Badge, InfoRow, StatusBadge } from '@/src/components/ui';
import { UserFormModal } from '@/src/components/users/UserFormModal';
import {
  getAdminUser,
  updateAdminUser,
  type AdminUserDetailResponse,
} from '@/src/services/adminApi';
import {
  displayName,
  formatJoined,
  formatLastActive,
  profileStatus,
} from '@/src/utils/userDisplay';

export function UserProfileClient({ id, roleLabel }: { id: string; roleLabel: string }) {
  const router = useRouter();
  const [data, setData] = useState<AdminUserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminUser(id);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <p>{error || 'User not found'}</p>
        <button type="button" onClick={() => router.back()} className="btn-primary mt-4">Go Back</button>
      </div>
    );
  }

  const profile = data.profile;
  const name = displayName(profile?.full_name ?? null, profile?.email ?? data.app_user?.email ?? null);
  const connections = [...data.connections.as_guardian, ...data.connections.as_elder];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => router.back()} className="btn-secondary p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">{name}</h1>
          <p className="text-sm text-slate-500">{roleLabel} · {id}</p>
        </div>
        {profile && (
          <StatusBadge status={profileStatus(profile.is_banned)} />
        )}
        <button type="button" className="btn-secondary" onClick={() => setEditing(true)}>
          <Pencil className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-1">
          <h3 className="section-title text-sm mb-3">Profile</h3>
          <InfoRow label="Full name" value={profile?.full_name ?? '—'} />
          <InfoRow label="Email" value={profile?.email ?? data.app_user?.email ?? '—'} />
          <InfoRow label="Phone" value={profile?.mobile ?? data.app_user?.phone_e164 ?? '—'} />
          <InfoRow label="Role" value={profile?.role ?? '—'} />
          <InfoRow label="Country" value={profile?.country ?? '—'} />
          <InfoRow label="Age" value={profile?.age != null ? String(profile.age) : '—'} />
          <InfoRow label="Joined" value={formatJoined(profile?.created_at ?? data.app_user?.created_at)} />
          <InfoRow label="Last active" value={formatLastActive(profile?.last_active)} />
        </div>

        <div className="card p-5 space-y-1">
          <h3 className="section-title text-sm mb-3">Emergency contact</h3>
          <InfoRow label="Name" value={profile?.emergency_name ?? '—'} />
          <InfoRow label="Phone" value={profile?.emergency_phone ?? '—'} />
          <InfoRow label="Relation" value={profile?.emergency_relation ?? '—'} />
          <h3 className="section-title text-sm mb-3 mt-4">Plan</h3>
          <InfoRow label="Plan" value={profile?.plan_type ?? '—'} />
          <InfoRow label="Status" value={profile?.plan_status ?? '—'} />
        </div>
      </div>

      {profile?.medical_conditions && profile.medical_conditions.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title mb-3">Medical conditions</h3>
          <div className="flex flex-wrap gap-2">
            {profile.medical_conditions.map((c) => (
              <Badge key={c} variant="danger" size="sm">{c}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <h3 className="section-title mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Connections ({connections.length})
        </h3>
        {connections.length === 0 ? (
          <p className="text-sm text-slate-400">No guardian–elder links</p>
        ) : (
          <div className="space-y-2">
            {connections.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                <div>
                  <p className="font-medium">{c.guardian_name} → {c.elder_name}</p>
                  <p className="text-xs text-slate-500">{c.relation} · {c.elder_email}</p>
                </div>
                <Badge variant={c.status === 'connected' ? 'success' : c.status === 'pending' ? 'warning' : 'default'}>
                  {c.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {profile && (
        <UserFormModal
          open={editing}
          mode="edit"
          role={profile.role === 'guardian' ? 'guardian' : 'elder'}
          initial={{
            full_name: profile.full_name ?? undefined,
            email: profile.email ?? undefined,
            phone: profile.mobile ?? undefined,
            country: profile.country ?? undefined,
            age: profile.age ?? undefined,
          }}
          onClose={() => setEditing(false)}
          onSubmit={async (payload) => {
            await updateAdminUser(id, payload);
            setEditing(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

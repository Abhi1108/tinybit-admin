'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Users } from 'lucide-react';
import { Badge } from '@/src/components/ui';
import { getAdminConnections, type AdminConnection } from '@/src/services/adminApi';
import { formatJoined } from '@/src/utils/userDisplay';

export default function FamilyCirclePage() {
  const [connections, setConnections] = useState<AdminConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const data = await getAdminConnections({ status: 'connected', limit: 100 });
        setConnections(data.connections);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load family circles');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = connections.reduce<Record<string, AdminConnection[]>>((acc, c) => {
    const key = c.elder_id || c.elder_email;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Family Circles</h1>
          <p className="text-sm text-slate-500 mt-0.5">Connected guardian–elder relationships</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card p-12 text-center text-slate-400">No connected family circles yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(grouped).map(([key, links]) => (
            <div key={key} className="card p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {links[0].elder_name !== '—' ? links[0].elder_name : links[0].elder_email}
                  </h3>
                  <p className="text-xs text-slate-500">{links.length} guardian{links.length !== 1 ? 's' : ''} linked</p>
                </div>
              </div>
              <div className="space-y-2">
                {links.map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div>
                      <p className="font-medium">{l.guardian_name}</p>
                      <p className="text-xs text-slate-500">{l.relation} · since {formatJoined(l.created_at)}</p>
                    </div>
                    <Badge variant="success" size="sm">connected</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

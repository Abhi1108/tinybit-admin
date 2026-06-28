'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Stethoscope, MessageSquare } from 'lucide-react';
import { Avatar, Badge, Pagination } from '@/src/components/ui';
import { getAdminMoods } from '@/src/services/adminApi';

interface MoodEntry {
  id: string;
  user_id: string;
  mood: string | null;
  mood_score: number | null;
  note: string | null;
  created_at: string;
  user_name: string;
}

export default function ConditionsPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  async function fetchMoodLogs() {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminMoods({ page, limit });
      if (res.success) {
        setMoods(res.moods || []);
      } else {
        throw new Error(res.error || 'Failed to fetch mood entries');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mood entries');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMoodLogs();
  }, [page]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getMoodBadgeVariant = (score: number | null) => {
    if (!score) return 'default';
    if (score >= 4) return 'success';
    if (score === 3) return 'info';
    if (score === 2) return 'warning';
    return 'danger';
  };

  // Calculate summary stats
  const validMoods = moods.filter(m => m.mood_score !== null);
  const avgMood = validMoods.length
    ? (validMoods.reduce((acc, m) => acc + (m.mood_score || 0), 0) / validMoods.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-brand-500" /> Elder Moods & Notes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View self-reported mood scores, notes, and chronological logs from elders.
          </p>
        </div>
      </div>

      {/* Stats Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 rounded-xl flex items-center gap-4 bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30">
          <div className="p-3 bg-brand-500/10 rounded-lg text-brand-600 dark:text-brand-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-700 dark:text-brand-400">{avgMood} / 5</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Average Mood Score</p>
          </div>
        </div>

        <div className="card p-4 rounded-xl flex items-center gap-4 bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30">
          <div className="p-3 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">
              {loading ? '—' : `${moods.filter((m) => m.note).length} notes`}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Logs with Notes (This Page)</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header rounded-tl-xl">Elder</th>
                <th className="table-header">Timestamp</th>
                <th className="table-header">Self-Reported Mood</th>
                <th className="table-header">Mood Score</th>
                <th className="table-header rounded-tr-xl">User Note / Comments</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="table-cell py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading mood history...
                  </td>
                </tr>
              ) : moods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell py-16 text-center text-slate-400">
                    No mood records found.
                  </td>
                </tr>
              ) : (
                moods.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.user_name || 'Elder'} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            {item.user_name || 'Elder'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="table-cell text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {item.mood || '—'}
                    </td>
                    <td className="table-cell">
                      {item.mood_score !== null ? (
                        <Badge variant={getMoodBadgeVariant(item.mood_score)} size="sm">
                          {item.mood_score} / 5
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="table-cell text-sm text-slate-700 dark:text-slate-300">
                      {item.note ? (
                        <p className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 italic max-w-lg">
                          "{item.note}"
                        </p>
                      ) : (
                        <span className="text-slate-400 italic font-light">No note provided</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && moods.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination
              page={page}
              pageSize={limit}
              total={page * limit + (moods.length < limit ? 0 : 1)}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

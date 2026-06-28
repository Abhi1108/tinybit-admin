'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ClipboardList, Filter } from 'lucide-react';
import { Avatar, Badge, Pagination } from '@/src/components/ui';
import { getAdminCheckIns } from '@/src/services/adminApi';

interface CheckIn {
  id: string;
  user_id: string;
  check_in_date: string;
  mood: string | null;
  mood_score: number | null;
  sleep_rested: boolean | null;
  breakfast_done: boolean | null;
  hydration_done: boolean | null;
  pain_reported: boolean | null;
  water_glasses: number | null;
  medicines_taken: boolean | null;
  sleep_quality: string | null;
  sleep_hours: number | null;
  energy_level: string | null;
  pain_level: number | null;
  physical_activity: string | null;
  voice_note_url: string | null;
  voice_note_duration: number | null;
  notes: string | null;
  created_at: string;
  user_name: string;
}

export default function CheckinsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const limit = 10;

  async function fetchCheckIns() {
    setLoading(true);
    setError(null);
    try {
      const params: { page: number; limit: number; mood?: string } = {
        page,
        limit,
      };
      if (moodFilter !== 'all') {
        params.mood = moodFilter;
      }
      const res = await getAdminCheckIns(params);
      if (res.success) {
        setCheckIns(res.check_ins || []);
      } else {
        throw new Error(res.error || 'Failed to fetch check-ins');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCheckIns();
  }, [page, moodFilter]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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

  const getPainBadgeVariant = (level: number | null) => {
    if (level === null) return 'default';
    if (level === 0) return 'success';
    if (level <= 3) return 'info';
    if (level <= 6) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-brand-500" /> Daily Check-ins
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor daily logs, sleep quality, pain levels, and physical activity reports.
          </p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Filter by Mood:</span>
        </div>
        <select
          value={moodFilter}
          onChange={(e) => {
            setMoodFilter(e.target.value);
            setPage(1);
          }}
          className="input-field w-40"
        >
          <option value="all">All Moods</option>
          <option value="happy">Happy</option>
          <option value="calm">Calm</option>
          <option value="tired">Tired</option>
          <option value="low">Low</option>
          <option value="anxious">Anxious</option>
          <option value="stressed">Stressed</option>
        </select>
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
                <th className="table-header">Date</th>
                <th className="table-header">Mood / Score</th>
                <th className="table-header">Sleep Quality</th>
                <th className="table-header">Pain Level</th>
                <th className="table-header">Physical Activity</th>
                <th className="table-header rounded-tr-xl">Meds & Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="table-cell py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading check-ins...
                  </td>
                </tr>
              ) : checkIns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell py-16 text-center text-slate-400">
                    No check-ins found.
                  </td>
                </tr>
              ) : (
                checkIns.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.user_name || 'Elder'} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            {item.user_name || 'Elder'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">ID: {item.user_id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(item.created_at || item.check_in_date)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {item.mood && (
                          <span className="text-sm capitalize text-slate-700 dark:text-slate-300">
                            {item.mood}
                          </span>
                        )}
                        {item.mood_score !== null && (
                          <Badge variant={getMoodBadgeVariant(item.mood_score)} size="sm">
                            {item.mood_score}/5
                          </Badge>
                        )}
                        {!item.mood && item.mood_score === null && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="table-cell text-sm">
                      <div className="text-slate-900 dark:text-white font-medium">
                        {item.sleep_quality || '—'}
                      </div>
                      {item.sleep_hours !== null && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.sleep_hours} hrs slept {item.sleep_rested ? '• Rested' : ''}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      {item.pain_level !== null ? (
                        <Badge variant={getPainBadgeVariant(item.pain_level)} size="sm">
                          {item.pain_level === 0 ? 'No Pain' : `Level ${item.pain_level}/10`}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="table-cell text-sm text-slate-600 dark:text-slate-400">
                      {item.physical_activity || '—'}
                    </td>
                    <td className="table-cell text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        {item.medicines_taken !== null && (
                          <Badge variant={item.medicines_taken ? 'success' : 'danger'} size="sm">
                            Meds: {item.medicines_taken ? 'Taken' : 'Missed'}
                          </Badge>
                        )}
                        {item.water_glasses !== null && (
                          <Badge variant="teal" size="sm">
                            Water: {item.water_glasses} gls
                          </Badge>
                        )}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" title={item.notes}>
                          {item.notes}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && checkIns.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <Pagination
              page={page}
              pageSize={limit}
              total={page * limit + (checkIns.length < limit ? 0 : 1)}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

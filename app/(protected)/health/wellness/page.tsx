'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Activity, Heart, Moon, Droplets } from 'lucide-react';
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
  created_at: string;
  user_name: string;
  bp_systolic: number | null;
  bp_diastolic: number | null;
}

export default function WellnessPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  async function fetchWellnessLogs() {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminCheckIns({ page, limit });
      if (res.success) {
        setCheckIns(res.check_ins || []);
      } else {
        throw new Error(res.error || 'Failed to fetch wellness data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wellness logs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWellnessLogs();
  }, [page]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatBp = (item: CheckIn) => {
    if (item.bp_systolic != null && item.bp_diastolic != null) {
      return `${Math.round(item.bp_systolic)}/${Math.round(item.bp_diastolic)}`;
    }
    return null;
  };

  const sleepWithHours = checkIns.filter((c) => c.sleep_hours !== null);
  const waterWithGlasses = checkIns.filter((c) => c.water_glasses !== null);
  const bpLogged = checkIns.filter((c) => c.bp_systolic != null && c.bp_diastolic != null);

  const stats = {
    avgSleep: sleepWithHours.length
      ? (sleepWithHours.reduce((acc, c) => acc + (c.sleep_hours || 0), 0) / sleepWithHours.length).toFixed(1)
      : '—',
    avgWater: waterWithGlasses.length
      ? (waterWithGlasses.reduce((acc, c) => acc + (c.water_glasses || 0), 0) / waterWithGlasses.length).toFixed(1)
      : '—',
    bpLoggedCount: bpLogged.length,
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-500" /> Wellness Logs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor and track elder wellness metrics including vitals, sleep quality, hydration, and physical activity.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 rounded-xl flex items-center gap-4 bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30">
          <div className="p-3 bg-brand-500/10 rounded-lg text-brand-600 dark:text-brand-400">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-700 dark:text-brand-400">{stats.avgSleep} hrs</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Avg. Sleep Duration</p>
          </div>
        </div>

        <div className="card p-4 rounded-xl flex items-center gap-4 bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30">
          <div className="p-3 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{stats.avgWater} glasses</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Avg. Daily Hydration</p>
          </div>
        </div>

        <div className="card p-4 rounded-xl flex items-center gap-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
          <div className="p-3 bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{loading ? '—' : `${stats.bpLoggedCount} logs`}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">BP readings on this page</p>
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
                <th className="table-header">Date</th>
                <th className="table-header">Heart Rate</th>
                <th className="table-header">Blood Pressure</th>
                <th className="table-header">SpO2 Level</th>
                <th className="table-header">Sleep Hours</th>
                <th className="table-header">Hydration</th>
                <th className="table-header rounded-tr-xl">Physical Activity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="table-cell py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading wellness logs...
                  </td>
                </tr>
              ) : checkIns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-cell py-16 text-center text-slate-400">
                    No wellness logs found.
                  </td>
                </tr>
              ) : (
                checkIns.map((item) => {
                  const bp = formatBp(item);
                  return (
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
                        {formatDate(item.created_at || item.check_in_date)}
                      </td>
                      <td className="table-cell text-sm text-slate-400">—</td>
                      <td className="table-cell text-sm text-slate-800 dark:text-slate-200 font-medium">
                        {bp ? `${bp} mmHg` : <span className="text-slate-400 font-normal">—</span>}
                      </td>
                      <td className="table-cell text-sm text-slate-400">—</td>
                      <td className="table-cell text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{item.sleep_hours ?? '—'} hrs</span>
                        {item.sleep_quality && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 block capitalize">
                            {item.sleep_quality}
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        {item.water_glasses !== null ? (
                          <Badge variant="teal" size="sm">
                            {item.water_glasses} glasses
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="table-cell text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {item.physical_activity || '—'}
                      </td>
                    </tr>
                  );
                })
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

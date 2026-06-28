'use client';
import React, { useState, useMemo } from 'react';
import {
  Zap, Search, RotateCcw, PauseCircle, PlayCircle, Save,
  TrendingUp, Users, Award, CheckSquare, Star, Plus, Trash2, Edit2, X,
} from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

/* ─── Types ─────────────────────────────────────────────── */
type StreakStatus = 'active' | 'paused' | 'broken';

interface UserStreak {
  id: string; name: string; location: string;
  currentStreak: number; longestStreak: number;
  totalPoints: number; status: StreakStatus;
  lastActivity: string; activities: string[];
}

interface StreakActivity {
  id: string; label: string; points: number; enabled: boolean; minPerDay: number;
}

interface RewardRule {
  id: string; milestone: string; points: number; badge: string; tier: string;
}

/* ─── Mock Data ─────────────────────────────────────────── */
const INIT_STREAKS: UserStreak[] = [
  { id: 's001', name: 'Arjun Mehta', location: 'Mumbai', currentStreak: 87, longestStreak: 92, totalPoints: 14850, status: 'active', lastActivity: '2026-06-10', activities: ['check-in', 'medicine', 'journal'] },
  { id: 's002', name: 'Priya Sharma', location: 'Delhi', currentStreak: 74, longestStreak: 74, totalPoints: 12600, status: 'active', lastActivity: '2026-06-10', activities: ['check-in', 'medicine'] },
  { id: 's003', name: 'Ramesh Patel', location: 'Bangalore', currentStreak: 61, longestStreak: 80, totalPoints: 10380, status: 'active', lastActivity: '2026-06-10', activities: ['check-in', 'journal', 'activity'] },
  { id: 's004', name: 'Kavitha Nair', location: 'Chennai', currentStreak: 45, longestStreak: 61, totalPoints: 7650, status: 'paused', lastActivity: '2026-06-08', activities: ['check-in'] },
  { id: 's005', name: 'Suresh Kumar', location: 'Hyderabad', currentStreak: 38, longestStreak: 45, totalPoints: 6460, status: 'active', lastActivity: '2026-06-10', activities: ['check-in', 'medicine', 'activity'] },
  { id: 's006', name: 'Anita Joshi', location: 'Pune', currentStreak: 0, longestStreak: 32, totalPoints: 5440, status: 'broken', lastActivity: '2026-06-07', activities: ['check-in'] },
  { id: 's007', name: 'Vijay Gupta', location: 'Ahmedabad', currentStreak: 29, longestStreak: 41, totalPoints: 4930, status: 'active', lastActivity: '2026-06-10', activities: ['check-in', 'medicine'] },
  { id: 's008', name: 'Meena Reddy', location: 'Kolkata', currentStreak: 21, longestStreak: 21, totalPoints: 3570, status: 'paused', lastActivity: '2026-06-09', activities: ['check-in', 'journal'] },
  { id: 's009', name: 'Prakash Iyer', location: 'Jaipur', currentStreak: 14, longestStreak: 28, totalPoints: 2380, status: 'active', lastActivity: '2026-06-10', activities: ['check-in', 'activity'] },
  { id: 's010', name: 'Sunita Singh', location: 'Lucknow', currentStreak: 0, longestStreak: 15, totalPoints: 1800, status: 'broken', lastActivity: '2026-06-05', activities: ['check-in'] },
];

const INIT_ACTIVITIES: StreakActivity[] = [
  { id: 'a001', label: 'Daily Check-In', points: 10, enabled: true, minPerDay: 1 },
  { id: 'a002', label: 'Medicine Tracking', points: 15, enabled: true, minPerDay: 1 },
  { id: 'a003', label: 'Memory Journal Entry', points: 20, enabled: true, minPerDay: 1 },
  { id: 'a004', label: 'Activity Completion', points: 25, enabled: true, minPerDay: 1 },
  { id: 'a005', label: 'Wellness Video Watched', points: 5, enabled: false, minPerDay: 1 },
  { id: 'a006', label: 'Family Message Sent', points: 10, enabled: false, minPerDay: 1 },
];

const INIT_RULES: RewardRule[] = [
  { id: 'r001', milestone: '7-day streak', points: 100, badge: '🔥', tier: 'Starter' },
  { id: 'r002', milestone: '30-day streak', points: 500, badge: '⭐', tier: 'Silver' },
  { id: 'r003', milestone: '60-day streak', points: 1200, badge: '🏅', tier: 'Gold' },
  { id: 'r004', milestone: '90-day streak', points: 3000, badge: '🏆', tier: 'Platinum' },
  { id: 'r005', milestone: '1000 total points', points: 200, badge: '💎', tier: 'Milestone' },
  { id: 'r006', milestone: '100 medicine logs', points: 300, badge: '💊', tier: 'Health Hero' },
  { id: 'r007', milestone: '50 journal entries', points: 400, badge: '📓', tier: 'Storyteller' },
];

const activityLabels: Record<string, string> = {
  'check-in': '✅ Check-In', 'medicine': '💊 Medicine', 'journal': '📓 Journal', 'activity': '🏃 Activity',
};

/* ─── Helpers ────────────────────────────────────────────── */
const statusStyle: Record<StreakStatus, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  paused: { variant: 'warning', label: 'Paused' },
  broken: { variant: 'danger', label: 'Broken' },
};

/* ─── Page ──────────────────────────────────────────────── */
export default function StreakManagementPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'config' | 'rewards'>('users');
  const [streaks, setStreaks] = useState(INIT_STREAKS);
  const [activities, setActivities] = useState(INIT_ACTIVITIES);
  const [rules, setRules] = useState(INIT_RULES);

  // User streaks state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StreakStatus>('all');
  const [resetId, setResetId] = useState<string | null>(null);

  // Reward rule state
  const [showAddRule, setShowAddRule] = useState(false);
  const [editRule, setEditRule] = useState<RewardRule | null>(null);
  const [newRule, setNewRule] = useState({ milestone: '', points: '', badge: '🎖️', tier: '' });

  // Config state
  const [minDayActions, setMinDayActions] = useState(1);
  const [graceHours, setGraceHours] = useState(24);
  const [saved, setSaved] = useState(false);

  const filtered = useMemo(() => streaks.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q))
      && (statusFilter === 'all' || s.status === statusFilter);
  }), [streaks, search, statusFilter]);

  const stats = useMemo(() => ({
    active: streaks.filter(s => s.status === 'active').length,
    highest: Math.max(...streaks.map(s => s.currentStreak)),
    avg: Math.round(streaks.filter(s => s.status === 'active').reduce((a, s) => a + s.currentStreak, 0) / Math.max(1, streaks.filter(s => s.status === 'active').length)),
    paused: streaks.filter(s => s.status === 'paused').length,
  }), [streaks]);

  function togglePause(id: string) {
    setStreaks(p => p.map(s => s.id === id ? { ...s, status: s.status === 'paused' ? 'active' : 'paused' } : s));
  }
  function resetStreak(id: string) {
    setStreaks(p => p.map(s => s.id === id ? { ...s, currentStreak: 0, status: 'broken' } : s));
    setResetId(null);
  }
  function restoreStreak(id: string) {
    setStreaks(p => p.map(s => s.id === id ? { ...s, status: 'active', currentStreak: 1 } : s));
  }

  function toggleActivity(id: string) { setActivities(p => p.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)); }
  function updateActivityPoints(id: string, val: string) { setActivities(p => p.map(a => a.id === id ? { ...a, points: Number(val) || 0 } : a)); }
  function updateActivityMin(id: string, val: string) { setActivities(p => p.map(a => a.id === id ? { ...a, minPerDay: Number(val) || 1 } : a)); }

  function saveConfig() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  function handleAddRule() {
    if (!newRule.milestone || !newRule.points) return;
    setRules(p => [...p, { id: `r${Date.now()}`, milestone: newRule.milestone, points: Number(newRule.points), badge: newRule.badge, tier: newRule.tier }]);
    setNewRule({ milestone: '', points: '', badge: '🎖️', tier: '' }); setShowAddRule(false);
  }
  function handleSaveRule() {
    if (!editRule) return;
    setRules(p => p.map(r => r.id === editRule.id ? editRule : r));
    setEditRule(null);
  }
  function deleteRule(id: string) { setRules(p => p.filter(r => r.id !== id)); }

  const BADGES = ['🔥', '⭐', '🏅', '🏆', '💎', '🎖️', '💊', '📓', '🌟', '🎯', '❤️', '🦁'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Zap className="w-6 h-6 text-amber-500" /> Leaderboard & Streak Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage user streaks, reward rules, and engagement configuration</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Streak Users', value: stats.active, icon: <Zap className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Highest Active Streak', value: `${stats.highest} days`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Average Streak', value: `${stats.avg} days`, icon: <Users className="w-4 h-4" />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Paused Streaks', value: stats.paused, icon: <PauseCircle className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}><span className={s.color}>{s.icon}</span></div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {([['users', 'User Streaks'], ['config', 'Streak Config'], ['rewards', 'Reward Rules']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === t ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700')}>
            {label}
          </button>
        ))}
      </div>

      {/* ── USER STREAKS TAB ── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input-field pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="input-field w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="broken">Broken</option>
              </select>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    {['User', 'Current Streak', 'Longest Streak', 'Total Points', 'Activities', 'Last Active', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(s => {
                    const ss = statusStyle[s.status];
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {s.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{s.name}</p>
                              <p className="text-[10px] text-slate-400">{s.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('flex items-center gap-1 text-sm font-bold whitespace-nowrap', s.currentStreak > 0 ? 'text-amber-600' : 'text-slate-300')}><Zap className="w-3.5 h-3.5" />{s.currentStreak} days</span>
                        </td>
                        <td className="px-4 py-3"><span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{s.longestStreak} days</span></td>
                        <td className="px-4 py-3"><span className="text-sm font-semibold text-brand-600 whitespace-nowrap">{s.totalPoints.toLocaleString()} pts</span></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {s.activities.map(a => <span key={a} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">{activityLabels[a] ?? a}</span>)}
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs text-slate-500 whitespace-nowrap">{s.lastActivity}</span></td>
                        <td className="px-4 py-3"><Badge variant={ss.variant} size="sm">{ss.label}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {s.status !== 'broken' && (
                              <button onClick={() => togglePause(s.id)} title={s.status === 'active' ? 'Pause Streak' : 'Resume Streak'}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-amber-600 transition-colors">
                                {s.status === 'active' ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            {s.status === 'broken' && (
                              <button onClick={() => restoreStreak(s.id)} title="Restore Streak"
                                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-colors">
                                <PlayCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={() => setResetId(s.id)} title="Reset Streak"
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {/* Reset confirm */}
                          {resetId === s.id && (
                            <div className="mt-1 flex gap-1">
                              <button className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded" onClick={() => resetStreak(s.id)}>Confirm Reset</button>
                              <button className="text-[10px] text-slate-400 hover:text-slate-600" onClick={() => setResetId(null)}>Cancel</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No users match your filters</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500">Showing {filtered.length} of {streaks.length} users</p>
            </div>
          </div>
        </div>
      )}

      {/* ── STREAK CONFIG TAB ── */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Global rules */}
          <div className="card p-6">
            <h2 className="section-title mb-5">Global Streak Rules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Minimum Actions Per Day</label>
                <p className="text-xs text-slate-400 mb-2">User must complete at least this many activities to maintain a streak day.</p>
                <input type="number" min={1} max={10} className="input-field w-32" value={minDayActions} onChange={e => setMinDayActions(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Grace Period (hours)</label>
                <p className="text-xs text-slate-400 mb-2">Hours after midnight before a streak is considered broken.</p>
                <input type="number" min={0} max={48} className="input-field w-32" value={graceHours} onChange={e => setGraceHours(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Activity toggles */}
          <div className="card p-6">
            <h2 className="section-title mb-5">Activity Configuration</h2>
            <p className="text-xs text-slate-400 mb-4">Enable activities that count toward the daily streak. Adjust points and minimum completions per activity.</p>
            <div className="space-y-3">
              {activities.map(a => (
                <div key={a.id} className={cn('flex items-center gap-4 p-4 rounded-xl border transition-colors', a.enabled ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700')}>
                  <button onClick={() => toggleActivity(a.id)}>
                    {a.enabled ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.label}</p>
                    <p className="text-[11px] text-slate-400">Contributes to daily streak count</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1 text-center">Points</p>
                      <input type="number" min={1} max={100} className="input-field w-20 text-center text-sm" value={a.points} onChange={e => updateActivityPoints(a.id, e.target.value)} disabled={!a.enabled} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1 text-center">Min/Day</p>
                      <input type="number" min={1} max={10} className="input-field w-20 text-center text-sm" value={a.minPerDay} onChange={e => updateActivityMin(a.id, e.target.value)} disabled={!a.enabled} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn-primary" onClick={saveConfig}><Save className="w-4 h-4" />{saved ? 'Saved!' : 'Save Configuration'}</button>
          </div>
        </div>
      )}

      {/* ── REWARD RULES TAB ── */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Define milestones, badge unlocks, and point multipliers</p>
            <button className="btn-primary" onClick={() => { setShowAddRule(true); setEditRule(null); }}><Plus className="w-4 h-4" /> Add Rule</button>
          </div>

          {/* Add / Edit form */}
          {(showAddRule || editRule) && (
            <div className="card p-6 border-2 border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between mb-5">
                <h2 className="section-title">{editRule ? 'Edit Reward Rule' : 'New Reward Rule'}</h2>
                <button onClick={() => { setShowAddRule(false); setEditRule(null); }} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Milestone Description <span className="text-red-500">*</span></label>
                  <input className="input-field" placeholder="e.g. 30-day streak"
                    value={editRule ? editRule.milestone : newRule.milestone}
                    onChange={e => editRule ? setEditRule({ ...editRule, milestone: e.target.value }) : setNewRule(r => ({ ...r, milestone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Points Awarded <span className="text-red-500">*</span></label>
                  <input type="number" className="input-field" placeholder="500"
                    value={editRule ? editRule.points : newRule.points}
                    onChange={e => editRule ? setEditRule({ ...editRule, points: Number(e.target.value) }) : setNewRule(r => ({ ...r, points: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Badge</label>
                  <div className="flex flex-wrap gap-2">
                    {BADGES.map(b => (
                      <button key={b} onClick={() => editRule ? setEditRule({ ...editRule, badge: b }) : setNewRule(r => ({ ...r, badge: b }))}
                        className={cn('text-xl w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all',
                          (editRule ? editRule.badge : newRule.badge) === b ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        )}>{b}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tier / Label</label>
                  <input className="input-field" placeholder="e.g. Gold, Platinum, Health Hero"
                    value={editRule ? editRule.tier : newRule.tier}
                    onChange={e => editRule ? setEditRule({ ...editRule, tier: e.target.value }) : setNewRule(r => ({ ...r, tier: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button className="btn-secondary" onClick={() => { setShowAddRule(false); setEditRule(null); }}>Cancel</button>
                <button className="btn-primary" onClick={editRule ? handleSaveRule : handleAddRule}><Save className="w-4 h-4" />{editRule ? 'Save Rule' : 'Add Rule'}</button>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  {['Badge', 'Milestone', 'Tier', 'Points Awarded', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rules.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3"><span className="text-2xl">{r.badge}</span></td>
                    <td className="px-5 py-3"><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.milestone}</p></td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full">{r.tier}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-sm font-bold text-brand-600"><Star className="w-3.5 h-3.5 text-yellow-500" />{r.points.toLocaleString()} pts</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditRule(r); setShowAddRule(false); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteRule(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500">{rules.length} reward rules configured</p>
            </div>
          </div>

          {/* Achievement levels summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Starter', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800', pts: '0–499', icon: '🌱' },
              { label: 'Silver', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/50', pts: '500–1,999', icon: '⭐' },
              { label: 'Gold', color: 'text-amber-700', bg: 'bg-amber-50 dark:bg-amber-900/20', pts: '2,000–5,999', icon: '🏅' },
              { label: 'Platinum', color: 'text-violet-700', bg: 'bg-violet-50 dark:bg-violet-900/20', pts: '6,000+', icon: '🏆' },
            ].map(tier => (
              <div key={tier.label} className={cn('rounded-xl p-4 text-center', tier.bg)}>
                <p className="text-3xl mb-2">{tier.icon}</p>
                <p className={cn('font-bold text-sm', tier.color)}>{tier.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{tier.pts} pts</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

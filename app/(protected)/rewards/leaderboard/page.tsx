'use client';
import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Search, Download, Zap, Star, TrendingUp, Users, Crown, Award } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

/* ─── Types ─────────────────────────────────────────────── */
type Period = 'global' | 'weekly' | 'monthly' | 'alltime';
type Tier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

interface LeaderEntry {
  rank: number; name: string; location: string;
  points: number; streak: number; longestStreak: number;
  achievements: number; tier: Tier; change: number;
}

/* ─── Mock Data ─────────────────────────────────────────── */
function makeBoard(seed: number): LeaderEntry[] {
  const names = ['Arjun Mehta', 'Priya Sharma', 'Ramesh Patel', 'Kavitha Nair', 'Suresh Kumar', 'Anita Joshi', 'Vijay Gupta', 'Meena Reddy', 'Prakash Iyer', 'Sunita Singh', 'Rakesh Verma', 'Deepa Rao', 'Mohan Das', 'Lalitha Pillai', 'Kishore Bajaj'];
  const locs = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Lucknow', 'Surat', 'Bhopal', 'Coimbatore', 'Kochi', 'Nagpur'];
  return names.map((name, i) => {
    const pts = Math.max(100, (15000 - i * 800 + seed * 30));
    const str = Math.max(1, 90 - i * 4 + (seed % 7));
    const changes = [0, 1, -1, 2, -2, 0, 1, 0, -1, 2, 0, -1, 1, 0, -2];
    return {
      rank: i + 1, name, location: locs[i],
      points: pts, streak: str, longestStreak: str + 10 + (i % 5),
      achievements: Math.max(1, 24 - i),
      tier: (i === 0 ? 'Platinum' : i < 4 ? 'Gold' : i < 8 ? 'Silver' : 'Bronze') as Tier,
      change: seed === 0 ? 0 : changes[(i + seed) % changes.length],
    };
  });
}

const DATA: Record<Period, LeaderEntry[]> = {
  global: makeBoard(0),
  weekly: makeBoard(3),
  monthly: makeBoard(7),
  alltime: makeBoard(11),
};

const PERIOD_LABELS: Record<Period, string> = { global: 'Global', weekly: 'This Week', monthly: 'This Month', alltime: 'All Time' };

const tierStyle: Record<Tier, { color: string; bg: string }> = {
  Platinum: { color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-900/30' },
  Gold: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  Silver: { color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  Bronze: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('global');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | Tier>('all');

  const board = DATA[period];
  const filtered = useMemo(() => board.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
      && (tierFilter === 'all' || e.tier === tierFilter);
  }), [board, search, tierFilter]);

  const stats = useMemo(() => ({
    activeStreaks: board.filter(e => e.streak > 0).length,
    highest: Math.max(...board.map(e => e.streak)),
    avg: Math.round(board.reduce((a, e) => a + e.streak, 0) / board.length),
    totalPoints: board.reduce((a, e) => a + e.points, 0),
  }), [board]);

  // Podium: display order 2nd, 1st, 3rd
  const top3 = board.slice(0, 3);
  const podiumDisplay = [top3[1], top3[0], top3[2]];
  const podiumRanks = [2, 1, 3];
  const podiumStyles = [
    { ring: 'ring-slate-300', podiumBg: 'bg-slate-100 dark:bg-slate-800', h: 'h-20', num: 'text-slate-400' },
    { ring: 'ring-amber-400', podiumBg: 'bg-amber-50 dark:bg-amber-900/20', h: 'h-28', num: 'text-amber-500' },
    { ring: 'ring-orange-400', podiumBg: 'bg-orange-50 dark:bg-orange-900/20', h: 'h-16', num: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> Leaderboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">User engagement rankings and performance metrics</p>
        </div>
        <button className="btn-secondary"><Download className="w-4 h-4" /> Export Rankings</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Streak Users', value: stats.activeStreaks, icon: <Zap className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Highest Streak', value: `${stats.highest} days`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Average Streak', value: `${stats.avg} days`, icon: <Users className="w-4 h-4" />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Total Points (Board)', value: stats.totalPoints.toLocaleString(), icon: <Star className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
              <span className={s.color}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all',
              period === p ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700')}>
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="card p-8">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-8">Top Performers — {PERIOD_LABELS[period]}</p>
        <div className="flex items-end justify-center gap-6">
          {podiumDisplay.map((entry, idx) => {
            if (!entry) return null;
            const ps = podiumStyles[idx];
            const isFirst = podiumRanks[idx] === 1;
            return (
              <div key={entry.name} className="flex flex-col items-center gap-3">
                <div className="relative">
                  {isFirst && <Crown className="absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-500" />}
                  <div className={cn('w-16 h-16 rounded-full ring-4 flex items-center justify-center text-xl font-black text-white bg-gradient-to-br from-brand-400 to-teal-500 shadow-lg', ps.ring)}>
                    {entry.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{entry.name}</p>
                  <p className="text-xs text-slate-400">{entry.location}</p>
                  <p className="text-sm font-bold text-brand-600 mt-0.5">{entry.points.toLocaleString()} pts</p>
                  <p className="text-xs text-amber-500 flex items-center justify-center gap-0.5 mt-0.5"><Zap className="w-3 h-3" />{entry.streak}d</p>
                </div>
                <div className={cn('w-24 rounded-t-xl flex items-end justify-center pb-2', ps.podiumBg, ps.h)}>
                  <span className={cn('text-4xl font-black', ps.num)}>{podiumRanks[idx]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input-field pl-9" placeholder="Search by name or city..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={tierFilter} onChange={e => setTierFilter(e.target.value as typeof tierFilter)}>
            <option value="all">All Tiers</option>
            <option value="Platinum">🏆 Platinum</option>
            <option value="Gold">🥇 Gold</option>
            <option value="Silver">🥈 Silver</option>
            <option value="Bronze">🥉 Bronze</option>
          </select>
        </div>
      </div>

      {/* Rankings table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                {['Rank', 'User', 'Points', 'Current Streak', 'Longest Streak', 'Achievements', 'Tier', 'Change'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(entry => {
                const ts = tierStyle[entry.tier];
                return (
                  <tr key={`${entry.name}-${entry.rank}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        entry.rank === 1 ? 'bg-amber-100 text-amber-700' : entry.rank === 2 ? 'bg-slate-100 text-slate-600' : entry.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                      )}>
                        {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {entry.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{entry.name}</p>
                          <p className="text-[10px] text-slate-400">{entry.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm font-bold text-brand-600">{entry.points.toLocaleString()}</span></td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm font-semibold text-amber-600 whitespace-nowrap"><Zap className="w-3.5 h-3.5" />{entry.streak} days</span>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{entry.longestStreak} days</span></td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap"><Award className="w-3.5 h-3.5 text-violet-500" />{entry.achievements}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', ts.bg, ts.color)}>{entry.tier}</span>
                    </td>
                    <td className="px-4 py-3">
                      {entry.change !== 0
                        ? <span className={cn('text-xs font-semibold whitespace-nowrap', entry.change > 0 ? 'text-emerald-600' : 'text-red-500')}>{entry.change > 0 ? `↑${entry.change}` : `↓${Math.abs(entry.change)}`}</span>
                        : <span className="text-xs text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No users match your search</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500">Showing {filtered.length} of {board.length} users — {PERIOD_LABELS[period]}</p>
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Trophy, Medal, Search, Download, Zap, Star, TrendingUp, Users, Crown, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/src/components/ui';
import { getAdminMindGames } from '@/src/services/adminApi';

type Period = 'global' | 'weekly' | 'monthly' | 'alltime';
type Tier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

interface LeaderEntry {
  rank: number;
  name: string;
  location: string;
  points: number;
  streak: number;
  longestStreak: number;
  achievements: number;
  tier: Tier;
  change: number;
  gameType: string;
}

const PERIOD_LABELS: Record<Period, string> = { global: 'Global', weekly: 'This Week', monthly: 'This Month', alltime: 'All Time' };

const tierStyle: Record<Tier, { color: string; bg: string }> = {
  Platinum: { color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-900/30' },
  Gold: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  Silver: { color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  Bronze: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
};

function tierFromScore(score: number): Tier {
  if (score >= 900) return 'Platinum';
  if (score >= 600) return 'Gold';
  if (score >= 300) return 'Silver';
  return 'Bronze';
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('global');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | Tier>('all');
  const [board, setBoard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminMindGames({ limit: 100 });
        if (res.success) {
          const scores = res.scores || [];
          // Aggregate best score per user
          const byUser = new Map<string, { name: string; points: number; gameType: string }>();
          for (const s of scores) {
            const id = s.user_id || s.id;
            const name = s.user_name || 'Unknown';
            const points = Number(s.score) || 0;
            const existing = byUser.get(id);
            if (!existing || points > existing.points) {
              byUser.set(id, { name, points, gameType: s.game_type || '—' });
            }
          }
          const entries: LeaderEntry[] = Array.from(byUser.values())
            .sort((a, b) => b.points - a.points)
            .map((u, i) => ({
              rank: i + 1,
              name: u.name,
              location: u.gameType,
              points: u.points,
              streak: 0,
              longestStreak: 0,
              achievements: 0,
              tier: tierFromScore(u.points),
              change: 0,
              gameType: u.gameType,
            }));
          setBoard(entries);
        } else {
          setError(res.error || 'Failed to load leaderboard');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  const filtered = useMemo(() => board.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
      && (tierFilter === 'all' || e.tier === tierFilter);
  }), [board, search, tierFilter]);

  const stats = useMemo(() => ({
    activeStreaks: board.length,
    highest: board.length ? Math.max(...board.map(e => e.points)) : 0,
    avg: board.length ? Math.round(board.reduce((a, e) => a + e.points, 0) / board.length) : 0,
    totalPoints: board.reduce((a, e) => a + e.points, 0),
  }), [board]);

  const top3 = board.slice(0, 3);
  const podiumDisplay = [top3[1], top3[0], top3[2]];
  const podiumRanks = [2, 1, 3];
  const podiumStyles = [
    { ring: 'ring-slate-300', podiumBg: 'bg-slate-100 dark:bg-slate-800', h: 'h-20', num: 'text-slate-400' },
    { ring: 'ring-amber-400', podiumBg: 'bg-amber-50 dark:bg-amber-900/20', h: 'h-28', num: 'text-amber-500' },
    { ring: 'ring-orange-400', podiumBg: 'bg-orange-50 dark:bg-orange-900/20', h: 'h-16', num: 'text-orange-500' },
  ];

  const handleExport = () => {
    const csv = [['Rank', 'User', 'Game', 'Points', 'Tier'], ...filtered.map(e => [e.rank, e.name, e.location, e.points, e.tier])].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leaderboard.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> Leaderboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Mind-games score rankings</p>
        </div>
        <button className="btn-secondary" onClick={handleExport}><Download className="w-4 h-4" /> Export Rankings</button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ranked Users', value: stats.activeStreaks, icon: <Zap className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Highest Score', value: stats.highest.toLocaleString(), icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Average Score', value: stats.avg.toLocaleString(), icon: <Users className="w-4 h-4" />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
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

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all',
              period === p ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700')}>
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card py-16 flex justify-center gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /> Loading leaderboard…</div>
      ) : (
        <>
          <div className="card p-8">
            <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-8">Top Performers — {PERIOD_LABELS[period]}</p>
            <div className="flex items-end justify-center gap-6">
              {podiumDisplay.map((entry, idx) => {
                if (!entry) return null;
                const ps = podiumStyles[idx];
                const isFirst = podiumRanks[idx] === 1;
                return (
                  <div key={entry.name + entry.rank} className="flex flex-col items-center gap-3">
                    <div className="relative">
                      {isFirst && <Crown className="absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-500" />}
                      <div className={cn('w-16 h-16 rounded-full ring-4 flex items-center justify-center text-xl font-black text-white bg-gradient-to-br from-brand-400 to-teal-500 shadow-lg', ps.ring)}>
                        {entry.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{entry.name}</p>
                      <p className="text-xs text-slate-400">{entry.location}</p>
                      <p className="text-sm font-bold text-brand-600 mt-0.5">{entry.points.toLocaleString()} pts</p>
                    </div>
                    <div className={cn('w-24 rounded-t-xl flex items-end justify-center pb-2', ps.podiumBg, ps.h)}>
                      <span className={cn('text-4xl font-black', ps.num)}>{podiumRanks[idx]}</span>
                    </div>
                  </div>
                );
              })}
              {top3.length === 0 && <p className="text-sm text-slate-400">No scores yet</p>}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input-field pl-9" placeholder="Search by name or game..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="input-field w-auto" value={tierFilter} onChange={e => setTierFilter(e.target.value as typeof tierFilter)}>
                <option value="all">All Tiers</option>
                <option value="Platinum">Platinum</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
              </select>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    {['Rank', 'User', 'Points', 'Game', 'Tier'].map(h => (
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
                              {entry.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{entry.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-sm font-bold text-brand-600">{entry.points.toLocaleString()}</span></td>
                        <td className="px-4 py-3"><span className="text-sm text-slate-500">{entry.location}</span></td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', ts.bg, ts.color)}>{entry.tier}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No users match your search</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500">Showing {filtered.length} of {board.length} users — {PERIOD_LABELS[period]}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import TeamMatrix from '@/components/TeamMatrix';
import { analyzeAllTeams, TeamStats } from '@/lib/TeamAnalysis';

// Mock team data with logos - in production, fetch from API
const mockTeamStats: TeamStats[] = [
  { teamId: 1, teamName: 'Manchester City', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t43.png', goalsFor: 45, goalsAgainst: 18, xGFor: 50.2, xGAgainst: 15.8, matchesPlayed: 20, points: 48 },
  { teamId: 2, teamName: 'Arsenal', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t3.png', goalsFor: 42, goalsAgainst: 16, xGFor: 38.5, xGAgainst: 20.1, matchesPlayed: 20, points: 46 },
  { teamId: 3, teamName: 'Liverpool', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t14.png', goalsFor: 48, goalsAgainst: 20, xGFor: 52.3, xGAgainst: 18.2, matchesPlayed: 20, points: 50 },
  { teamId: 4, teamName: 'Aston Villa', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t7.png', goalsFor: 38, goalsAgainst: 25, xGFor: 35.1, xGAgainst: 28.5, matchesPlayed: 20, points: 38 },
  { teamId: 5, teamName: 'Tottenham', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t6.png', goalsFor: 35, goalsAgainst: 28, xGFor: 40.2, xGAgainst: 24.1, matchesPlayed: 20, points: 35 },
  { teamId: 6, teamName: 'Newcastle', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t4.png', goalsFor: 32, goalsAgainst: 22, xGFor: 28.5, xGAgainst: 26.8, matchesPlayed: 20, points: 34 },
  { teamId: 7, teamName: 'Manchester United', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t1.png', goalsFor: 28, goalsAgainst: 30, xGFor: 32.1, xGAgainst: 25.5, matchesPlayed: 20, points: 28 },
  { teamId: 8, teamName: 'Chelsea', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t8.png', goalsFor: 40, goalsAgainst: 26, xGFor: 36.8, xGAgainst: 28.2, matchesPlayed: 20, points: 36 },
  { teamId: 9, teamName: 'Brighton', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t36.png', goalsFor: 35, goalsAgainst: 32, xGFor: 38.5, xGAgainst: 28.1, matchesPlayed: 20, points: 32 },
  { teamId: 10, teamName: 'West Ham', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t21.png', goalsFor: 28, goalsAgainst: 35, xGFor: 25.2, xGAgainst: 32.5, matchesPlayed: 20, points: 26 },
  { teamId: 11, teamName: 'Brentford', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t94.png', goalsFor: 30, goalsAgainst: 28, xGFor: 32.5, xGAgainst: 30.1, matchesPlayed: 20, points: 30 },
  { teamId: 12, teamName: 'Crystal Palace', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t31.png', goalsFor: 22, goalsAgainst: 30, xGFor: 26.8, xGAgainst: 28.5, matchesPlayed: 20, points: 24 },
  { teamId: 13, teamName: 'Fulham', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t54.png', goalsFor: 28, goalsAgainst: 32, xGFor: 30.2, xGAgainst: 28.8, matchesPlayed: 20, points: 28 },
  { teamId: 14, teamName: 'Wolves', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t39.png', goalsFor: 25, goalsAgainst: 35, xGFor: 22.1, xGAgainst: 32.2, matchesPlayed: 20, points: 22 },
  { teamId: 15, teamName: 'Bournemouth', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t91.png', goalsFor: 30, goalsAgainst: 38, xGFor: 28.5, xGAgainst: 35.2, matchesPlayed: 20, points: 26 },
  { teamId: 16, teamName: 'Nottingham Forest', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t17.png', goalsFor: 22, goalsAgainst: 32, xGFor: 25.8, xGAgainst: 30.1, matchesPlayed: 20, points: 24 },
  { teamId: 17, teamName: 'Everton', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t11.png', goalsFor: 20, goalsAgainst: 28, xGFor: 24.5, xGAgainst: 32.8, matchesPlayed: 20, points: 20 },
  { teamId: 18, teamName: 'Leicester City', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t13.png', goalsFor: 26, goalsAgainst: 40, xGFor: 28.2, xGAgainst: 36.5, matchesPlayed: 20, points: 18 },
  { teamId: 19, teamName: 'Ipswich Town', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t40.png', goalsFor: 18, goalsAgainst: 42, xGFor: 22.5, xGAgainst: 38.2, matchesPlayed: 20, points: 14 },
  { teamId: 20, teamName: 'Southampton', teamLogo: 'https://resources.premierleague.com/premierleague/badges/t20.png', goalsFor: 15, goalsAgainst: 45, xGFor: 20.8, xGAgainst: 40.5, matchesPlayed: 20, points: 10 },
];

export default function MatrixPage() {
  // Analyze all teams using the 5-tier model
  const analyzedTeams = analyzeAllTeams(mockTeamStats);

  // Count verdicts for summary
  const verdictCounts = {
    DOMINANT: analyzedTeams.filter(t => t.marketVerdict === 'DOMINANT').length,
    PRIME_BUY: analyzedTeams.filter(t => t.marketVerdict === 'PRIME_BUY').length,
    STABLE: analyzedTeams.filter(t => t.marketVerdict === 'STABLE').length,
    FRAGILE: analyzedTeams.filter(t => t.marketVerdict === 'FRAGILE').length,
    OVERHEATED: analyzedTeams.filter(t => t.marketVerdict === 'OVERHEATED').length,
    CRITICAL: analyzedTeams.filter(t => t.marketVerdict === 'CRITICAL').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
          Health vs. Heat Matrix
        </h1>
        <p className="text-slate-400">
          5-tier efficiency gradient analysis combining sustainability (xG structure) with conversion efficiency
        </p>
      </div>

      {/* Legend Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">📊 Structure (Health)</h3>
          <p className="text-xs text-slate-400 mb-2">Net xG per 90 — predicts long-term reliability</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">70-100: Elite structure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-300">40-70: Average structure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">0-40: Broken structure</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">🔥 Form (Heat)</h3>
          <p className="text-xs text-slate-400 mb-2">Goals - xG — predicts short-term regression</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px]">CRIT OVER</span>
              <span className="text-slate-300">+6.0 or more</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-500 text-white font-mono text-[10px]">HEATING UP</span>
              <span className="text-slate-300">+2.0 to +6.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-mono text-[10px]">FAIR VALUE</span>
              <span className="text-slate-300">-2.0 to +2.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-300 text-blue-900 font-mono text-[10px]">COLD</span>
              <span className="text-slate-300">-6.0 to -2.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-mono text-[10px]">EXTREME VAL</span>
              <span className="text-slate-300">-6.0 or less</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verdict Summary */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">Market Archetypes</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <div className="text-center p-3 rounded-lg bg-emerald-900/20 border border-emerald-800">
            <div className="text-xl font-bold text-emerald-400">{verdictCounts.DOMINANT}</div>
            <p className="text-xs text-emerald-400/80 font-medium">DOMINANT</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-900/20 border border-purple-800">
            <div className="text-xl font-bold text-purple-400">{verdictCounts.PRIME_BUY}</div>
            <p className="text-xs text-purple-400/80 font-medium">💎 PRIME BUY</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="text-xl font-bold text-slate-400">{verdictCounts.STABLE}</div>
            <p className="text-xs text-slate-500 font-medium">STABLE</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="text-xl font-bold text-slate-500">{verdictCounts.FRAGILE}</div>
            <p className="text-xs text-slate-500 font-medium">FRAGILE</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-900/20 border border-amber-800">
            <div className="text-xl font-bold text-amber-400">{verdictCounts.OVERHEATED}</div>
            <p className="text-xs text-amber-400/80 font-medium">⚠️ OVERHEATED</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-900/20 border border-red-800">
            <div className="text-xl font-bold text-red-400">{verdictCounts.CRITICAL}</div>
            <p className="text-xs text-red-400/80 font-medium">🚨 CRITICAL</p>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <TeamMatrix teams={analyzedTeams} />
    </div>
  );
}

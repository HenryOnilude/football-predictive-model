'use client';

import { useState } from 'react';
import TeamSentimentCard from '@/components/TeamSentimentCard';
import { TeamLuckResult, calculateTeamLuck, TeamStats } from '@/lib/TeamLuck';

type QuadrantFilter = 'ALL' | 'DOUBLE_VALUE' | 'CLEAN_SHEET_CHASER' | 'GOAL_CHASER' | 'AVOID' | 'NEUTRAL';

// Mock team data - in production, fetch from API
const mockTeamStats: TeamStats[] = [
  { teamId: 1, teamName: 'Manchester City', teamShort: 'MCI', goalsFor: 45, goalsAgainst: 18, xGFor: 50.2, xGAgainst: 15.8, matchesPlayed: 20 },
  { teamId: 2, teamName: 'Arsenal', teamShort: 'ARS', goalsFor: 42, goalsAgainst: 16, xGFor: 38.5, xGAgainst: 20.1, matchesPlayed: 20 },
  { teamId: 3, teamName: 'Liverpool', teamShort: 'LIV', goalsFor: 48, goalsAgainst: 20, xGFor: 52.3, xGAgainst: 18.2, matchesPlayed: 20 },
  { teamId: 4, teamName: 'Aston Villa', teamShort: 'AVL', goalsFor: 38, goalsAgainst: 25, xGFor: 35.1, xGAgainst: 28.5, matchesPlayed: 20 },
  { teamId: 5, teamName: 'Tottenham', teamShort: 'TOT', goalsFor: 35, goalsAgainst: 28, xGFor: 40.2, xGAgainst: 24.1, matchesPlayed: 20 },
  { teamId: 6, teamName: 'Newcastle', teamShort: 'NEW', goalsFor: 32, goalsAgainst: 22, xGFor: 28.5, xGAgainst: 26.8, matchesPlayed: 20 },
  { teamId: 7, teamName: 'Manchester United', teamShort: 'MUN', goalsFor: 28, goalsAgainst: 30, xGFor: 32.1, xGAgainst: 25.5, matchesPlayed: 20 },
  { teamId: 8, teamName: 'Chelsea', teamShort: 'CHE', goalsFor: 40, goalsAgainst: 26, xGFor: 36.8, xGAgainst: 28.2, matchesPlayed: 20 },
  { teamId: 9, teamName: 'Brighton', teamShort: 'BHA', goalsFor: 35, goalsAgainst: 32, xGFor: 38.5, xGAgainst: 28.1, matchesPlayed: 20 },
  { teamId: 10, teamName: 'West Ham', teamShort: 'WHU', goalsFor: 28, goalsAgainst: 35, xGFor: 25.2, xGAgainst: 32.5, matchesPlayed: 20 },
  { teamId: 11, teamName: 'Brentford', teamShort: 'BRE', goalsFor: 30, goalsAgainst: 28, xGFor: 32.5, xGAgainst: 30.1, matchesPlayed: 20 },
  { teamId: 12, teamName: 'Crystal Palace', teamShort: 'CRY', goalsFor: 22, goalsAgainst: 30, xGFor: 26.8, xGAgainst: 28.5, matchesPlayed: 20 },
  { teamId: 13, teamName: 'Fulham', teamShort: 'FUL', goalsFor: 28, goalsAgainst: 32, xGFor: 30.2, xGAgainst: 28.8, matchesPlayed: 20 },
  { teamId: 14, teamName: 'Wolves', teamShort: 'WOL', goalsFor: 25, goalsAgainst: 35, xGFor: 22.1, xGAgainst: 32.2, matchesPlayed: 20 },
  { teamId: 15, teamName: 'Bournemouth', teamShort: 'BOU', goalsFor: 30, goalsAgainst: 38, xGFor: 28.5, xGAgainst: 35.2, matchesPlayed: 20 },
  { teamId: 16, teamName: 'Nottingham Forest', teamShort: 'NFO', goalsFor: 22, goalsAgainst: 32, xGFor: 25.8, xGAgainst: 30.1, matchesPlayed: 20 },
  { teamId: 17, teamName: 'Everton', teamShort: 'EVE', goalsFor: 20, goalsAgainst: 28, xGFor: 24.5, xGAgainst: 32.8, matchesPlayed: 20 },
  { teamId: 18, teamName: 'Leicester City', teamShort: 'LEI', goalsFor: 26, goalsAgainst: 40, xGFor: 28.2, xGAgainst: 36.5, matchesPlayed: 20 },
  { teamId: 19, teamName: 'Ipswich Town', teamShort: 'IPS', goalsFor: 18, goalsAgainst: 42, xGFor: 22.5, xGAgainst: 38.2, matchesPlayed: 20 },
  { teamId: 20, teamName: 'Southampton', teamShort: 'SOU', goalsFor: 15, goalsAgainst: 45, xGFor: 20.8, xGAgainst: 40.5, matchesPlayed: 20 },
];

const filterOptions: { value: QuadrantFilter; label: string; icon: string; description: string }[] = [
  { value: 'ALL', label: 'All Teams', icon: '📊', description: 'View all teams' },
  { value: 'DOUBLE_VALUE', label: 'Double Value', icon: '💎', description: 'Unlucky Attack + Defense' },
  { value: 'CLEAN_SHEET_CHASER', label: 'Clean Sheet Chasers', icon: '🛡️', description: 'Best defensive value' },
  { value: 'GOAL_CHASER', label: 'Goal Chasers', icon: '🔫', description: 'Best attacking value' },
  { value: 'AVOID', label: 'Avoid', icon: '⚠️', description: 'Overperforming - regression due' },
  { value: 'NEUTRAL', label: 'Neutral', icon: '➡️', description: 'Performing as expected' },
];

export default function TeamsPage() {
  const [filter, setFilter] = useState<QuadrantFilter>('ALL');

  // Calculate luck for all teams
  const teamsWithLuck: TeamLuckResult[] = mockTeamStats.map(calculateTeamLuck);

  // Filter teams based on quadrant
  const filteredTeams = filter === 'ALL' 
    ? teamsWithLuck 
    : teamsWithLuck.filter(t => t.quadrant === filter);

  // Count teams in each quadrant
  const quadrantCounts = {
    ALL: teamsWithLuck.length,
    DOUBLE_VALUE: teamsWithLuck.filter(t => t.quadrant === 'DOUBLE_VALUE').length,
    CLEAN_SHEET_CHASER: teamsWithLuck.filter(t => t.quadrant === 'CLEAN_SHEET_CHASER').length,
    GOAL_CHASER: teamsWithLuck.filter(t => t.quadrant === 'GOAL_CHASER').length,
    AVOID: teamsWithLuck.filter(t => t.quadrant === 'AVOID').length,
    NEUTRAL: teamsWithLuck.filter(t => t.quadrant === 'NEUTRAL').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
          Team Sentiment Analysis
        </h1>
        <p className="text-slate-400">
          Identify the best defenses and attacks to target based on xG variance
        </p>
      </div>

      {/* Quadrant Filter */}
      <div className="card p-4 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Market Sentiment Filter</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === option.value
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-300'
                }
              `}
            >
              <span className="mr-1.5">{option.icon}</span>
              {option.label}
              <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-900/50 text-xs">
                {quadrantCounts[option.value]}
              </span>
            </button>
          ))}
        </div>
        {filter !== 'ALL' && (
          <p className="text-xs text-slate-500 mt-3">
            {filterOptions.find(o => o.value === filter)?.description}
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="card bg-slate-800/50 p-4 mb-8 border-slate-700">
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-semibold text-white mb-2">Attacking Luck (xG Delta)</p>
            <div className="space-y-1 text-slate-400">
              <p><span className="text-emerald-400 font-semibold">Negative:</span> Unlucky - missing chances. <strong className="text-white">TARGET ATTACKERS</strong></p>
              <p><span className="text-rose-400 font-semibold">Positive:</span> Lucky - scoring worldies. <strong className="text-white">AVOID ATTACKERS</strong></p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Defensive Luck (xGA Delta)</p>
            <div className="space-y-1 text-slate-400">
              <p><span className="text-emerald-400 font-semibold">Positive:</span> Unlucky - conceding cheap goals. <strong className="text-white">BUY DEFENSE</strong></p>
              <p><span className="text-rose-400 font-semibold">Negative:</span> Lucky - keepers saving them. <strong className="text-white">AVOID DEFENSE</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400">No teams match this filter</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredTeams.map((team) => (
            <TeamSentimentCard key={team.teamId} team={team} />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="card p-6 mt-8 bg-slate-800/50 border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-4">Quick Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{quadrantCounts.DOUBLE_VALUE}</div>
            <p className="text-xs text-slate-500">💎 Double Value</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{quadrantCounts.CLEAN_SHEET_CHASER}</div>
            <p className="text-xs text-slate-500">🛡️ CS Chasers</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{quadrantCounts.GOAL_CHASER}</div>
            <p className="text-xs text-slate-500">🔫 Goal Chasers</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-400">{quadrantCounts.AVOID}</div>
            <p className="text-xs text-slate-500">⚠️ Avoid</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-400">{quadrantCounts.NEUTRAL}</div>
            <p className="text-xs text-slate-500">➡️ Neutral</p>
          </div>
        </div>
      </div>
    </div>
  );
}

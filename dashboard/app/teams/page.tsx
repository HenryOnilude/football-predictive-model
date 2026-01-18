'use client';

import { useEffect, useState } from 'react';
import TeamSentimentCard from '@/components/TeamSentimentCard';
import TeamMatrix from '@/components/TeamMatrix';
import PremierLeagueTable from '@/components/PremierLeagueTable';
import { TeamLuckResult } from '@/lib/TeamLuck';
import { TeamAnalysis } from '@/lib/TeamAnalysis';
import { 
  fetchFPLData, 
  transformTeams, 
  convertToTeamAnalysis,
  getCurrentGameweek,
  TeamHealthHeat,
} from '@/lib/fpl';

type QuadrantFilter = 'ALL' | 'DOUBLE_VALUE' | 'CLEAN_SHEET_CHASER' | 'GOAL_CHASER' | 'AVOID' | 'NEUTRAL';

const filterOptions: { value: QuadrantFilter; label: string; icon: string; description: string }[] = [
  { value: 'ALL', label: 'All Teams', icon: '📊', description: 'View all teams' },
  { value: 'DOUBLE_VALUE', label: 'Double Value', icon: '💎', description: 'Unlucky Attack + Defense' },
  { value: 'CLEAN_SHEET_CHASER', label: 'Clean Sheet Chasers', icon: '🛡️', description: 'Best defensive value' },
  { value: 'GOAL_CHASER', label: 'Goal Chasers', icon: '🔫', description: 'Best attacking value' },
  { value: 'AVOID', label: 'Avoid', icon: '⚠️', description: 'Overperforming - regression due' },
  { value: 'NEUTRAL', label: 'Neutral', icon: '➡️', description: 'Performing as expected' },
];

// Convert TeamHealthHeat to TeamLuckResult for sentiment cards
function convertToTeamLuck(team: TeamHealthHeat): TeamLuckResult {
  // goalDelta = goals - xG (positive = overperforming, negative = underperforming)
  const attackingLuck = team.goalDelta;
  // For defense, we use clean sheet luck (positive = unlucky, negative = lucky)
  const defensiveLuck = team.cleanSheetLuck;
  
  // Determine verdicts based on luck values
  const attackVerdict: TeamLuckResult['attackVerdict'] = 
    attackingLuck <= -1 ? 'TARGET_ATTACKERS' : 
    attackingLuck >= 1 ? 'AVOID_ATTACKERS' : 'NEUTRAL';
  
  const defenseVerdict: TeamLuckResult['defenseVerdict'] = 
    defensiveLuck >= 1 ? 'BUY_DEFENSE' : 
    defensiveLuck <= -1 ? 'AVOID_DEFENSE' : 'NEUTRAL';
  
  // Determine quadrant
  let quadrant: TeamLuckResult['quadrant'];
  if (attackVerdict === 'TARGET_ATTACKERS' && defenseVerdict === 'BUY_DEFENSE') {
    quadrant = 'DOUBLE_VALUE';
  } else if (defenseVerdict === 'BUY_DEFENSE') {
    quadrant = 'CLEAN_SHEET_CHASER';
  } else if (attackVerdict === 'TARGET_ATTACKERS') {
    quadrant = 'GOAL_CHASER';
  } else if (attackVerdict === 'AVOID_ATTACKERS' || defenseVerdict === 'AVOID_DEFENSE') {
    quadrant = 'AVOID';
  } else {
    quadrant = 'NEUTRAL';
  }

  // Get labels based on luck values
  const attackLabel = attackingLuck <= -3 ? 'EXPLOSIVE' : 
    attackingLuck <= -1 ? 'VALUE BUY' : 
    attackingLuck >= 3 ? 'COOLDOWN' : 
    attackingLuck >= 1 ? 'OVERHEATED' : 'STABLE';
  
  const defenseLabel = defensiveLuck >= 3 ? 'BUY DIP' : 
    defensiveLuck >= 1 ? 'UNDERVALUED' : 
    defensiveLuck <= -3 ? 'FRAGILE' : 
    defensiveLuck <= -1 ? 'RISKY' : 'STABLE';

  return {
    teamId: team.id,
    teamName: team.name,
    teamShort: team.shortName,
    logo: team.logo,
    
    attackingLuck,
    attackVerdict,
    attackLabel,
    attackDescription: attackingLuck <= -1 
      ? 'Underperforming xG. Attackers are due goals.'
      : attackingLuck >= 1 
      ? 'Overperforming xG. Regression likely.'
      : 'Performing as expected.',
    
    defensiveLuck,
    defenseVerdict,
    defenseLabel,
    defenseDescription: defensiveLuck >= 1
      ? 'Conceding cheap goals. Clean sheets due.'
      : defensiveLuck <= -1
      ? 'Keepers saving them. Goals coming.'
      : 'Defense performing as expected.',
    
    quadrant,
    
    goalsFor: team.totalGoals,
    goalsAgainst: Math.round(team.totalXGC),
    xGFor: team.totalXG,
    xGAgainst: team.totalXGC,
    matchesPlayed: 20,
  };
}

export default function TeamsPage() {
  const [filter, setFilter] = useState<QuadrantFilter>('ALL');
  const [teamsData, setTeamsData] = useState<TeamHealthHeat[]>([]);
  const [analyzedTeams, setAnalyzedTeams] = useState<TeamAnalysis[]>([]);
  const [gameweek, setGameweek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single data fetch at page level
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchFPLData();
        const teams = transformTeams(data);
        const analyzed = convertToTeamAnalysis(teams);
        
        setTeamsData(teams);
        setAnalyzedTeams(analyzed);
        setGameweek(getCurrentGameweek(data));
      } catch (err) {
        console.error('Failed to fetch FPL data:', err);
        setError('Failed to load data from FPL API');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Convert to TeamLuckResult for sentiment cards
  const teamsWithLuck: TeamLuckResult[] = teamsData.map(convertToTeamLuck);

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

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading Market Intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ========== PAGE HEADER ========== */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Market Intelligence
          </h1>
          <span className="px-3 py-1 bg-emerald-600/20 border border-emerald-600/40 text-emerald-400 text-sm font-medium rounded-full">
            GW{gameweek}
          </span>
        </div>
        <p className="text-slate-400">
          Actionable insights backed by granular performance data • Live from Official FPL API
        </p>
      </div>

      {/* ========== PREMIER LEAGUE TABLE ========== */}
      <div className="mb-10">
        <PremierLeagueTable />
      </div>

      {/* ========== SECTION A: MARKET SENTIMENT (THE DASHBOARD) ========== */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">
          Market Sentiment
        </h2>
        <p className="text-slate-400 text-sm">
          Immediate Buy/Sell signals based on xG variance analysis
        </p>
      </div>

      {/* Quadrant Filter */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6">
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
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
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

      {/* Sentiment Cards Grid - Mobile: stack vertically */}
      {filteredTeams.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center mb-8">
          <p className="text-slate-400">No teams match this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filteredTeams.map((team) => (
            <TeamSentimentCard key={team.teamId} team={team} />
          ))}
        </div>
      )}

      {/* Quick Summary Stats */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-12">
        <h3 className="text-sm font-semibold text-white mb-4">Sentiment Summary</h3>
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

      {/* ========== VISUAL DIVIDER ========== */}
      <div className="relative my-12">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-950 px-4 text-slate-500 text-sm flex items-center gap-2">
            <span className="text-lg">▼</span> Detailed Performance Data
          </span>
        </div>
      </div>

      {/* ========== SECTION B: THE MATRIX (THE EVIDENCE) ========== */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">
          Health vs. Heat Matrix
        </h2>
        <p className="text-slate-400 text-sm">
          Verify sentiment signals with raw performance numbers
        </p>
      </div>

      {/* Matrix Legend Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
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
              <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-mono text-[10px]">EXTREME VAL</span>
              <span className="text-slate-300">-6.0 or less</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Table - Horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[600px]">
          <TeamMatrix teams={analyzedTeams} />
        </div>
      </div>
    </div>
  );
}

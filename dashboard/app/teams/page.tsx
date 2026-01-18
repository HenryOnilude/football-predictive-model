'use client';

import { useEffect, useState } from 'react';
import TeamMatrix from '@/components/TeamMatrix';
import TeamSentimentCard from '@/components/TeamSentimentCard';
import { TeamAnalysis } from '@/lib/TeamAnalysis';
import { TeamLuckResult } from '@/lib/TeamLuck';
import { 
  fetchFPLData, 
  transformTeams, 
  convertToTeamAnalysis,
  getCurrentGameweek,
  TeamHealthHeat,
} from '@/lib/fpl';

// Convert TeamHealthHeat to TeamLuckResult for sentiment cards
function convertToTeamLuck(team: TeamHealthHeat): TeamLuckResult {
  const attackingLuck = team.goalDelta;
  const defensiveLuck = team.cleanSheetLuck;
  
  const attackVerdict: TeamLuckResult['attackVerdict'] = 
    attackingLuck <= -1 ? 'TARGET_ATTACKERS' : 
    attackingLuck >= 1 ? 'AVOID_ATTACKERS' : 'NEUTRAL';
  
  const defenseVerdict: TeamLuckResult['defenseVerdict'] = 
    defensiveLuck >= 1 ? 'BUY_DEFENSE' : 
    defensiveLuck <= -1 ? 'AVOID_DEFENSE' : 'NEUTRAL';
  
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
  const [analyzedTeams, setAnalyzedTeams] = useState<TeamAnalysis[]>([]);
  const [sentimentTeams, setSentimentTeams] = useState<TeamLuckResult[]>([]);
  const [gameweek, setGameweek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single data fetch at page level - shared by both components
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const fplData = await fetchFPLData();
        const teams = transformTeams(fplData);
        
        // Convert to both formats from single data source
        const analyzed = convertToTeamAnalysis(teams);
        const sentiment = teams.map(convertToTeamLuck);
        
        setAnalyzedTeams(analyzed);
        setSentimentTeams(sentiment);
        setGameweek(getCurrentGameweek(fplData));
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
          Live Premier League standings with actionable Buy/Sell signals • Official FPL API
        </p>
      </div>

      {/* ========== SECTION A: MARKET SENTIMENT (THE DASHBOARD) ========== */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
          📊 Market Sentiment Dashboard
        </h2>
        <p className="text-slate-400 text-sm">
          Actionable Buy/Sell signals based on xG variance • Click a card for details
        </p>
      </div>

      {/* Sentiment Cards Grid - Responsive: Stack on mobile, 2 cols on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {sentimentTeams
          .filter(t => t.quadrant !== 'NEUTRAL')
          .slice(0, 6)
          .map((team) => (
            <TeamSentimentCard key={team.teamId} team={team} />
          ))}
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
        <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
          🔬 Health vs. Heat Matrix
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
              <span className="text-slate-300">75+: Elite structure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-300">45-75: Average structure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">&lt;45: Broken structure</span>
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

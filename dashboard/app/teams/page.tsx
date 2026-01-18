'use client';

import { useEffect, useState } from 'react';
import TeamMatrix from '@/components/TeamMatrix';
import MarketIntelligenceTable from '@/components/MarketIntelligenceTable';
import { TeamLuckResult } from '@/lib/TeamLuck';
import { TeamAnalysis } from '@/lib/TeamAnalysis';
import { 
  fetchFPLData, 
  transformTeams, 
  convertToTeamAnalysis,
  getCurrentGameweek,
  TeamHealthHeat,
} from '@/lib/fpl';


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

interface StandingTeam {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface StandingWithSentiment extends StandingTeam {
  sentiment: TeamLuckResult | null;
}

export default function TeamsPage() {
  const [analyzedTeams, setAnalyzedTeams] = useState<TeamAnalysis[]>([]);
  const [standings, setStandings] = useState<StandingWithSentiment[]>([]);
  const [gameweek, setGameweek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single data fetch at page level - fetch both FPL data and standings
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Fetch FPL data and standings in parallel
        const [fplData, standingsRes] = await Promise.all([
          fetchFPLData(),
          fetch('/api/standings').then(r => r.json())
        ]);
        
        const teams = transformTeams(fplData);
        const analyzed = convertToTeamAnalysis(teams);
        const teamsWithLuck = teams.map(convertToTeamLuck);
        
        // Get standings table
        const standingsTable: StandingTeam[] = standingsRes.standings?.[0]?.table || [];
        
        // Merge standings with sentiment data
        const mergedStandings: StandingWithSentiment[] = standingsTable.map(standing => {
          // Find matching sentiment by team name (fuzzy match)
          const sentiment = teamsWithLuck.find(t => 
            t.teamName.toLowerCase().includes(standing.team.shortName.toLowerCase()) ||
            standing.team.name.toLowerCase().includes(t.teamName.toLowerCase()) ||
            standing.team.shortName.toLowerCase() === t.teamShort.toLowerCase()
          ) || null;
          
          return { ...standing, sentiment };
        });
        
        setAnalyzedTeams(analyzed);
        setStandings(mergedStandings);
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

      {/* ========== UNIFIED TABLE: STANDINGS + SENTIMENT ========== */}
      <div className="mb-10">
        <MarketIntelligenceTable standings={standings} />
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

'use client';

import { useEffect, useState } from 'react';
import MarketIntelligenceTable from '@/components/MarketIntelligenceTable';
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

interface StandingTeam {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  points: number;
}

interface HybridTeamData extends StandingTeam {
  analysis: TeamAnalysis | null;
}

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
  const [hybridStandings, setHybridStandings] = useState<HybridTeamData[]>([]);
  const [sentimentTeams, setSentimentTeams] = useState<TeamLuckResult[]>([]);
  const [gameweek, setGameweek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate summary stats for mini-ticker
  const summaryStats = {
    highRisk: hybridStandings.filter(t => t.analysis && t.analysis.sustainabilityScore < 45).length,
    undervalued: sentimentTeams.filter(t => t.quadrant === 'GOAL_CHASER' || t.quadrant === 'DOUBLE_VALUE').length,
    opportunities: sentimentTeams.filter(t => t.quadrant !== 'NEUTRAL' && t.quadrant !== 'AVOID').length,
  };

  // Single data fetch at page level - shared by both components
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
        const sentiment = teams.map(convertToTeamLuck);
        
        // Get standings table and merge with analysis
        // Name mapping for teams with different names in FPL vs football-data.org
        const nameMap: Record<string, string[]> = {
          'Man Utd': ['Manchester United', 'Man United', 'Manchester Utd'],
          'Spurs': ['Tottenham', 'Tottenham Hotspur'],
          'Man City': ['Manchester City'],
          'Nott\'m Forest': ['Nottingham Forest', 'Nottingham'],
          'Newcastle': ['Newcastle United'],
          'West Ham': ['West Ham United'],
          'Wolves': ['Wolverhampton', 'Wolverhampton Wanderers'],
          'Brighton': ['Brighton & Hove Albion', 'Brighton and Hove Albion'],
          'Leicester': ['Leicester City'],
        };
        
        const standingsTable = standingsRes.standings?.[0]?.table || [];
        const merged: HybridTeamData[] = standingsTable.map((s: StandingTeam) => {
          const standingName = s.team.name.toLowerCase();
          const standingShort = s.team.shortName.toLowerCase();
          
          const analysis = analyzed.find(a => {
            const analysisName = a.teamName.toLowerCase();
            
            // Direct match
            if (analysisName.includes(standingShort) || standingName.includes(analysisName)) {
              return true;
            }
            
            // Check name mapping
            for (const [fplName, altNames] of Object.entries(nameMap)) {
              if (analysisName.includes(fplName.toLowerCase())) {
                if (altNames.some(alt => standingName.includes(alt.toLowerCase()))) {
                  return true;
                }
              }
            }
            
            return false;
          }) || null;
          
          return { position: s.position, team: s.team, points: s.points, analysis };
        });
        
        setHybridStandings(merged);
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

      {/* ========== MINI-TICKER (Summary Stats) ========== */}
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-slate-400">High Risk:</span>
          <span className="text-rose-400 font-semibold">{summaryStats.highRisk}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-400">Undervalued:</span>
          <span className="text-emerald-400 font-semibold">{summaryStats.undervalued}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-slate-400">Opportunities:</span>
          <span className="text-purple-400 font-semibold">{summaryStats.opportunities}</span>
        </div>
      </div>

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
          Market Sentiment Dashboard
        </h2>
        <p className="text-slate-400 text-sm">
          Actionable Buy/Sell signals based on xG variance • Click a card for details
        </p>
      </div>

      {/* ========== CARD LEGEND (Always Visible) ========== */}
      <div className="mb-6 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quadrant Badges */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Team Categories</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-semibold whitespace-nowrap">DOUBLE VALUE</span>
                <span className="text-slate-400">Team is unlucky in attack AND defense. Their players should score more goals AND keep more clean sheets soon.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-semibold whitespace-nowrap">CS CHASER</span>
                <span className="text-slate-400">Defense is conceding cheap goals they shouldn&apos;t be. Buy their defenders/goalkeeper — clean sheets are coming.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-semibold whitespace-nowrap">GOAL CHASER</span>
                <span className="text-slate-400">Attackers are missing chances they should score. Buy their forwards/midfielders — goals are coming.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-400 font-semibold whitespace-nowrap">AVOID</span>
                <span className="text-slate-400">Team is overperforming their stats. Their luck will run out — expect fewer goals or more goals conceded soon.</span>
              </div>
            </div>
          </div>
          
          {/* Action Labels */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Card Signals</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-semibold whitespace-nowrap">BUY DIP</span>
                <span className="text-slate-400">Defense underperforming. Great time to buy their defenders.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-semibold whitespace-nowrap">EXPLOSIVE</span>
                <span className="text-slate-400">Attack severely underperforming. Goals coming — buy attackers now.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-semibold whitespace-nowrap">COOLDOWN</span>
                <span className="text-slate-400">Attack overperforming luck. Consider selling before regression.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-600 text-white font-semibold whitespace-nowrap">STABLE</span>
                <span className="text-slate-400">Performing as expected. No major moves needed — hold position.</span>
              </div>
            </div>
          </div>
        </div>
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

      {/* ========== SECTION B: HYBRID INTELLIGENCE TABLE ========== */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[700px]">
          <MarketIntelligenceTable standings={hybridStandings} />
        </div>
      </div>
    </div>
  );
}

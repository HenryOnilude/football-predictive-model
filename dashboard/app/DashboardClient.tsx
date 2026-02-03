'use client';

import { useEffect, useState } from 'react';
import LeagueTable from '@/components/LeagueTable';
import MarketMoversRow from '@/components/MarketMoversRow';
import DeepDiveLinks from '@/components/DeepDiveLinks';
import { DashboardData, TeamData } from '@/lib/types';
import { fetchFPLData, transformTeams, getCurrentGameweek, TeamHealthHeat } from '@/lib/fpl';

interface StandingsTeam {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
  };
  points: number;
  playedGames: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface StandingsResponse {
  standings: Array<{
    table: StandingsTeam[];
  }>;
}

// Explicit mapping from FPL team names to standings team shortNames
const FPL_TO_STANDINGS_MAP: Record<string, string> = {
  'Man Utd': 'man united',
  'Spurs': 'tottenham',
  'Nott\'m Forest': 'nott\'m forest',
  'Wolves': 'wolves',
  'Man City': 'man city',
  'Arsenal': 'arsenal',
  'Liverpool': 'liverpool',
  'Chelsea': 'chelsea',
  'Newcastle': 'newcastle',
  'Brighton': 'brighton',
  'Aston Villa': 'aston villa',
  'Fulham': 'fulham',
  'Brentford': 'brentford',
  'Crystal Palace': 'crystal palace',
  'West Ham': 'west ham',
  'Bournemouth': 'bournemouth',
  'Everton': 'everton',
  'Leicester': 'leicester',
  'Ipswich': 'ipswich',
  'Southampton': 'southampton',
};

function normalizeTeamName(name: string): string {
  if (FPL_TO_STANDINGS_MAP[name]) {
    name = FPL_TO_STANDINGS_MAP[name];
  }
  return name
    .toLowerCase()
    .replace(/\s*(fc|afc)\s*/gi, '')
    .replace(/[''"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [rawTeams, setRawTeams] = useState<TeamHealthHeat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentGameweek, setCurrentGameweek] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch FPL data (with client-side fallback) and standings in parallel
        const [fplData, standingsRes] = await Promise.all([
          fetchFPLData(),
          fetch('/api/standings').then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        const teams = transformTeams(fplData);
        const gameweek = getCurrentGameweek(fplData);
        setCurrentGameweek(gameweek);
        setRawTeams(teams);

        const standingsTable: StandingsTeam[] = (standingsRes as StandingsResponse)?.standings?.[0]?.table || [];
        
        // Create lookup map for standings by normalized team name
        const standingsMap = new Map<string, StandingsTeam>();
        standingsTable.forEach(team => {
          standingsMap.set(normalizeTeamName(team.team.name), team);
          standingsMap.set(normalizeTeamName(team.team.shortName), team);
        });

        // Map teams to dashboard format
        const mappedTeams: TeamData[] = teams
          .map((team) => {
            const variance = Number(team.goalDelta.toFixed(1));
            const riskScore = Math.round(Math.min(100, Math.abs(variance) * 15));
            
            const standingsData = standingsMap.get(normalizeTeamName(team.name)) ||
                                  standingsMap.get(normalizeTeamName(team.shortName));
            
            if (!standingsData) return null;
            
            const actualPoints = standingsData.points;
            const matches = standingsData.playedGames;
            const goalsFor = standingsData.goalsFor;
            const goalsAgainst = standingsData.goalsAgainst;
            const position = standingsData.position;
            
            const xgDiff = team.totalXG - (team.totalXG * 0.9);
            const xPTS = Math.round(matches * 1.3 + xgDiff * 2);
            
            return {
              Team: standingsData.team.shortName,
              Matches: matches,
              Actual_Points: actualPoints,
              Goals_For: goalsFor,
              Goals_Against: goalsAgainst,
              xG_For: team.totalXG,
              xG_Against: team.totalXG * 0.9,
              xPTS: xPTS,
              Variance: Number((actualPoints - xPTS).toFixed(1)),
              Position_Actual: position,
              Position_Expected: position,
              Z_Score: Number((variance / 2).toFixed(2)),
              P_Value: 0.05,
              Significant: Math.abs(actualPoints - xPTS) > 5,
              Risk_Score: riskScore,
              Risk_Category: riskScore >= 90 ? 'Critical' : riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Moderate' : 'Low',
              Regression_Probability: Number(Math.min(0.95, Math.abs(variance) * 0.1).toFixed(2)),
              Performance_Status: (actualPoints - xPTS) > 5 ? 'Overperforming' : (actualPoints - xPTS) < -5 ? 'Underperforming' : 'As Expected',
            };
          })
          .filter((team): team is TeamData => team !== null);

        mappedTeams.sort((a, b) => a.Position_Actual - b.Position_Actual);

        setData({
          teams: mappedTeams,
          lastUpdated: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Dashboard load error:', e);
        setError(e instanceof Error ? e.message : 'Failed to load FPL data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading Performance Analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Error Loading Live Data</h2>
          <p className="text-rose-300">{error || 'Unable to fetch data from the FPL API.'}</p>
          <p className="mt-4 text-sm text-slate-400">
            The Fantasy Premier League API may be temporarily unavailable. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const overperformingCount = data.teams.filter(t => t.Variance > 3).length;
  const underperformingCount = data.teams.filter(t => t.Variance < -3).length;
  const highRiskCount = data.teams.filter(t => t.Risk_Score >= 70).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-semibold text-white mb-3 tracking-tight">
              Performance Analysis
            </h2>
            <p className="text-slate-400 text-lg">
              Identifying regression risk using Expected Goals (xG) data
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Gameweek {currentGameweek}</p>
              <p className="text-sm font-medium text-emerald-400">
                Live Data · {new Date(data.lastUpdated).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="card p-6 hover:border-slate-600 transition-colors">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Total Teams</div>
          <div className="text-4xl font-semibold text-white">{data.teams.length}</div>
        </div>
        <div className="card p-6 bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50 transition-colors">
          <div className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-2">High Risk</div>
          <div className="text-4xl font-semibold text-rose-400">{highRiskCount}</div>
          <div className="text-xs text-rose-400/70 mt-2">Risk Score ≥ 70</div>
        </div>
        <div className="card p-6 bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50 transition-colors">
          <div className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">Overperforming</div>
          <div className="text-4xl font-semibold text-orange-400">{overperformingCount}</div>
          <div className="text-xs text-orange-400/70 mt-2">Variance &gt; +3</div>
        </div>
        <div className="card p-6 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Underperforming</div>
          <div className="text-4xl font-semibold text-emerald-400">{underperformingCount}</div>
          <div className="text-xs text-emerald-400/70 mt-2">Variance &lt; -3</div>
        </div>
      </div>

      {/* Market Movers */}
      <MarketMoversRow teams={rawTeams} />

      {/* Main Table */}
      <LeagueTable teams={data.teams} />

      {/* Deep Dive Links */}
      <DeepDiveLinks />
    </div>
  );
}

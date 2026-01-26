'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchFPLData, FPLElement, FPLTeam, getCurrentGameweek } from '@/lib/fpl';
import { PlayerLuckData, TEAM_SHORT_NAMES, FixtureData } from '@/lib/fplTypes';
import DeltaDeckClient from './DeltaDeckClient';

function calculateLuckScore(actualGoals: number, xG: number): number {
  return Number((actualGoals - xG).toFixed(2));
}

function getVerdict(luckScore: number): { verdict: 'BUY' | 'TRAP' | 'HOLD'; label: string } {
  if (luckScore <= -1.5) {
    return { verdict: 'BUY', label: 'DUE A HAUL' };
  } else if (luckScore <= -0.5) {
    return { verdict: 'BUY', label: 'UNDERVALUED' };
  } else if (luckScore >= 1.5) {
    return { verdict: 'TRAP', label: 'REGRESSION RISK' };
  } else if (luckScore >= 0.5) {
    return { verdict: 'TRAP', label: 'SELL HIGH' };
  }
  return { verdict: 'HOLD', label: 'FAIR VALUE' };
}

function calculateMetrics(luckScore: number) {
  const absLuckScore = Math.abs(luckScore);
  const differentialValue = Math.min(100, absLuckScore * 25);
  const haulPotential = luckScore < 0 
    ? Math.min(100, 50 + absLuckScore * 20)
    : Math.max(0, 50 - absLuckScore * 20);
  const trapIndicator = luckScore > 0
    ? Math.min(100, 50 + absLuckScore * 20)
    : Math.max(0, 50 - absLuckScore * 20);

  return {
    differentialValue: Number(differentialValue.toFixed(1)),
    haulPotential: Number(haulPotential.toFixed(1)),
    trapIndicator: Number(trapIndicator.toFixed(1)),
  };
}

function generateMockFixtures(): FixtureData[] {
  const opponents = ['Liverpool', 'Chelsea', 'Arsenal', 'Manchester City', 'Tottenham'];
  const shuffled = opponents.sort(() => Math.random() - 0.5).slice(0, 3);
  
  return shuffled.map((opponent, idx) => ({
    opponent,
    opponentShort: TEAM_SHORT_NAMES[opponent] || opponent.slice(0, 3).toUpperCase(),
    fdr: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
    isHome: idx % 2 === 0,
  }));
}

const positionMap: Record<number, string> = {
  1: 'Goalkeeper',
  2: 'Defender', 
  3: 'Midfielder',
  4: 'Attacker',
};

export default function AlphaClientWrapper() {
  const [players, setPlayers] = useState<PlayerLuckData[]>([]);
  const [gameweek, setGameweek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchFPLData();
      const gw = getCurrentGameweek(data);
      setGameweek(gw);
      
      const teamMap = new Map<number, FPLTeam>(data.teams.map(t => [t.id, t]));
      
      const relevantPlayers = data.elements
        .filter((el: FPLElement) => {
          if (el.status === 'u' || el.status === 'd') return false;
          const xG = parseFloat(el.expected_goals) || 0;
          return el.goals_scored > 0 || xG > 1.0;
        })
        .sort((a: FPLElement, b: FPLElement) => b.goals_scored - a.goals_scored)
        .slice(0, 30);
      
      const luckData: PlayerLuckData[] = relevantPlayers.map((el: FPLElement) => {
        const team = teamMap.get(el.team);
        const teamName = team?.name || 'Unknown';
        const xG = parseFloat(el.expected_goals) || 0;
        const actualGoals = el.goals_scored;
        const luckScore = calculateLuckScore(actualGoals, xG);
        const { verdict, label } = getVerdict(luckScore);
        const metrics = calculateMetrics(luckScore);
        
        return {
          id: el.id,
          code: el.code,
          name: el.web_name,
          team: teamName,
          teamShort: team?.short_name || teamName.slice(0, 3).toUpperCase(),
          position: positionMap[el.element_type] || 'Attacker',
          photo: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${el.code}.png`,
          price: el.now_cost / 10,
          actualGoals,
          xG: Number(xG.toFixed(2)),
          luckScore,
          verdict,
          verdictLabel: label,
          differentialValue: metrics.differentialValue,
          haulPotential: metrics.haulPotential,
          trapIndicator: metrics.trapIndicator,
          fixtures: generateMockFixtures(),
          gameweek: gw,
        };
      });
      
      setPlayers(luckData);
    } catch (err) {
      console.error('Failed to load Alpha data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400">Loading Alpha signals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center space-y-4">
          <p className="text-rose-400 font-medium">Failed to load data</p>
          <p className="text-sm text-slate-400">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DeltaDeckClient 
      players={players}
      gameweek={gameweek}
      lastUpdated={new Date().toISOString()}
      cached={false}
    />
  );
}

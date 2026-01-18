'use client';

import { useEffect, useState } from 'react';
import TeamMatrix from '@/components/TeamMatrix';
import { TeamAnalysis } from '@/lib/TeamAnalysis';
import { 
  fetchFPLData, 
  transformTeams, 
  convertToTeamAnalysis,
  getCurrentGameweek,
} from '@/lib/fpl';

export default function MatrixPage() {
  const [analyzedTeams, setAnalyzedTeams] = useState<TeamAnalysis[]>([]);
  const [gameweek, setGameweek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchFPLData();
        const teams = transformTeams(data);
        const analyzed = convertToTeamAnalysis(teams);
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

  // Count verdicts for summary
  const verdictCounts = {
    DOMINANT: analyzedTeams.filter(t => t.marketVerdict === 'DOMINANT').length,
    PRIME_BUY: analyzedTeams.filter(t => t.marketVerdict === 'PRIME_BUY').length,
    STABLE: analyzedTeams.filter(t => t.marketVerdict === 'STABLE').length,
    FRAGILE: analyzedTeams.filter(t => t.marketVerdict === 'FRAGILE').length,
    OVERHEATED: analyzedTeams.filter(t => t.marketVerdict === 'OVERHEATED').length,
    CRITICAL: analyzedTeams.filter(t => t.marketVerdict === 'CRITICAL').length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading FPL data...</p>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Health vs. Heat Matrix
          </h1>
          <span className="px-3 py-1 bg-emerald-600/20 border border-emerald-600/40 text-emerald-400 text-sm font-medium rounded-full">
            GW{gameweek}
          </span>
        </div>
        <p className="text-slate-400">
          5-tier efficiency gradient analysis • Live data from Official FPL API
        </p>
      </div>

      {/* Legend Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Structure (Health)</h3>
          <p className="text-xs text-slate-400 mb-3">
            <strong className="text-slate-300">What it measures:</strong> How good is this team at creating chances AND preventing them? 
            We calculate xG created minus xG conceded per game. Higher score = better overall quality.
          </p>
          <p className="text-xs text-slate-400 mb-3">
            <strong className="text-slate-300">Why it matters:</strong> Teams with high Structure scores are fundamentally good — their results are sustainable long-term.
          </p>
          <div className="space-y-1.5 text-xs border-t border-slate-700 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300"><strong>70-100:</strong> Elite — title contenders, trust their players</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-300"><strong>40-70:</strong> Average — mid-table, selective picks only</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300"><strong>0-40:</strong> Broken — relegation candidates, avoid</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Form (Heat)</h3>
          <p className="text-xs text-slate-400 mb-3">
            <strong className="text-slate-300">What it measures:</strong> Are they scoring more or less than expected? 
            We subtract xG from actual goals. Positive = overperforming, Negative = underperforming.
          </p>
          <p className="text-xs text-slate-400 mb-3">
            <strong className="text-slate-300">Why it matters:</strong> Hot teams will cool down, cold teams will heat up. This predicts short-term regression.
          </p>
          <div className="space-y-1.5 text-xs border-t border-slate-700 pt-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px]">CRIT OVER</span>
              <span className="text-slate-300">+6 goals above xG — unsustainable, will drop</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-500 text-white font-mono text-[10px]">HEATING UP</span>
              <span className="text-slate-300">+2 to +6 above — running hot, caution</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-mono text-[10px]">FAIR VALUE</span>
              <span className="text-slate-300">-2 to +2 — scoring as expected, stable</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-300 text-blue-900 font-mono text-[10px]">COLD</span>
              <span className="text-slate-300">-2 to -6 below — unlucky, goals coming</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-mono text-[10px]">EXTREME VAL</span>
              <span className="text-slate-300">-6+ below — severely unlucky, BUY NOW</span>
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
            <p className="text-xs text-purple-400/80 font-medium">PRIME BUY</p>
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
            <p className="text-xs text-amber-400/80 font-medium">OVERHEATED</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-900/20 border border-red-800">
            <div className="text-xl font-bold text-red-400">{verdictCounts.CRITICAL}</div>
            <p className="text-xs text-red-400/80 font-medium">CRITICAL</p>
          </div>
        </div>
      </div>

      {/* Sort Options Explanation */}
      <div className="mb-4 p-3 bg-slate-900/30 border border-slate-800 rounded-lg">
        <div className="flex flex-wrap items-start gap-4 text-xs">
          <span className="text-slate-500 font-medium pt-1">Sort by:</span>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-emerald-600 text-white font-semibold">Structure</span>
              <span className="text-slate-400">Ranks teams by their underlying quality (best xG structure first)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-slate-700 text-slate-300 font-semibold">Form</span>
              <span className="text-slate-400">Ranks by current finishing heat (most overperforming first)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-slate-700 text-slate-300 font-semibold">Verdict</span>
              <span className="text-slate-400">Groups teams by action recommendation (DOMINANT → CRITICAL)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <TeamMatrix teams={analyzedTeams} />
    </div>
  );
}

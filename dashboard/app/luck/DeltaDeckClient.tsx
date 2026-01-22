'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, TrendingDown, Scale, Filter } from 'lucide-react';
import { PlayerLuckData } from '@/lib/fplTypes';
import AlphaMobileGrid from '@/components/alpha/AlphaMobileGrid';

// Lazy load desktop table - only loads on lg+ screens
const AlphaDesktopTable = dynamic(
  () => import('@/components/alpha/AlphaDesktopTable'),
  { 
    ssr: false,
    loading: () => (
      <div className="py-6 text-center text-slate-500">
        Loading terminal view...
      </div>
    )
  }
);

interface DeltaDeckClientProps {
  players: PlayerLuckData[];
  gameweek: number;
  lastUpdated: string;
  cached: boolean;
}

type PositionFilter = 'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD';

const POSITION_MAP: Record<string, PositionFilter> = {
  'Goalkeeper': 'GK',
  'Defender': 'DEF',
  'Midfielder': 'MID',
  'Attacker': 'FWD',
};

export default function DeltaDeckClient({ players, gameweek, lastUpdated, cached }: DeltaDeckClientProps) {
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('ALL');

  // Filter players based on position
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      if (positionFilter !== 'ALL') {
        const playerPos = POSITION_MAP[player.position] || 'FWD';
        if (playerPos !== positionFilter) return false;
      }
      return true;
    });
  }, [players, positionFilter]);

  // Group by signal type
  const alphaBuys = filteredPlayers.filter(p => p.luckScore < -3.0);
  const regressionRisks = filteredPlayers.filter(p => p.luckScore > 3.0);
  const fairValues = filteredPlayers.filter(p => p.luckScore >= -3.0 && p.luckScore <= 3.0);

  // Stats
  const totalAlpha = players.filter(p => p.luckScore < -3.0).length;
  const totalRisk = players.filter(p => p.luckScore > 3.0).length;
  const totalFair = players.filter(p => p.luckScore >= -3.0 && p.luckScore <= 3.0).length;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                <span className="text-base">Δ</span>
                <span className="text-xs font-semibold text-emerald-400">GW {gameweek}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Alpha Signals
              </h1>
              <p className="text-sm text-slate-400 hidden md:block">
                Market Inefficiencies & Performance Variance
              </p>
            </div>

            {/* Quick Stats - Inline on mobile */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="text-center p-2 md:p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">{totalAlpha}</span>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Buy</p>
              </div>
              <div className="text-center p-2 md:p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                <div className="flex items-center justify-center gap-1">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span className="text-xl font-bold font-mono tabular-nums text-rose-400">{totalRisk}</span>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sell</p>
              </div>
              <div className="text-center p-2 md:p-3 rounded-lg bg-slate-500/10 border border-slate-500/30">
                <div className="flex items-center justify-center gap-1">
                  <Scale className="w-4 h-4 text-slate-400" />
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-400">{totalFair}</span>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Hold</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-16 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            {/* Position Filter */}
            <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800" role="group" aria-label="Filter by position">
              {(['ALL', 'GK', 'DEF', 'MID', 'FWD'] as PositionFilter[]).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  aria-label={`Filter by ${pos === 'ALL' ? 'all positions' : pos === 'GK' ? 'Goalkeepers' : pos === 'DEF' ? 'Defenders' : pos === 'MID' ? 'Midfielders' : 'Forwards'}`}
                  aria-pressed={positionFilter === pos}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    positionFilter === pos
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            {/* Results count */}
            <div className="ml-auto text-xs text-slate-500">
              Showing {filteredPlayers.length} of {players.length} assets
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive View Splitting */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile View: High-density Futbin-style cards (< 1024px) */}
        <div className="block lg:hidden">
          <AlphaMobileGrid
            alphaBuys={alphaBuys}
            regressionRisks={regressionRisks}
            fairValues={fairValues}
            filteredCount={filteredPlayers.length}
            onResetFilters={() => setPositionFilter('ALL')}
          />
        </div>

        {/* Desktop View: Professional terminal table (>= 1024px) */}
        <div className="hidden lg:block">
          <AlphaDesktopTable
            players={filteredPlayers}
            filteredCount={filteredPlayers.length}
            onResetFilters={() => setPositionFilter('ALL')}
          />
        </div>

        {/* Signal Legend - Collapsible on mobile */}
        <details className="mt-8 md:mt-12 rounded-xl bg-slate-900/50 border border-slate-800 overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-white hover:bg-slate-800/50 transition-colors">
            Signal Definitions
          </summary>
          <div className="p-4 pt-0 grid md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h4 className="font-semibold text-emerald-400">Alpha Buy</h4>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Delta &lt; -3.0 — Underperforming xG. Buy before regression.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h4 className="font-semibold text-rose-400">Regression Risk</h4>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Delta &gt; +3.0 — Overperforming xG. Sell before correction.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-slate-400" />
                <h4 className="font-semibold text-slate-400">Fair Value</h4>
              </div>
              <p className="text-slate-400 leading-relaxed">
                -3.0 ≤ Delta ≤ +3.0 — Performing as expected. Hold.
              </p>
            </div>
          </div>
        </details>

        {/* Cache Status */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600">
            {cached ? 'Cached data' : 'Fresh data'} • 
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import LuckCard from '@/components/LuckCard';
import { TrendingUp, TrendingDown, Scale, Filter } from 'lucide-react';
import { PlayerLuckData } from '@/lib/fplTypes';

interface DeltaDeckClientProps {
  players: PlayerLuckData[];
  gameweek: number;
  lastUpdated: string;
  cached: boolean;
}

// Market Class helper
function getMarketClass(price: number): 'Premium' | 'Mid-Range' | 'Budget' {
  if (price >= 10) return 'Premium';
  if (price >= 6) return 'Mid-Range';
  return 'Budget';
}

type PositionFilter = 'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD';
type MarketClassFilter = 'ALL' | 'Premium' | 'Mid-Range' | 'Budget';

const POSITION_MAP: Record<string, PositionFilter> = {
  'Goalkeeper': 'GK',
  'Defender': 'DEF',
  'Midfielder': 'MID',
  'Attacker': 'FWD',
};

export default function DeltaDeckClient({ players, gameweek, lastUpdated, cached }: DeltaDeckClientProps) {
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('ALL');
  const [marketClassFilter, setMarketClassFilter] = useState<MarketClassFilter>('ALL');

  // Filter players based on selected filters
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      // Position filter
      if (positionFilter !== 'ALL') {
        const playerPos = POSITION_MAP[player.position] || 'FWD';
        if (playerPos !== positionFilter) return false;
      }
      
      // Market class filter
      if (marketClassFilter !== 'ALL') {
        const playerClass = getMarketClass(player.price);
        if (playerClass !== marketClassFilter) return false;
      }
      
      return true;
    });
  }, [players, positionFilter, marketClassFilter]);

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
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <span className="text-xl">Δ</span>
              <span className="text-sm font-semibold text-emerald-400">
                GW {gameweek}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              The Delta Deck
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Market Inefficiencies & Performance Variance
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-8">
            <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-lg">📈</span>
                <span className="text-2xl font-bold text-emerald-400">{totalAlpha}</span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Alpha Buys</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-lg">📉</span>
                <span className="text-2xl font-bold text-rose-400">{totalRisk}</span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Regression Risk</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-500/10 border border-slate-500/30">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-lg">⚖️</span>
                <span className="text-2xl font-bold text-slate-400">{totalFair}</span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Fair Value</p>
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
            <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
              {(['ALL', 'GK', 'DEF', 'MID', 'FWD'] as PositionFilter[]).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
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

            {/* Market Class Filter */}
            <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
              {(['ALL', 'Premium', 'Mid-Range', 'Budget'] as MarketClassFilter[]).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setMarketClassFilter(cls)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    marketClassFilter === cls
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cls === 'Premium' ? '>£10m' : cls === 'Budget' ? '<£6m' : cls === 'Mid-Range' ? '£6-10m' : cls}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Alpha Buys Section */}
        {alphaBuys.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>📈</span> Alpha Buys
                </h2>
                <p className="text-sm text-slate-500">
                  Delta &lt; -3.0 — Buy low before regression upward
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {alphaBuys.map((player) => (
                <LuckCard key={player.id} player={player} />
              ))}
            </div>
          </section>
        )}

        {/* Regression Risk Section */}
        {regressionRisks.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>📉</span> Regression Risk
                </h2>
                <p className="text-sm text-slate-500">
                  Delta &gt; +3.0 — Sell high before correction
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {regressionRisks.map((player) => (
                <LuckCard key={player.id} player={player} />
              ))}
            </div>
          </section>
        )}

        {/* Fair Value Section */}
        {fairValues.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
                <Scale className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>⚖️</span> Fair Value
                </h2>
                <p className="text-sm text-slate-500">
                  -3.0 ≤ Delta ≤ +3.0 — Performing as expected
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {fairValues.map((player) => (
                <LuckCard key={player.id} player={player} />
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">No players match your current filters.</p>
            <button
              onClick={() => {
                setPositionFilter('ALL');
                setMarketClassFilter('ALL');
              }}
              className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Signal Legend */}
        <section className="mt-16 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">Signal Definitions</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📈</span>
                <h4 className="font-semibold text-emerald-400">Alpha Buy</h4>
              </div>
              <p className="text-slate-400">
                Delta &lt; -3.0 — Player is significantly underperforming xG. 
                Statistical regression predicts returns will increase. Buy before the market corrects.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📉</span>
                <h4 className="font-semibold text-rose-400">Regression Risk</h4>
              </div>
              <p className="text-slate-400">
                Delta &gt; +3.0 — Player is significantly overperforming xG.
                Unsustainable output. Sell high before the inevitable correction.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚖️</span>
                <h4 className="font-semibold text-slate-400">Fair Value</h4>
              </div>
              <p className="text-slate-400">
                -3.0 ≤ Delta ≤ +3.0 — Player is performing in line with expected metrics.
                No statistical edge. Hold or evaluate based on fixtures.
              </p>
            </div>
          </div>
        </section>

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

'use client';

import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import CompactPlayerCard from '@/components/CompactPlayerCard';
import { PlayerLuckData } from '@/lib/fplTypes';

interface AlphaMobileGridProps {
  alphaBuys: PlayerLuckData[];
  regressionRisks: PlayerLuckData[];
  fairValues: PlayerLuckData[];
  filteredCount: number;
  onResetFiltersAction: () => void;
}

/**
 * Mobile-optimized high-density Futbin-style card grid
 * Renders on screens < 1024px (lg breakpoint)
 */
export default function AlphaMobileGrid({
  alphaBuys,
  regressionRisks,
  fairValues,
  filteredCount,
  onResetFiltersAction,
}: AlphaMobileGridProps) {
  return (
    <div className="py-4">
      {/* Alpha Buys Section */}
      {alphaBuys.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Alpha Buys
              </h2>
              <p className="text-xs text-slate-500">
                Delta &lt; -3.0 — Buy low
              </p>
            </div>
            <span className="ml-auto text-xs text-slate-600 font-mono">{alphaBuys.length}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {alphaBuys.map((player) => (
              <CompactPlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>
      )}

      {/* Regression Risk Section */}
      {regressionRisks.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Regression Risk
              </h2>
              <p className="text-xs text-slate-500">
                Delta &gt; +3.0 — Sell high
              </p>
            </div>
            <span className="ml-auto text-xs text-slate-600 font-mono">{regressionRisks.length}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {regressionRisks.map((player) => (
              <CompactPlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>
      )}

      {/* Fair Value Section */}
      {fairValues.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-500/20 flex items-center justify-center">
              <Scale className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Fair Value
              </h2>
              <p className="text-xs text-slate-500">
                -3.0 ≤ Delta ≤ +3.0
              </p>
            </div>
            <span className="ml-auto text-xs text-slate-600 font-mono">{fairValues.length}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {fairValues.map((player) => (
              <CompactPlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {filteredCount === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400">No players match your current filters.</p>
          <button
            onClick={onResetFiltersAction}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

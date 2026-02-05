'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronRight, X, RotateCcw } from 'lucide-react';
import { PlayerLuckData, FDR_COLORS } from '@/lib/fplTypes';
import PlayerImage from '@/components/PlayerImage';

interface CompactPlayerCardProps {
  player: PlayerLuckData;
}

/**
 * Compact Player Card - Futbin/Bloomberg-inspired high-density design
 * Mobile: Compact card with modal
 * Desktop: Larger flippable card with details on back
 */
export default function CompactPlayerCard({ player }: CompactPlayerCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const isAlpha = player.luckScore < 0;
  const signalLabel = isAlpha ? 'BUY' : 'SELL';

  // Mobile: Show modal, Desktop: Flip card
  const handleClick = () => {
    if (window.innerWidth < 768) {
      setShowDetail(true);
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <>
      {/* Flip Card Container - Larger on desktop */}
      <div
        className="relative w-full h-40 md:h-64 cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 ease-in-out`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front Side */}
          <button
            onClick={handleClick}
            className="absolute inset-0 w-full h-full p-3 md:p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 text-left group"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
        {/* Top Row: Photo + Name + Signal */}
        <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-4">
          {/* Player Photo */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-slate-800 overflow-hidden">
              <PlayerImage
                playerId={player.code}
                playerName={player.name}
                teamName={player.team}
                size="sm"
                className="!w-10 !h-10 md:!w-16 md:!h-16 !rounded-lg md:!rounded-xl"
              />
            </div>
            {/* Position Badge */}
            <span className="absolute -bottom-1 -right-1 px-1 py-0.5 md:px-1.5 md:py-1 text-[8px] md:text-xs font-bold bg-slate-700 text-slate-300 rounded">
              {player.position.slice(0, 3).toUpperCase()}
            </span>
          </div>

          {/* Name & Team */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-lg font-bold text-white truncate leading-tight">
              {player.name}
            </h3>
            <p className="text-[10px] md:text-sm text-slate-500 truncate">
              {player.teamShort}
            </p>
          </div>

          {/* Signal Badge */}
          <div className={`flex-shrink-0 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded text-[10px] md:text-xs font-bold ${
            isAlpha
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            {signalLabel}
          </div>
        </div>

        {/* Alpha Score - Primary Metric */}
        <div className="flex items-baseline justify-between mb-2 md:mb-4">
          <span className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider">Delta</span>
          <span className={`text-xl md:text-3xl font-bold font-mono tabular-nums ${
            isAlpha ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {player.luckScore > 0 ? '+' : ''}{player.luckScore.toFixed(2)}
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-1 md:gap-2 mb-2 md:mb-4">
          <div className="text-right">
            <p className="text-[8px] md:text-xs text-slate-600 uppercase">xG</p>
            <p className="text-xs md:text-base font-mono tabular-nums text-slate-300">{player.xG.toFixed(1)}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] md:text-xs text-slate-600 uppercase">Goals</p>
            <p className="text-xs md:text-base font-mono tabular-nums text-white">{player.actualGoals}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] md:text-xs text-slate-600 uppercase">£</p>
            <p className="text-xs md:text-base font-mono tabular-nums text-slate-300">{player.price.toFixed(1)}m</p>
          </div>
        </div>

        {/* Fixtures Row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5 md:gap-1">
            {player.fixtures.slice(0, 3).map((fixture, idx) => (
              <span
                key={idx}
                className={`px-1 py-0.5 md:px-2 md:py-1 text-[8px] md:text-xs font-bold rounded md:rounded-lg ${FDR_COLORS[fixture.fdr].bg} ${FDR_COLORS[fixture.fdr].text}`}
                title={`${fixture.isHome ? 'H' : 'A'}: ${fixture.opponent}`}
              >
                {fixture.opponentShort}
              </span>
            ))}
          </div>
          <ChevronRight className="w-3 h-3 md:hidden text-slate-600 group-hover:text-slate-400 transition-colors" />
          <div className="hidden md:flex items-center gap-1 text-xs text-slate-500">
            <RotateCcw className="w-3 h-3" />
            <span>Click to flip</span>
          </div>
        </div>
      </button>

          {/* Back Side - Desktop Only */}
          <div
            className="absolute inset-0 w-full h-full p-4 bg-slate-900 border border-slate-700 rounded-xl overflow-auto"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Back Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden">
                  <PlayerImage
                    playerId={player.code}
                    playerName={player.name}
                    teamName={player.team}
                    size="md"
                    className="!w-12 !h-12 !rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{player.name}</h3>
                  <p className="text-xs text-slate-400">{player.team} • {player.position}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Flip back"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Signal Badge */}
            <div className={`p-3 rounded-xl mb-3 ${
              isAlpha ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Alpha Signal</span>
                <div className={`flex items-center gap-1 ${isAlpha ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isAlpha ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-bold text-sm">{player.verdict}</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-300">xG</span>
                <span className="text-sm font-mono tabular-nums text-white">{player.xG.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-300">Actual Goals</span>
                <span className="text-sm font-mono tabular-nums text-white">{player.actualGoals}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-300">Haul Potential</span>
                <span className="text-sm font-mono tabular-nums text-emerald-400">{player.haulPotential.toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-300">Trap Indicator</span>
                <span className="text-sm font-mono tabular-nums text-rose-400">{player.trapIndicator.toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-300">Differential</span>
                <span className="text-sm font-mono tabular-nums text-purple-400">{player.differentialValue.toFixed(0)}%</span>
              </div>
            </div>

            {/* Fixtures */}
            <div>
              <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Fixtures</h4>
              <div className="flex flex-wrap gap-1.5">
                {player.fixtures.slice(0, 4).map((fixture, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${FDR_COLORS[fixture.fdr].bg}`}
                  >
                    <span className="text-xs font-medium text-white">{fixture.isHome ? 'H' : 'A'}</span>
                    <span className="text-xs font-bold text-white">{fixture.opponentShort}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal - Mobile Only */}
      {showDetail && (
        <PlayerDetailModal player={player} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}

/**
 * Detail Modal - Progressive Disclosure
 * Shows full Bayesian evidence and metrics
 */
function PlayerDetailModal({ player, onClose }: { player: PlayerLuckData; onClose: () => void }) {
  const isAlpha = player.luckScore < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden">
              <PlayerImage
                playerId={player.code}
                playerName={player.name}
                teamName={player.team}
                size="md"
                className="!w-12 !h-12 !rounded-xl"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{player.name}</h2>
              <p className="text-xs text-slate-400">{player.team} • {player.position}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* Primary Signal */}
          <div className={`p-4 rounded-xl mb-4 ${
            isAlpha ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Alpha Signal</span>
              <div className={`flex items-center gap-1 ${isAlpha ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isAlpha ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-bold">{player.verdict}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold font-mono tabular-nums text-white">
                {player.luckScore > 0 ? '+' : ''}{player.luckScore.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Luck Delta (Goals - xG)</p>
            </div>
          </div>

          {/* Bayesian Evidence */}
          <div className="mb-4">
            <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Bayesian Evidence</h3>
            <div className="space-y-3">
              {/* xG Comparison */}
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-300">Expected Goals (xG)</span>
                <span className="text-sm font-mono tabular-nums text-white">{player.xG.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-300">Actual Goals</span>
                <span className="text-sm font-mono tabular-nums text-white">{player.actualGoals}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-300">Haul Potential</span>
                <span className="text-sm font-mono tabular-nums text-emerald-400">{player.haulPotential.toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-300">Trap Indicator</span>
                <span className="text-sm font-mono tabular-nums text-rose-400">{player.trapIndicator.toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-300">Differential Value</span>
                <span className="text-sm font-mono tabular-nums text-purple-400">{player.differentialValue.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Upcoming Fixtures */}
          <div className="mb-4">
            <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Upcoming Fixtures</h3>
            <div className="flex flex-wrap gap-2">
              {player.fixtures.map((fixture, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${FDR_COLORS[fixture.fdr].bg}`}
                >
                  <span className="text-xs font-medium text-white">{fixture.isHome ? 'H' : 'A'}</span>
                  <span className="text-sm font-bold text-white">{fixture.opponentShort}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verdict Explanation */}
          <div className={`p-4 rounded-xl ${
            isAlpha ? 'bg-emerald-900/20' : 'bg-rose-900/20'
          }`}>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isAlpha ? (
                <>
                  <strong className="text-emerald-400">Underperforming xG.</strong>{' '}
                  This player is creating quality chances but not converting. 
                  Statistical regression suggests returns are incoming.
                </>
              ) : (
                <>
                  <strong className="text-rose-400">Overperforming xG.</strong>{' '}
                  This player is scoring above expected rate.
                  Statistical regression suggests a correction is likely.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

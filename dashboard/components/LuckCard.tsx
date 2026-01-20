'use client';

import { useState } from 'react';
import { TrendingUp, AlertTriangle, RotateCcw } from 'lucide-react';
import { PlayerLuckData, FDR_COLORS } from '@/lib/fplTypes';
import PlayerImage from '@/components/PlayerImage';

interface LuckCardProps {
  player: PlayerLuckData;
}

export default function LuckCard({ player }: LuckCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Calculate bar width based on luck score (max display at ±3)
  const barWidth = Math.min(100, Math.abs(player.luckScore) * 33.33);
  const isUnlucky = player.luckScore < 0; // Negative = unlucky = BUY

  return (
    <div
      className="w-full max-w-[350px] min-h-[620px] perspective-1000 select-none cursor-pointer"
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
      aria-label={`${player.name} luck card. Tap to flip.`}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
            {/* Top Section - Player Info */}
            <div className="flex-shrink-0 pt-6 pb-4 px-5">
              <div className="flex items-center gap-4">
                {/* Player Photo - Using PlayerImage component with ID-based lookup */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden ring-2 ring-slate-700">
                    <PlayerImage
                      playerId={player.code}
                      playerName={player.name}
                      teamName={player.team}
                      size="lg"
                      className="!w-20 !h-20 !rounded-full"
                    />
                  </div>
                  {/* Position badge */}
                  <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-slate-800 rounded-full text-[10px] font-medium text-slate-400 border border-slate-700">
                    {player.position.slice(0, 3).toUpperCase()}
                  </div>
                </div>

                {/* Name & Team */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white tracking-tight truncate font-inter">
                    {player.name}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">
                    {player.teamShort}
                  </p>
                  {/* Price & Fixtures Pills */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                      £{player.price.toFixed(1)}m
                    </span>
                    {/* Next 3 Fixtures - FDR colored */}
                    <div className="flex gap-1">
                      {player.fixtures.slice(0, 3).map((fixture, idx) => (
                        <span
                          key={idx}
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${FDR_COLORS[fixture.fdr].bg} ${FDR_COLORS[fixture.fdr].text}`}
                          title={`${fixture.isHome ? 'H' : 'A'}: ${fixture.opponent}`}
                        >
                          {fixture.opponentShort}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section - Diverging Bar Chart */}
            <div className="flex-1 px-5 py-4 flex flex-col justify-center">
              <div className="mb-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                  Luck Score
                </p>
                <p className="text-3xl font-bold text-white font-mono tracking-tight">
                  {player.luckScore > 0 ? '+' : ''}{player.luckScore.toFixed(2)}
                </p>
              </div>

              {/* Diverging Bar - Center axis at 0 */}
              <div className="relative h-10 flex items-center">
                {/* Background track */}
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 bg-slate-800/50 rounded-l-lg" />
                  <div className="w-1/2 bg-slate-800/50 rounded-r-lg" />
                </div>
                
                
                {/* The bar itself */}
                <div className="absolute top-1 bottom-1 left-1/2 flex items-center">
                  {isUnlucky ? (
                    // Green bar growing LEFT (unlucky = BUY)
                    <div
                      className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 rounded-l-md transform -translate-x-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  ) : (
                    // Red bar growing RIGHT (lucky = TRAP)
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-r-md transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>

                {/* Labels */}
                <div className="absolute inset-0 flex justify-between items-center px-3 text-xs font-medium">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    BUY
                  </span>
                  <span className="text-rose-400 flex items-center gap-1">
                    TRAP
                    <AlertTriangle className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* FPL Metrics Row */}
              <div className="grid grid-cols-3 gap-2 mt-6">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Differential</p>
                  <p className="text-sm font-bold text-white font-mono">{player.differentialValue.toFixed(0)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Haul Pot.</p>
                  <p className="text-sm font-bold text-white font-mono">{player.haulPotential.toFixed(0)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Trap Risk</p>
                  <p className="text-sm font-bold text-white font-mono">{player.trapIndicator.toFixed(0)}%</p>
                </div>
              </div>
            </div>

            {/* Bottom Section - Verdict Badge (Thumb Zone) */}
            <div className="flex-shrink-0 px-5 pb-6 pt-2">
              <div
                className={`w-full py-3 rounded-xl text-center font-bold text-sm tracking-wide ${
                  player.verdict === 'BUY'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
                    : player.verdict === 'TRAP'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white'
                    : 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200'
                }`}
              >
                {player.verdictLabel}
              </div>
              
              {/* Flip hint */}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-slate-600">
                <RotateCcw className="w-3 h-3" />
                <span className="text-xs">Tap for evidence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side - Glassmorphism Evidence Table */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="w-full h-full bg-black/90 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 pt-6 pb-4 px-5 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {player.name}
                  </h3>
                  <p className="text-xs text-slate-500">Statistical Evidence</p>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-xs">Tap to flip</span>
                </div>
              </div>
            </div>

            {/* Evidence Table */}
            <div className="flex-1 px-5 py-6 flex flex-col justify-center">
              <div className="space-y-4">
                {/* xG vs Goals Comparison */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected Goals (xG)</p>
                      <p className="text-3xl font-bold text-slate-300 font-mono">{player.xG.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Actual Goals</p>
                      <p className="text-3xl font-bold text-white font-mono">{player.actualGoals}</p>
                    </div>
                  </div>
                  
                  {/* Difference indicator */}
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Difference</span>
                      <span className={`text-lg font-bold font-mono ${
                        player.luckScore < 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {player.luckScore > 0 ? '+' : ''}{player.luckScore.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interpretation */}
                <div className={`rounded-xl p-4 border ${
                  player.verdict === 'BUY'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : player.verdict === 'TRAP'
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-slate-500/10 border-slate-500/30'
                }`}>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {player.verdict === 'BUY' ? (
                      <>
                        <strong className="text-emerald-400">Underperforming xG.</strong>{' '}
                        This player is creating quality chances but not converting. 
                        Statistical regression suggests returns are incoming.
                      </>
                    ) : player.verdict === 'TRAP' ? (
                      <>
                        <strong className="text-rose-400">Overperforming xG.</strong>{' '}
                        This player is scoring above expected rate.
                        Statistical regression suggests a correction is likely.
                      </>
                    ) : (
                      <>
                        <strong className="text-slate-400">Performing at expected level.</strong>{' '}
                        Goals align with chance quality. Fair price.
                      </>
                    )}
                  </p>
                </div>

                {/* FPL Context */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Haul Potential</p>
                    <p className="text-xl font-bold text-white font-mono">{player.haulPotential.toFixed(0)}%</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Trap Indicator</p>
                    <p className="text-xl font-bold text-white font-mono">{player.trapIndicator.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom - GW Indicator */}
            <div className="flex-shrink-0 px-5 pb-6 pt-2">
              <div className="flex items-center justify-center text-sm gap-2">
                <span className="text-slate-500">GW</span>
                <span className="font-bold text-white">{player.gameweek}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

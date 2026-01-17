'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ContextBadge {
  emoji: string;
  label: string;
  type: 'warning' | 'positive' | 'neutral';
}

interface StockPlayerCardProps {
  playerName: string;
  teamName: string;
  teamLogo?: string;
  position: string;
  adjustedLuckScore: number; // Positive = Buy, Negative = Sell
  rawLuckScore?: number;
  price: number;
  priceChange?: number; // Week-over-week price change
  contextBadges?: ContextBadge[];
  fatigueAdjustment?: number;
  squadAvailabilityAdjustment?: number;
}

export default function StockPlayerCard({
  playerName,
  teamName,
  teamLogo,
  position,
  adjustedLuckScore,
  rawLuckScore,
  price,
  priceChange = 0,
  contextBadges = [],
  fatigueAdjustment = 0,
  squadAvailabilityAdjustment = 0,
}: StockPlayerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine signal based on adjusted luck score
  const signal = adjustedLuckScore > 0 ? 'BUY' : adjustedLuckScore < 0 ? 'SELL' : 'HOLD';
  const signalColor = signal === 'BUY' 
    ? 'text-emerald-400' 
    : signal === 'SELL' 
    ? 'text-rose-400' 
    : 'text-slate-400';
  const signalBg = signal === 'BUY'
    ? 'bg-emerald-500/10 border-emerald-500/30'
    : signal === 'SELL'
    ? 'bg-rose-500/10 border-rose-500/30'
    : 'bg-slate-700/50 border-slate-600';

  const TrendIcon = signal === 'BUY' 
    ? TrendingUp 
    : signal === 'SELL' 
    ? TrendingDown 
    : Minus;

  // Format luck score with sign
  const formattedScore = adjustedLuckScore >= 0 
    ? `+${adjustedLuckScore.toFixed(2)}` 
    : adjustedLuckScore.toFixed(2);

  // Price change formatting
  const priceChangeFormatted = priceChange >= 0 
    ? `+£${priceChange.toFixed(1)}m` 
    : `-£${Math.abs(priceChange).toFixed(1)}m`;

  return (
    <div className="w-full max-w-md bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Section 1: The Ticker (Always Visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        {/* Left: Player Info */}
        <div className="flex items-center gap-3">
          {/* Team Logo */}
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
            {teamLogo ? (
              <Image src={teamLogo} alt={teamName} width={32} height={32} className="object-contain" />
            ) : (
              <span className="text-xs font-bold text-slate-500">
                {teamName.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="text-left">
            <h3 className="text-white font-semibold text-base leading-tight">
              {playerName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-slate-500 text-xs">{teamName}</span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-slate-500 text-xs">{position}</span>
            </div>
          </div>
        </div>

        {/* Right: Luck Score (Financial Style) */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            {/* Adjusted Luck Score - Monospace Financial Font */}
            <div className={`font-mono text-xl font-bold ${signalColor}`}>
              {formattedScore}
            </div>
            {/* Price */}
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <span className="text-slate-400 text-xs font-mono">£{price.toFixed(1)}m</span>
              {priceChange !== 0 && (
                <span className={`text-xs font-mono ${priceChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {priceChangeFormatted}
                </span>
              )}
            </div>
          </div>
          
          {/* Trend Icon */}
          <div className={`p-2 rounded-lg ${signalBg} border`}>
            <TrendIcon className={`w-4 h-4 ${signalColor}`} />
          </div>
          
          {/* Expand Chevron */}
          <div className="text-slate-500">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </button>

      {/* Section 2: The Analysis (Expandable) */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 pb-4 pt-2 border-t border-slate-800">
          {/* Signal Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className={`px-3 py-1.5 rounded-lg ${signalBg} border`}>
              <span className={`text-sm font-semibold ${signalColor}`}>
                {signal === 'BUY' ? '📈 BUY SIGNAL' : signal === 'SELL' ? '📉 SELL SIGNAL' : '➡️ HOLD'}
              </span>
            </div>
            
            {/* Trust Tooltip */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(!showTooltip);
                }}
                className="p-1.5 rounded-full hover:bg-slate-800 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
              </button>
              
              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute right-0 top-8 w-56 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Score adjusted for <strong className="text-white">Fatigue</strong> and{' '}
                    <strong className="text-white">Squad Availability</strong>.
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Raw Score:</span>
                      <span className="font-mono text-slate-300">
                        {rawLuckScore !== undefined ? rawLuckScore.toFixed(2) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Fatigue Adj:</span>
                      <span className={`font-mono ${fatigueAdjustment >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {fatigueAdjustment >= 0 ? '+' : ''}{fatigueAdjustment.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Squad Avail:</span>
                      <span className={`font-mono ${squadAvailabilityAdjustment >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {squadAvailabilityAdjustment >= 0 ? '+' : ''}{squadAvailabilityAdjustment.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Context Badges */}
          {contextBadges.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                Context Factors
              </p>
              <div className="flex flex-wrap gap-2">
                {contextBadges.map((badge, index) => (
                  <div
                    key={index}
                    className={`
                      px-2.5 py-1 rounded-md text-xs font-medium
                      ${badge.type === 'warning' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                        : badge.type === 'positive'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                      }
                    `}
                  >
                    {badge.emoji} {badge.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Breakdown Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Luck Score Breakdown</span>
              <span className={`text-sm font-mono font-semibold ${signalColor}`}>
                {formattedScore}
              </span>
            </div>
            
            {/* Visual bar */}
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-px bg-slate-600" />
              <div
                className={`absolute inset-y-0 ${adjustedLuckScore >= 0 ? 'left-1/2' : 'right-1/2'} ${
                  adjustedLuckScore >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                } rounded-full transition-all duration-500`}
                style={{
                  width: `${Math.min(Math.abs(adjustedLuckScore) * 10, 50)}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-rose-400/70">Sell</span>
              <span className="text-[10px] text-slate-600">0</span>
              <span className="text-[10px] text-emerald-400/70">Buy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo data for testing
export const demoContextBadges: ContextBadge[] = [
  { emoji: '⚠️', label: 'No Rodri', type: 'warning' },
  { emoji: '🔥', label: 'Hot Form', type: 'positive' },
  { emoji: '🏠', label: 'Home Fixture', type: 'neutral' },
];

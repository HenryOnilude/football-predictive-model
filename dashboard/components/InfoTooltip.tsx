'use client';

import { useState } from 'react';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  content: string;
  className?: string;
}

/**
 * Axiom Informational Tooltip
 * Provides contextual help for Nuclear Math terminology
 */
export function InfoTooltip({ title, content, className = '' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-slate-500 hover:text-emerald-400 transition-colors rounded-full hover:bg-slate-800/50 min-w-[28px] min-h-[28px] flex items-center justify-center"
        aria-label={`Info about ${title}`}
      >
        <Info className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 md:hidden" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Tooltip */}
          <div className="absolute z-50 left-0 top-full mt-2 w-64 md:w-72 p-4 rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-semibold text-white">{title}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{content}</p>
          </div>
        </>
      )}
    </div>
  );
}

// Predefined tooltips for common Axiom terminology
export const AXIOM_TOOLTIPS = {
  systemHealth: {
    title: 'System Health',
    content: '0-100 score based on underlying xG creation/prevention. Higher = Sustainable quality. Combines offensive threat generation with defensive solidity metrics.',
  },
  finishingHeat: {
    title: 'Finishing Heat',
    content: 'Variance between actual goals scored and expected goals (xG). Predicts short-term goal regression. Hot = overperforming, Cold = underperforming.',
  },
  archetypes: {
    title: 'Market Archetypes',
    content: 'DOMINANT = Elite underlying metrics, buy with confidence. OVERHEATED = Outperforming xG, sell before regression. PRIME_BUY = Undervalued opportunity.',
  },
  luckDelta: {
    title: 'Luck Delta (Δ)',
    content: 'Actual points minus expected points based on xG. Negative = unlucky/buy signal. Positive = lucky/sell signal. Range typically -10 to +10.',
  },
  bayesianVariance: {
    title: 'Bayesian Variance',
    content: 'Statistical confidence in the prediction. Lower games played = higher uncertainty. Score adjusts automatically as more data accumulates.',
  },
} as const;

export type TooltipKey = keyof typeof AXIOM_TOOLTIPS;

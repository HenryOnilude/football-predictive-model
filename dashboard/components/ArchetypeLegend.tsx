'use client';

import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Zap, Shield, AlertTriangle, Flame, Crown } from 'lucide-react';

interface ArchetypeLegendProps {
  className?: string;
}

const ARCHETYPES = [
  {
    name: 'DOMINANT',
    icon: Crown,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    action: 'BUY',
    actionColor: 'text-emerald-400',
    description: 'Elite underlying metrics across all categories. Sustainable success backed by xG dominance.',
    signal: 'Strong buy - Premium asset with proven quality.',
  },
  {
    name: 'PRIME_BUY',
    icon: TrendingUp,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    action: 'BUY',
    actionColor: 'text-purple-400',
    description: 'Underperforming xG suggests imminent positive regression. Market has undervalued true quality.',
    signal: 'Alpha opportunity - Buy before correction.',
  },
  {
    name: 'ENTERTAINERS',
    icon: Zap,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    action: 'HOLD',
    actionColor: 'text-amber-400',
    description: 'High-variance team. Explosive attacking but defensive vulnerabilities create unpredictable returns.',
    signal: 'Volatile - Good for differentials, risky for set-and-forget.',
  },
  {
    name: 'STABLE',
    icon: Shield,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30',
    action: 'HOLD',
    actionColor: 'text-slate-400',
    description: 'Performing in line with expected metrics. No statistical edge either way.',
    signal: 'Neutral - Evaluate based on fixtures and form.',
  },
  {
    name: 'FRAGILE',
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    action: 'CAUTION',
    actionColor: 'text-yellow-400',
    description: 'Underlying metrics suggest vulnerability. May be masking issues with lucky results.',
    signal: 'Monitor closely - Potential regression candidate.',
  },
  {
    name: 'OVERHEATED',
    icon: Flame,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    action: 'SELL',
    actionColor: 'text-orange-400',
    description: 'Significantly overperforming xG. Current output is unsustainable.',
    signal: 'Sell high - Lock in profits before correction.',
  },
  {
    name: 'CRITICAL',
    icon: TrendingDown,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-500/30',
    action: 'AVOID',
    actionColor: 'text-rose-400',
    description: 'Poor underlying metrics across the board. Structural issues unlikely to improve short-term.',
    signal: 'Avoid - Fundamental quality concerns.',
  },
];

export function ArchetypeLegend({ className = '' }: ArchetypeLegendProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors ${className}`}
      >
        <span className="text-xs">📊</span>
        <span>Archetype Legend</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-white">Market Archetypes</h2>
                <p className="text-sm text-slate-400 mt-1">Understanding Axiom signal classifications</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-120px)]">
              <div className="space-y-4">
                {ARCHETYPES.map((archetype) => {
                  const Icon = archetype.icon;
                  return (
                    <div
                      key={archetype.name}
                      className={`p-4 rounded-xl ${archetype.bgColor} border ${archetype.borderColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${archetype.bgColor}`}>
                          <Icon className={`w-5 h-5 ${archetype.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className={`font-bold ${archetype.color}`}>{archetype.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${archetype.bgColor} ${archetype.actionColor}`}>
                              {archetype.action}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{archetype.description}</p>
                          <p className="text-xs text-slate-400 italic">{archetype.signal}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Note */}
              <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Note:</strong> Archetypes are derived from xG-based regression analysis. 
                  They represent statistical tendencies, not guarantees. Always consider fixtures, 
                  injuries, and form when making transfer decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ArchetypeLegend;

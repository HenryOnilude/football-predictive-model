'use client';

import { X, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';
import { MappedPlayer } from '@/lib/fpl-api';
import PlayerImage from './PlayerImage';

interface PlayerDetailPanelProps {
  player: MappedPlayer | null;
  isOpen: boolean;
  onCloseAction: () => void;
}

function getSignalBadge(delta: number): { label: string; color: string; bgColor: string; icon: string } {
  if (delta < -2) {
    return { label: 'Positive Alpha', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: '📈' };
  }
  if (delta > 2) {
    return { label: 'Regression Risk', color: 'text-rose-400', bgColor: 'bg-rose-500/20', icon: '📉' };
  }
  return { label: 'Fair Value', color: 'text-slate-400', bgColor: 'bg-slate-500/20', icon: '⚖️' };
}

export default function PlayerDetailPanel({ player, isOpen, onCloseAction }: PlayerDetailPanelProps) {
  if (!player) return null;

  const signal = getSignalBadge(player.goalDelta);
  const deltaColor = player.goalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseAction}
      />

      {/* Centered Modal */}
      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div
          className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-slate-900 border-b border-slate-800/60 p-4 z-20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight">Player Analysis</h2>
              <button
                onClick={onCloseAction}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors group"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {/* Player Header */}
          <div className="flex items-start gap-3 mb-4 pb-4 border-b border-slate-800/50">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden ring-2 ring-slate-700/50 shadow-xl flex-shrink-0">
              <PlayerImage
                playerId={player.code}
                playerName={player.name}
                teamName={player.team}
                size="lg"
                className="!w-16 !h-16 !rounded-xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-1 truncate">{player.name}</h3>
              <p className="text-sm text-slate-400 mb-2">{player.team} · {player.position}</p>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${signal.bgColor} ${signal.color} border border-current border-opacity-20`}>
                <span>{signal.icon}</span>
                <span>{signal.label}</span>
              </div>
            </div>
          </div>

          {/* Price & Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40 hover:border-slate-600/60 transition-all shadow-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Price</p>
              <p className="text-2xl font-bold text-white tabular-nums">£{player.price.toFixed(1)}m</p>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40 hover:border-slate-600/60 transition-all shadow-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Ownership</p>
              <p className="text-2xl font-bold text-white tabular-nums">{player.selectedBy}%</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40 mb-4 shadow-lg">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Performance Metrics
            </h4>
            <div className="space-y-3">
              {/* xG vs Goals */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Expected Goals (xG)</span>
                  <span className="font-mono text-slate-300">{player.xG.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${Math.min((player.xG / Math.max(player.xG, player.goals)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Actual Goals</span>
                  <span className="font-mono text-emerald-400">{player.goals}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min((player.goals / Math.max(player.xG, player.goals)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Delta */}
              <div className="pt-2 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Delta (Goals - xG)</span>
                  <span className={`font-mono text-base font-bold ${deltaColor}`}>
                    {player.goalDelta > 0 ? '+' : ''}{player.goalDelta.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="bg-slate-800/30 rounded-lg p-3 text-center border border-slate-700/40 shadow-lg hover:border-slate-600/60 transition-all">
              <p className="text-xl font-bold text-white tabular-nums">{player.totalPoints}</p>
              <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide font-medium">Total Pts</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 text-center border border-slate-700/40 shadow-lg hover:border-emerald-600/40 transition-all">
              <p className="text-xl font-bold text-emerald-400 tabular-nums">{player.form}</p>
              <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide font-medium">Form</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 text-center border border-slate-700/40 shadow-lg hover:border-slate-600/60 transition-all">
              <p className="text-xl font-bold text-white tabular-nums">{player.assists}</p>
              <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide font-medium">Assists</p>
            </div>
          </div>

          {/* xA Stats */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40 mb-4 shadow-lg">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Expected Assists
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-0.5">xA</p>
                <p className="font-mono text-lg font-bold text-white tabular-nums">{player.xA.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-0.5">xGI (Total)</p>
                <p className="font-mono text-lg font-bold text-cyan-400 tabular-nums">{player.xGI.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Signal Interpretation */}
          <div className={`rounded-xl p-4 border-2 ${signal.bgColor} shadow-xl`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center">
                {player.goalDelta < -2 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : player.goalDelta > 2 ? (
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                ) : (
                  <Activity className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <h5 className={`font-bold text-sm mb-1.5 ${signal.color}`}>{signal.label}</h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {player.goalDelta < -2
                    ? `${player.name} is underperforming expected goals by ${Math.abs(player.goalDelta).toFixed(2)}. Statistical regression suggests increased output ahead.`
                    : player.goalDelta > 2
                    ? `${player.name} is overperforming expected goals by ${player.goalDelta.toFixed(2)}. Consider selling before regression occurs.`
                    : `${player.name} is performing in line with expected metrics. No significant edge detected.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

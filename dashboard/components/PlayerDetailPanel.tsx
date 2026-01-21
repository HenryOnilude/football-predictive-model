'use client';

import { X, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';
import { MappedPlayer } from '@/lib/fpl-api';
import PlayerImage from './PlayerImage';

interface PlayerDetailPanelProps {
  player: MappedPlayer | null;
  isOpen: boolean;
  onClose: () => void;
}

function getSignalBadge(delta: number): { label: string; color: string; bgColor: string; icon: string } {
  if (delta < -2) {
    return { label: 'Positive Alpha', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: '+' };
  }
  if (delta > 2) {
    return { label: 'Regression Risk', color: 'text-rose-400', bgColor: 'bg-rose-500/20', icon: '-' };
  }
  return { label: 'Fair Value', color: 'text-slate-400', bgColor: 'bg-slate-500/20', icon: '=' };
}

export default function PlayerDetailPanel({ player, isOpen, onClose }: PlayerDetailPanelProps) {
  if (!player) return null;

  const signal = getSignalBadge(player.goalDelta);
  const deltaColor = player.goalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Player Analysis</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-64px)]">
          {/* Player Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-700">
              <PlayerImage
                playerId={player.code}
                playerName={player.name}
                teamName={player.team}
                size="lg"
                className="!w-16 !h-16 !rounded-full"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{player.name}</h3>
              <p className="text-sm text-slate-400">{player.team} · {player.position}</p>
              <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md text-xs font-semibold ${signal.bgColor} ${signal.color}`}>
                <span>{signal.icon}</span>
                <span>{signal.label}</span>
              </div>
            </div>
          </div>

          {/* Price & Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Price</p>
              <p className="text-2xl font-bold text-white">£{player.price.toFixed(1)}m</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Ownership</p>
              <p className="text-2xl font-bold text-white">{player.selectedBy}%</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance Metrics
            </h4>
            <div className="space-y-4">
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
              <div className="pt-3 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Delta (Goals - xG)</span>
                  <span className={`font-mono text-lg font-bold ${deltaColor}`}>
                    {player.goalDelta > 0 ? '+' : ''}{player.goalDelta.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-800/30 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-2xl font-bold text-white">{player.totalPoints}</p>
              <p className="text-xs text-slate-500">Total Pts</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-2xl font-bold text-emerald-400">{player.form}</p>
              <p className="text-xs text-slate-500">Form</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-2xl font-bold text-white">{player.assists}</p>
              <p className="text-xs text-slate-500">Assists</p>
            </div>
          </div>

          {/* xA Stats */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Expected Assists
            </h4>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">xA</p>
                <p className="font-mono text-lg text-white">{player.xA.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">xGI (Total)</p>
                <p className="font-mono text-lg text-cyan-400">{player.xGI.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Signal Interpretation */}
          <div className={`rounded-xl p-4 border ${signal.bgColor} border-opacity-30`}>
            <div className="flex items-start gap-3">
              {player.goalDelta < -2 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : player.goalDelta > 2 ? (
                <TrendingDown className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Activity className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h5 className={`font-semibold ${signal.color}`}>{signal.label}</h5>
                <p className="text-sm text-slate-400 mt-1">
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
    </>
  );
}

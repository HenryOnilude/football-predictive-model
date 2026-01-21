'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { MappedPlayer } from '@/lib/fpl-api';
import PlayerImage from '@/components/PlayerImage';
import PlayerDetailPanel from '@/components/PlayerDetailPanel';

interface MarketTerminalClientProps {
  unlucky: MappedPlayer[]; // Positive Alpha (underperforming xG)
  lucky: MappedPlayer[];   // Regression Risk (overperforming xG)
  byForm: MappedPlayer[];  // Momentum Vectors
  byValue: MappedPlayer[];
  currentGameweek: number;
  lastUpdated: string;
}

// Signal badge based on delta
function getSignalBadge(delta: number): { label: string; color: string; bgColor: string } {
  if (delta < -2) {
    return { label: 'Positive Alpha', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
  }
  if (delta > 2) {
    return { label: 'Regression Risk', color: 'text-rose-400', bgColor: 'bg-rose-500/20' };
  }
  return { label: 'Fair Value', color: 'text-slate-400', bgColor: 'bg-slate-500/20' };
}

// Momentum indicator
function getMomentumColor(form: number): string {
  if (form >= 7) return 'bg-emerald-500';
  if (form >= 5) return 'bg-emerald-400';
  if (form >= 3) return 'bg-amber-400';
  return 'bg-rose-400';
}

export default function MarketTerminalClient({
  unlucky,
  lucky,
  byForm,
  currentGameweek,
  lastUpdated,
}: MarketTerminalClientProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<MappedPlayer | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleRowClick = (player: MappedPlayer) => {
    setSelectedPlayer(player);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  // Combine and sort for alpha screener (prioritize positive alpha)
  const alphaScreenerData = [...unlucky].sort((a, b) => a.goalDelta - b.goalDelta);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-8 h-8 text-emerald-400" />
                <h1 className="text-3xl font-bold text-white tracking-tight">Market Terminal</h1>
              </div>
              <p className="text-slate-400">Real-time player valuation & signal analysis</p>
            </div>
            <div className="hidden md:block text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="text-xs text-slate-500 uppercase">GW</span>
                <span className="text-xl font-bold text-emerald-400">{currentGameweek}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Updated {new Date(lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold uppercase">Positive Alpha</span>
              </div>
              <p className="text-3xl font-bold text-emerald-400">{unlucky.length}</p>
              <p className="text-xs text-slate-500">Underperforming xG</p>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span className="text-xs text-rose-400 font-semibold uppercase">Regression Risk</span>
              </div>
              <p className="text-3xl font-bold text-rose-400">{lucky.length}</p>
              <p className="text-xs text-slate-500">Overperforming xG</p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-semibold uppercase">Momentum Vectors</span>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{byForm.length}</p>
              <p className="text-xs text-slate-500">In-form assets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Bento Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Alpha Screener - 8 cols */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    The Alpha Screener
                  </h2>
                  <p className="text-xs text-slate-500">Click any row for detailed analysis</p>
                </div>
                <div className="text-xs text-slate-500">
                  {alphaScreenerData.length} assets
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Player</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Signal</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Delta</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Own %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alphaScreenerData.map((player, index) => {
                      const signal = getSignalBadge(player.goalDelta);
                      const deltaColor = player.goalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400';

                      return (
                        <tr
                          key={player.id}
                          onClick={() => handleRowClick(player)}
                          className={`border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors ${
                            index % 2 === 0 ? 'bg-slate-900/30' : ''
                          }`}
                        >
                          {/* Player */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                                <PlayerImage
                                  playerId={player.code}
                                  playerName={player.name}
                                  teamName={player.team}
                                  size="sm"
                                  className="!w-8 !h-8 !rounded-full"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{player.name}</p>
                                <p className="text-xs text-slate-500">{player.team} · {player.positionShort}</p>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-white">£{player.price.toFixed(1)}m</span>
                          </td>

                          {/* Signal Badge */}
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${signal.bgColor} ${signal.color}`}>
                              {signal.label}
                            </span>
                          </td>

                          {/* Delta - Monospaced */}
                          <td className="px-4 py-3 text-right">
                            <span className={`font-mono text-sm font-bold ${deltaColor}`}>
                              {player.goalDelta > 0 ? '+' : ''}{player.goalDelta.toFixed(2)}
                            </span>
                          </td>

                          {/* Ownership */}
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-slate-400">{player.selectedBy}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Regression Risk Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mt-6">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                    Regression Risk
                  </h2>
                  <p className="text-xs text-slate-500">Overperforming assets - sell signals</p>
                </div>
                <div className="text-xs text-slate-500">
                  {lucky.length} assets
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Player</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Signal</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Delta</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Own %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lucky.sort((a, b) => b.goalDelta - a.goalDelta).map((player, index) => {
                      const signal = getSignalBadge(player.goalDelta);
                      const deltaColor = player.goalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400';

                      return (
                        <tr
                          key={player.id}
                          onClick={() => handleRowClick(player)}
                          className={`border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors ${
                            index % 2 === 0 ? 'bg-slate-900/30' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                                <PlayerImage
                                  playerId={player.code}
                                  playerName={player.name}
                                  teamName={player.team}
                                  size="sm"
                                  className="!w-8 !h-8 !rounded-full"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{player.name}</p>
                                <p className="text-xs text-slate-500">{player.team} · {player.positionShort}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-white">£{player.price.toFixed(1)}m</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${signal.bgColor} ${signal.color}`}>
                              {signal.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-mono text-sm font-bold ${deltaColor}`}>
                              {player.goalDelta > 0 ? '+' : ''}{player.goalDelta.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-slate-400">{player.selectedBy}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Market Momentum - 4 cols */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Market Momentum
                </h2>
                <p className="text-xs text-slate-500">Top momentum vectors</p>
              </div>

              {/* Momentum List */}
              <div className="divide-y divide-slate-800/50">
                {byForm.slice(0, 10).map((player, index) => {
                  const momentumColor = getMomentumColor(player.form);

                  return (
                    <div
                      key={player.id}
                      onClick={() => handleRowClick(player)}
                      className="px-4 py-3 hover:bg-slate-800/30 cursor-pointer transition-colors flex items-center gap-3"
                    >
                      {/* Rank */}
                      <div className="w-6 text-center">
                        <span className="text-xs font-bold text-slate-600">#{index + 1}</span>
                      </div>

                      {/* Player Image */}
                      <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                        <PlayerImage
                          playerId={player.code}
                          playerName={player.name}
                          teamName={player.team}
                          size="sm"
                          className="!w-10 !h-10 !rounded-full"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{player.name}</p>
                        <p className="text-xs text-slate-500">{player.team}</p>
                      </div>

                      {/* Form Heatmap Bar */}
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-white">{player.form.toFixed(1)}</span>
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${momentumColor} rounded-full`}
                            style={{ width: `${Math.min((player.form / 10) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/30">
                <p className="text-xs text-slate-500 mb-2">Momentum Scale</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500" />
                </div>
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>Cold</span>
                  <span>Hot</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-600">
            Data from official Fantasy Premier League API • 
            Last updated: {new Date(lastUpdated).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Player Detail Panel */}
      <PlayerDetailPanel
        player={selectedPlayer}
        isOpen={isPanelOpen}
        onCloseAction={handleClosePanel}
      />
    </div>
  );
}

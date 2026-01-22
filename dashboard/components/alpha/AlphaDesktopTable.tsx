'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import PlayerImage from '@/components/PlayerImage';
import { PlayerLuckData, FDR_COLORS } from '@/lib/fplTypes';

interface AlphaDesktopTableProps {
  players: PlayerLuckData[];
  filteredCount: number;
  onResetFilters: () => void;
}

type SortKey = 'luckScore' | 'xG' | 'actualGoals' | 'price' | 'name';
type SortDir = 'asc' | 'desc';

// Helper functions moved outside component to avoid re-creation on render
function getSignalBadge(score: number) {
  if (score < -3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <TrendingUp className="w-3 h-3" />
        BUY
      </span>
    );
  }
  if (score > 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
        <TrendingDown className="w-3 h-3" />
        SELL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
      HOLD
    </span>
  );
}

/**
 * Desktop-optimized professional terminal table view
 * Renders on screens >= 1024px (lg breakpoint)
 */
export default function AlphaDesktopTable({
  players,
  filteredCount,
  onResetFilters,
}: AlphaDesktopTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('luckScore');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const sortedPlayers = [...players].sort((a, b) => {
    let comparison = 0;
    switch (sortKey) {
      case 'luckScore':
        comparison = a.luckScore - b.luckScore;
        break;
      case 'xG':
        comparison = a.xG - b.xG;
        break;
      case 'actualGoals':
        comparison = a.actualGoals - b.actualGoals;
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
    }
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'luckScore' ? 'asc' : 'desc');
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />;
    }
    return sortDir === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-emerald-400" />
      : <ChevronDown className="w-3 h-3 text-emerald-400" />;
  };

  if (filteredCount === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">No players match your current filters.</p>
        <button
          onClick={onResetFilters}
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Table Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[200px]">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-white transition-colors group">
                    <span>Player</span>
                    {renderSortIcon('name')}
                  </button>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Signal
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <button onClick={() => handleSort('luckScore')} className="flex items-center gap-1 hover:text-white transition-colors group ml-auto">
                    <span>Delta</span>
                    {renderSortIcon('luckScore')}
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <button onClick={() => handleSort('xG')} className="flex items-center gap-1 hover:text-white transition-colors group ml-auto">
                    <span>xG</span>
                    {renderSortIcon('xG')}
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <button onClick={() => handleSort('actualGoals')} className="flex items-center gap-1 hover:text-white transition-colors group ml-auto">
                    <span>Goals</span>
                    {renderSortIcon('actualGoals')}
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <button onClick={() => handleSort('price')} className="flex items-center gap-1 hover:text-white transition-colors group ml-auto">
                    <span>Price</span>
                    {renderSortIcon('price')}
                  </button>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[160px]">
                  Fixtures
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Haul %
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Trap %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sortedPlayers.map((player, index) => {
                const isExpanded = expandedId === player.id;
                const isAlpha = player.luckScore < -3;
                const isRisk = player.luckScore > 3;

                return (
                  <tr
                    key={player.id}
                    onClick={() => setExpandedId(isExpanded ? null : player.id)}
                    className={`cursor-pointer transition-colors ${
                      isExpanded ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'
                    } ${isAlpha ? 'border-l-2 border-l-emerald-500' : isRisk ? 'border-l-2 border-l-rose-500' : ''}`}
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono tabular-nums">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                          <PlayerImage
                            playerId={player.code}
                            playerName={player.name}
                            teamName={player.team}
                            size="sm"
                            className="!w-10 !h-10 !rounded-lg"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{player.name}</p>
                          <p className="text-xs text-slate-500">
                            {player.teamShort} • {player.position}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getSignalBadge(player.luckScore)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-bold font-mono tabular-nums ${
                        isAlpha ? 'text-emerald-400' : isRisk ? 'text-rose-400' : 'text-slate-300'
                      }`}>
                        {player.luckScore > 0 ? '+' : ''}{player.luckScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono tabular-nums text-slate-300">
                      {player.xG.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono tabular-nums text-white">
                      {player.actualGoals}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono tabular-nums text-slate-300">
                      £{player.price.toFixed(1)}m
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        {player.fixtures.slice(0, 5).map((fixture, idx) => (
                          <span
                            key={idx}
                            className={`w-8 h-6 flex items-center justify-center text-[10px] font-bold rounded ${FDR_COLORS[fixture.fdr].bg} ${FDR_COLORS[fixture.fdr].text}`}
                            title={`${fixture.isHome ? 'H' : 'A'} vs ${fixture.opponent}`}
                          >
                            {fixture.opponentShort}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono tabular-nums text-emerald-400">
                      {player.haulPotential.toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono tabular-nums text-rose-400">
                      {player.trapIndicator.toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing {sortedPlayers.length} players</span>
            <span>Click row to expand • Sort by clicking column headers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

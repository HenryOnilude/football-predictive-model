'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TeamAnalysis, getEfficiencyBadgeConfig, getSustainabilityColor, getVerdictConfig } from '@/lib/TeamAnalysis';

interface HybridTeamData {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  points: number;
  analysis: TeamAnalysis | null;
}

interface MarketIntelligenceTableProps {
  standings: HybridTeamData[];
  loading?: boolean;
}

type SortField = 'position' | 'points' | 'systemHealth';

// System Health Progress Bar
function SystemHealthBar({ score }: { score: number }) {
  const color = getSustainabilityColor(score);
  const label = score > 75 ? 'Elite' : score >= 45 ? 'Average' : 'Weak';
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-slate-400 text-xs font-mono w-8">{score}</span>
      <span className="text-slate-500 text-[10px] hidden sm:inline">{label}</span>
    </div>
  );
}

// Finishing Heat Badge
function HeatBadge({ status, delta }: { status: string; delta: number }) {
  const config = getEfficiencyBadgeConfig(status as Parameters<typeof getEfficiencyBadgeConfig>[0]);
  
  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-1 rounded font-mono text-[10px] font-bold ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
      <span className="text-slate-500 text-[10px] hidden sm:inline">
        ({delta > 0 ? '+' : ''}{delta.toFixed(1)})
      </span>
    </div>
  );
}

// Action Badge (Market Signal)
function ActionBadge({ verdict }: { verdict: string }) {
  const config = getVerdictConfig(verdict as Parameters<typeof getVerdictConfig>[0]);
  
  const styleMap: Record<string, string> = {
    DOMINANT: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    ENTERTAINERS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    PRIME_BUY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    STABLE: 'bg-slate-700/50 text-slate-400 border-slate-600',
    OVERHEATED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    CRITICAL: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    FRAGILE: 'bg-slate-700/50 text-slate-500 border-slate-600',
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-semibold ${styleMap[verdict] || styleMap.STABLE}`}>
      {config.icon && <span>{config.icon}</span>} {config.label}
    </span>
  );
}

export default function MarketIntelligenceTable({ standings, loading }: MarketIntelligenceTableProps) {
  const [sortBy, setSortBy] = useState<SortField>('systemHealth');

  // Sort standings based on selected field
  const sortedStandings = [...standings].sort((a, b) => {
    switch (sortBy) {
      case 'systemHealth':
        return (b.analysis?.sustainabilityScore || 0) - (a.analysis?.sustainabilityScore || 0);
      case 'points':
        return b.points - a.points;
      case 'position':
      default:
        return a.position - b.position;
    }
  });

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <span className="text-white text-sm font-bold">PL</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Hybrid Intelligence Table</h2>
              <p className="text-xs text-slate-500">Live standings merged with xG analytics</p>
            </div>
          </div>
          
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">Sort:</span>
            {(['systemHealth', 'points', 'position'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === option
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {option === 'systemHealth' ? 'Health' : option === 'points' ? 'Pts' : 'Rank'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Column & Sort Explanations */}
      <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800">
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          {/* Column Explanations */}
          <div>
            <h4 className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Table Columns</h4>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-semibold whitespace-nowrap">SYSTEM HEALTH</span>
                <span className="text-slate-400">0-100 score based on xG created minus xG conceded. Higher = better long-term prospects. Elite teams score 75+.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-semibold whitespace-nowrap">FINISHING HEAT</span>
                <span className="text-slate-400">How efficiently a team is converting chances. &quot;Hot&quot; = overperforming (regression risk). &quot;Cold&quot; = underperforming (goals due).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-semibold whitespace-nowrap">ACTION</span>
                <span className="text-slate-400">FPL transfer recommendation combining health + heat. DOMINANT = buy, CRITICAL = avoid, PRIME BUY = undervalued.</span>
              </div>
            </div>
          </div>
          
          {/* Sort Explanations */}
          <div>
            <h4 className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Sort Options</h4>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold">Health</span>
                <span className="text-slate-400">Sort by System Health score — shows structurally best teams first (best xG difference).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">Pts</span>
                <span className="text-slate-400">Sort by league points — shows teams with most points at the top.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">Rank</span>
                <span className="text-slate-400">Sort by league position — shows actual Premier League standings (1st to 20th).</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-3 py-3 text-left font-medium">#</th>
              <th className="px-3 py-3 text-left font-medium">Team</th>
              <th className="px-3 py-3 text-center font-medium">Pts</th>
              <th className="px-4 py-3 text-left font-medium">System Health</th>
              <th className="px-4 py-3 text-left font-medium">Finishing Heat</th>
              <th className="px-3 py-3 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((team) => {
              let positionClass = 'text-slate-400';
              let rowClass = '';
              
              if (team.position <= 4) {
                positionClass = 'text-blue-400';
                rowClass = 'border-l-2 border-l-blue-500';
              } else if (team.position === 5) {
                positionClass = 'text-orange-400';
                rowClass = 'border-l-2 border-l-orange-500';
              } else if (team.position >= 18) {
                positionClass = 'text-rose-400';
                rowClass = 'border-l-2 border-l-rose-500';
              }

              return (
                <tr 
                  key={team.team.id}
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${rowClass}`}
                >
                  {/* Column 1: Rank */}
                  <td className={`px-3 py-4 font-bold text-sm ${positionClass}`}>
                    {team.position}
                  </td>
                  
                  {/* Column 2: Team */}
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <Image
                        src={team.team.crest}
                        alt={team.team.name}
                        width={28}
                        height={28}
                        className="object-contain"
                        unoptimized
                      />
                      <span className="font-medium text-white text-sm">
                        <span className="hidden md:inline">{team.team.shortName}</span>
                        <span className="md:hidden">{team.team.tla}</span>
                      </span>
                    </div>
                  </td>
                  
                  {/* Column 3: Points */}
                  <td className="px-3 py-4 text-center font-bold text-white text-lg">
                    {team.points}
                  </td>
                  
                  {/* Column 4: System Health (Structure Progress Bar) */}
                  <td className="px-4 py-4">
                    {team.analysis ? (
                      <SystemHealthBar score={team.analysis.sustainabilityScore} />
                    ) : (
                      <span className="text-slate-600 text-xs">-</span>
                    )}
                  </td>
                  
                  {/* Column 5: Finishing Heat (Heat Badge) */}
                  <td className="px-4 py-4">
                    {team.analysis ? (
                      <HeatBadge 
                        status={team.analysis.efficiencyStatus} 
                        delta={team.analysis.efficiencyDelta} 
                      />
                    ) : (
                      <span className="text-slate-600 text-xs">-</span>
                    )}
                  </td>
                  
                  {/* Column 6: Action (Market Signal) */}
                  <td className="px-3 py-4 text-center">
                    {team.analysis ? (
                      <ActionBadge verdict={team.analysis.marketVerdict} />
                    ) : (
                      <span className="text-slate-600 text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-slate-800">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          {/* Position Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span className="text-slate-400">UCL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
              <span className="text-slate-400">UEL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span className="text-slate-400">Relegation</span>
            </div>
          </div>
          
          {/* Health Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Elite (75+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-400">Average (45-75)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-400">Weak (&lt;45)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

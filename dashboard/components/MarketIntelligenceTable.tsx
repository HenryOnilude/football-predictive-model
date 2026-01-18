'use client';

import Image from 'next/image';
import { TeamLuckResult } from '@/lib/TeamLuck';

interface StandingWithSentiment {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string | null;
  sentiment: TeamLuckResult | null;
}

interface MarketIntelligenceTableProps {
  standings: StandingWithSentiment[];
  loading?: boolean;
}

function FormBadge({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: 'bg-emerald-500 text-white',
    D: 'bg-slate-500 text-white',
    L: 'bg-rose-500 text-white',
  };
  return (
    <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded ${colors[result] || 'bg-slate-700'}`}>
      {result}
    </span>
  );
}

function SentimentBadge({ sentiment }: { sentiment: TeamLuckResult }) {
  const config: Record<string, { label: string; icon: string; style: string }> = {
    DOUBLE_VALUE: { label: 'DOUBLE VALUE', icon: '💎', style: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    CLEAN_SHEET_CHASER: { label: 'CS CHASER', icon: '🛡️', style: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    GOAL_CHASER: { label: 'GOAL CHASER', icon: '🔫', style: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    AVOID: { label: 'AVOID', icon: '⚠️', style: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    NEUTRAL: { label: 'NEUTRAL', icon: '➡️', style: 'bg-slate-700/50 text-slate-400 border-slate-600' },
  };
  
  const badge = config[sentiment.quadrant] || config.NEUTRAL;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-semibold ${badge.style}`}>
      {badge.icon} {badge.label}
    </span>
  );
}

function LuckIndicator({ value, type }: { value: number; type: 'attack' | 'defense' }) {
  const isGood = type === 'attack' ? value < 0 : value > 0;
  const color = isGood ? 'text-emerald-400' : value === 0 ? 'text-slate-400' : 'text-rose-400';
  const label = type === 'attack' ? 'xG Δ' : 'xGA Δ';
  
  return (
    <div className="text-center">
      <div className={`text-sm font-bold font-mono ${color}`}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}
      </div>
      <div className="text-[9px] text-slate-500">{label}</div>
    </div>
  );
}

export default function MarketIntelligenceTable({ standings, loading }: MarketIntelligenceTableProps) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <span className="text-white text-sm font-bold">PL</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Premier League Standings</h2>
              <p className="text-xs text-slate-500">Live results with Market Sentiment signals</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">●</span>
              <span className="text-slate-400">Undervalued</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400">●</span>
              <span className="text-slate-400">Overvalued</span>
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
              <th className="px-3 py-3 text-center font-medium">P</th>
              <th className="px-3 py-3 text-center font-medium hidden sm:table-cell">W</th>
              <th className="px-3 py-3 text-center font-medium hidden sm:table-cell">D</th>
              <th className="px-3 py-3 text-center font-medium hidden sm:table-cell">L</th>
              <th className="px-3 py-3 text-center font-medium hidden md:table-cell">GF</th>
              <th className="px-3 py-3 text-center font-medium hidden md:table-cell">GA</th>
              <th className="px-3 py-3 text-center font-medium">GD</th>
              <th className="px-3 py-3 text-center font-medium">Pts</th>
              <th className="px-3 py-3 text-center font-medium hidden lg:table-cell">Form</th>
              <th className="px-3 py-3 text-center font-medium">Attack</th>
              <th className="px-3 py-3 text-center font-medium">Defense</th>
              <th className="px-3 py-3 text-center font-medium">Signal</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team) => {
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
                  <td className={`px-3 py-3 font-bold text-sm ${positionClass}`}>
                    {team.position}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src={team.team.crest}
                        alt={team.team.name}
                        width={24}
                        height={24}
                        className="object-contain"
                        unoptimized
                      />
                      <span className="font-medium text-white text-sm">
                        <span className="hidden md:inline">{team.team.shortName}</span>
                        <span className="md:hidden">{team.team.tla}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center text-slate-400 text-sm">{team.playedGames}</td>
                  <td className="px-3 py-3 text-center text-slate-400 text-sm hidden sm:table-cell">{team.won}</td>
                  <td className="px-3 py-3 text-center text-slate-400 text-sm hidden sm:table-cell">{team.draw}</td>
                  <td className="px-3 py-3 text-center text-slate-400 text-sm hidden sm:table-cell">{team.lost}</td>
                  <td className="px-3 py-3 text-center text-slate-400 text-sm hidden md:table-cell">{team.goalsFor}</td>
                  <td className="px-3 py-3 text-center text-slate-400 text-sm hidden md:table-cell">{team.goalsAgainst}</td>
                  <td className={`px-3 py-3 text-center font-medium text-sm ${team.goalDifference > 0 ? 'text-emerald-400' : team.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-white">{team.points}</td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-0.5">
                      {team.form?.split(',').slice(0, 5).map((result: string, i: number) => (
                        <FormBadge key={i} result={result.trim()} />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {team.sentiment ? (
                      <LuckIndicator value={team.sentiment.attackingLuck} type="attack" />
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {team.sentiment ? (
                      <LuckIndicator value={team.sentiment.defensiveLuck} type="defense" />
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {team.sentiment ? (
                      <SentimentBadge sentiment={team.sentiment} />
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
      <div className="px-6 py-3 border-t border-slate-800 flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span>Champions League</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-orange-500" />
          <span>Europa League</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-rose-500" />
          <span>Relegation</span>
        </div>
        <div className="ml-auto flex gap-4">
          <span>💎 Double Value</span>
          <span>🛡️ CS Chaser</span>
          <span>🔫 Goal Chaser</span>
          <span>⚠️ Avoid</span>
        </div>
      </div>
    </div>
  );
}

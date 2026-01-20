'use client';

import Link from 'next/link';
import { MappedPlayer } from '@/lib/fpl-api';

interface FPLPlayerCardsProps {
  title: string;
  subtitle: string;
  players: MappedPlayer[];
  showMore?: string;
}

function getBadgeConfig(badge: MappedPlayer['finishingBadge']) {
  switch (badge) {
    case 'SIEGE':
      return { label: 'SIEGE', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400', description: 'Unlucky - due a haul' };
    case 'SNIPER':
      return { label: 'SNIPER', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400', description: 'Elite finisher' };
    case 'MIRAGE':
      return { label: 'MIRAGE', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400', description: 'Illusion - sell before regression' };
    case 'WASTEFUL':
      return { label: 'WASTEFUL', bgColor: 'bg-rose-500/20', textColor: 'text-rose-400', description: 'Poor shot selection' };
    default:
      return { label: 'FAIR', bgColor: 'bg-slate-500/20', textColor: 'text-slate-400', description: 'Performing as expected' };
  }
}

function getRiskBadge(risk: MappedPlayer['riskLevel']) {
  switch (risk) {
    case 'Critical':
      return { color: 'text-rose-400', bg: 'bg-rose-500/20' };
    case 'High':
      return { color: 'text-amber-400', bg: 'bg-amber-500/20' };
    case 'Moderate':
      return { color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    default:
      return { color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  }
}

export default function FPLPlayerCards({ title, subtitle, players, showMore }: FPLPlayerCardsProps) {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary-color)]">{title}</h3>
          <p className="text-sm text-[var(--text-secondary-color)]">{subtitle}</p>
        </div>
        {showMore && (
          <Link 
            href={showMore}
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            View All <span>→</span>
          </Link>
        )}
      </div>

      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {players.slice(0, 5).map((player) => {
          const badgeConfig = getBadgeConfig(player.finishingBadge);
          const riskConfig = getRiskBadge(player.riskLevel);

          return (
            <div
              key={player.id}
              className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle-color)] p-4 hover:border-[var(--border-card-color)] hover:bg-[var(--bg-surface)] transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[var(--text-primary-color)] truncate">
                    {player.name}
                  </h4>
                  <p className="text-[10px] text-[var(--text-muted-color)]">
                    {player.team} · {player.positionShort}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeConfig.bgColor} ${badgeConfig.textColor}`}>
                  {badgeConfig.label}
                </span>
              </div>

              {/* Price & Points */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-[var(--text-primary-color)]">£{player.price.toFixed(1)}m</p>
                  <p className="text-[10px] text-[var(--text-muted-color)]">{player.totalPoints} pts</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400">{player.form}</p>
                  <p className="text-[10px] text-[var(--text-muted-color)]">Form</p>
                </div>
              </div>

              {/* xG Stats */}
              <div className="grid grid-cols-3 gap-2 text-center mb-3 py-2 bg-[var(--bg-surface)] rounded-lg">
                <div>
                  <p className="text-xs font-mono font-semibold text-slate-400">{player.xG.toFixed(1)}</p>
                  <p className="text-[9px] text-[var(--text-muted-color)]">xG</p>
                </div>
                <div>
                  <p className="text-xs font-mono font-semibold text-emerald-400">{player.goals}</p>
                  <p className="text-[9px] text-[var(--text-muted-color)]">Goals</p>
                </div>
                <div>
                  <p className={`text-xs font-mono font-semibold ${player.goalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {player.goalDelta > 0 ? '+' : ''}{player.goalDelta.toFixed(1)}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted-color)]">Δ</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${riskConfig.bg} ${riskConfig.color}`}>
                  {player.riskLevel} Risk
                </span>
                <span className="text-[10px] text-[var(--text-muted-color)]">
                  {player.selectedBy}% owned
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TeamHealthHeat } from '@/lib/fpl';
import { getEfficiencyBadgeConfig } from '@/lib/TeamAnalysis';

interface MarketMoversRowProps {
  teams: TeamHealthHeat[];
}

export default function MarketMoversRow({ teams }: MarketMoversRowProps) {
  // Get diverse selection based on efficiency status
  // Prioritize interesting patterns: CRITICAL_OVER (hot), COLD (value), CRITICAL_VALUE (extreme value)
  const hot = teams.find(t => t.efficiencyStatus === 'CRITICAL_OVER');
  const cold = teams.find(t => t.efficiencyStatus === 'COLD');
  const extremeValue = teams.find(t => t.efficiencyStatus === 'CRITICAL_VALUE');

  // Fallback to any interesting teams if specific statuses not found
  const topMovers = [hot, cold, extremeValue]
    .filter((t): t is TeamHealthHeat => t !== undefined)
    .slice(0, 3);

  // If we don't have 3 teams, fill with other interesting teams (not SUSTAINABLE)
  if (topMovers.length < 3) {
    const remaining = teams
      .filter(t => !topMovers.includes(t) && t.efficiencyStatus !== 'SUSTAINABLE')
      .slice(0, 3 - topMovers.length);
    topMovers.push(...remaining);
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary-color)]">
            Market Movers
          </h3>
          <p className="text-sm text-[var(--text-secondary-color)]">
            Teams with notable finishing patterns
          </p>
        </div>
        <Link 
          href="/teams" 
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
        >
          See All Cards
          <span>→</span>
        </Link>
      </div>

      {/* Horizontal Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topMovers.map((team) => {
          const badgeConfig = getEfficiencyBadgeConfig(team.efficiencyStatus);

          return (
            <Link
              key={team.id}
              href={`/team/${team.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group"
            >
              <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle-color)] p-4 hover:border-[var(--border-card-color)] hover:bg-[var(--bg-surface)] transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {team.logo && (
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center overflow-hidden">
                        <Image
                          src={team.logo}
                          alt={team.name}
                          width={24}
                          height={24}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text-primary-color)] group-hover:text-emerald-400 transition-colors">
                        {team.name}
                      </h4>
                      <p className="text-[10px] text-[var(--text-muted-color)]">
                        20 matches
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${badgeConfig.bgColor} ${badgeConfig.textColor}`}>
                    {badgeConfig.label}
                  </span>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[var(--text-muted-color)]">xG</span>
                    <span className="font-mono font-semibold text-[var(--text-primary-color)]">{team.totalXG.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-purple-400">PSxG</span>
                    <span className="font-mono font-semibold text-purple-400">{team.avgXGPer90.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400">Goals</span>
                    <span className="font-mono font-semibold text-emerald-400">{team.totalGoals}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[10px] text-[var(--text-muted-color)] mt-2 line-clamp-1">
                  {badgeConfig.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

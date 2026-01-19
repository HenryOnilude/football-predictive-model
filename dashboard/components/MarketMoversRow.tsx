'use client';

import Link from 'next/link';
import Image from 'next/image';
import { demoTeams } from '@/lib/demoData';
import { analyzeTeamPerformance, getFinishingBadgeConfig } from '@/lib/TeamAnalysis';

export default function MarketMoversRow() {
  // Analyze demo teams and pick top 3 most interesting
  const analyzedTeams = demoTeams.map(team => ({
    team,
    analysis: analyzeTeamPerformance(team),
  }));

  // Get diverse selection: SIEGE (unlucky), SNIPER (elite), GHOST (lucky)
  const siege = analyzedTeams.find(t => t.analysis.finishingBadge === 'SIEGE');
  const sniper = analyzedTeams.find(t => t.analysis.finishingBadge === 'SNIPER');
  const ghost = analyzedTeams.find(t => t.analysis.finishingBadge === 'GHOST');

  const topMovers = [siege, sniper, ghost].filter((t): t is { team: typeof demoTeams[0]; analysis: ReturnType<typeof analyzeTeamPerformance> } => t !== undefined).slice(0, 3);

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
        {topMovers.map(({ team, analysis }) => {
          const badgeConfig = getFinishingBadgeConfig(analysis.finishingBadge || 'FAIR');
          
          return (
            <Link 
              key={team.teamId}
              href={`/team/${team.teamName.toLowerCase().replace(/\s+/g, '-')}`}
              className="group"
            >
              <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle-color)] p-4 hover:border-[var(--border-card-color)] hover:bg-[var(--bg-surface)] transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {team.teamLogo && (
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center overflow-hidden">
                        <Image
                          src={team.teamLogo}
                          alt={team.teamName}
                          width={24}
                          height={24}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text-primary-color)] group-hover:text-emerald-400 transition-colors">
                        {team.teamName}
                      </h4>
                      <p className="text-[10px] text-[var(--text-muted-color)]">
                        {team.matchesPlayed} matches
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
                    <span className="font-mono font-semibold text-[var(--text-primary-color)]">{team.xGFor.toFixed(1)}</span>
                  </div>
                  {team.PSxG && (
                    <div className="flex items-center gap-1">
                      <span className="text-purple-400">PSxG</span>
                      <span className="font-mono font-semibold text-purple-400">{team.PSxG.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400">Goals</span>
                    <span className="font-mono font-semibold text-emerald-400">{team.goalsFor}</span>
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

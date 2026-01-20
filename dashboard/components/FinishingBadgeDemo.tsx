'use client';

import { demoTeams, DemoTeam } from '@/lib/demoData';
import { analyzeTeamPerformance, getFinishingBadgeConfig, FinishingBadge } from '@/lib/TeamAnalysis';
import Image from 'next/image';

interface BadgeCardProps {
  team: DemoTeam;
  badge: FinishingBadge;
}

function BadgeCard({ team, badge }: BadgeCardProps) {
  const config = getFinishingBadgeConfig(badge);
  
  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle-color)] p-4 hover:border-[var(--border-card-color)] transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {team.teamLogo && (
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center overflow-hidden">
            <Image
              src={team.teamLogo}
              alt={team.teamName}
              width={32}
              height={32}
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-[var(--text-primary-color)]">{team.teamName}</h4>
          <p className="text-xs text-[var(--text-muted-color)]">{team.matchesPlayed} matches</p>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${config.bgColor} ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-[var(--bg-surface)]">
          <div className="text-lg font-bold text-[var(--text-primary-color)] font-mono">{team.xGFor.toFixed(1)}</div>
          <div className="text-[10px] text-[var(--text-muted-color)] uppercase">xG</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-[var(--bg-surface)]">
          <div className="text-lg font-bold text-purple-400 font-mono">{team.PSxG?.toFixed(1)}</div>
          <div className="text-[10px] text-[var(--text-muted-color)] uppercase">PSxG</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-[var(--bg-surface)]">
          <div className="text-lg font-bold text-emerald-400 font-mono">{team.goalsFor}</div>
          <div className="text-[10px] text-[var(--text-muted-color)] uppercase">Goals</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--text-secondary-color)] leading-relaxed">
        {config.description}
      </p>

      {/* Technical Reason (collapsed by default) */}
      <details className="mt-3">
        <summary className="text-[10px] text-[var(--text-muted-color)] cursor-pointer hover:text-[var(--text-secondary-color)]">
          Why this badge?
        </summary>
        <p className="text-[10px] text-[var(--text-muted-color)] mt-2 pl-2 border-l-2 border-[var(--border-subtle-color)]">
          {team.badgeReason}
        </p>
      </details>
    </div>
  );
}

export default function FinishingBadgeDemo() {
  // Analyze demo teams to get their finishing badges
  const analyzedTeams = demoTeams.map(team => ({
    team,
    analysis: analyzeTeamPerformance(team),
  }));

  return (
    <div className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-[var(--text-primary-color)] tracking-tight mb-1">
            PSxG Finishing Analysis
          </h3>
          <p className="text-sm text-[var(--text-secondary-color)]">
            Advanced shot quality badges using Post-Shot Expected Goals
          </p>
        </div>
        <span className="px-3 py-1 bg-purple-600/20 border border-purple-600/40 text-purple-400 text-xs font-medium rounded-full">
          DEMO DATA
        </span>
      </div>

      {/* Badge Legend */}
      <div className="mb-6 p-4 bg-[var(--bg-card)] border border-[var(--border-subtle-color)] rounded-xl">
        <h4 className="text-xs font-semibold text-[var(--text-secondary-color)] uppercase tracking-wider mb-3">
          Badge Types
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-purple-600 text-white font-bold">SIEGE</span>
            <span className="text-[var(--text-muted-color)]">Unlucky</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-emerald-600 text-white font-bold">SNIPER</span>
            <span className="text-[var(--text-muted-color)]">Elite</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-slate-600 text-white font-bold">FAIR</span>
            <span className="text-[var(--text-muted-color)]">Expected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-amber-600 text-white font-bold">WASTEFUL</span>
            <span className="text-[var(--text-muted-color)]">Bad shots</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-rose-600 text-white font-bold">MIRAGE</span>
            <span className="text-[var(--text-muted-color)]">Illusion</span>
          </div>
        </div>
      </div>

      {/* Demo Team Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {analyzedTeams.map(({ team, analysis }) => (
          <BadgeCard 
            key={team.teamId} 
            team={team} 
            badge={analysis.finishingBadge || 'FAIR'} 
          />
        ))}
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--bg-card)] border border-[var(--border-subtle-color)] rounded-xl">
        <h4 className="text-sm font-semibold text-[var(--text-primary-color)] mb-3">How PSxG Works</h4>
        <div className="grid md:grid-cols-3 gap-4 text-xs text-[var(--text-secondary-color)]">
          <div>
            <span className="font-semibold text-[var(--text-primary-color)]">xG (Expected Goals)</span>
            <p className="mt-1">Measures chance quality based on shot location, angle, and type.</p>
          </div>
          <div>
            <span className="font-semibold text-purple-400">PSxG (Post-Shot xG)</span>
            <p className="mt-1">Measures shot quality AFTER the shot is taken — placement, power, accuracy.</p>
          </div>
          <div>
            <span className="font-semibold text-emerald-400">The Insight</span>
            <p className="mt-1">Comparing xG → PSxG → Goals reveals if a team is unlucky, skilled, or wasteful.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

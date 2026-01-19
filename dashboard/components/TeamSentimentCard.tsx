'use client';

import { TeamLuckResult } from '@/lib/TeamLuck';
import Image from 'next/image';

interface TeamSentimentCardProps {
  team: TeamLuckResult;
}

export default function TeamSentimentCard({ team }: TeamSentimentCardProps) {
  // Attack badge colors
  const getAttackBadgeStyle = () => {
    if (team.attackVerdict === 'TARGET_ATTACKERS') {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
    if (team.attackVerdict === 'AVOID_ATTACKERS') {
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
    return 'bg-slate-700/50 text-slate-400 border-slate-600';
  };

  // Defense badge colors
  const getDefenseBadgeStyle = () => {
    if (team.defenseVerdict === 'BUY_DEFENSE') {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
    if (team.defenseVerdict === 'AVOID_DEFENSE') {
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
    return 'bg-slate-700/50 text-slate-400 border-slate-600';
  };

  // Quadrant badge
  const getQuadrantBadge = () => {
    switch (team.quadrant) {
      case 'DOUBLE_VALUE':
        return { label: 'DOUBLE VALUE', icon: '', style: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'CLEAN_SHEET_CHASER':
        return { label: 'CS CHASER', icon: '', style: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'GOAL_CHASER':
        return { label: 'GOAL CHASER', icon: '', style: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      case 'AVOID':
        return { label: 'AVOID', icon: '', style: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
      default:
        return { label: 'NEUTRAL', icon: '', style: 'bg-slate-700/50 text-slate-400 border-slate-600' };
    }
  };

  const quadrantBadge = getQuadrantBadge();

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle-color)] overflow-hidden hover:border-[var(--border-card-color)] transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle-color)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {team.logo ? (
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center overflow-hidden">
              <Image
                src={team.logo}
                alt={team.teamName}
                width={32}
                height={32}
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--text-muted-color)]">{team.teamShort}</span>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary-color)]">{team.teamName}</h3>
            <p className="text-xs text-[var(--text-muted-color)]">{team.matchesPlayed} matches</p>
          </div>
        </div>
        
        {/* Quadrant Badge */}
        <div className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${quadrantBadge.style}`}>
          {quadrantBadge.icon} {quadrantBadge.label}
        </div>
      </div>

      {/* Two Sections: Defense & Attack */}
      <div className="grid grid-cols-2 divide-x divide-[var(--border-subtle-color)]">
        {/* Section A: Defense */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wide">Defensive Stability</span>
          </div>
          
          {/* xGA Delta */}
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono ${
                team.defensiveLuck > 0 ? 'text-emerald-400' : team.defensiveLuck < 0 ? 'text-rose-400' : 'text-slate-300'
              }`}>
                {team.defensiveLuck > 0 ? '+' : ''}{team.defensiveLuck.toFixed(1)}
              </span>
              <span className="text-xs text-[var(--text-muted-color)]">xGA Δ</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted-color)] mt-1">
              <span>{team.goalsAgainst} GA</span>
              <span>•</span>
              <span>{team.xGAgainst.toFixed(1)} xGA</span>
            </div>
          </div>
          
          {/* Defense Badge */}
          <div className={`inline-flex px-2.5 py-1.5 rounded-md border text-xs font-semibold ${getDefenseBadgeStyle()}`}>
             {team.defenseLabel}
          </div>
          
          <p className="text-xs text-[var(--text-muted-color)] mt-2 leading-relaxed">
            {team.defenseDescription}
          </p>
        </div>

        {/* Section B: Attack */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wide">Attacking Threat</span>
          </div>
          
          {/* xG Delta */}
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono ${
                team.attackingLuck < 0 ? 'text-emerald-400' : team.attackingLuck > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}>
                {team.attackingLuck > 0 ? '+' : ''}{team.attackingLuck.toFixed(1)}
              </span>
              <span className="text-xs text-[var(--text-muted-color)]">xG Δ</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted-color)] mt-1">
              <span>{team.goalsFor} GF</span>
              <span>•</span>
              <span>{team.xGFor.toFixed(1)} xG</span>
            </div>
          </div>
          
          {/* Attack Badge */}
          <div className={`inline-flex px-2.5 py-1.5 rounded-md border text-xs font-semibold ${getAttackBadgeStyle()}`}>
             {team.attackLabel}
          </div>
          
          <p className="text-xs text-[var(--text-muted-color)] mt-2 leading-relaxed">
            {team.attackDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

// Export demo data for testing
export const demoTeamLuckData: TeamLuckResult[] = [
  {
    teamId: 1,
    teamName: 'Manchester City',
    teamShort: 'MCI',
    logo: '',
    attackingLuck: -4.2,
    attackVerdict: 'TARGET_ATTACKERS',
    attackLabel: 'EXPLOSIVE',
    attackDescription: 'Significantly underperforming xG. Attackers are due goals.',
    defensiveLuck: 2.8,
    defenseVerdict: 'BUY_DEFENSE',
    defenseLabel: 'UNDERVALUED',
    defenseDescription: 'Slightly unlucky defensively. Good value in defenders.',
    quadrant: 'DOUBLE_VALUE',
    goalsFor: 32,
    goalsAgainst: 18,
    xGFor: 36.2,
    xGAgainst: 15.2,
    matchesPlayed: 18,
  },
  {
    teamId: 2,
    teamName: 'Arsenal',
    teamShort: 'ARS',
    logo: '',
    attackingLuck: 3.5,
    attackVerdict: 'AVOID_ATTACKERS',
    attackLabel: 'COOLDOWN',
    attackDescription: 'Overperforming xG. Scoring unsustainably.',
    defensiveLuck: -4.1,
    defenseVerdict: 'AVOID_DEFENSE',
    defenseLabel: 'FRAGILE',
    defenseDescription: 'Keepers saving them. Defense overvalued.',
    quadrant: 'AVOID',
    goalsFor: 38,
    goalsAgainst: 12,
    xGFor: 34.5,
    xGAgainst: 16.1,
    matchesPlayed: 18,
  },
];

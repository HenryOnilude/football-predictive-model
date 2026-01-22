'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronDown } from 'lucide-react';
import {
  TeamAnalysis,
  getEfficiencyBadgeConfig,
  getSustainabilityColor,
  getVerdictConfig,
} from '@/lib/TeamAnalysis';

interface TeamMatrixProps {
  teams: TeamAnalysis[];
}

interface InsightModalProps {
  team: TeamAnalysis;
  onClose: () => void;
}

function InsightModal({ team, onClose }: InsightModalProps) {
  const verdictConfig = getVerdictConfig(team.marketVerdict);
  const efficiencyConfig = getEfficiencyBadgeConfig(team.efficiencyStatus);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            {team.teamLogo && (
              <Image
                src={team.teamLogo}
                alt={team.teamName}
                width={48}
                height={48}
                className="object-contain"
                unoptimized
              />
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{team.teamName}</h2>
              <p className={`text-sm font-semibold ${verdictConfig.color}`}>
                {verdictConfig.icon} {verdictConfig.label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Chance Creation Grade */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Chance Creation</p>
            <p className="text-white text-lg font-semibold">
              Creating <span className="text-emerald-400">{team.chanceGrade}</span> chances per game
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Net xG/90: {team.netXGPer90 > 0 ? '+' : ''}{team.netXGPer90}
            </p>
          </div>

          {/* Efficiency Status */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-2">Current Form</p>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-md font-mono text-sm font-bold ${efficiencyConfig.bgColor} ${efficiencyConfig.textColor}`}>
                {efficiencyConfig.label}
              </span>
              <span className="text-slate-400 text-sm">
                ({team.efficiencyDelta > 0 ? '+' : ''}{team.efficiencyDelta} goal diff)
              </span>
            </div>
          </div>

          {/* Insight Note */}
          <div className={`rounded-xl p-4 ${
            team.marketVerdict === 'PRIME_BUY' ? 'bg-purple-900/30 border border-purple-700' :
            team.marketVerdict === 'OVERHEATED' ? 'bg-orange-900/30 border border-orange-700' :
            team.marketVerdict === 'ENTERTAINERS' ? 'bg-amber-900/30 border border-amber-700' :
            team.marketVerdict === 'CRITICAL' ? 'bg-red-900/30 border border-red-700' :
            team.marketVerdict === 'DOMINANT' ? 'bg-emerald-900/30 border border-emerald-700' :
            'bg-slate-800/50'
          }`}>
            <p className="text-white font-medium">{team.insightNote}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs uppercase tracking-wide">Structure Score</p>
              <p className="text-2xl font-bold text-white">{team.sustainabilityScore}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs uppercase tracking-wide">Efficiency Delta</p>
              <p className={`text-2xl font-bold ${team.efficiencyDelta > 0 ? 'text-rose-400' : team.efficiencyDelta < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {team.efficiencyDelta > 0 ? '+' : ''}{team.efficiencyDelta}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamMatrix({ teams }: TeamMatrixProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamAnalysis | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'sustainability' | 'efficiency' | 'verdict'>('sustainability');

  const sortedTeams = [...teams].sort((a, b) => {
    switch (sortBy) {
      case 'sustainability':
        return b.sustainabilityScore - a.sustainabilityScore;
      case 'efficiency':
        return b.efficiencyDelta - a.efficiencyDelta;
      case 'verdict':
        const verdictOrder = ['DOMINANT', 'PRIME_BUY', 'ENTERTAINERS', 'STABLE', 'FRAGILE', 'OVERHEATED', 'CRITICAL'];
        return verdictOrder.indexOf(a.marketVerdict) - verdictOrder.indexOf(b.marketVerdict);
      default:
        return 0;
    }
  });

  const handleRowClick = (team: TeamAnalysis) => {
    // On mobile, toggle expanded row; on desktop, open modal
    if (window.innerWidth < 768) {
      setExpandedTeam(expandedTeam === team.teamId ? null : team.teamId);
    } else {
      setSelectedTeam(team);
    }
  };

  return (
    <>
      {/* Sort Controls */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <span className="text-slate-500 text-sm py-2 shrink-0">Sort:</span>
        {(['sustainability', 'efficiency', 'verdict'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors shrink-0 min-h-[44px] min-w-[44px] ${
              sortBy === option
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {option === 'sustainability' ? 'Structure' : option === 'efficiency' ? 'Form' : 'Verdict'}
          </button>
        ))}
      </div>

      {/* Matrix Table - BBC Sport Style Sticky */}
      <div className="relative bg-slate-900/50 rounded-xl border border-slate-800">
        {/* Scroll shadow indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10 md:hidden rounded-r-xl" />
        
        <div className="overflow-x-auto">
          <table className="w-max min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                {/* Sticky Team Header */}
                <th className="sticky left-0 z-20 bg-slate-900 text-left py-3 px-3 md:px-4 text-slate-400 font-medium text-xs md:text-sm min-w-[140px] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-slate-700/50">
                  Team
                </th>
                <th className="text-right py-3 px-3 md:px-4 text-slate-400 font-medium text-xs md:text-sm whitespace-nowrap">Score</th>
                <th className="text-left py-3 px-3 md:px-4 text-slate-400 font-medium text-xs md:text-sm hidden md:table-cell">Structure</th>
                <th className="text-left py-3 px-3 md:px-4 text-slate-400 font-medium text-xs md:text-sm">Form</th>
                <th className="text-left py-3 px-3 md:px-4 text-slate-400 font-medium text-xs md:text-sm hidden sm:table-cell">Verdict</th>
                {/* Mobile expand indicator */}
                <th className="md:hidden w-8"></th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team) => {
                const efficiencyConfig = getEfficiencyBadgeConfig(team.efficiencyStatus);
                const verdictConfig = getVerdictConfig(team.marketVerdict);
                const sustainabilityColor = getSustainabilityColor(team.sustainabilityScore);
                const isExpanded = expandedTeam === team.teamId;

                return (
                  <>
                    <tr
                      key={team.teamId}
                      onClick={() => handleRowClick(team)}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                    >
                      {/* Sticky Team Column */}
                      <td className="sticky left-0 z-20 bg-slate-900 py-3 px-3 md:px-4 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-slate-700/50">
                        <div className="flex items-center gap-2 md:gap-3">
                          {team.teamLogo && (
                            <Image
                              src={team.teamLogo}
                              alt={team.teamName}
                              width={24}
                              height={24}
                              className="object-contain md:w-8 md:h-8"
                              unoptimized
                            />
                          )}
                          <span className="text-white font-medium text-xs md:text-sm truncate max-w-[80px] md:max-w-none">
                            {team.teamName}
                          </span>
                        </div>
                      </td>

                      {/* Score - Right aligned for financial style */}
                      <td className="py-3 px-3 md:px-4 text-right tabular-nums">
                        <span className="text-white font-mono text-xs md:text-sm font-bold">
                          {team.sustainabilityScore}
                        </span>
                      </td>

                      {/* Structure Bar - Hidden on mobile */}
                      <td className="py-3 px-3 md:px-4 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${sustainabilityColor} transition-all duration-300`}
                              style={{ width: `${team.sustainabilityScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Form Badge */}
                      <td className="py-3 px-3 md:px-4">
                        <span className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded font-mono text-[10px] md:text-xs font-bold ${efficiencyConfig.bgColor} ${efficiencyConfig.textColor}`}>
                          {efficiencyConfig.label}
                        </span>
                      </td>

                      {/* Verdict - Hidden on small mobile */}
                      <td className="py-3 px-3 md:px-4 hidden sm:table-cell">
                        <span className={`font-bold text-xs md:text-sm ${verdictConfig.color}`}>
                          {verdictConfig.icon && <span className="mr-1">{verdictConfig.icon}</span>}
                          <span className="hidden lg:inline">{verdictConfig.label}</span>
                        </span>
                      </td>

                      {/* Mobile expand indicator */}
                      <td className="md:hidden px-2 py-3 text-slate-500">
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </td>
                    </tr>

                    {/* Expanded Row - Mobile Only */}
                    {isExpanded && (
                      <tr key={`${team.teamId}-expanded`} className="md:hidden bg-slate-800/40 border-b border-slate-700/50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="space-y-3">
                            {/* Verdict on mobile */}
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 text-xs">Verdict</span>
                              <span className={`font-bold text-sm ${verdictConfig.color}`}>
                                {verdictConfig.icon} {verdictConfig.label}
                              </span>
                            </div>
                            {/* Structure bar on mobile */}
                            <div>
                              <span className="text-slate-400 text-xs block mb-1">Health Structure</span>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${sustainabilityColor} transition-all duration-300`}
                                  style={{ width: `${team.sustainabilityScore}%` }}
                                />
                              </div>
                            </div>
                            {/* Efficiency Delta */}
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 text-xs">Goal Delta</span>
                              <span className={`font-mono font-bold text-sm ${team.efficiencyDelta > 0 ? 'text-rose-400' : team.efficiencyDelta < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {team.efficiencyDelta > 0 ? '+' : ''}{team.efficiencyDelta}
                              </span>
                            </div>
                            {/* Insight */}
                            <p className="text-slate-300 text-xs leading-relaxed">
                              {team.insightNote}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Modal - Desktop Only */}
      {selectedTeam && (
        <InsightModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </>
  );
}

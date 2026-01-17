'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
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
            team.marketVerdict === 'OVERHEATED' ? 'bg-amber-900/30 border border-amber-700' :
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
  const [sortBy, setSortBy] = useState<'sustainability' | 'efficiency' | 'verdict'>('sustainability');

  const sortedTeams = [...teams].sort((a, b) => {
    switch (sortBy) {
      case 'sustainability':
        return b.sustainabilityScore - a.sustainabilityScore;
      case 'efficiency':
        return b.efficiencyDelta - a.efficiencyDelta;
      case 'verdict':
        const verdictOrder = ['DOMINANT', 'PRIME_BUY', 'STABLE', 'FRAGILE', 'OVERHEATED', 'CRITICAL'];
        return verdictOrder.indexOf(a.marketVerdict) - verdictOrder.indexOf(b.marketVerdict);
      default:
        return 0;
    }
  });

  return (
    <>
      {/* Sort Controls */}
      <div className="flex gap-2 mb-4">
        <span className="text-slate-500 text-sm py-2">Sort by:</span>
        {(['sustainability', 'efficiency', 'verdict'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === option
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {option === 'sustainability' ? 'Structure' : option === 'efficiency' ? 'Form' : 'Verdict'}
          </button>
        ))}
      </div>

      {/* Matrix Table */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Team</th>
              <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Structure</th>
              <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Form</th>
              <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team) => {
              const efficiencyConfig = getEfficiencyBadgeConfig(team.efficiencyStatus);
              const verdictConfig = getVerdictConfig(team.marketVerdict);
              const sustainabilityColor = getSustainabilityColor(team.sustainabilityScore);

              return (
                <tr
                  key={team.teamId}
                  onClick={() => setSelectedTeam(team)}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  {/* Col 1: Team */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {team.teamLogo && (
                        <Image
                          src={team.teamLogo}
                          alt={team.teamName}
                          width={32}
                          height={32}
                          className="object-contain"
                          unoptimized
                        />
                      )}
                      <span className="text-white font-medium">{team.teamName}</span>
                    </div>
                  </td>

                  {/* Col 2: Structure (Progress Bar) */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${sustainabilityColor} transition-all duration-300`}
                          style={{ width: `${team.sustainabilityScore}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-sm font-mono w-8">
                        {team.sustainabilityScore}
                      </span>
                    </div>
                  </td>

                  {/* Col 3: Form (Efficiency Badge) */}
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${efficiencyConfig.bgColor} ${efficiencyConfig.textColor}`}>
                      {efficiencyConfig.label}
                    </span>
                  </td>

                  {/* Col 4: Verdict */}
                  <td className="py-4 px-4">
                    <span className={`font-bold ${verdictConfig.color}`}>
                      {verdictConfig.icon && <span className="mr-1">{verdictConfig.icon}</span>}
                      {verdictConfig.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Insight Modal */}
      {selectedTeam && (
        <InsightModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </>
  );
}

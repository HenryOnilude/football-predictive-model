'use client';

import { useState } from 'react';
import { TeamData } from '@/lib/types';
import RiskBadge from './RiskBadge';
import Link from 'next/link';

interface LeagueTableProps {
  teams: TeamData[];
}

type SortField = keyof TeamData;
type SortDirection = 'asc' | 'desc';

export default function LeagueTable({ teams }: LeagueTableProps) {
  const [sortField, setSortField] = useState<SortField>('Position_Actual');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filter, setFilter] = useState<string>('all');

  // Sort teams
  const sortedTeams = [...teams].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  // Filter teams
  const filteredTeams = sortedTeams.filter(team => {
    if (filter === 'all') return true;
    if (filter === 'high-risk') return team.Risk_Score >= 70;
    if (filter === 'overperforming') return team.Variance > 3;
    if (filter === 'underperforming') return team.Variance < -3;
    return true;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors group"
    >
      {children}
      {sortField === field && (
        <span className="text-indigo-600">
          {sortDirection === 'asc' ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </span>
      )}
      {sortField !== field && (
        <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
          </svg>
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Filter section */}
      <div className="flex items-center justify-between card p-5">
        <div className="flex items-center gap-4">
          <label htmlFor="filter" className="text-sm font-medium text-slate-700">
            View:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="all">All Teams ({teams.length})</option>
            <option value="high-risk">High Risk</option>
            <option value="overperforming">Overperforming (Var &gt; +3)</option>
            <option value="underperforming">Underperforming (Var &lt; -3)</option>
          </select>
        </div>
        <span className="text-sm text-slate-500">
          {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <SortButton field="Position_Actual">Pos</SortButton>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <SortButton field="Team">Team</SortButton>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <SortButton field="Matches">MP</SortButton>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <SortButton field="Actual_Points">Pts</SortButton>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <SortButton field="xPTS">xPTS</SortButton>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <SortButton field="Variance">Var</SortButton>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <SortButton field="Risk_Score">Risk</SortButton>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => (
                <tr
                  key={team.Team}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      <span className="text-sm font-semibold text-slate-700">{team.Position_Actual}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Link
                      href={`/team/${team.Team.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {team.Team}
                    </Link>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 text-center font-medium">
                    {team.Matches}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-slate-900">
                      {team.Actual_Points}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 text-center font-medium">
                    {team.xPTS.toFixed(1)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                      team.Variance > 3 ? 'bg-red-100 text-red-700' :
                      team.Variance < -3 ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {team.Variance > 0 ? '+' : ''}{team.Variance.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-slate-900">
                      {team.Risk_Score}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <RiskBadge riskCategory={team.Risk_Category} riskScore={team.Risk_Score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-6 bg-slate-50/50">
        <h4 className="text-sm font-semibold text-slate-900 mb-4 tracking-tight">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500">MP</span>
            <p className="text-slate-700 font-medium">Matches Played</p>
          </div>
          <div>
            <span className="text-slate-500">Pts</span>
            <p className="text-slate-700 font-medium">Actual Points</p>
          </div>
          <div>
            <span className="text-slate-500">xPTS</span>
            <p className="text-slate-700 font-medium">Expected Points</p>
            <p className="text-xs text-slate-500 mt-1">Based on chance quality</p>
          </div>
          <div>
            <span className="text-slate-500">Var</span>
            <p className="text-slate-700 font-medium">Variance</p>
            <p className="text-xs text-slate-500 mt-1">Pts - xPTS difference</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Risk Categories:</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-slate-600">Critical (90-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-slate-600">High (70-89)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-slate-600">Moderate (40-69)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-slate-600">Low (0-39)</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Variance Interpretation:</p>
            <div className="text-xs text-slate-600 space-y-1">
              <p><span className="inline-block w-12 text-red-600 font-semibold">+3 or more:</span> Overperforming (results better than performance) - regression risk</p>
              <p><span className="inline-block w-12 text-blue-600 font-semibold">-3 or less:</span> Underperforming (unlucky) - natural improvement likely</p>
              <p><span className="inline-block w-12 text-slate-600 font-semibold">-2 to +2:</span> Performing as expected - results match underlying metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

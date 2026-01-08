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
      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
    >
      {children}
      {sortField === field && (
        <span className="text-blue-600">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Filter dropdown */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
        <label htmlFor="filter" className="font-semibold text-gray-700">
          Filter:
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Show All ({teams.length})</option>
          <option value="high-risk">High Risk Only</option>
          <option value="overperforming">Overperforming (Variance &gt; +3)</option>
          <option value="underperforming">Underperforming (Variance &lt; -3)</option>
        </select>
        <span className="text-sm text-gray-600">
          Showing {filteredTeams.length} of {teams.length} teams
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="Position_Actual">Pos</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="Team">Team</SortButton>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="Matches">MP</SortButton>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="Actual_Points">Pts</SortButton>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="xPTS">xPTS</SortButton>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="Variance">Var</SortButton>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="Risk_Score">Risk</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeams.map((team) => (
                <tr
                  key={team.Team}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {team.Position_Actual}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/team/${team.Team.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {team.Team}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {team.Matches}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                    {team.Actual_Points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {team.xPTS.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`font-semibold ${
                      team.Variance > 3 ? 'text-red-600' :
                      team.Variance < -3 ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {team.Variance > 0 ? '+' : ''}{team.Variance.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-bold">
                    {team.Risk_Score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RiskBadge riskCategory={team.Risk_Category} riskScore={team.Risk_Score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow text-sm text-gray-600">
        <p className="font-semibold mb-2">Legend:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div><strong>MP:</strong> Matches Played</div>
          <div><strong>Pts:</strong> Actual Points</div>
          <div><strong>xPTS:</strong> Expected Points (from xG)</div>
          <div><strong>Var:</strong> Variance (Actual - Expected)</div>
          <div className="md:col-span-2">
            <strong>Risk:</strong> 🔴 Critical (90-100) | 🟠 High (70-89) | 🟡 Moderate (40-69) | 🟢 Low (0-39)
          </div>
        </div>
      </div>
    </div>
  );
}

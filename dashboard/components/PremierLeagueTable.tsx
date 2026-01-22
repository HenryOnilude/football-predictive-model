'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TeamStanding {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface StandingsData {
  competition: { name: string };
  season: { currentMatchday: number };
  standings: Array<{ table: TeamStanding[] }>;
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

export default function PremierLeagueTable() {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [matchday, setMatchday] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStandings() {
      try {
        setLoading(true);
        
        // Fetch from our standings API route
        const response = await fetch('/api/standings');
        if (!response.ok) {
          throw new Error('Failed to fetch standings');
        }
        
        const data: StandingsData = await response.json();
        
        // Get the main league table (TOTAL standings)
        const table = data.standings?.[0]?.table || [];
        setStandings(table);
        setMatchday(data.season?.currentMatchday || 0);
      } catch (err) {
        console.error('Failed to fetch standings:', err);
        setError('Failed to load standings');
      } finally {
        setLoading(false);
      }
    }
    
    loadStandings();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
            <span className="text-white text-sm font-bold">PL</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Premier League Table</h2>
            <p className="text-xs text-slate-500">2025-26 Season • Matchday {matchday}</p>
          </div>
        </div>
      </div>

      {/* Table - BBC Sport Style Sticky */}
      <div className="relative">
        {/* Scroll shadow indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10 md:hidden" />
        
        <div className="overflow-x-auto">
          <table className="w-max min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                {/* Sticky Position + Team columns */}
                <th className="sticky left-0 z-20 bg-slate-900 px-2 md:px-4 py-3 text-left font-medium w-8">#</th>
                <th className="sticky left-8 z-20 bg-slate-900 px-2 md:px-4 py-3 text-left font-medium min-w-[100px] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-slate-700/50">Team</th>
                <th className="px-2 md:px-4 py-3 text-right font-medium">P</th>
                <th className="px-2 md:px-4 py-3 text-right font-medium hidden sm:table-cell">W</th>
                <th className="px-2 md:px-4 py-3 text-right font-medium hidden sm:table-cell">D</th>
                <th className="px-2 md:px-4 py-3 text-right font-medium hidden sm:table-cell">L</th>
                <th className="px-2 md:px-4 py-3 text-right font-medium hidden md:table-cell">GF</th>
                <th className="px-2 md:px-4 py-3 text-right font-medium hidden md:table-cell">GA</th>
                <th className="px-2 md:px-4 py-3 text-right font-medium">GD</th>
                <th className="px-2 md:px-4 py-3 text-right font-medium">Pts</th>
                <th className="px-2 md:px-4 py-3 text-center font-medium hidden lg:table-cell">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team) => {
                // Position styling
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
                    {/* Sticky Position */}
                    <td className={`sticky left-0 z-20 bg-slate-900 px-2 md:px-4 py-3 font-bold text-xs md:text-sm ${positionClass}`}>
                      {team.position}
                    </td>
                    {/* Sticky Team */}
                    <td className="sticky left-8 z-20 bg-slate-900 px-2 md:px-4 py-3 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-slate-700/50">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Image
                          src={team.team.crest}
                          alt={team.team.name}
                          width={20}
                          height={20}
                          className="object-contain md:w-6 md:h-6"
                          unoptimized
                        />
                        <span className="font-medium text-white text-xs md:text-sm truncate max-w-[60px] md:max-w-none">
                          <span className="hidden md:inline">{team.team.name}</span>
                          <span className="md:hidden">{team.team.tla}</span>
                        </span>
                      </div>
                    </td>
                    {/* Right-aligned numeric columns for financial typography */}
                    <td className="px-2 md:px-4 py-3 text-right text-slate-400 text-xs md:text-sm tabular-nums">{team.playedGames}</td>
                    <td className="px-2 md:px-4 py-3 text-right text-slate-400 text-xs md:text-sm tabular-nums hidden sm:table-cell">{team.won}</td>
                    <td className="px-2 md:px-4 py-3 text-right text-slate-400 text-xs md:text-sm tabular-nums hidden sm:table-cell">{team.draw}</td>
                    <td className="px-2 md:px-4 py-3 text-right text-slate-400 text-xs md:text-sm tabular-nums hidden sm:table-cell">{team.lost}</td>
                    <td className="px-2 md:px-4 py-3 text-right text-slate-400 text-xs md:text-sm tabular-nums hidden md:table-cell">{team.goalsFor}</td>
                    <td className="px-2 md:px-4 py-3 text-right text-slate-400 text-xs md:text-sm tabular-nums hidden md:table-cell">{team.goalsAgainst}</td>
                    <td className={`px-2 md:px-4 py-3 text-right font-medium text-xs md:text-sm tabular-nums ${team.goalDifference > 0 ? 'text-emerald-400' : team.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                    </td>
                    <td className="px-2 md:px-4 py-3 text-right font-bold text-white text-xs md:text-sm tabular-nums">{team.points}</td>
                    <td className="px-2 md:px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {team.form?.split(',').slice(0, 5).map((result: string, i: number) => (
                          <FormBadge key={i} result={result} />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
      </div>
    </div>
  );
}

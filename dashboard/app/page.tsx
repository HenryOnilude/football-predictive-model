import DeepDiveLinks from '@/components/DeepDiveLinks';
import FPLPlayerCards from '@/components/FPLPlayerCards';
import { getTopPerformers, getAllTeams, MappedTeamStats } from '@/lib/fpl-api';
import Link from 'next/link';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function HomePage() {
  let playerData;
  let teamData;
  let error: string | null = null;

  try {
    [playerData, teamData] = await Promise.all([
      getTopPerformers(10),
      getAllTeams()
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load FPL data';
  }

  if (error || !playerData || !teamData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Error Loading Live Data</h2>
          <p className="text-rose-300">
            {error || 'Unable to fetch data from the FPL API.'}
          </p>
          <p className="mt-4 text-sm text-slate-400">
            The Fantasy Premier League API may be temporarily unavailable. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Calculate team-level stats
  const teamsWithStats = teamData.teams.map((team: MappedTeamStats) => ({
    ...team,
    riskLevel: Math.abs(team.goalDelta) >= 5 ? 'Critical' : 
               Math.abs(team.goalDelta) >= 3 ? 'High' : 
               Math.abs(team.goalDelta) >= 1.5 ? 'Moderate' : 'Low'
  }));
  
  const highRiskCount = teamsWithStats.filter(t => t.riskLevel === 'Critical' || t.riskLevel === 'High').length;
  const overperformingCount = teamsWithStats.filter(t => t.goalDelta > 3).length;
  const underperformingCount = teamsWithStats.filter(t => t.goalDelta < -3).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-semibold text-white mb-3 tracking-tight">
              Performance Analysis
            </h2>
            <p className="text-slate-400 text-lg">
              Identifying regression risk using Expected Goals (xG) data
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Gameweek {playerData.currentGameweek}</p>
              <p className="text-sm font-medium text-emerald-400">
                Live Data · {new Date(playerData.lastUpdated).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="card p-6 hover:border-slate-600 transition-colors">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Total Teams</div>
          <div className="text-4xl font-semibold text-white">{teamData.teams.length}</div>
        </div>
        <div className="card p-6 bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50 transition-colors">
          <div className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-2">High Risk</div>
          <div className="text-4xl font-semibold text-rose-400">{highRiskCount}</div>
          <div className="text-xs text-rose-400/70 mt-2">Risk Score ≥ 70</div>
        </div>
        <div className="card p-6 bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50 transition-colors">
          <div className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">Overperforming</div>
          <div className="text-4xl font-semibold text-orange-400">{overperformingCount}</div>
          <div className="text-xs text-orange-400/70 mt-2">Variance &gt; +3</div>
        </div>
        <div className="card p-6 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Underperforming</div>
          <div className="text-4xl font-semibold text-emerald-400">{underperformingCount}</div>
          <div className="text-xs text-emerald-400/70 mt-2">Variance &lt; -3</div>
        </div>
      </div>

      {/* Understanding the Analysis */}
      <div className="card bg-slate-800/50 p-8 mb-6 border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-5 tracking-tight">Understanding the Analysis</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">Expected Goals (xG)</h4>
              <p className="text-slate-300">
                A measure of shot quality. A close-range shot might have 0.8 xG (80% chance of scoring),
                while a long-distance effort has 0.05 xG (5% chance). Teams creating high-quality chances have high xG.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Expected Points (xPTS)</h4>
              <p className="text-slate-300">
                How many points a team SHOULD have based on their xG. Calculated using mathematical models (Poisson distribution)
                that convert chance quality into win/draw/loss probabilities, then into expected points.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Variance</h4>
              <p className="text-slate-300">
                The difference between actual points and expected points (Actual - xPTS).
                <span className="text-rose-400 font-medium"> Positive variance (+)</span> = overperforming (getting lucky).
                <span className="text-emerald-400 font-medium"> Negative variance (-)</span> = underperforming (unlucky).
              </p>
            </div>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">Overperforming</h4>
              <p className="text-slate-300">
                Getting MORE points than performance suggests. Example: 26 actual points but only 20.5 xPTS.
                Usually due to exceptional finishing or goalkeeping luck. <strong className="text-rose-400">Warning sign</strong> -
                performance will likely regress (drop) when luck normalizes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Underperforming</h4>
              <p className="text-slate-300">
                Getting FEWER points than performance suggests. Example: 15 actual points but 22 xPTS.
                Usually due to poor finishing or goalkeeping errors. <strong className="text-emerald-400">Good sign</strong> -
                results will likely improve naturally when luck normalizes, without needing major changes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Risk Score (0-100)</h4>
              <p className="text-slate-300">
                How likely performance will regress. <strong className="text-white">90-100 = Critical</strong> (major drop coming),
                <strong className="text-white"> 70-89 = High</strong> (regression likely), <strong className="text-white">40-69 = Moderate</strong>,
                <strong className="text-white"> 0-39 = Low</strong> (sustainable or will improve).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="card bg-slate-800/50 p-8 mb-10 border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-5 tracking-tight">Key Insights</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">High Risk Teams</p>
              <p className="text-sm text-slate-400">
                <strong className="text-white">{highRiskCount} teams</strong> getting results that flatter their performance
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Overperformance Warning</p>
              <p className="text-sm text-slate-400">
                <strong className="text-white">+3 variance</strong> = unsustainable finishing/goalkeeping luck
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Unlucky Teams</p>
              <p className="text-sm text-slate-400">
                Creating quality chances but not getting the points they deserve
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Potential ROI</p>
              <p className="text-sm text-slate-400">
                <strong className="text-white">40-60M</strong> saved by avoiding panic decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Market Movers - Unlucky Players */}
      <FPLPlayerCards
        title="🎯 Siege Mode Players"
        subtitle="Underperforming xG - statistically due goals"
        players={playerData.unlucky}
        showMore="/fpl"
      />

      {/* Section 2: Regression Candidates */}
      <FPLPlayerCards
        title="⚠️ Regression Risk"
        subtitle="Overperforming xG - unsustainable luck"
        players={playerData.lucky}
        showMore="/fpl"
      />

      {/* Section 3: Top Form */}
      <FPLPlayerCards
        title="🔥 In-Form Players"
        subtitle="Highest form rating this season"
        players={playerData.byForm}
        showMore="/fpl"
      />

      {/* Team Stats Summary */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary-color)]">
            Team Goal Analysis
          </h3>
          <Link 
            href="/teams" 
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View All Teams →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {teamsWithStats.slice(0, 10).map((team) => (
            <div 
              key={team.id}
              className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle-color)] p-4"
            >
              <h4 className="text-sm font-semibold text-[var(--text-primary-color)] truncate mb-2">
                {team.shortName}
              </h4>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div>
                  <p className="text-xs font-mono text-slate-400">{team.totalXG.toFixed(1)}</p>
                  <p className="text-[9px] text-[var(--text-muted-color)]">xG</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-emerald-400">{team.totalGoals}</p>
                  <p className="text-[9px] text-[var(--text-muted-color)]">Goals</p>
                </div>
                <div>
                  <p className={`text-xs font-mono ${team.goalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {team.goalDelta > 0 ? '+' : ''}{team.goalDelta.toFixed(1)}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted-color)]">Δ</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Deep Dive Links (Bottom) */}
      <DeepDiveLinks />
    </div>
  );
}

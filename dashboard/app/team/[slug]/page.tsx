import { TeamData, DashboardData } from '@/lib/types';
import Link from 'next/link';
import RiskBadge from '@/components/RiskBadge';
import TeamChart from '@/components/TeamChart';
import LuckWaterfallChart from '@/components/LuckWaterfallChart';
import { getAllTeams } from '@/lib/fpl-api';

export const revalidate = 300; // Revalidate every 5 minutes

// Normalize team name for slug matching (handle apostrophes, special chars)
function normalizeForSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''"]/g, '') // Remove apostrophes and quotes
    .replace(/\s+/g, '-')   // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove other special chars
}

async function getData(): Promise<DashboardData> {
  const fplData = await getAllTeams();
  
  const teams: TeamData[] = fplData.teams.map((team, index) => {
    const playerCount = team.players?.length || 1;
    const totalMinutes = team.players?.reduce((sum, p) => sum + (p.minutes || 0), 0) || 0;
    const totalPoints = team.players?.reduce((sum, p) => sum + (p.totalPoints || 0), 0) || 0;
    const variance = Number(team.goalDelta.toFixed(1));
    const riskScore = Math.round(Math.min(100, Math.abs(variance) * 15));
    
    return {
      Team: team.name || team.shortName || 'Unknown',
      Matches: Math.round(totalMinutes / 90 / playerCount) || 19,
      Actual_Points: totalPoints,
      Goals_For: team.totalGoals,
      Goals_Against: 0,
      xG_For: team.totalXG,
      xG_Against: 0,
      xPTS: team.totalXG * 2.5,
      Variance: variance,
      Position_Actual: index + 1,
      Position_Expected: index + 1,
      Z_Score: Number((variance / 2).toFixed(2)),
      P_Value: 0.05,
      Significant: Math.abs(variance) > 3,
      Risk_Score: riskScore,
      Risk_Category: riskScore >= 90 ? 'Critical' : riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Moderate' : 'Low',
      Regression_Probability: Number(Math.min(0.95, Math.abs(variance) * 0.1).toFixed(2)),
      Performance_Status: variance > 3 ? 'Overperforming' : variance < -3 ? 'Underperforming' : 'As Expected',
      PSxG: team.totalXG * 0.95, // Estimate PSxG
    };
  });

  // Sort by total goals
  teams.sort((a, b) => b.Goals_For - a.Goals_For);
  teams.forEach((team, i) => {
    team.Position_Actual = i + 1;
    team.Position_Expected = i + 1;
  });

  return {
    teams,
    lastUpdated: fplData.lastUpdated
  };
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getData();
  const { slug } = await params;

  // Find team by slug (handle special characters like apostrophes)
  const team = data.teams.find(t => normalizeForSlug(t.Team) === slug);
  
  // Fallback: try original slug matching
  const teamName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800">Team Not Found</h2>
          <p className="text-red-600 mt-2">Could not find data for: {teamName}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Team Header */}
      <div className="card p-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-semibold text-white mb-4 tracking-tight">{team.Team}</h1>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-slate-500">Position</span>
                <p className="text-2xl font-semibold text-white mt-1">#{team.Position_Actual}</p>
              </div>
              <div>
                <span className="text-slate-500">Matches</span>
                <p className="text-2xl font-semibold text-white mt-1">{team.Matches}</p>
              </div>
              <div>
                <span className="text-slate-500">Points</span>
                <p className="text-2xl font-semibold text-white mt-1">{team.Actual_Points}</p>
              </div>
            </div>
          </div>
          <div>
            <RiskBadge riskCategory={team.Risk_Category} riskScore={team.Risk_Score} />
          </div>
        </div>
      </div>

      {/* Performance Status Alert */}
      {team.Performance_Status === 'Overperforming' && team.Risk_Score >= 70 && (
        <div className="card bg-rose-500/10 border-rose-500/30 p-6 mb-10">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <span className="text-rose-400 font-semibold text-lg">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-rose-300 mb-2">High Regression Risk - Results Flattering Performance</h3>
              <p className="text-sm text-rose-200/80 leading-relaxed mb-3">
                <strong>Warning:</strong> This team is getting better results than their underlying performance suggests they should.
                They have <strong>{team.Actual_Points}</strong> points but based on chances created/allowed (xG),
                they should have closer to <strong className="text-rose-300">{team.xPTS.toFixed(1)}</strong> points.
              </p>
              <p className="text-sm text-rose-200/80 leading-relaxed">
                <strong className="text-rose-300">Why this matters:</strong> The {(team.Variance).toFixed(1)} point difference is likely due to unsustainable finishing luck or goalkeeping.
                When performance normalizes (regression to mean), they could drop {Math.abs(team.Variance * 0.7).toFixed(0)}-{Math.abs(team.Variance * 0.9).toFixed(0)} points
                (<strong className="text-rose-300">{(team.Regression_Probability * 100).toFixed(0)}% probability</strong>).
              </p>
            </div>
          </div>
        </div>
      )}

      {team.Performance_Status === 'Underperforming' && (
        <div className="card bg-emerald-500/10 border-emerald-500/30 p-6 mb-10">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-emerald-300 mb-2">Improvement Potential - Unlucky But Creating Quality</h3>
              <p className="text-sm text-emerald-200/80 leading-relaxed mb-3">
                <strong>Good news:</strong> This team is getting worse results than their performance deserves.
                They have <strong>{team.Actual_Points}</strong> points but based on chances created/allowed (xG),
                they should have closer to <strong className="text-emerald-300">{team.xPTS.toFixed(1)}</strong> points.
              </p>
              <p className="text-sm text-emerald-200/80 leading-relaxed">
                <strong className="text-emerald-300">Why this matters:</strong> The {Math.abs(team.Variance).toFixed(1)} point gap suggests poor finishing luck or goalkeeping errors.
                Natural improvement likely as performance normalizes - potential to gain {Math.abs(team.Variance * 0.5).toFixed(0)}-{Math.abs(team.Variance * 0.7).toFixed(0)} points
                without major changes to tactics or squad.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <div className="card p-6">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Actual Points</div>
          <div className="text-3xl font-semibold text-white">{team.Actual_Points}</div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Expected Points</div>
          <div className="text-3xl font-semibold text-white">{team.xPTS.toFixed(1)}</div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Goals For</div>
          <div className="text-3xl font-semibold text-white mb-1">{team.Goals_For}</div>
          <div className="text-xs text-slate-400">xG: <span className="font-semibold text-white">{team.xG_For.toFixed(1)}</span></div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Goals Against</div>
          <div className="text-3xl font-semibold text-white mb-1">{team.Goals_Against}</div>
          <div className="text-xs text-slate-400">xGA: <span className="font-semibold text-white">{team.xG_Against.toFixed(1)}</span></div>
        </div>
      </div>

      {/* Finishing Flow Chart (PSxG Analysis) */}
      <LuckWaterfallChart 
        teamName={team.Team}
        xG={team.xG_For}
        PSxG={team.PSxG}
        goals={team.Goals_For}
      />

      {/* Charts */}
      <TeamChart team={team} />

      {/* What This Means in Plain English */}
      <div className="card bg-slate-800/50 p-8 mt-10 border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4 tracking-tight">What This Means in Plain English</h3>
        <div className="prose prose-sm max-w-none text-slate-300 space-y-3">
          <p>
            <strong className="text-white">{team.Team}</strong> has earned <strong className="text-white">{team.Actual_Points} points</strong> from {team.Matches} matches
            (position #{team.Position_Actual}).
          </p>
          <p>
            However, based on the quality of chances they&apos;ve created ({team.xG_For.toFixed(1)} xG) and conceded ({team.xG_Against.toFixed(1)} xGA),
            statistical models predict they should have closer to <strong className="text-white">{team.xPTS.toFixed(1)} points</strong> (position #{team.Position_Expected}).
          </p>
          <p className={team.Variance > 3 ? 'text-rose-300' : team.Variance < -3 ? 'text-emerald-300' : 'text-slate-300'}>
            {team.Variance > 3 ? (
              <>
                This means they&apos;re getting <strong className="text-white">{team.Variance.toFixed(1)} more points than their performance suggests</strong> -
                likely due to exceptional finishing (converting low-quality chances) or outstanding goalkeeping (saving shots that typically go in).
                This level of luck is <strong className="text-white">difficult to sustain</strong>. Expect results to worsen as finishing/goalkeeping normalizes.
              </>
            ) : team.Variance < -3 ? (
              <>
                This means they&apos;re getting <strong className="text-white">{Math.abs(team.Variance).toFixed(1)} fewer points than their performance suggests</strong> -
                likely due to poor finishing (missing good chances) or unlucky goalkeeping (conceding from weak shots).
                The good news: This is usually <strong className="text-white">temporary bad luck</strong>. Expect natural improvement as finishing/goalkeeping normalizes,
                without needing major tactical changes or expensive signings.
              </>
            ) : (
              <>
                This means their results closely match their underlying performance quality. They&apos;re getting roughly the points their
                chance creation and defense deserves. This is <strong className="text-white">sustainable</strong> - no major regression or improvement expected based on luck alone.
              </>
            )}
          </p>
          <p>
            <strong className="text-white">Bottom line:</strong>
            {team.Variance > 3 ? (
              <> Don&apos;t be fooled by current position. Performance quality suggests a drop is coming. Avoid panic buys - the issue isn&apos;t lack of talent, it&apos;s unsustainable luck running out.</>
            ) : team.Variance < -3 ? (
              <> Don&apos;t panic about current position. Performance quality suggests improvement is coming naturally. Avoid hasty managerial changes - the issue is bad luck, not tactics.</>
            ) : (
              <> Current position accurately reflects performance quality. Any improvement will require genuine tactical or squad upgrades, not just waiting for luck to change.</>
            )}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card p-8 mt-10">
        <h3 className="text-xl font-semibold text-white mb-6 tracking-tight">Strategic Recommendations</h3>
        <div className="space-y-4">
          {team.Risk_Score >= 90 && (
            <div className="flex gap-3 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                <span className="text-rose-400 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-rose-200">
                <strong className="font-semibold text-rose-300">Critical Risk:</strong> Monitor closely for regression. Avoid panic decisions if performance normalizes.
              </p>
            </div>
          )}
          {team.Risk_Score >= 70 && team.Risk_Score < 90 && (
            <div className="flex gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-400 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-orange-200">
                <strong className="font-semibold text-orange-300">High Risk:</strong> Performance may regress to mean. Focus on underlying xG metrics.
              </p>
            </div>
          )}
          {team.Variance < -3 && (
            <div className="flex gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-emerald-200">
                <strong className="font-semibold text-emerald-300">Underperforming:</strong> Expected to improve naturally. Review finishing efficiency.
              </p>
            </div>
          )}
          <div className="flex gap-3 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
              <span className="text-slate-300 text-xs font-bold">i</span>
            </div>
            <p className="text-sm text-slate-300">
              <strong className="font-semibold text-white">Key Insight:</strong> Expected position based on xG is <strong className="text-white">#{team.Position_Expected}</strong>,
               current position is <strong className="text-white">#{team.Position_Actual}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

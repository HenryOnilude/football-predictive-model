import { TeamData, DashboardData } from '@/lib/types';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import RiskBadge from '@/components/RiskBadge';
import TeamChart from '@/components/TeamChart';

async function getData(): Promise<DashboardData> {
  const dataPath = path.join(process.cwd(), '..', 'data', 'risk_analysis.csv');

  if (!fs.existsSync(dataPath)) {
    throw new Error('Data file not found');
  }

  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  const headers = lines[0].split(',');

  const teams = lines.slice(1).map(line => {
    const values = line.split(',');
    const team: any = {};

    headers.forEach((header, index) => {
      const value = values[index];

      if (header === 'Team' || header === 'Risk_Category' || header === 'Performance_Status') {
        team[header] = value;
      } else if (header === 'Significant') {
        team[header] = value.toLowerCase() === 'true';
      } else if (header === 'Matches' || header === 'Actual_Points' || header === 'Goals_For' ||
                 header === 'Goals_Against' || header === 'Position_Actual' || header === 'Position_Expected' ||
                 header === 'Risk_Score') {
        team[header] = parseInt(value, 10);
      } else {
        team[header] = parseFloat(value);
      }
    });

    return team;
  });

  const stats = fs.statSync(dataPath);
  return {
    teams,
    lastUpdated: stats.mtime.toISOString()
  };
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getData();
  const { slug } = await params;

  // Find team by slug (convert slug back to team name)
  const teamName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const team = data.teams.find(t =>
    t.Team.toLowerCase().replace(/\s+/g, '-') === slug ||
    t.Team.toLowerCase() === teamName.toLowerCase()
  );

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
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Team Header */}
      <div className="card p-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-semibold text-slate-900 mb-4 tracking-tight">{team.Team}</h1>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-slate-500">Position</span>
                <p className="text-2xl font-semibold text-slate-900 mt-1">#{team.Position_Actual}</p>
              </div>
              <div>
                <span className="text-slate-500">Matches</span>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{team.Matches}</p>
              </div>
              <div>
                <span className="text-slate-500">Points</span>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{team.Actual_Points}</p>
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
        <div className="card bg-linear-to-br from-red-50 to-red-100/50 border-red-200 p-6 mb-10">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-semibold text-lg">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-red-900 mb-2">High Regression Risk - Results Flattering Performance</h3>
              <p className="text-sm text-red-700 leading-relaxed mb-3">
                <strong>Warning:</strong> This team is getting better results than their underlying performance suggests they should.
                They have <strong>{team.Actual_Points}</strong> points but based on chances created/allowed (xG),
                they should have closer to <strong>{team.xPTS.toFixed(1)}</strong> points.
              </p>
              <p className="text-sm text-red-700 leading-relaxed">
                <strong>Why this matters:</strong> The {(team.Variance).toFixed(1)} point difference is likely due to unsustainable finishing luck or goalkeeping.
                When performance normalizes (regression to mean), they could drop {Math.abs(team.Variance * 0.7).toFixed(0)}-{Math.abs(team.Variance * 0.9).toFixed(0)} points
                (<strong>{(team.Regression_Probability * 100).toFixed(0)}% probability</strong>).
              </p>
            </div>
          </div>
        </div>
      )}

      {team.Performance_Status === 'Underperforming' && (
        <div className="card bg-linear-to-br from-blue-50 to-blue-100/50 border-blue-200 p-6 mb-10">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-blue-900 mb-2">Improvement Potential - Unlucky But Creating Quality</h3>
              <p className="text-sm text-blue-700 leading-relaxed mb-3">
                <strong>Good news:</strong> This team is getting worse results than their performance deserves.
                They have <strong>{team.Actual_Points}</strong> points but based on chances created/allowed (xG),
                they should have closer to <strong>{team.xPTS.toFixed(1)}</strong> points.
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                <strong>Why this matters:</strong> The {Math.abs(team.Variance).toFixed(1)} point gap suggests poor finishing luck or goalkeeping errors.
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
          <div className="text-3xl font-semibold text-slate-900">{team.Actual_Points}</div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Expected Points</div>
          <div className="text-3xl font-semibold text-slate-900">{team.xPTS.toFixed(1)}</div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Goals For</div>
          <div className="text-3xl font-semibold text-slate-900 mb-1">{team.Goals_For}</div>
          <div className="text-xs text-slate-500">xG: <span className="font-semibold">{team.xG_For.toFixed(1)}</span></div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Goals Against</div>
          <div className="text-3xl font-semibold text-slate-900 mb-1">{team.Goals_Against}</div>
          <div className="text-xs text-slate-500">xGA: <span className="font-semibold">{team.xG_Against.toFixed(1)}</span></div>
        </div>
      </div>

      {/* Charts */}
      <TeamChart team={team} />

      {/* What This Means in Plain English */}
      <div className="card bg-linear-to-br from-indigo-50/30 to-blue-50/20 p-8 mt-10 border-indigo-200/40">
        <h3 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">What This Means in Plain English</h3>
        <div className="prose prose-sm max-w-none text-slate-700 space-y-3">
          <p>
            <strong className="text-slate-900">{team.Team}</strong> has earned <strong>{team.Actual_Points} points</strong> from {team.Matches} matches
            (position #{team.Position_Actual}).
          </p>
          <p>
            However, based on the quality of chances they've created ({team.xG_For.toFixed(1)} xG) and conceded ({team.xG_Against.toFixed(1)} xGA),
            statistical models predict they should have closer to <strong>{team.xPTS.toFixed(1)} points</strong> (position #{team.Position_Expected}).
          </p>
          <p className={team.Variance > 3 ? 'text-red-800' : team.Variance < -3 ? 'text-blue-800' : 'text-slate-700'}>
            {team.Variance > 3 ? (
              <>
                This means they're getting <strong>{team.Variance.toFixed(1)} more points than their performance suggests</strong> -
                likely due to exceptional finishing (converting low-quality chances) or outstanding goalkeeping (saving shots that typically go in).
                This level of luck is <strong>difficult to sustain</strong>. Expect results to worsen as finishing/goalkeeping normalizes.
              </>
            ) : team.Variance < -3 ? (
              <>
                This means they're getting <strong>{Math.abs(team.Variance).toFixed(1)} fewer points than their performance suggests</strong> -
                likely due to poor finishing (missing good chances) or unlucky goalkeeping (conceding from weak shots).
                The good news: This is usually <strong>temporary bad luck</strong>. Expect natural improvement as finishing/goalkeeping normalizes,
                without needing major tactical changes or expensive signings.
              </>
            ) : (
              <>
                This means their results closely match their underlying performance quality. They're getting roughly the points their
                chance creation and defense deserves. This is <strong>sustainable</strong> - no major regression or improvement expected based on luck alone.
              </>
            )}
          </p>
          <p>
            <strong className="text-slate-900">Bottom line:</strong>
            {team.Variance > 3 ? (
              <> Don't be fooled by current position. Performance quality suggests a drop is coming. Avoid panic buys - the issue isn't lack of talent, it's unsustainable luck running out.</>
            ) : team.Variance < -3 ? (
              <> Don't panic about current position. Performance quality suggests improvement is coming naturally. Avoid hasty managerial changes - the issue is bad luck, not tactics.</>
            ) : (
              <> Current position accurately reflects performance quality. Any improvement will require genuine tactical or squad upgrades, not just waiting for luck to change.</>
            )}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card p-8 mt-10">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 tracking-tight">Strategic Recommendations</h3>
        <div className="space-y-4">
          {team.Risk_Score >= 90 && (
            <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-200 flex items-center justify-center">
                <span className="text-red-700 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-900">
                <strong className="font-semibold">Critical Risk:</strong> Monitor closely for regression. Avoid panic decisions if performance normalizes.
              </p>
            </div>
          )}
          {team.Risk_Score >= 70 && team.Risk_Score < 90 && (
            <div className="flex gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center">
                <span className="text-orange-700 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-orange-900">
                <strong className="font-semibold">High Risk:</strong> Performance may regress to mean. Focus on underlying xG metrics.
              </p>
            </div>
          )}
          {team.Variance < -3 && (
            <div className="flex gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-blue-900">
                <strong className="font-semibold">Underperforming:</strong> Expected to improve naturally. Review finishing efficiency.
              </p>
            </div>
          )}
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-700 text-xs font-bold">i</span>
            </div>
            <p className="text-sm text-slate-700">
              <strong className="font-semibold">Key Insight:</strong> Expected position based on xG is <strong>#{team.Position_Expected}</strong>,
               current position is <strong>#{team.Position_Actual}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

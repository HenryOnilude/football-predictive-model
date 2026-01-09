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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Team Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.Team}</h1>
            <p className="text-gray-600">
              Position: <strong>#{team.Position_Actual}</strong> |
              Matches: <strong>{team.Matches}</strong> |
              Points: <strong>{team.Actual_Points}</strong>
            </p>
          </div>
          <div>
            <RiskBadge riskCategory={team.Risk_Category} riskScore={team.Risk_Score} />
          </div>
        </div>
      </div>

      {/* Performance Status Alert */}
      {team.Performance_Status === 'Overperforming' && team.Risk_Score >= 70 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">High Regression Risk</h3>
              <p className="mt-1 text-sm text-red-700">
                This team is significantly overperforming their expected metrics.
                Performance regression is likely ({(team.Regression_Probability * 100).toFixed(0)}% probability).
              </p>
            </div>
          </div>
        </div>
      )}

      {team.Performance_Status === 'Underperforming' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Improvement Potential</h3>
              <p className="mt-1 text-sm text-blue-700">
                This team is underperforming their expected metrics.
                Natural improvement likely without major changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Actual Points</div>
          <div className="text-2xl font-bold text-gray-900">{team.Actual_Points}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Expected Points</div>
          <div className="text-2xl font-bold text-gray-900">{team.xPTS.toFixed(1)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Goals For</div>
          <div className="text-2xl font-bold text-gray-900">{team.Goals_For}</div>
          <div className="text-xs text-gray-500">xG: {team.xG_For.toFixed(1)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Goals Against</div>
          <div className="text-2xl font-bold text-gray-900">{team.Goals_Against}</div>
          <div className="text-xs text-gray-500">xGA: {team.xG_Against.toFixed(1)}</div>
        </div>
      </div>

      {/* Charts */}
      <TeamChart team={team} />

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Strategic Recommendations</h3>
        <div className="space-y-3 text-sm text-gray-700">
          {team.Risk_Score >= 90 && (
            <p>🔴 <strong>Critical:</strong> Monitor closely for regression. Avoid panic decisions if performance normalizes.</p>
          )}
          {team.Risk_Score >= 70 && team.Risk_Score < 90 && (
            <p>🟠 <strong>High Risk:</strong> Performance may regress to mean. Focus on underlying xG metrics.</p>
          )}
          {team.Variance < -3 && (
            <p>📈 <strong>Underperforming:</strong> Expected to improve naturally. Review finishing efficiency.</p>
          )}
          <p>💡 <strong>Key Insight:</strong> Expected position based on xG is #{team.Position_Expected},
             current position is #{team.Position_Actual}.</p>
        </div>
      </div>
    </div>
  );
}

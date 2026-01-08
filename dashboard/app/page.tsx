import LeagueTable from '@/components/LeagueTable';
import { DashboardData } from '@/lib/types';
import fs from 'fs';
import path from 'path';

async function getData(): Promise<DashboardData> {
  try {
    // Read the risk_analysis.csv file directly from the Python output
    const dataPath = path.join(process.cwd(), '..', 'data', 'risk_analysis.csv');

    if (!fs.existsSync(dataPath)) {
      throw new Error('Data file not found. Please run the Python analysis first.');
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    const headers = lines[0].split(',');

    const teams = lines.slice(1).map(line => {
      const values = line.split(',');
      const team: any = {};

      headers.forEach((header, index) => {
        const value = values[index];

        // Convert to appropriate types
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

    // Get file modification time for lastUpdated
    const stats = fs.statSync(dataPath);
    const lastUpdated = stats.mtime.toISOString();

    return {
      teams,
      lastUpdated
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to load data');
  }
}

export default async function HomePage() {
  let data: DashboardData | null = null;
  let error: string | null = null;

  try {
    data = await getData();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load data';
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h2>
          <p className="text-red-600">
            {error || 'Unable to load data. Please make sure the Python analysis has been run.'}
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Run: <code className="bg-gray-100 px-2 py-1 rounded">python main.py</code>
          </p>
        </div>
      </div>
    );
  }

  const overperformingCount = data.teams.filter(t => t.Variance > 3).length;
  const underperformingCount = data.teams.filter(t => t.Variance < -3).length;
  const highRiskCount = data.teams.filter(t => t.Risk_Score >= 70).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Performance Analysis Dashboard
        </h2>
        <p className="text-gray-600">
          Identifying performance regression risk based on Expected Goals (xG) data
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Teams</div>
          <div className="text-3xl font-bold text-gray-900">{data.teams.length}</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
          <div className="text-sm font-medium text-red-600 mb-1">High Risk</div>
          <div className="text-3xl font-bold text-red-700">{highRiskCount}</div>
          <div className="text-xs text-red-600 mt-1">Risk Score ≥ 70</div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-6 border border-orange-200">
          <div className="text-sm font-medium text-orange-600 mb-1">Overperforming</div>
          <div className="text-3xl font-bold text-orange-700">{overperformingCount}</div>
          <div className="text-xs text-orange-600 mt-1">Variance &gt; +3</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
          <div className="text-sm font-medium text-blue-600 mb-1">Underperforming</div>
          <div className="text-3xl font-bold text-blue-700">{underperformingCount}</div>
          <div className="text-xs text-blue-600 mt-1">Variance &lt; -3</div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Key Insights</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            📊 <strong>{highRiskCount} teams</strong> are at high risk of performance regression (Risk Score ≥ 70)
          </p>
          <p>
            ⚠️ Teams overperforming their xG by <strong>+3 points or more</strong> should be monitored closely for regression to mean
          </p>
          <p>
            💡 Underperforming teams may see natural improvement without major changes
          </p>
          <p>
            💰 <strong>Potential ROI:</strong> £40-60M by avoiding reactive decisions based on short-term variance
          </p>
        </div>
      </div>

      {/* League Table */}
      <LeagueTable teams={data.teams} />
    </div>
  );
}

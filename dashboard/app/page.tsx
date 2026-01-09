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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-semibold text-slate-900 mb-3 tracking-tight">
              Performance Analysis
            </h2>
            <p className="text-slate-600 text-lg">
              Identifying regression risk using Expected Goals (xG) data
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Last Updated</p>
              <p className="text-sm font-medium text-slate-600">
                {new Date(data.lastUpdated).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
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
        <div className="card p-6 hover:border-slate-300 transition-colors">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Total Teams</div>
          <div className="text-4xl font-semibold text-slate-900">{data.teams.length}</div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 hover:border-red-300 transition-colors">
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">High Risk</div>
          <div className="text-4xl font-semibold text-red-700">{highRiskCount}</div>
          <div className="text-xs text-red-600/80 mt-2">Risk Score ≥ 70</div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 hover:border-orange-300 transition-colors">
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Overperforming</div>
          <div className="text-4xl font-semibold text-orange-700">{overperformingCount}</div>
          <div className="text-xs text-orange-600/80 mt-2">Variance &gt; +3</div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:border-blue-300 transition-colors">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Underperforming</div>
          <div className="text-4xl font-semibold text-blue-700">{underperformingCount}</div>
          <div className="text-xs text-blue-600/80 mt-2">Variance &lt; -3</div>
        </div>
      </div>

      {/* Understanding the Analysis */}
      <div className="card bg-gradient-to-br from-slate-50 to-slate-100/30 p-8 mb-6 border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">📊 Understanding the Analysis</h3>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            <strong className="text-slate-900">What is "Overperforming"?</strong> Getting more points than your chance quality (xG) suggests.
            A team in 12th with 26 points might be overperforming if their xG says they should have 20 points - they're getting results that flatter their actual performance.
          </p>
          <p>
            <strong className="text-slate-900">Why it matters:</strong> Overperformance is usually unsustainable luck (finishing, goalkeeping).
            When it normalizes, results will drop. Underperformers often improve naturally without changes.
          </p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="card bg-gradient-to-br from-indigo-50/50 to-blue-50/30 p-8 mb-10 border-indigo-200/60">
        <h3 className="text-xl font-semibold text-slate-900 mb-5 tracking-tight">Key Insights</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-semibold text-lg">!</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 mb-1">High Risk Teams</p>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-900">{highRiskCount} teams</strong> getting results that flatter their performance
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-semibold text-lg">↑</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 mb-1">Overperformance Warning</p>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-900">+3 variance</strong> = unsustainable finishing/goalkeeping luck
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">↓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 mb-1">Unlucky Teams</p>
              <p className="text-sm text-slate-600">
                Creating quality chances but not getting the points they deserve
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-semibold text-lg">£</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 mb-1">Potential ROI</p>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-900">£40-60M</strong> saved by avoiding panic decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* League Table */}
      <LeagueTable teams={data.teams} />
    </div>
  );
}

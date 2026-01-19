import LeagueTable from '@/components/LeagueTable';
import FinishingBadgeDemo from '@/components/FinishingBadgeDemo';
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
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Error Loading Data</h2>
          <p className="text-rose-300">
            {error || 'Unable to load data. Please make sure the Python analysis has been run.'}
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Run: <code className="bg-slate-800 px-2 py-1 rounded text-slate-300">python main.py</code>
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
            <h2 className="text-4xl font-semibold text-white mb-3 tracking-tight">
              Performance Analysis
            </h2>
            <p className="text-slate-400 text-lg">
              Identifying regression risk using Expected Goals (xG) data
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Last Updated</p>
              <p className="text-sm font-medium text-slate-300">
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
        <div className="card p-6 hover:border-slate-600 transition-colors">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Total Teams</div>
          <div className="text-4xl font-semibold text-white">{data.teams.length}</div>
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

      {/* PSxG Finishing Badge Demo */}
      <FinishingBadgeDemo />

      {/* League Table */}
      <LeagueTable teams={data.teams} />
    </div>
  );
}

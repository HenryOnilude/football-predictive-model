import { getTopPerformers } from '@/lib/fpl-api';
import FPLPlayerCards from '@/components/FPLPlayerCards';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function FPLPage() {
  let data;
  let error: string | null = null;

  try {
    data = await getTopPerformers(10);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load FPL data';
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Error Loading FPL Data</h2>
          <p className="text-rose-300">{error || 'Unable to fetch data from FPL API.'}</p>
          <p className="mt-4 text-sm text-slate-400">
            The FPL API may be temporarily unavailable. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-semibold text-white mb-3 tracking-tight">
              Live FPL Intelligence
            </h2>
            <p className="text-slate-400 text-lg">
              Real-time player analysis using official Fantasy Premier League data
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Gameweek {data.currentGameweek}</p>
              <p className="text-sm font-medium text-emerald-400">
                Updated {new Date(data.lastUpdated).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="card p-6">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Gameweek</div>
          <div className="text-4xl font-semibold text-white">{data.currentGameweek}</div>
        </div>
        <div className="card p-6 bg-purple-500/10 border-purple-500/30">
          <div className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2">Siege (Unlucky)</div>
          <div className="text-4xl font-semibold text-purple-400">{data.unlucky.length}</div>
          <div className="text-xs text-purple-400/70 mt-2">Due a haul</div>
        </div>
        <div className="card p-6 bg-amber-500/10 border-amber-500/30">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">Mirage (Illusion)</div>
          <div className="text-4xl font-semibold text-amber-400">{data.lucky.length}</div>
          <div className="text-xs text-amber-400/70 mt-2">Regression risk</div>
        </div>
        <div className="card p-6 bg-emerald-500/10 border-emerald-500/30">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Top Form</div>
          <div className="text-4xl font-semibold text-emerald-400">{data.byForm[0]?.form.toFixed(1) || '-'}</div>
          <div className="text-xs text-emerald-400/70 mt-2">{data.byForm[0]?.name || 'N/A'}</div>
        </div>
      </div>

      {/* Unlucky Players - Due a Haul */}
      <FPLPlayerCards
        title="🎯 Siege Mode Players"
        subtitle="Underperforming xG - statistically due goals"
        players={data.unlucky}
      />

      {/* Lucky Players - Regression Risk */}
      <FPLPlayerCards
        title="⚠️ Regression Candidates"
        subtitle="Overperforming xG - unsustainable form"
        players={data.lucky}
      />

      {/* Best Form */}
      <FPLPlayerCards
        title="🔥 In-Form Players"
        subtitle="Highest form rating this season"
        players={data.byForm}
      />

      {/* Best Value */}
      <FPLPlayerCards
        title="💎 Best Value"
        subtitle="Highest points per million"
        players={data.byValue}
      />

      {/* Footer Timestamp */}
      <div className="mt-12 pt-8 border-t border-[var(--border-subtle-color)]">
        <div className="flex items-center justify-between text-sm text-[var(--text-muted-color)]">
          <p>Data from official Fantasy Premier League API</p>
          <p>
            Last updated: {new Date(data.lastUpdated).toLocaleString('en-GB', {
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
  );
}

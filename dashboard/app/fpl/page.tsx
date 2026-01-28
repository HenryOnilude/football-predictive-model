import { getTopPerformers } from '@/lib/fpl-api';
import MarketTerminalClient from './MarketTerminalClient';

export const dynamic = 'force-dynamic'; // Force server-side rendering to use proxy

export default async function MarketTerminalPage() {
  let data;
  let error: string | null = null;

  try {
    data = await getTopPerformers(15);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load FPL data';
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Error Loading Market Data</h2>
          <p className="text-rose-300">{error || 'Unable to fetch data from FPL API.'}</p>
          <p className="mt-4 text-sm text-slate-400">
            The FPL API may be temporarily unavailable. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MarketTerminalClient
      unlucky={data.unlucky}
      lucky={data.lucky}
      byForm={data.byForm}
      byValue={data.byValue}
      currentGameweek={data.currentGameweek}
      lastUpdated={data.lastUpdated}
    />
  );
}

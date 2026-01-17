import { fetchLuckData } from '@/app/actions/fetchLuckData';
import LuckCard from '@/components/LuckCard';
import { TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LuckPage() {
  const data = await fetchLuckData();

  const buyPlayers = data.players.filter((p) => p.verdict === 'BUY');
  const trapPlayers = data.players.filter((p) => p.verdict === 'TRAP');
  const holdPlayers = data.players.filter((p) => p.verdict === 'HOLD');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">
                Gameweek {data.gameweek}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Who&apos;s Due a Haul?
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Find players underperforming their xG. 
              <span className="text-emerald-400 font-medium"> Statistical regression </span>
              says they&apos;re about to pop off.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-10">
            <div className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-2xl font-bold text-white">{buyPlayers.length}</span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Buy Signals</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-2xl font-bold text-white">{trapPlayers.length}</span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Trap Alerts</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-2xl font-bold text-white">{holdPlayers.length}</span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Fair Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* BUY Section */}
        {buyPlayers.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Differential Value
                </h2>
                <p className="text-sm text-slate-500">
                  Underperforming xG — due for regression upward
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {buyPlayers.map((player) => (
                <LuckCard key={player.id} player={player} />
              ))}
            </div>
          </section>
        )}

        {/* TRAP Section */}
        {trapPlayers.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Trap Indicator
                </h2>
                <p className="text-sm text-slate-500">
                  Overperforming xG — regression risk incoming
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {trapPlayers.map((player) => (
                <LuckCard key={player.id} player={player} />
              ))}
            </div>
          </section>
        )}

        {/* HOLD Section */}
        {holdPlayers.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
                <span className="text-slate-400 font-bold">=</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Fair Value
                </h2>
                <p className="text-sm text-slate-500">
                  Performing as expected — no edge here
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {holdPlayers.map((player) => (
                <LuckCard key={player.id} player={player} />
              ))}
            </div>
          </section>
        )}

        {/* Methodology Note */}
        <section className="mt-16 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-3">How This Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-emerald-400 mb-1">Differential Value</h4>
              <p className="text-slate-400">
                Players with negative luck scores are converting fewer chances than expected. 
                This is unsustainable — expect their output to increase.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Haul Potential</h4>
              <p className="text-slate-400">
                Measures likelihood of a big gameweek based on underlying chance quality 
                vs actual returns. Higher = more likely to explode.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-rose-400 mb-1">Trap Indicator</h4>
              <p className="text-slate-400">
                Players outperforming xG are riding luck. High trap indicator means 
                they&apos;re likely to regress — avoid buying at peak price.
              </p>
            </div>
          </div>
        </section>

        {/* Cache Status */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600">
            {data.cached ? 'Cached data' : 'Fresh data'} • 
            Last updated: {new Date(data.lastUpdated).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

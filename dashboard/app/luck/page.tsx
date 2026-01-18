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

          {/* Key Terms Explanation */}
          <div className="mt-10 p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">Understanding The Data</h3>
            
            {/* Core Stats */}
            <div className="grid md:grid-cols-2 gap-4 text-xs mb-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-semibold whitespace-nowrap">xG (Expected Goals)</span>
                  <span className="text-slate-400">A stat measuring the quality of chances a player gets. If a player has 5.0 xG but only 3 goals, they&apos;re underperforming — more goals should come.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-semibold whitespace-nowrap">LUCK SCORE</span>
                  <span className="text-slate-400">Goals minus xG. Negative = unlucky (scoring less than expected). Positive = lucky (scoring more than expected). Luck evens out over time.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-semibold whitespace-nowrap">DIFFERENTIAL %</span>
                  <span className="text-slate-400">How many FPL managers own this player. Lower = bigger rank boost if they score. High differential picks can win you mini-leagues.</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-semibold whitespace-nowrap">HAUL POT. %</span>
                  <span className="text-slate-400">Probability of a big points haul (10+ pts) based on xG, fixtures, and form. Higher = more likely to explode soon.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-semibold whitespace-nowrap">TRAP RISK %</span>
                  <span className="text-slate-400">Chance the player is overperforming and will regress. High trap risk = avoid buying, their output will likely drop.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Explanation */}
            <div className="border-t border-slate-700 pt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Card Action Buttons</h4>
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold whitespace-nowrap text-[10px]">DUE A HAUL 🔥</span>
                    <span className="text-slate-400">This player is getting good chances but not scoring. Statistics say they WILL score soon — buy them now before they explode.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold whitespace-nowrap text-[10px]">SELL HIGH</span>
                    <span className="text-slate-400">This player is scoring MORE than their chances suggest. They&apos;re on a lucky streak that won&apos;t last — sell them now while their price is high.</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-semibold whitespace-nowrap text-[10px]">REGRESSION RISK ⚠️</span>
                    <span className="text-slate-400">DANGER: This player is heavily overperforming. They&apos;re scoring goals they statistically shouldn&apos;t be. Their output WILL drop — avoid buying at all costs.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-600 text-white font-semibold whitespace-nowrap text-[10px]">FAIR VALUE</span>
                    <span className="text-slate-400">This player is performing exactly as expected. No edge here — their output should stay consistent.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-8">
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

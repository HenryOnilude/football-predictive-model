'use client';


interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <span className="text-white text-sm">📊</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Methodology Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6">
          
          {/* Section: What is xG? */}
          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400">⚽</span> What is xG (Expected Goals)?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">Expected Goals (xG)</strong> measures the quality of a scoring chance 
              based on historical data. Each shot is assigned a value between 0 and 1, representing the probability 
              it will result in a goal.
            </p>
            <div className="mt-3 bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400">
              <strong className="text-slate-300">Example:</strong> A penalty has an xG of ~0.76 (76% chance of scoring), 
              while a long-range shot might be approximately 0.03 (3% chance).
            </div>
          </section>

          {/* Section: What is Variance? */}
          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-amber-400">📈</span> What is Variance (Goals - xG)?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">Variance</strong> is the difference between actual goals scored and 
              expected goals. This tells us if a team is <em>overperforming</em> or <em>underperforming</em> 
              relative to their chances.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                <div className="text-rose-400 font-semibold mb-1">Positive Variance (+)</div>
                <div className="text-slate-400">Scoring MORE than expected. Regression risk—goals may dry up.</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <div className="text-emerald-400 font-semibold mb-1">Negative Variance (-)</div>
                <div className="text-slate-400">Scoring LESS than expected. Upside potential—goals are due.</div>
              </div>
            </div>
          </section>

          {/* Section: System Health Score */}
          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-blue-400">💪</span> System Health Score (0-100)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">System Health</strong> measures a team&apos;s structural quality based on 
              their <strong>Net xG per 90 minutes</strong> (xG created minus xG conceded). This predicts long-term 
              reliability rather than short-term form.
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300"><strong className="text-emerald-400">75+</strong> — Elite structure (Title contenders)</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-300"><strong className="text-amber-400">45-75</strong> — Average structure (Mid-table)</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-300"><strong className="text-rose-400">&lt;45</strong> — Weak structure (Relegation risk)</span>
              </div>
            </div>
          </section>

          {/* Section: Finishing Heat */}
          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-orange-400">🔥</span> Finishing Heat (Efficiency)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">Finishing Heat</strong> shows how efficiently a team is converting 
              their chances right now. Hot teams are overperforming; cold teams are underperforming.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px]">CRIT OVER</span>
                <span className="text-slate-400">+6.0 or more</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-orange-500 text-white font-mono text-[10px]">HOT</span>
                <span className="text-slate-400">+2.0 to +6.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-600 text-white font-mono text-[10px]">MEAN</span>
                <span className="text-slate-400">-2.0 to +2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-600 text-white font-mono text-[10px]">COLD</span>
                <span className="text-slate-400">-2.0 to -6.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-mono text-[10px]">EXTREME VAL</span>
                <span className="text-slate-400">-6.0 or less</span>
              </div>
            </div>
          </section>

          {/* Section: Team Quadrants */}
          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-cyan-400">🏷️</span> Team Quadrants (Card Badges)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Teams are classified based on attacking and defensive xG variance:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">💎 DOUBLE VALUE</span>
                <span className="text-slate-400">Both attack and defense underperforming xG. Best value picks.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold">🛡️ CS CHASER</span>
                <span className="text-slate-400">Defense conceding cheap goals. Clean sheets are due.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">⚽ GOAL CHASER</span>
                <span className="text-slate-400">Attackers underperforming xG. Goals are due.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold">🚫 AVOID</span>
                <span className="text-slate-400">Overperforming in attack or defense. Regression likely.</span>
              </div>
            </div>
          </section>

          {/* Section: Card Labels */}
          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-amber-400">🔖</span> Card Action Labels
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Individual labels on sentiment cards indicate specific opportunities:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold">BUY DIP</span>
                <span className="text-slate-400">Defense due clean sheets</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-semibold">EXPLOSIVE</span>
                <span className="text-slate-400">Attack severely underperforming</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold">COOLDOWN</span>
                <span className="text-slate-400">Attack overperforming, sell high</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-600 text-white font-semibold">STABLE</span>
                <span className="text-slate-400">Performing as expected</span>
              </div>
            </div>
          </section>

          {/* Section: Market Verdicts */}
          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-purple-400">🎯</span> Market Verdicts (Action Signals)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              We combine Health + Heat to generate actionable FPL transfer signals:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">💎 DOMINANT</span>
                <span className="text-slate-400">Elite health + hot finishing. Premium assets.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold">🚀 PRIME BUY</span>
                <span className="text-slate-400">Good health + cold finishing. Buy the dip!</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-slate-700/50 text-slate-400 border border-slate-600 font-semibold">⚖️ STABLE</span>
                <span className="text-slate-400">Performing as expected. Hold position.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">⚠️ OVERHEATED</span>
                <span className="text-slate-400">Hot finishing, regression likely. Sell high.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold">🚨 CRITICAL</span>
                <span className="text-slate-400">Poor health + hot finishing. Avoid completely.</span>
              </div>
            </div>
          </section>

          {/* Section: Sort Options */}
          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-slate-400">🔄</span> Table Sort Options
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Use the sort buttons to reorder the Hybrid Intelligence Table:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-emerald-600 text-white font-semibold">Health</span>
                <span className="text-slate-400">Sort by System Health score (best structural teams first)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-slate-700 text-slate-300 font-semibold">Pts</span>
                <span className="text-slate-400">Sort by league points (actual standings)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-slate-700 text-slate-300 font-semibold">Rank</span>
                <span className="text-slate-400">Sort by league position (1st to 20th)</span>
              </div>
            </div>
          </section>

          {/* Data Source */}
          <section className="border-t border-slate-700 pt-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>📡</span>
              <span>Data sourced from Official FPL API & football-data.org • Updated every gameweek</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Trigger Button Component
export function MethodologyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors"
    >
      <span>ℹ️</span>
      <span className="hidden sm:inline">Methodology</span>
    </button>
  );
}

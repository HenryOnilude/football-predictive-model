'use client';

import { TeamData } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface TeamChartProps {
  team: TeamData;
}

export default function TeamChart({ team }: TeamChartProps) {
  // Data for comparison chart
  const comparisonData = [
    {
      metric: 'Points',
      Actual: team.Actual_Points,
      Expected: team.xPTS,
    },
    {
      metric: 'Goals',
      Actual: team.Goals_For,
      Expected: team.xG_For,
    },
  ];

  // Data for variance visualization
  const varianceData = [
    {
      category: 'Performance',
      value: team.Variance,
      fill: team.Variance > 0 ? '#ef4444' : '#3b82f6',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Actual vs Expected Comparison */}
      <div className="card p-8">
        <h3 className="text-xl font-semibold text-white mb-6 tracking-tight">Actual vs Expected Performance</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={comparisonData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="metric"
              tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                padding: '12px'
              }}
              labelStyle={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: '#cbd5e1', fontSize: '13px' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 500 }}>{value}</span>}
            />
            <Bar dataKey="Actual" fill="#6366f1" name="Actual" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Expected" fill="#10b981" name="Expected (xG/xPTS)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Variance Bar */}
      <div className="card p-8">
        <div className="flex items-baseline justify-between mb-6">
          <h3 className="text-xl font-semibold text-white tracking-tight">
            Performance Variance
          </h3>
          <span className={`text-2xl font-bold ${team.Variance > 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {team.Variance > 0 ? '+' : ''}{team.Variance.toFixed(1)}
          </span>
        </div>
        <div className="relative">
          <div className="h-14 bg-slate-800 rounded-xl overflow-hidden flex items-center relative">
            <div
              className={`h-full ${team.Variance > 0 ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'} transition-all duration-700 ease-out`}
              style={{
                width: `${Math.min(Math.abs(team.Variance) * 5, 100)}%`,
                marginLeft: team.Variance > 0 ? '50%' : `${50 - Math.min(Math.abs(team.Variance) * 5, 50)}%`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-full bg-slate-400"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-3 font-medium">
            <span>Underperforming</span>
            <span className="font-bold text-slate-300">0</span>
            <span>Overperforming</span>
          </div>
        </div>
        <div className="mt-6 p-4 rounded-lg bg-slate-800">
          <p className={`text-sm font-medium ${
            team.Variance > 3 ? 'text-rose-400' :
            team.Variance < -3 ? 'text-blue-400' :
            'text-slate-300'
          }`}>
            {team.Variance > 3 ?
              `Getting ${team.Variance.toFixed(1)} more points than performance suggests - unsustainable (high regression risk)` :
              team.Variance < -3 ?
              `Getting ${Math.abs(team.Variance).toFixed(1)} fewer points than performance suggests - unlucky (natural improvement expected)` :
              'Results match underlying performance - sustainable'}
          </p>
        </div>
      </div>

      {/* Statistical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-6 bg-purple-500/10 border-purple-500/30">
          <div className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-2">Regression Probability</div>
          <div className="text-3xl font-semibold text-purple-300 mt-1 mb-3">
            {(team.Regression_Probability * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-purple-300/80">
            Likelihood that performance will revert to expected levels. Higher = more likely to regress (for overperformers) or improve (for underperformers).
          </p>
        </div>
        <div className="card p-6 bg-indigo-500/10 border-indigo-500/30">
          <div className="text-xs font-medium text-indigo-400 uppercase tracking-wide mb-2">Z-Score</div>
          <div className="text-3xl font-semibold text-indigo-300 mt-1 mb-3">
            {team.Z_Score.toFixed(2)}
          </div>
          <p className="text-xs text-indigo-300/80">
            How unusual this variance is compared to all teams. Above +2 or below -2 indicates extreme performance deviation from the mean.
          </p>
        </div>
        <div className="card p-6 bg-cyan-500/10 border-cyan-500/30">
          <div className="text-xs font-medium text-cyan-400 uppercase tracking-wide mb-2">P-Value</div>
          <div className="flex items-baseline gap-2 mb-3">
            <div className="text-3xl font-semibold text-cyan-300">
              {team.P_Value.toFixed(3)}
            </div>
            {team.Significant && <span className="text-lg text-rose-400 font-bold">*</span>}
          </div>
          <p className="text-xs text-cyan-300/80">
            Probability this variance is due to random chance. Below 0.05 (*) means statistically significant - not just luck.
          </p>
        </div>
      </div>

      {/* Statistical Explanation */}
      <div className="card bg-slate-800/50 p-6 border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-3">Understanding These Statistics</h4>
        <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div>
            <p className="font-medium text-white mb-1">Regression Probability</p>
            <p>High % (70%+) = very likely to change. Low % (20%-) = performance is sustainable. This tells you if the current form will last.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Z-Score</p>
            <p>Measures extremeness. +2.0 = top 2.5% (extremely lucky). -2.0 = bottom 2.5% (extremely unlucky). Between -1 and +1 = normal.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">P-Value</p>
            <p>Below 0.05 marked with * = less than 5% chance this is random. Above 0.05 = could just be normal variance, not a real pattern.</p>
          </div>
        </div>
      </div>

      {team.Significant && (
        <div className="card bg-amber-500/10 border-amber-500/30 p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">*</span>
            </div>
            <p className="text-sm text-amber-200">
              <strong className="font-semibold">Statistically Significant (*):</strong> This variance is NOT due to random chance (p-value &lt; 0.05).
              The {Math.abs(team.Variance).toFixed(1)} point gap between actual and expected performance is a real, measurable pattern that will likely correct itself.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

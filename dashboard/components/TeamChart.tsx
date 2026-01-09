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
        <h3 className="text-xl font-semibold text-slate-900 mb-6 tracking-tight">Actual vs Expected Performance</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={comparisonData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="metric"
              tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              labelStyle={{ color: '#0f172a', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: '#475569', fontSize: '13px' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>{value}</span>}
            />
            <Bar dataKey="Actual" fill="#6366f1" name="Actual" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Expected" fill="#10b981" name="Expected (xG/xPTS)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Variance Bar */}
      <div className="card p-8">
        <div className="flex items-baseline justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
            Performance Variance
          </h3>
          <span className={`text-2xl font-bold ${team.Variance > 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {team.Variance > 0 ? '+' : ''}{team.Variance.toFixed(1)}
          </span>
        </div>
        <div className="relative">
          <div className="h-14 bg-slate-100 rounded-xl overflow-hidden flex items-center relative">
            <div
              className={`h-full ${team.Variance > 0 ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'} transition-all duration-700 ease-out`}
              style={{
                width: `${Math.min(Math.abs(team.Variance) * 5, 100)}%`,
                marginLeft: team.Variance > 0 ? '50%' : `${50 - Math.min(Math.abs(team.Variance) * 5, 50)}%`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-full bg-slate-800"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-3 font-medium">
            <span>Underperforming</span>
            <span className="font-bold text-slate-700">0</span>
            <span>Overperforming</span>
          </div>
        </div>
        <div className="mt-6 p-4 rounded-lg bg-slate-50">
          <p className={`text-sm font-medium ${
            team.Variance > 3 ? 'text-red-700' :
            team.Variance < -3 ? 'text-blue-700' :
            'text-slate-700'
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
        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2">Regression Probability</div>
          <div className="text-3xl font-semibold text-purple-900 mt-1">
            {(team.Regression_Probability * 100).toFixed(1)}%
          </div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
          <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-2">Z-Score</div>
          <div className="text-3xl font-semibold text-indigo-900 mt-1">
            {team.Z_Score.toFixed(2)}
          </div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200">
          <div className="text-xs font-medium text-cyan-600 uppercase tracking-wide mb-2">P-Value</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-semibold text-cyan-900">
              {team.P_Value.toFixed(3)}
            </div>
            {team.Significant && <span className="text-lg text-red-600 font-bold">*</span>}
          </div>
        </div>
      </div>

      {team.Significant && (
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200 p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center">
              <span className="text-yellow-700 text-xs font-bold">*</span>
            </div>
            <p className="text-sm text-yellow-900">
              <strong className="font-semibold">Statistically Significant:</strong> This variance is unlikely to be due to chance (p &lt; 0.05). The performance difference between actual and expected is meaningful.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="space-y-6">
      {/* Actual vs Expected Comparison */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Actual vs Expected Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Actual" fill="#3b82f6" name="Actual" />
            <Bar dataKey="Expected" fill="#10b981" name="Expected (xG/xPTS)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Variance Bar */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Variance: {team.Variance > 0 ? '+' : ''}{team.Variance.toFixed(1)} points
        </h3>
        <div className="relative">
          <div className="h-12 bg-gray-200 rounded-lg overflow-hidden flex items-center">
            <div
              className={`h-full ${team.Variance > 0 ? 'bg-red-500' : 'bg-blue-500'} transition-all duration-500`}
              style={{
                width: `${Math.min(Math.abs(team.Variance) * 5, 100)}%`,
                marginLeft: team.Variance > 0 ? '50%' : `${50 - Math.min(Math.abs(team.Variance) * 5, 50)}%`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-full bg-gray-800"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Underperforming</span>
            <span className="font-bold">0</span>
            <span>Overperforming</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          {team.Variance > 3 ?
            '⚠️ Significantly overperforming - high regression risk' :
            team.Variance < -3 ?
            '📈 Underperforming - potential for improvement' :
            '✅ Performing as expected'}
        </p>
      </div>

      {/* Statistical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Regression Probability</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {(team.Regression_Probability * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Z-Score</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {team.Z_Score.toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">P-Value</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {team.P_Value.toFixed(3)}
            {team.Significant && <span className="text-sm text-red-600 ml-2">*</span>}
          </div>
        </div>
      </div>

      {team.Significant && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>* Statistically Significant:</strong> This variance is unlikely to be due to chance (p &lt; 0.05)
          </p>
        </div>
      )}
    </div>
  );
}

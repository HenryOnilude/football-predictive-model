'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { FinishingBadge, getFinishingBadgeConfig } from '@/lib/TeamAnalysis';

interface LuckWaterfallChartProps {
  teamName: string;
  xG: number;
  PSxG?: number;
  goals: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
  label: string;
}

interface TooltipPayloadItem {
  payload: ChartDataItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  xG: number;
  PSxG?: number;
  goals: number;
}

function CustomTooltip({ active, payload, xG, PSxG, goals }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  let gapAnalysis = '';
  let gapValue = 0;
  let gapColor = 'text-slate-400';

  if (data.name === 'Shot Quality' && PSxG !== undefined) {
    gapValue = PSxG - xG;
    if (gapValue >= 3) {
      gapAnalysis = 'Elite Shot Selection';
      gapColor = 'text-emerald-400';
    } else if (gapValue <= -3) {
      gapAnalysis = 'Poor Shot Selection';
      gapColor = 'text-amber-400';
    } else {
      gapAnalysis = 'Normal Shot Quality';
      gapColor = 'text-slate-400';
    }
  } else if (data.name === 'Actual Goals') {
    const reference = PSxG !== undefined ? PSxG : xG;
    gapValue = goals - reference;
    if (gapValue >= 3) {
      gapAnalysis = 'Clinical Finishing';
      gapColor = 'text-emerald-400';
    } else if (gapValue <= -3) {
      gapAnalysis = 'Keeper Saves / Bad Luck';
      gapColor = 'text-rose-400';
    } else if (gapValue >= 1) {
      gapAnalysis = 'Slightly Lucky';
      gapColor = 'text-amber-400';
    } else if (gapValue <= -1) {
      gapAnalysis = 'Slightly Unlucky';
      gapColor = 'text-purple-400';
    } else {
      gapAnalysis = 'As Expected';
      gapColor = 'text-slate-400';
    }
  } else if (data.name === 'Chances Created') {
    gapAnalysis = 'Base Chance Quality';
    gapColor = 'text-blue-400';
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-white mb-1">{data.label}</p>
      <p className="text-2xl font-bold text-white font-mono">{data.value.toFixed(1)}</p>
      {gapAnalysis && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <p className={`text-xs font-semibold ${gapColor}`}>
            {gapAnalysis} {gapValue !== 0 && data.name !== 'Chances Created' && (
              <span>({gapValue > 0 ? '+' : ''}{gapValue.toFixed(1)})</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function getAnalysisText(teamName: string, xG: number, PSxG: number | undefined, goals: number): {
  badge: FinishingBadge;
  analysis: string;
} {
  // Calculate deltas
  const goalDelta = goals - xG;
  const psxgDelta = PSxG !== undefined ? PSxG - xG : 0;
  const finishingDelta = PSxG !== undefined ? goals - PSxG : 0;

  // Determine badge and analysis
  if (PSxG !== undefined) {
    // Advanced analysis with PSxG
    if (psxgDelta >= -2 && finishingDelta <= -5) {
      return {
        badge: 'SIEGE',
        analysis: `${teamName} is creating quality chances (xG: ${xG.toFixed(1)}, PSxG: ${PSxG.toFixed(1)}) but failing to convert them (Goals: ${goals}). This suggests goalkeeper saves or hitting the woodwork. Expect positive regression - goals are coming.`,
      };
    }
    if (psxgDelta >= 3 && finishingDelta >= 0) {
      return {
        badge: 'SNIPER',
        analysis: `${teamName} is taking elite-quality shots (PSxG: ${PSxG.toFixed(1)} vs xG: ${xG.toFixed(1)}) AND converting them (Goals: ${goals}). This is genuine skill, not luck - sustainable performance.`,
      };
    }
    if (psxgDelta <= -5 && Math.abs(finishingDelta) <= 3) {
      return {
        badge: 'WASTEFUL',
        analysis: `${teamName} is creating chances (xG: ${xG.toFixed(1)}) but taking poor quality shots (PSxG: ${PSxG.toFixed(1)}). The issue is shot selection, not luck. Need better finishing positions.`,
      };
    }
    if (xG <= 15 && goalDelta >= 5) {
      return {
        badge: 'GHOST',
        analysis: `${teamName} is scoring (Goals: ${goals}) despite poor chance creation (xG: ${xG.toFixed(1)}). These are lucky, scrappy goals - expect negative regression.`,
      };
    }
  } else {
    // Basic analysis without PSxG
    if (goalDelta <= -5) {
      return {
        badge: 'SIEGE',
        analysis: `${teamName} is creating good chances (xG: ${xG.toFixed(1)}) but not converting (Goals: ${goals}). Unlucky finishing - expect positive regression.`,
      };
    }
    if (goalDelta >= 5) {
      return {
        badge: 'GHOST',
        analysis: `${teamName} is scoring (Goals: ${goals}) beyond expected (xG: ${xG.toFixed(1)}). Lucky finishing - expect negative regression.`,
      };
    }
  }

  return {
    badge: 'FAIR',
    analysis: `${teamName} is performing as expected. Chances created (xG: ${xG.toFixed(1)}) roughly matches goals scored (${goals}). Sustainable performance with no major regression expected.`,
  };
}

export default function LuckWaterfallChart({ teamName, xG, PSxG, goals }: LuckWaterfallChartProps) {
  const hasPSxG = PSxG !== undefined;
  
  // Build chart data
  const chartData: ChartDataItem[] = [
    {
      name: 'Chances Created',
      value: xG,
      fill: '#64748b', // Slate
      label: 'xG (Expected Goals)',
    },
  ];

  if (hasPSxG) {
    chartData.push({
      name: 'Shot Quality',
      value: PSxG,
      fill: '#8b5cf6', // Purple
      label: 'PSxG (Post-Shot xG)',
    });
  }

  chartData.push({
    name: 'Actual Goals',
    value: goals,
    fill: '#10b981', // Emerald
    label: 'Goals Scored',
  });

  // Get analysis
  const { badge, analysis } = getAnalysisText(teamName, xG, PSxG, goals);
  const badgeConfig = getFinishingBadgeConfig(badge);

  // Calculate max for chart domain
  const maxValue = Math.max(xG, PSxG || 0, goals) * 1.2;

  return (
    <div className="card p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary-color)]">
            Finishing Flow Analysis
          </h3>
          <p className="text-sm text-[var(--text-secondary-color)]">
            xG → {hasPSxG ? 'PSxG → ' : ''}Goals Conversion
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${badgeConfig.bgColor} ${badgeConfig.textColor}`}>
          {badgeConfig.label}
        </span>
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
          >
            <XAxis 
              type="number" 
              domain={[0, maxValue]}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              tick={{ fill: '#f8fafc', fontSize: 13, fontWeight: 500 }}
              axisLine={{ stroke: '#334155' }}
              width={90}
            />
            <Tooltip 
              content={<CustomTooltip xG={xG} PSxG={PSxG} goals={goals} />}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <ReferenceLine x={xG} stroke="#64748b" strokeDasharray="3 3" />
            <Bar 
              dataKey="value" 
              radius={[0, 6, 6, 0]}
              barSize={40}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-[var(--border-subtle-color)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-500" />
          <span className="text-xs text-[var(--text-secondary-color)]">xG (Chance Quality)</span>
        </div>
        {hasPSxG && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-xs text-[var(--text-secondary-color)]">PSxG (Shot Quality)</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-xs text-[var(--text-secondary-color)]">Goals (Actual)</span>
        </div>
      </div>

      {/* Analysis Text */}
      <div className="bg-[var(--bg-surface)] rounded-lg p-4">
        <p className="text-sm font-semibold text-[var(--text-primary-color)] mb-2">Analysis</p>
        <p className="text-sm text-[var(--text-secondary-color)] leading-relaxed">
          {analysis}
        </p>
      </div>

      {/* Gap Breakdown (if PSxG available) */}
      {hasPSxG && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[var(--bg-surface)] rounded-lg p-3 text-center">
            <p className="text-xs text-[var(--text-muted-color)] uppercase mb-1">Shot Selection</p>
            <p className={`text-lg font-bold font-mono ${
              (PSxG - xG) >= 2 ? 'text-emerald-400' : 
              (PSxG - xG) <= -2 ? 'text-amber-400' : 'text-slate-400'
            }`}>
              {(PSxG - xG) > 0 ? '+' : ''}{(PSxG - xG).toFixed(1)}
            </p>
            <p className="text-[10px] text-[var(--text-muted-color)]">PSxG - xG</p>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-lg p-3 text-center">
            <p className="text-xs text-[var(--text-muted-color)] uppercase mb-1">Finishing</p>
            <p className={`text-lg font-bold font-mono ${
              (goals - PSxG) >= 2 ? 'text-emerald-400' : 
              (goals - PSxG) <= -2 ? 'text-rose-400' : 'text-slate-400'
            }`}>
              {(goals - PSxG) > 0 ? '+' : ''}{(goals - PSxG).toFixed(1)}
            </p>
            <p className="text-[10px] text-[var(--text-muted-color)]">Goals - PSxG</p>
          </div>
        </div>
      )}
    </div>
  );
}

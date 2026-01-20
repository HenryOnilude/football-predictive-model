'use client';

import { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import Image from 'next/image';

interface TeamData {
  teamId: number;
  teamName: string;
  teamLogo?: string;
  avgXGPer90: number;
  avgXGCPer90: number;
  sustainabilityScore: number;
  marketVerdict: string;
}

interface MagicQuadrantProps {
  teams: TeamData[];
}

// Get action tag based on quadrant position (matching research terminology)
function getActionTag(xG: number, xGC: number, avgXG: number, avgXGC: number): string {
  const isHighXG = xG > avgXG;
  const isLowXGC = xGC < avgXGC;
  
  if (isHighXG && isLowXGC) return 'THE ELITE'; // Top-Right: High attack, strong defense (Trust)
  if (isHighXG && !isLowXGC) return 'ENTERTAINERS'; // Top-Left: High attack, weak defense (Glass Cannon)
  if (!isHighXG && isLowXGC) return 'PRAGMATISTS'; // Bottom-Right: Low attack, strong defense (Solid but boring)
  return 'STRUGGLERS'; // Bottom-Left: Low attack, weak defense (Avoid)
}

// Get quadrant color
function getQuadrantColor(xG: number, xGC: number, avgXG: number, avgXGC: number): string {
  const isHighXG = xG > avgXG;
  const isLowXGC = xGC < avgXGC;
  
  if (isHighXG && isLowXGC) return '#10b981'; // Emerald - Elite
  if (isHighXG && !isLowXGC) return '#f59e0b'; // Amber - Attacking
  if (!isHighXG && isLowXGC) return '#3b82f6'; // Blue - Defensive
  return '#ef4444'; // Red - Strugglers
}

// Custom tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TeamData & { actionTag: string } }> }) {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        {data.teamLogo && (
          <Image
            src={data.teamLogo}
            alt={data.teamName}
            width={24}
            height={24}
            className="object-contain"
            unoptimized
          />
        )}
        <span className="font-bold text-white">{data.teamName}</span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">xG/90:</span>
          <span className="text-emerald-400 font-mono">{data.avgXGPer90.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">xGC/90:</span>
          <span className="text-rose-400 font-mono">{data.avgXGCPer90.toFixed(2)}</span>
        </div>
        <div className="pt-1 border-t border-slate-700 mt-1">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            data.actionTag === 'THE ELITE' ? 'bg-emerald-500/20 text-emerald-400' :
            data.actionTag === 'ENTERTAINERS' ? 'bg-amber-500/20 text-amber-400' :
            data.actionTag === 'PRAGMATISTS' ? 'bg-blue-500/20 text-blue-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {data.actionTag}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MagicQuadrant({ teams }: MagicQuadrantProps) {
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
  
  // Calculate averages for quadrant lines
  const avgXG = teams.reduce((sum, t) => sum + t.avgXGPer90, 0) / teams.length;
  const avgXGC = teams.reduce((sum, t) => sum + t.avgXGCPer90, 0) / teams.length;
  
  // Prepare data with action tags
  const chartData = teams.map(t => ({
    ...t,
    // X-axis: xGC (reversed - lower is better, so we want low xGC on RIGHT)
    x: t.avgXGCPer90,
    // Y-axis: xG (higher is better)
    y: t.avgXGPer90,
    actionTag: getActionTag(t.avgXGPer90, t.avgXGCPer90, avgXG, avgXGC),
  }));
  
  // Get domain bounds
  const xValues = chartData.map(d => d.x);
  const yValues = chartData.map(d => d.y);
  const xMin = Math.min(...xValues) - 0.1;
  const xMax = Math.max(...xValues) + 0.1;
  const yMin = Math.min(...yValues) - 0.1;
  const yMax = Math.max(...yValues) + 0.1;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-1">Magic Quadrant</h3>
        <p className="text-xs text-slate-500">xG vs xGC Analysis • Lower xGC (right) = Better Defense</p>
      </div>
      
      {/* Quadrant Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-400">THE ELITE (Dominant)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-400">ENTERTAINERS (Glass Cannon)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-400">PRAGMATISTS (Solid Defense)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-400">STRUGGLERS (Avoid)</span>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            
            {/* X-Axis: xGC (reversed) */}
            <XAxis
              type="number"
              dataKey="x"
              name="xGC/90"
              domain={[xMax, xMin]} // Reversed: high xGC on left, low xGC on right
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => v.toFixed(1)}
              label={{ 
                value: '← More Goals Conceded | Fewer Goals Conceded →', 
                position: 'bottom', 
                fill: '#64748b',
                fontSize: 11,
                offset: 20
              }}
            />
            
            {/* Y-Axis: xG */}
            <YAxis
              type="number"
              dataKey="y"
              name="xG/90"
              domain={[yMin, yMax]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => v.toFixed(1)}
              label={{ 
                value: 'Expected Goals (xG/90)', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11,
                offset: 10
              }}
            />
            
            {/* Reference lines for quadrant dividers */}
            <ReferenceLine x={avgXGC} stroke="#475569" strokeDasharray="5 5" />
            <ReferenceLine y={avgXG} stroke="#475569" strokeDasharray="5 5" />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Scatter data={chartData} fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getQuadrantColor(entry.avgXGPer90, entry.avgXGCPer90, avgXG, avgXGC)}
                  stroke={hoveredTeam === entry.teamName ? '#fff' : 'transparent'}
                  strokeWidth={2}
                  r={hoveredTeam === entry.teamName ? 10 : 7}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredTeam(entry.teamName)}
                  onMouseLeave={() => setHoveredTeam(null)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {/* Quadrant Labels */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-center text-xs">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
          <span className="text-amber-400 font-semibold">Top Left: ENTERTAINERS</span>
          <p className="text-slate-500">High Risk / High Reward (Glass Cannon)</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2">
          <span className="text-emerald-400 font-semibold">Top Right: THE ELITE</span>
          <p className="text-slate-500">Dominant - Trust the Process</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
          <span className="text-red-400 font-semibold">Bottom Left: STRUGGLERS</span>
          <p className="text-slate-500">Poor Attack, Leaky Defense - Avoid</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
          <span className="text-blue-400 font-semibold">Bottom Right: PRAGMATISTS</span>
          <p className="text-slate-500">Low Attack, Solid Defense</p>
        </div>
      </div>
    </div>
  );
}

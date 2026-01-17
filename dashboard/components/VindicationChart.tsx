'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface MatchEvent {
  minute: number;
  homeXG: number;
  awayXG: number;
  event?: string;
}

interface VindicationChartProps {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  matchEvents: MatchEvent[];
}

type Verdict = 'DAYLIGHT_ROBBERY' | 'JUSTICE_SERVED' | 'FAIR_RESULT';

function getVerdict(
  homeXG: number,
  awayXG: number,
  homeGoals: number,
  awayGoals: number
): { verdict: Verdict; label: string; description: string } {
  const winner = homeGoals > awayGoals ? 'home' : awayGoals > homeGoals ? 'away' : 'draw';
  
  if (winner === 'draw') {
    const xgDiff = Math.abs(homeXG - awayXG);
    if (xgDiff > 1.0) {
      return {
        verdict: 'DAYLIGHT_ROBBERY',
        label: 'VERDICT: DAYLIGHT ROBBERY',
        description: `${homeXG > awayXG ? 'Home' : 'Away'} dominated but couldn't convert`,
      };
    }
    return {
      verdict: 'FAIR_RESULT',
      label: 'VERDICT: FAIR RESULT',
      description: 'The draw reflects the balance of play',
    };
  }

  const winnerXG = winner === 'home' ? homeXG : awayXG;
  const loserXG = winner === 'home' ? awayXG : homeXG;
  const winnerName = winner === 'home' ? 'Home' : 'Away';
  const loserName = winner === 'home' ? 'Away' : 'Home';

  // Loser dominated on xG but lost
  if (loserXG > winnerXG + 1.0) {
    return {
      verdict: 'DAYLIGHT_ROBBERY',
      label: 'VERDICT: DAYLIGHT ROBBERY',
      description: `${loserName} deserved more based on xG (${loserXG.toFixed(2)} vs ${winnerXG.toFixed(2)})`,
    };
  }

  // Winner dominated on xG and won
  if (winnerXG > loserXG + 1.0) {
    return {
      verdict: 'JUSTICE_SERVED',
      label: 'VERDICT: JUSTICE SERVED',
      description: `${winnerName} deserved the win based on xG dominance`,
    };
  }

  return {
    verdict: 'FAIR_RESULT',
    label: 'VERDICT: FAIR RESULT',
    description: 'The result reflects the balance of chances created',
  };
}

export default function VindicationChart({
  homeTeam,
  awayTeam,
  homeGoals,
  awayGoals,
  matchEvents,
}: VindicationChartProps) {
// Get final xG values
  const finalEvent = matchEvents[matchEvents.length - 1];
  const finalHomeXG = finalEvent?.homeXG || 0;
  const finalAwayXG = finalEvent?.awayXG || 0;

  const { verdict, label, description } = getVerdict(
    finalHomeXG,
    finalAwayXG,
    homeGoals,
    awayGoals
  );

return (
    <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">
            Match Dominance Chart
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            xG accumulation over 90 minutes
          </p>
        </div>
        
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{homeTeam}</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{homeGoals}</p>
          </div>
          <div className="text-slate-600 text-lg">-</div>
          <div className="text-left">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{awayTeam}</p>
            <p className="text-2xl font-bold text-rose-400 font-mono">{awayGoals}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={matchEvents}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <XAxis
              dataKey="minute"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#64748b' }}
              axisLine={{ stroke: '#475569' }}
              label={{
                value: 'Minutes',
                position: 'insideBottomRight',
                offset: -5,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#64748b' }}
              axisLine={{ stroke: '#475569' }}
              label={{
                value: 'xG',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
              itemStyle={{ fontSize: '14px' }}
              formatter={(value, name) => [
                `${Number(value).toFixed(2)} xG`,
                name === 'homeXG' ? homeTeam : awayTeam,
              ]}
              labelFormatter={(label) => `${label}' minute`}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-slate-300 text-sm">
                  {value === 'homeXG' ? homeTeam : awayTeam}
                </span>
              )}
            />
            
            {/* Reference lines for halftime and fulltime */}
            <ReferenceLine x={45} stroke="#475569" strokeDasharray="5 5" />
            <ReferenceLine x={90} stroke="#475569" strokeDasharray="5 5" />

            {/* Home xG Line - Neon Green with stepAfter */}
            <Line
              type="stepAfter"
              dataKey="homeXG"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                fill: '#10b981',
                stroke: '#022c22',
                strokeWidth: 2,
              }}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))',
              }}
            />

            {/* Away xG Line - Neon Red with stepAfter */}
            <Line
              type="stepAfter"
              dataKey="awayXG"
              stroke="#f43f5e"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                fill: '#f43f5e',
                stroke: '#4c0519',
                strokeWidth: 2,
              }}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.5))',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Final xG Summary */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
              {homeTeam} xG
            </p>
            <p className="text-xl font-bold text-emerald-400 font-mono">
              {finalHomeXG.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
              {awayTeam} xG
            </p>
            <p className="text-xl font-bold text-rose-400 font-mono">
              {finalAwayXG.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Verdict Badge */}
        <div
          className={`
            px-4 py-2 rounded-lg font-semibold text-sm
            ${verdict === 'DAYLIGHT_ROBBERY'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse'
              : verdict === 'JUSTICE_SERVED'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
              : 'bg-slate-700/50 text-slate-300 border border-slate-600'
            }
          `}
        >
          {label}
        </div>
      </div>

      {/* Verdict Description */}
      <p className="text-sm text-slate-400 mt-3">{description}</p>
    </div>
  );
}

// Demo data generator for testing
export function generateDemoMatchEvents(): MatchEvent[] {
  const events: MatchEvent[] = [];
  let homeXG = 0;
  let awayXG = 0;

  // Generate xG accumulation over 90 minutes
  for (let minute = 0; minute <= 90; minute += 5) {
    // Random chance creation
    if (minute > 0) {
      if (Math.random() > 0.6) {
        homeXG += Math.random() * 0.3;
      }
      if (Math.random() > 0.6) {
        awayXG += Math.random() * 0.3;
      }
    }

    events.push({
      minute,
      homeXG: Number(homeXG.toFixed(2)),
      awayXG: Number(awayXG.toFixed(2)),
    });
  }

  return events;
}

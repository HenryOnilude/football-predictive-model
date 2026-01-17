/**
 * Team Performance Analysis - Health vs. Heat Matrix
 * 5-Tier Efficiency Gradient for nuanced team analysis
 */

export interface TeamStats {
  teamId: number;
  teamName: string;
  teamLogo?: string;
  goalsFor: number;
  goalsAgainst: number;
  xGFor: number;
  xGAgainst: number;
  matchesPlayed: number;
  points: number;
}

// 5-Tier Efficiency Status
export type EfficiencyStatus = 
  | 'CRITICAL_OVER'   // Diff > +6.0 (🔴 Red)
  | 'RUNNING_HOT'     // Diff +2.0 to +6.0 (🟠 Orange)
  | 'SUSTAINABLE'     // Diff -2.0 to +2.0 (⚪ Gray)
  | 'COLD'            // Diff -6.0 to -2.0 (🔵 Blue)
  | 'CRITICAL_VALUE'; // Diff < -6.0 (🟣 Purple)

// Market Verdict Archetypes
export type MarketVerdict = 
  | 'DOMINANT'    // High Sust + Hot (Trust)
  | 'OVERHEATED'  // Low Sust + Hot (⚠️ Warning)
  | 'PRIME_BUY'   // High Sust + Cold (💎 Opportunity)
  | 'CRITICAL'    // Low Sust + Cold (Relegation Form)
  | 'STABLE'      // High Sust + Sustainable
  | 'FRAGILE';    // Low Sust + Sustainable

export interface TeamAnalysis {
  teamId: number;
  teamName: string;
  teamLogo?: string;
  sustainabilityScore: number; // 0-100 (Health)
  efficiencyStatus: EfficiencyStatus; // 5-tier (Heat)
  efficiencyDelta: number; // Goals - xG
  netXGPer90: number; // xGFor - xGAgainst per 90
  marketVerdict: MarketVerdict;
  chanceGrade: 'Elite' | 'Good' | 'Average' | 'Poor' | 'Broken';
  insightNote: string;
}

// Legacy type for backwards compatibility
export type ConversionStatus = 'OVER' | 'UNDER' | 'MEAN';

/**
 * Calculate Sustainability Score (Health) based on Net xG per 90
 * Scale: 0-100 where 50 is average
 * Net xG > +0.5: 80-100 (Elite)
 * Net xG ~0.0: 50 (Average)
 * Net xG < -0.5: 0-20 (Broken)
 */
function calculateSustainabilityScore(netXGPer90: number): number {
  if (netXGPer90 >= 0.5) {
    // Elite: 80-100 (linear from 0.5 to 1.5)
    const normalized = Math.min(1, (netXGPer90 - 0.5) / 1.0);
    return Math.round(80 + normalized * 20);
  } else if (netXGPer90 >= -0.5) {
    // Average: 20-80 (linear from -0.5 to 0.5)
    const normalized = (netXGPer90 + 0.5) / 1.0;
    return Math.round(20 + normalized * 60);
  } else {
    // Broken: 0-20 (linear from -1.5 to -0.5)
    const normalized = Math.max(0, (netXGPer90 + 1.5) / 1.0);
    return Math.round(normalized * 20);
  }
}

/**
 * Determine 5-Tier Efficiency Status based on Goals - xG difference
 */
function determineEfficiencyStatus(efficiencyDelta: number): EfficiencyStatus {
  if (efficiencyDelta > 6.0) {
    return 'CRITICAL_OVER';
  } else if (efficiencyDelta >= 2.0) {
    return 'RUNNING_HOT';
  } else if (efficiencyDelta >= -2.0) {
    return 'SUSTAINABLE';
  } else if (efficiencyDelta >= -6.0) {
    return 'COLD';
  }
  return 'CRITICAL_VALUE';
}

/**
 * Derive Market Verdict based on Sustainability + Efficiency
 */
function deriveMarketVerdict(
  sustainabilityScore: number,
  efficiencyStatus: EfficiencyStatus
): MarketVerdict {
  const isHighSustainability = sustainabilityScore >= 60;
  const isHot = efficiencyStatus === 'CRITICAL_OVER' || efficiencyStatus === 'RUNNING_HOT';
  const isCold = efficiencyStatus === 'CRITICAL_VALUE' || efficiencyStatus === 'COLD';

  if (isHighSustainability && isHot) return 'DOMINANT';
  if (!isHighSustainability && isHot) return 'OVERHEATED';
  if (isHighSustainability && isCold) return 'PRIME_BUY';
  if (!isHighSustainability && isCold) return 'CRITICAL';
  if (isHighSustainability) return 'STABLE';
  return 'FRAGILE';
}

/**
 * Get chance creation grade based on xG per 90
 */
function getChanceGrade(xGPer90: number): 'Elite' | 'Good' | 'Average' | 'Poor' | 'Broken' {
  if (xGPer90 >= 2.0) return 'Elite';
  if (xGPer90 >= 1.5) return 'Good';
  if (xGPer90 >= 1.0) return 'Average';
  if (xGPer90 >= 0.5) return 'Poor';
  return 'Broken';
}

/**
 * Generate insight note based on efficiency status
 */
function generateInsightNote(efficiencyStatus: EfficiencyStatus, marketVerdict: MarketVerdict): string {
  switch (efficiencyStatus) {
    case 'CRITICAL_OVER':
      return 'Performance is statistically unsustainable. Selling recommended.';
    case 'RUNNING_HOT':
      return 'Finishing is elite right now, but monitor closely.';
    case 'COLD':
      return 'Conversion is below expected. Watch for positive regression.';
    case 'CRITICAL_VALUE':
      return 'Creating great chances but suffering bad luck. High probability of haul.';
    case 'SUSTAINABLE':
    default:
      if (marketVerdict === 'STABLE') {
        return 'Performance aligns with underlying metrics. Low volatility expected.';
      }
      return 'Metrics reflect true performance level. No significant regression expected.';
  }
}

/**
 * Main analysis function - analyzes team performance
 * Returns 5-tier Health vs. Heat Matrix analysis
 */
export function analyzeTeamPerformance(teamStats: TeamStats): TeamAnalysis {
  const netXG = teamStats.xGFor - teamStats.xGAgainst;
  const netXGPer90 = teamStats.matchesPlayed > 0 ? netXG / teamStats.matchesPlayed : 0;
  const efficiencyDelta = teamStats.goalsFor - teamStats.xGFor;
  const xGPer90 = teamStats.matchesPlayed > 0 ? teamStats.xGFor / teamStats.matchesPlayed : 0;

  const sustainabilityScore = calculateSustainabilityScore(netXGPer90);
  const efficiencyStatus = determineEfficiencyStatus(efficiencyDelta);
  const marketVerdict = deriveMarketVerdict(sustainabilityScore, efficiencyStatus);
  const chanceGrade = getChanceGrade(xGPer90);
  const insightNote = generateInsightNote(efficiencyStatus, marketVerdict);

  return {
    teamId: teamStats.teamId,
    teamName: teamStats.teamName,
    teamLogo: teamStats.teamLogo,
    sustainabilityScore,
    efficiencyStatus,
    efficiencyDelta: Number(efficiencyDelta.toFixed(1)),
    netXGPer90: Number(netXGPer90.toFixed(2)),
    marketVerdict,
    chanceGrade,
    insightNote,
  };
}

/**
 * Batch analyze multiple teams
 */
export function analyzeAllTeams(teamsStats: TeamStats[]): TeamAnalysis[] {
  return teamsStats.map(analyzeTeamPerformance);
}

/**
 * Get efficiency badge configuration for UI
 */
export function getEfficiencyBadgeConfig(status: EfficiencyStatus): {
  label: string;
  textColor: string;
  bgColor: string;
} {
  switch (status) {
    case 'CRITICAL_OVER':
      return {
        label: 'CRIT OVER',
        textColor: 'text-white',
        bgColor: 'bg-red-600',
      };
    case 'RUNNING_HOT':
      return {
        label: 'HEATING UP',
        textColor: 'text-white',
        bgColor: 'bg-orange-500',
      };
    case 'COLD':
      return {
        label: 'COLD',
        textColor: 'text-blue-900',
        bgColor: 'bg-blue-300',
      };
    case 'CRITICAL_VALUE':
      return {
        label: 'EXTREME VAL',
        textColor: 'text-white',
        bgColor: 'bg-purple-600',
      };
    case 'SUSTAINABLE':
    default:
      return {
        label: 'FAIR VALUE',
        textColor: 'text-slate-400',
        bgColor: 'bg-slate-700',
      };
  }
}

/**
 * Get sustainability score color based on value
 */
export function getSustainabilityColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-rose-500';
}

/**
 * Get market verdict display config
 */
export function getVerdictConfig(verdict: MarketVerdict): {
  label: string;
  icon: string;
  color: string;
} {
  switch (verdict) {
    case 'DOMINANT':
      return { label: 'DOMINANT', icon: '', color: 'text-emerald-400' };
    case 'OVERHEATED':
      return { label: 'OVERHEATED', icon: '⚠️', color: 'text-amber-400' };
    case 'PRIME_BUY':
      return { label: 'PRIME BUY', icon: '💎', color: 'text-purple-400' };
    case 'CRITICAL':
      return { label: 'CRITICAL', icon: '🚨', color: 'text-red-400' };
    case 'STABLE':
      return { label: 'STABLE', icon: '', color: 'text-slate-400' };
    case 'FRAGILE':
    default:
      return { label: 'FRAGILE', icon: '', color: 'text-slate-500' };
  }
}

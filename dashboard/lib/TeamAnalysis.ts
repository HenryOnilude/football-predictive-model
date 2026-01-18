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
 * Calibrated for Premier League range:
 * - Top Tier (City/Arsenal): ~+1.5 Net xG per 90 → ~100
 * - Mid Table: ~0.0 Net xG per 90 → ~50
 * - Relegation Tier: ~-1.5 Net xG per 90 → ~0
 * 
 * Formula: (Net_xG_Per90 + 1.5) / 3.0 * 100, clamped to 0-99
 */
function calculateSustainabilityScore(netXGPer90: number): number {
  // Linear scale from -1.5 (0) to +1.5 (100)
  const rawScore = ((netXGPer90 + 1.5) / 3.0) * 100;
  return Math.round(Math.min(Math.max(rawScore, 0), 99));
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
 * 
 * Calibrated thresholds:
 * - DOMINANT: Elite teams (Health > 80) that are hot - they can sustain it
 * - CRITICAL: Weak teams (Health < 40) that are hot - unsustainable luck
 * - PRIME_BUY: Good teams (Health > 60) that are cold - buy the dip
 * - OVERHEATED: Average teams (40-80) that are hot - regression likely
 * - STABLE: Good teams performing as expected
 * - FRAGILE: Weak teams performing as expected
 */
function deriveMarketVerdict(
  sustainabilityScore: number,
  efficiencyStatus: EfficiencyStatus
): MarketVerdict {
  const isElite = sustainabilityScore > 80;
  const isGood = sustainabilityScore > 60;
  const isWeak = sustainabilityScore < 40;
  const isHot = efficiencyStatus === 'CRITICAL_OVER' || efficiencyStatus === 'RUNNING_HOT';
  const isCold = efficiencyStatus === 'CRITICAL_VALUE' || efficiencyStatus === 'COLD';

  // Elite teams that are hot = DOMINANT (they can sustain it)
  if (isElite && isHot) return 'DOMINANT';
  
  // Weak teams that are hot = CRITICAL (unsustainable luck)
  if (isWeak && isHot) return 'CRITICAL';
  
  // Average/mid teams that are hot = OVERHEATED (regression likely)
  if (isHot) return 'OVERHEATED';
  
  // Good teams that are cold = PRIME_BUY (buy the dip)
  if (isGood && isCold) return 'PRIME_BUY';
  
  // Weak teams that are cold = CRITICAL (bad and unlucky)
  if (isWeak && isCold) return 'CRITICAL';
  
  // Good teams performing as expected = STABLE
  if (isGood) return 'STABLE';
  
  // Everyone else = FRAGILE
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
 * Calibrated thresholds: Green > 75, Yellow 45-75, Red < 45
 */
export function getSustainabilityColor(score: number): string {
  if (score > 75) return 'bg-emerald-500';
  if (score >= 45) return 'bg-amber-500';
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
      return { label: 'DOMINANT', icon: '💎', color: 'text-emerald-400' };
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

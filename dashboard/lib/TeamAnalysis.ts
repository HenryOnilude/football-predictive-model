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
  // Post-Shot xG metrics (optional - for advanced analysis)
  PSxG?: number;        // Post-Shot Expected Goals (shot quality)
  xGOT?: number;        // Expected Goals On Target
}

// 5-Tier Efficiency Status
export type EfficiencyStatus = 
  | 'CRITICAL_OVER'   // Diff > +6.0 (Red)
  | 'RUNNING_HOT'     // Diff +2.0 to +6.0 (Orange)
  | 'SUSTAINABLE'     // Diff -2.0 to +2.0 (Gray)
  | 'COLD'            // Diff -6.0 to -2.0 (Blue)
  | 'CRITICAL_VALUE'; // Diff < -6.0 (Purple)

// Market Verdict Archetypes
export type MarketVerdict = 
  | 'DOMINANT'      // High Sust + Hot + Good Defense (Trust - THE ELITE)
  | 'ENTERTAINERS'  // High Attack + Poor Defense (Glass Cannon - Top-Left Quadrant)
  | 'OVERHEATED'    // Low Sust + Hot (Warning)
  | 'PRIME_BUY'     // High Sust + Cold (Opportunity)
  | 'CRITICAL'      // Low Sust + Cold (Relegation Form)
  | 'STABLE'        // High Sust + Sustainable
  | 'FRAGILE';      // Low Sust + Sustainable

// Finishing Badge (PSxG-based analysis)
export type FinishingBadge = 
  | 'SIEGE'      // Unlucky - great chances, can't convert
  | 'SNIPER'     // Elite skill - clinical finishing
  | 'FAIR'       // Sustainable - performing as expected
  | 'WASTEFUL'   // Bad finishing - poor shot quality
  | 'MIRAGE';    // Results are an illusion - sell

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
  // For Magic Quadrant visualization
  avgXGPer90?: number;
  avgXGCPer90?: number;
  // PSxG-based advanced analysis (optional)
  finishingBadge?: FinishingBadge;
  hasPSxGData?: boolean;
}

// Legacy type for backwards compatibility
export type ConversionStatus = 'OVER' | 'UNDER' | 'MEAN';

/**
 * Calculate Sustainability Score (Health) based on Net xG per 90
 * Calibrated for Premier League range:
 * - Elite (City/Arsenal): ~+0.8 Net xG per 90 → ~100
 * - Mid Table: ~0.0 Net xG per 90 → ~50
 * - Relegation Tier: ~-0.8 Net xG per 90 → ~0
 * 
 * Formula: (Net_xG_Per90 + 0.8) / 1.6 * 100, clamped to 1-99
 */
function calculateSustainabilityScore(netXGPer90: number): number {
  const ELITE_THRESHOLD = 0.8;
  const RELEGATION_THRESHOLD = -0.8;
  
  // Map [-0.8, +0.8] to [0, 100]
  const score = ((netXGPer90 - RELEGATION_THRESHOLD) * 100) / (ELITE_THRESHOLD - RELEGATION_THRESHOLD);
  
  // Handle NaN edge case
  if (isNaN(score)) {
    return 50;
  }
  
  return Math.round(Math.min(Math.max(score, 1), 99));
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
 * Calculate finishing badge based on PSxG analysis
 * Uses advanced logic when PSxG is available, falls back to basic logic otherwise
 */
function calculateFinishingBadge(teamStats: TeamStats): FinishingBadge {
  // If no PSxG data, return FAIR as default (basic logic)
  if (!teamStats.PSxG) {
    return 'FAIR';
  }

  const goalDelta = teamStats.goalsFor - teamStats.xGFor;           // Overall luck
  const psxgDelta = teamStats.PSxG - teamStats.xGFor;               // Shot quality (PSxG > xG = better shots)
  const finishingDelta = teamStats.goalsFor - teamStats.PSxG;       // Finishing skill (Goals > PSxG = clinical)

  // SIEGE: High quality chances (PSxG ≈ xG), but not converting (Goals << PSxG)
  // They're hitting the target but keepers are saving or hitting woodwork
  if (psxgDelta >= -2 && finishingDelta <= -5) {
    return 'SIEGE';
  }

  // SNIPER: Better shots than expected (PSxG > xG) AND converting them (Goals ≥ PSxG)
  // Elite finishing skill - taking AND making great chances
  if (psxgDelta >= 3 && finishingDelta >= 0) {
    return 'SNIPER';
  }

  // WASTEFUL: Poor shot quality (PSxG << xG) AND not converting (Goals ≈ PSxG)
  // Taking bad shots and not getting lucky
  if (psxgDelta <= -5 && Math.abs(finishingDelta) <= 3) {
    return 'WASTEFUL';
  }

  // MIRAGE: Low xG, low PSxG, but high goals
  // Results are an illusion - scrappy goals, deflections
  if (teamStats.xGFor <= 15 && goalDelta >= 5) {
    return 'MIRAGE';
  }

  // FAIR: Everything roughly aligned
  return 'FAIR';
}

/**
 * Main analysis function - analyzes team performance
 * Returns 5-tier Health vs. Heat Matrix analysis
 * Uses PSxG for advanced finishing badge when available
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
  
  // Advanced PSxG analysis (if data available)
  const hasPSxGData = teamStats.PSxG !== undefined;
  const finishingBadge = calculateFinishingBadge(teamStats);

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
    finishingBadge,
    hasPSxGData,
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
      return { label: 'DOMINANT', icon: '', color: 'text-emerald-400' };
    case 'ENTERTAINERS':
      return { label: 'ENTERTAINERS', icon: '', color: 'text-amber-400' };
    case 'OVERHEATED':
      return { label: 'OVERHEATED', icon: '', color: 'text-orange-400' };
    case 'PRIME_BUY':
      return { label: 'PRIME BUY', icon: '', color: 'text-purple-400' };
    case 'CRITICAL':
      return { label: 'CRITICAL', icon: '', color: 'text-red-400' };
    case 'STABLE':
      return { label: 'STABLE', icon: '', color: 'text-slate-400' };
    case 'FRAGILE':
    default:
      return { label: 'FRAGILE', icon: '', color: 'text-slate-500' };
  }
}

/**
 * Get finishing badge display config (PSxG-based)
 */
export function getFinishingBadgeConfig(badge: FinishingBadge): {
  label: string;
  description: string;
  bgColor: string;
  textColor: string;
} {
  switch (badge) {
    case 'SIEGE':
      return {
        label: 'SIEGE',
        description: 'Creating quality chances but can\'t convert. Goals are coming.',
        bgColor: 'bg-purple-600',
        textColor: 'text-white',
      };
    case 'SNIPER':
      return {
        label: 'SNIPER',
        description: 'Elite finishing skill. Taking AND making great chances.',
        bgColor: 'bg-emerald-600',
        textColor: 'text-white',
      };
    case 'FAIR':
      return {
        label: 'FAIR',
        description: 'Performing as expected. No significant edge.',
        bgColor: 'bg-slate-600',
        textColor: 'text-white',
      };
    case 'WASTEFUL':
      return {
        label: 'WASTEFUL',
        description: 'Poor shot selection. Taking bad chances.',
        bgColor: 'bg-amber-600',
        textColor: 'text-white',
      };
    case 'MIRAGE':
      return {
        label: 'MIRAGE',
        description: 'Results are an illusion. High goals vs Low xG. Sell.',
        bgColor: 'bg-rose-600',
        textColor: 'text-white',
      };
  }
}

// ============================================================================
// FPL API Data Fetcher & Transformer
// Official Fantasy Premier League API Integration
// ============================================================================

import type { TeamAnalysis } from './TeamAnalysis';

// -----------------------------------------------------------------------------
// Raw FPL API Types
// -----------------------------------------------------------------------------

export interface FPLElement {
  id: number;
  code: number; // Used for player photos
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  team_code: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  now_cost: number; // Price in 0.1m units (e.g., 100 = £10.0m)
  total_points: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  minutes: number;
  starts: number;
  expected_goals: string; // xG as string
  expected_assists: string; // xA as string
  expected_goal_involvements: string;
  expected_goals_conceded: string; // xGC as string
  expected_goals_per_90: number;
  expected_assists_per_90: number;
  expected_goal_involvements_per_90: number;
  expected_goals_conceded_per_90: number;
  saves_per_90: number;
  clean_sheets_per_90: number;
  form: string;
  points_per_game: string;
  selected_by_percent: string;
  status: string; // 'a' = available, 'i' = injured, etc.
  news: string;
  chance_of_playing_next_round: number | null;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
}

export interface FPLTeam {
  id: number;
  code: number;
  name: string;
  short_name: string;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

export interface FPLBootstrapResponse {
  elements: FPLElement[];
  teams: FPLTeam[];
  element_types: { id: number; singular_name: string; plural_name: string }[];
  events: { id: number; name: string; is_current: boolean; finished: boolean }[];
}

// -----------------------------------------------------------------------------
// Transformed Types for our App
// -----------------------------------------------------------------------------

export type PositionType = 'GK' | 'DEF' | 'MID' | 'FWD';
export type EfficiencyStatus = 'CRITICAL_OVER' | 'RUNNING_HOT' | 'SUSTAINABLE' | 'COLD' | 'CRITICAL_VALUE';
export type MarketVerdict = 'DOMINANT' | 'ENTERTAINERS' | 'OVERHEATED' | 'PRIME_BUY' | 'CRITICAL' | 'STABLE' | 'FRAGILE';

export interface PlayerHealthHeat {
  id: number;
  code: number;
  name: string;
  webName: string;
  team: string;
  teamShort: string;
  teamId: number;
  position: PositionType;
  price: number;
  photo: string;
  
  // Raw stats
  goals: number;
  assists: number;
  cleanSheets: number;
  minutes: number;
  xG: number;
  xA: number;
  xGC: number;
  
  // Per 90 metrics
  xGPer90: number;
  xAPer90: number;
  xGCPer90: number;
  
  // Health vs Heat metrics
  goalDelta: number; // Goals - xG
  sustainabilityScore: number; // 0-100
  efficiencyStatus: EfficiencyStatus;
  marketVerdict: MarketVerdict;
  
  // For defenders/GKs
  cleanSheetLuck?: number; // Actual CS vs expected based on xGC
  
  // Meta
  form: number;
  selectedBy: number;
  status: string;
  news: string;
}

export interface TeamHealthHeat {
  id: number;
  code: number;
  name: string;
  shortName: string;
  logo: string;
  
  // Aggregated from players
  totalGoals: number;
  totalXG: number;
  totalXGC: number;
  avgXGPer90: number;
  avgXGCPer90: number;
  
  // Health vs Heat
  goalDelta: number;
  sustainabilityScore: number;
  efficiencyStatus: EfficiencyStatus;
  marketVerdict: MarketVerdict;
  
  // Defense
  cleanSheets: number;
  cleanSheetLuck: number;
}

// -----------------------------------------------------------------------------
// Data Fetcher
// -----------------------------------------------------------------------------

export async function fetchFPLData(): Promise<FPLBootstrapResponse> {
  // Use our proxy API route to avoid CORS
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const response = await fetch(`${baseUrl}/api/fpl`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch FPL data: ${response.status}`);
  }
  
  return response.json();
}

// Server-side direct fetch (bypasses proxy for server components)
export async function fetchFPLDataServer(): Promise<FPLBootstrapResponse> {
  const response = await fetch(
    'https://fantasy.premierleague.com/api/bootstrap-static/',
    {
      next: { revalidate: 300 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FPL-Dashboard/1.0)',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status}`);
  }
  
  return response.json();
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

const POSITION_MAP: Record<number, PositionType> = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

function getPlayerPhoto(code: number): string {
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${code}.png`;
}

function getTeamLogo(code: number): string {
  return `https://resources.premierleague.com/premierleague/badges/t${code}.png`;
}

function parseFloatSafe(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// -----------------------------------------------------------------------------
// Sustainability Score (0-100)
// Based on net xG per 90 (xGPer90 - xGCPer90) WITH absolute volume penalties
// -----------------------------------------------------------------------------

// FORENSIC FIX: Apply penalties based on absolute xG/xGA totals
// This prevents teams like Burnley (low volume) from gaming the per-90 ratio
// Thresholds based on forensic audit data (league averages ~30 xG, ~27 xGA)
function applyAbsoluteVolumePenalty(
  baseScore: number,
  totalXG: number,
  totalXGA: number
): number {
  let penalty = 0;
  
  // FIX 1: Minimum xG threshold - teams creating few chances can't be "Elite"
  // League average xG is ~30, Burnley has 18.7 (lowest)
  if (totalXG < 20) {
    penalty += 30; // Severe penalty for bottom-tier attack (Burnley, Wolves)
  } else if (totalXG < 22) {
    penalty += 15; // Moderate penalty for very weak attack (Spurs 21.4)
  }
  // Removed < 25 and < 30 thresholds - too aggressive for mid-table teams
  
  // FIX 2: Maximum xGA threshold - teams conceding lots can't be "Elite"
  // League average xGA is ~27, Burnley has 45.4 (worst)
  if (totalXGA > 42) {
    penalty += 30; // Severe penalty for terrible defense (Burnley only)
  } else if (totalXGA > 38) {
    penalty += 15; // Moderate penalty for very poor defense
  }
  // Removed > 30 and > 35 thresholds - too aggressive, was penalizing Man City (30.8)
  
  return Math.max(0, baseScore - penalty);
}

// FIXED: Use absolute xG difference instead of flawed per-90 averages
// Per-90 metrics from FPL API are player-level, not team-level
function calculateRawSustainabilityScore(totalXG: number, totalXGA: number): number {
  // Net xG Difference: Man City +28, Arsenal +25, Burnley -27
  const netXGDiff = totalXG - totalXGA;
  
  // Scale: -30 (terrible like Burnley) to +30 (elite like Man City) -> 0-100
  // Midpoint (0) = 50
  const normalized = (netXGDiff + 30) / 60; // Maps -30..+30 to 0..1
  const score = Math.round(normalized * 100);
  return Math.max(0, Math.min(100, score));
}

// Apply league position boost for top 4 teams
function applyLeaguePositionBoost(score: number, leagueRank: number): number {
  if (leagueRank <= 4) {
    return score + 15; // Boost top 4 teams
  }
  return score;
}

// Min-Max Normalization to spread scores 0-99
function normalizeScores(teams: { id: number; rawScore: number }[]): Map<number, number> {
  const scores = teams.map(t => t.rawScore);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore || 1; // Avoid division by zero
  
  const normalized = new Map<number, number>();
  for (const team of teams) {
    const normalizedScore = Math.round(((team.rawScore - minScore) / range) * 99);
    normalized.set(team.id, Math.max(1, Math.min(99, normalizedScore)));
  }
  return normalized;
}

// -----------------------------------------------------------------------------
// Efficiency Status (5-tier)
// Based on Goals - xG delta
// -----------------------------------------------------------------------------

function determineEfficiencyStatus(goalDelta: number): EfficiencyStatus {
  if (goalDelta > 6.0) return 'CRITICAL_OVER';
  if (goalDelta > 2.0) return 'RUNNING_HOT';
  if (goalDelta >= -2.0) return 'SUSTAINABLE';
  if (goalDelta >= -6.0) return 'COLD';
  return 'CRITICAL_VALUE';
}

// -----------------------------------------------------------------------------
// Game State Penalty (Desperation Fix)
// When trailing, teams generate inflated xG from "desperation shots"
// Apply 0.85 multiplier to discount low-quality volume
// -----------------------------------------------------------------------------

export type GameState = 'WINNING' | 'DRAWING' | 'TRAILING';

export function applyGameStatePenalty(
  xG: number,
  gameState: GameState
): number {
  // Desperation Penalty: trailing teams take more low-quality shots
  // Discount their xG by 15% to reflect true system health
  if (gameState === 'TRAILING') {
    return xG * 0.85;
  }
  return xG;
}

// -----------------------------------------------------------------------------
// Market Verdict (Rank-based for bell curve distribution)
// Top 3 = PRIME BUY, Next 5 = STABLE, Bottom 5 = AVOID/CRITICAL
// -----------------------------------------------------------------------------

function deriveMarketVerdictByRank(
  rank: number,
  sustainabilityScore: number,
  efficiencyStatus: EfficiencyStatus,
  defenseZScore: number, // Z-score: negative = below average defense
  attackZScore: number,  // Z-score: positive = above average attack
  totalGoals: number,    // Actual goal output (performance reality check)
  goalDelta: number      // Goals - xG (overperformance indicator)
): MarketVerdict {
  const isHot = efficiencyStatus === 'CRITICAL_OVER' || efficiencyStatus === 'RUNNING_HOT';
  const hasGoodDefense = defenseZScore >= 0; // At or above average
  const hasHighAttack = attackZScore > 0.5;  // Above average attack
  
  // REALITY CHECK: Teams with very low goal output can't be DOMINANT
  // This prevents relegation-tier teams from being mislabeled
  const isLowPerformer = totalGoals < 25; // Bottom-tier actual output
  const isMassiveOverperformer = goalDelta > 5; // Significantly outperforming xG
  
  // DEFENSE-GATE: High attack + poor defense = ENTERTAINERS (Glass Cannon)
  // This prevents teams like Spurs from being labeled DOMINANT
  if (hasHighAttack && !hasGoodDefense) {
    return 'ENTERTAINERS';
  }
  
  // OVERPERFORMANCE GATE: Hot teams with poor defense are ENTERTAINERS
  if (isHot && !hasGoodDefense) {
    return 'ENTERTAINERS';
  }
  
  // LOW PERFORMER GATE: Teams with very few goals can't be DOMINANT
  // Even if their xG metrics look good, actual results matter
  if (isLowPerformer && isMassiveOverperformer) {
    return 'OVERHEATED'; // Unsustainable - results don't match quality
  }
  if (isLowPerformer) {
    if (defenseZScore < -0.5) return 'CRITICAL';
    return 'FRAGILE';
  }
  
  // Top 3 teams by sustainability (with defense gate passed)
  if (rank <= 3) {
    if (isHot && hasGoodDefense) return 'DOMINANT';
    return 'PRIME_BUY';
  }
  
  // Next 5 teams (ranks 4-8)
  if (rank <= 8) {
    if (isHot && hasGoodDefense) return 'DOMINANT';
    if (sustainabilityScore >= 60) return 'STABLE';
    return 'STABLE';
  }
  
  // Middle teams (ranks 9-15)
  if (rank <= 15) {
    if (sustainabilityScore >= 50) return 'STABLE';
    return 'FRAGILE';
  }
  
  // Bottom 5 teams (ranks 16-20)
  if (rank >= 18) {
    return 'CRITICAL'; // Only bottom 3 get CRITICAL
  }
  
  return 'FRAGILE'; // ranks 16-17
}

// Simple verdict for individual players (not rank-based)
function derivePlayerVerdict(
  sustainabilityScore: number,
  efficiencyStatus: EfficiencyStatus
): MarketVerdict {
  const isHighSustainability = sustainabilityScore >= 60;
  const isLowSustainability = sustainabilityScore < 40;
  
  if (efficiencyStatus === 'CRITICAL_OVER' || efficiencyStatus === 'RUNNING_HOT') {
    return isHighSustainability ? 'DOMINANT' : 'OVERHEATED';
  }
  
  if (efficiencyStatus === 'CRITICAL_VALUE' || efficiencyStatus === 'COLD') {
    return isHighSustainability ? 'PRIME_BUY' : 'CRITICAL';
  }
  
  return isLowSustainability ? 'FRAGILE' : 'STABLE';
}

// -----------------------------------------------------------------------------
// Clean Sheet Luck (for Defenders/GKs)
// Compares actual clean sheets to expected based on xGC
// -----------------------------------------------------------------------------

function calculateCleanSheetLuck(
  cleanSheets: number,
  xGC: number,
  matches: number
): number {
  if (matches === 0) return 0;
  
  // Expected clean sheets based on Poisson distribution
  // P(0 goals) when xGC per match = λ is e^(-λ)
  const xGCPerMatch = xGC / matches;
  const expectedCSPerMatch = Math.exp(-xGCPerMatch);
  const expectedCS = expectedCSPerMatch * matches;
  
  // Luck = Actual - Expected
  return Number((cleanSheets - expectedCS).toFixed(2));
}

// -----------------------------------------------------------------------------
// Transform Players
// -----------------------------------------------------------------------------

export function transformPlayers(
  data: FPLBootstrapResponse
): PlayerHealthHeat[] {
  const teamMap = new Map(data.teams.map(t => [t.id, t]));
  
  return data.elements
    .filter(el => el.minutes > 0) // Only players with minutes
    .map(el => {
      const team = teamMap.get(el.team);
      const position = POSITION_MAP[el.element_type];
      
      const xG = parseFloatSafe(el.expected_goals);
      const xA = parseFloatSafe(el.expected_assists);
      const xGC = parseFloatSafe(el.expected_goals_conceded);
      
      const goalDelta = el.goals_scored - xG;
      const matches = el.minutes / 90;
      
      // Calculate per 90 if we have enough minutes
      const xGPer90 = matches > 0 ? xG / matches : el.expected_goals_per_90;
      const xAPer90 = matches > 0 ? xA / matches : el.expected_assists_per_90;
      const xGCPer90 = matches > 0 ? xGC / matches : el.expected_goals_conceded_per_90;
      
      // Net xG per 90 for attackers, inverse for defenders
      const netXGPer90 = position === 'GK' || position === 'DEF'
        ? -xGCPer90 // Lower xGC is better for defenders
        : xGPer90 - xAPer90 * 0.5; // Weighted for attacking contribution
      
      // Player-level sustainability: use per-90 metrics (different from team-level)
      const playerNormalized = (netXGPer90 + 0.5) / 1.0; // Scale -0.5..+0.5 to 0..1
      const sustainabilityScore = Math.max(0, Math.min(100, Math.round(playerNormalized * 100)));
      const efficiencyStatus = determineEfficiencyStatus(goalDelta);
      // Simple verdict for players (not rank-based)
      const marketVerdict = derivePlayerVerdict(sustainabilityScore, efficiencyStatus);
      
      // Clean sheet luck for GK/DEF
      const cleanSheetLuck = (position === 'GK' || position === 'DEF')
        ? calculateCleanSheetLuck(el.clean_sheets, xGC, Math.floor(matches))
        : undefined;
      
      return {
        id: el.id,
        code: el.code,
        name: `${el.first_name} ${el.second_name}`,
        webName: el.web_name,
        team: team?.name || 'Unknown',
        teamShort: team?.short_name || 'UNK',
        teamId: el.team,
        position,
        price: el.now_cost / 10,
        photo: getPlayerPhoto(el.code),
        
        goals: el.goals_scored,
        assists: el.assists,
        cleanSheets: el.clean_sheets,
        minutes: el.minutes,
        xG,
        xA,
        xGC,
        
        xGPer90,
        xAPer90,
        xGCPer90,
        
        goalDelta: Number(goalDelta.toFixed(2)),
        sustainabilityScore,
        efficiencyStatus,
        marketVerdict,
        cleanSheetLuck,
        
        form: parseFloatSafe(el.form),
        selectedBy: parseFloatSafe(el.selected_by_percent),
        status: el.status,
        news: el.news,
      };
    })
    .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
}

// -----------------------------------------------------------------------------
// Transform Teams (Aggregated)
// -----------------------------------------------------------------------------

export function transformTeams(
  data: FPLBootstrapResponse
): TeamHealthHeat[] {
  const players = transformPlayers(data);
  
  // Group players by team
  const teamPlayers = new Map<number, PlayerHealthHeat[]>();
  for (const player of players) {
    const existing = teamPlayers.get(player.teamId) || [];
    existing.push(player);
    teamPlayers.set(player.teamId, existing);
  }
  
  // STEP 1: Calculate raw scores for all teams
  const rawTeamData = data.teams.map(team => {
    const teamPlayersList = teamPlayers.get(team.id) || [];
    
    // Aggregate stats
    const totalGoals = teamPlayersList.reduce((sum, p) => sum + p.goals, 0);
    const totalXG = teamPlayersList.reduce((sum, p) => sum + p.xG, 0);
    const totalXGC = teamPlayersList.reduce((sum, p) => sum + p.xGC, 0) / 11; // Normalize
    const cleanSheets = Math.max(...teamPlayersList.filter(p => p.position === 'GK' || p.position === 'DEF').map(p => p.cleanSheets), 0);
    
    // Average per 90 metrics from starting players
    const starters = teamPlayersList.filter(p => p.minutes > 450).slice(0, 11);
    const avgXGPer90 = starters.length > 0
      ? starters.reduce((sum, p) => sum + p.xGPer90, 0) / starters.length
      : 0;
    const avgXGCPer90 = starters.length > 0
      ? starters.filter(p => p.position === 'DEF' || p.position === 'GK')
          .reduce((sum, p) => sum + p.xGCPer90, 0) / Math.max(starters.filter(p => p.position === 'DEF' || p.position === 'GK').length, 1)
      : 0;
    
    const goalDelta = totalGoals - totalXG;
    
    // FIXED: Calculate base score using absolute xG totals (not flawed per-90 averages)
    // totalXGC is already normalized (/11), so it represents team-level xGA
    const baseScore = calculateRawSustainabilityScore(totalXG, totalXGC);
    
    // FORENSIC FIX: Apply absolute volume penalties for extreme cases
    const rawScore = applyAbsoluteVolumePenalty(baseScore, totalXG, totalXGC);
    
    const efficiencyStatus = determineEfficiencyStatus(goalDelta);
    
    // Estimate matches from GK minutes
    const gk = teamPlayersList.find(p => p.position === 'GK' && p.minutes > 450);
    const matches = gk ? Math.floor(gk.minutes / 90) : 10;
    const cleanSheetLuck = calculateCleanSheetLuck(cleanSheets, totalXGC * matches, matches);
    
    // Calculate netXGPer90 for backward compatibility (used in return object)
    const netXGPer90 = avgXGPer90 - avgXGCPer90;
    
    return {
      team,
      totalGoals,
      totalXG,
      totalXGC,
      avgXGPer90,
      avgXGCPer90,
      goalDelta,
      netXGPer90,
      rawScore,
      efficiencyStatus,
      cleanSheets,
      cleanSheetLuck,
    };
  });
  
  // STEP 2: Sort by raw score to get league ranks
  const sortedByScore = [...rawTeamData].sort((a, b) => b.rawScore - a.rawScore);
  const rankMap = new Map<number, number>();
  sortedByScore.forEach((t, index) => {
    rankMap.set(t.team.id, index + 1);
  });
  
  // STEP 3: Calculate Z-scores for Attack and Defense (for Defense-Gate logic)
  const attackValues = rawTeamData.map(t => t.avgXGPer90);
  const defenseValues = rawTeamData.map(t => t.avgXGCPer90);
  
  const attackMean = attackValues.reduce((a, b) => a + b, 0) / attackValues.length;
  const defenseMean = defenseValues.reduce((a, b) => a + b, 0) / defenseValues.length;
  
  const attackStdDev = Math.sqrt(attackValues.reduce((sum, v) => sum + Math.pow(v - attackMean, 2), 0) / attackValues.length) || 1;
  const defenseStdDev = Math.sqrt(defenseValues.reduce((sum, v) => sum + Math.pow(v - defenseMean, 2), 0) / defenseValues.length) || 1;
  
  // Z-score maps: Attack (higher is better), Defense (lower xGC is better, so we invert)
  const zScoreMap = new Map<number, { attackZ: number; defenseZ: number }>();
  for (const t of rawTeamData) {
    const attackZ = (t.avgXGPer90 - attackMean) / attackStdDev;
    // Invert defense Z-score: lower xGC = positive Z (good defense)
    const defenseZ = (defenseMean - t.avgXGCPer90) / defenseStdDev;
    zScoreMap.set(t.team.id, { attackZ, defenseZ });
  }
  
  // STEP 4: Apply league position boost for top 4 teams
  const boostedScores = rawTeamData.map(t => ({
    id: t.team.id,
    rawScore: applyLeaguePositionBoost(t.rawScore, rankMap.get(t.team.id) || 20),
  }));
  
  // STEP 5: Apply Min-Max Normalization (spread 0-99)
  const normalizedScoreMap = normalizeScores(boostedScores);
  
  // STEP 6: Build final team objects with normalized scores and rank-based verdicts
  const finalTeams = rawTeamData.map(t => {
    const rank = rankMap.get(t.team.id) || 20;
    const sustainabilityScore = normalizedScoreMap.get(t.team.id) || 50;
    const zScores = zScoreMap.get(t.team.id) || { attackZ: 0, defenseZ: 0 };
    const marketVerdict = deriveMarketVerdictByRank(
      rank, 
      sustainabilityScore, 
      t.efficiencyStatus,
      zScores.defenseZ,
      zScores.attackZ,
      t.totalGoals,
      t.goalDelta
    );
    
    return {
      id: t.team.id,
      code: t.team.code,
      name: t.team.name,
      shortName: t.team.short_name,
      logo: getTeamLogo(t.team.code),
      
      totalGoals: t.totalGoals,
      totalXG: Number(t.totalXG.toFixed(2)),
      totalXGC: Number(t.totalXGC.toFixed(2)),
      avgXGPer90: Number(t.avgXGPer90.toFixed(3)),
      avgXGCPer90: Number(t.avgXGCPer90.toFixed(3)),
      
      goalDelta: Number(t.goalDelta.toFixed(2)),
      sustainabilityScore,
      efficiencyStatus: t.efficiencyStatus,
      marketVerdict,
      
      cleanSheets: t.cleanSheets,
      cleanSheetLuck: t.cleanSheetLuck,
    };
  });
  
  // Sort by sustainability score (highest first)
  return finalTeams.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
}

// -----------------------------------------------------------------------------
// Filter Helpers
// -----------------------------------------------------------------------------

export function getAttackers(players: PlayerHealthHeat[]): PlayerHealthHeat[] {
  return players.filter(p => p.position === 'MID' || p.position === 'FWD');
}

export function getDefenders(players: PlayerHealthHeat[]): PlayerHealthHeat[] {
  return players.filter(p => p.position === 'GK' || p.position === 'DEF');
}

export function getPrimeBuys(players: PlayerHealthHeat[]): PlayerHealthHeat[] {
  return players.filter(p => p.marketVerdict === 'PRIME_BUY');
}

export function getOverheated(players: PlayerHealthHeat[]): PlayerHealthHeat[] {
  return players.filter(p => p.marketVerdict === 'OVERHEATED' || p.marketVerdict === 'CRITICAL');
}

export function getCleanSheetLuckLeaders(players: PlayerHealthHeat[]): PlayerHealthHeat[] {
  return getDefenders(players)
    .filter(p => p.cleanSheetLuck !== undefined)
    .sort((a, b) => (b.cleanSheetLuck || 0) - (a.cleanSheetLuck || 0));
}

// -----------------------------------------------------------------------------
// Current Gameweek
// -----------------------------------------------------------------------------

export function getCurrentGameweek(data: FPLBootstrapResponse): number {
  const current = data.events.find(e => e.is_current);
  return current?.id || 1;
}

// -----------------------------------------------------------------------------
// Adapter: Convert TeamHealthHeat to TeamAnalysis format
// For compatibility with TeamMatrix component
// -----------------------------------------------------------------------------

function generateInsightNote(team: TeamHealthHeat): string {
  const delta = team.goalDelta;
  const sust = team.sustainabilityScore;
  
  if (team.marketVerdict === 'DOMINANT') {
    return `${team.name} are firing on all cylinders. Strong xG structure (${team.avgXGPer90.toFixed(2)} per 90) backs up their ${team.totalGoals} goals. Trust the process.`;
  }
  if (team.marketVerdict === 'ENTERTAINERS') {
    return `${team.name} are Glass Cannons - high attack (${team.avgXGPer90.toFixed(2)} xG/90) but leaky defense (${team.avgXGCPer90.toFixed(2)} xGC/90). High risk, high reward. Goals both ends.`;
  }
  if (team.marketVerdict === 'PRIME_BUY') {
    return `${team.name} are underperforming their underlying numbers. With ${delta.toFixed(1)} goal luck deficit, regression to the mean should bring returns.`;
  }
  if (team.marketVerdict === 'OVERHEATED') {
    return `${team.name} are outperforming xG by ${delta.toFixed(1)} goals. Their structure doesn't support current output. Regression risk is high.`;
  }
  if (team.marketVerdict === 'CRITICAL') {
    return `${team.name} in trouble. Poor xG structure (${sust}/100) combined with cold finishing (${delta.toFixed(1)}). Avoid their assets.`;
  }
  if (team.marketVerdict === 'STABLE') {
    return `${team.name} performing as expected. Solid structure at ${sust}/100 sustainability. Reliable but not explosive.`;
  }
  return `${team.name} have fragile underlying numbers. Current form may not be sustainable long-term.`;
}

function getChanceGrade(sustainabilityScore: number): 'Elite' | 'Good' | 'Average' | 'Poor' | 'Broken' {
  if (sustainabilityScore >= 80) return 'Elite';
  if (sustainabilityScore >= 60) return 'Good';
  if (sustainabilityScore >= 40) return 'Average';
  if (sustainabilityScore >= 20) return 'Poor';
  return 'Broken';
}

export function convertToTeamAnalysis(teams: TeamHealthHeat[]): TeamAnalysis[] {
  return teams.map(team => ({
    teamId: team.id,
    teamName: team.name,
    teamLogo: team.logo,
    sustainabilityScore: team.sustainabilityScore,
    efficiencyStatus: team.efficiencyStatus,
    efficiencyDelta: team.goalDelta,
    netXGPer90: team.avgXGPer90 - team.avgXGCPer90,
    marketVerdict: team.marketVerdict,
    chanceGrade: getChanceGrade(team.sustainabilityScore),
    insightNote: generateInsightNote(team),
    // For Magic Quadrant visualization
    avgXGPer90: team.avgXGPer90,
    avgXGCPer90: team.avgXGCPer90,
  }));
}

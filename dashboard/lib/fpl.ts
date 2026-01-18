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
export type MarketVerdict = 'DOMINANT' | 'OVERHEATED' | 'PRIME_BUY' | 'CRITICAL' | 'STABLE' | 'FRAGILE';

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
// Based on net xG per 90 (xGPer90 - xGCPer90)
// -----------------------------------------------------------------------------

function calculateSustainabilityScore(netXGPer90: number): number {
  // Scale: -1.5 (terrible) to +1.5 (elite) -> 0-100
  // Midpoint (0) = 50
  const normalized = (netXGPer90 + 1.5) / 3.0; // Maps -1.5..+1.5 to 0..1
  const score = Math.round(normalized * 100);
  return Math.max(0, Math.min(100, score));
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
// Market Verdict (6 archetypes)
// Combines sustainability + efficiency
// -----------------------------------------------------------------------------

function deriveMarketVerdict(
  sustainabilityScore: number,
  efficiencyStatus: EfficiencyStatus
): MarketVerdict {
  const isHighSustainability = sustainabilityScore >= 60;
  const isLowSustainability = sustainabilityScore < 40;
  
  // Hot performers
  if (efficiencyStatus === 'CRITICAL_OVER' || efficiencyStatus === 'RUNNING_HOT') {
    return isHighSustainability ? 'DOMINANT' : 'OVERHEATED';
  }
  
  // Cold performers
  if (efficiencyStatus === 'CRITICAL_VALUE' || efficiencyStatus === 'COLD') {
    return isHighSustainability ? 'PRIME_BUY' : 'CRITICAL';
  }
  
  // Sustainable
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
      
      const sustainabilityScore = calculateSustainabilityScore(netXGPer90);
      const efficiencyStatus = determineEfficiencyStatus(goalDelta);
      const marketVerdict = deriveMarketVerdict(sustainabilityScore, efficiencyStatus);
      
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
  
  return data.teams.map(team => {
    const players = teamPlayers.get(team.id) || [];
    
    // Aggregate stats
    const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
    const totalXG = players.reduce((sum, p) => sum + p.xG, 0);
    const totalXGC = players.reduce((sum, p) => sum + p.xGC, 0) / 11; // Normalize
    const cleanSheets = Math.max(...players.filter(p => p.position === 'GK' || p.position === 'DEF').map(p => p.cleanSheets), 0);
    
    // Average per 90 metrics from starting players
    const starters = players.filter(p => p.minutes > 450).slice(0, 11);
    const avgXGPer90 = starters.length > 0
      ? starters.reduce((sum, p) => sum + p.xGPer90, 0) / starters.length
      : 0;
    const avgXGCPer90 = starters.length > 0
      ? starters.filter(p => p.position === 'DEF' || p.position === 'GK')
          .reduce((sum, p) => sum + p.xGCPer90, 0) / Math.max(starters.filter(p => p.position === 'DEF' || p.position === 'GK').length, 1)
      : 0;
    
    const goalDelta = totalGoals - totalXG;
    const netXGPer90 = avgXGPer90 - avgXGCPer90;
    const sustainabilityScore = calculateSustainabilityScore(netXGPer90);
    const efficiencyStatus = determineEfficiencyStatus(goalDelta);
    const marketVerdict = deriveMarketVerdict(sustainabilityScore, efficiencyStatus);
    
    // Estimate matches from GK minutes
    const gk = players.find(p => p.position === 'GK' && p.minutes > 450);
    const matches = gk ? Math.floor(gk.minutes / 90) : 10;
    const cleanSheetLuck = calculateCleanSheetLuck(cleanSheets, totalXGC * matches, matches);
    
    return {
      id: team.id,
      code: team.code,
      name: team.name,
      shortName: team.short_name,
      logo: getTeamLogo(team.code),
      
      totalGoals,
      totalXG: Number(totalXG.toFixed(2)),
      totalXGC: Number(totalXGC.toFixed(2)),
      avgXGPer90: Number(avgXGPer90.toFixed(3)),
      avgXGCPer90: Number(avgXGCPer90.toFixed(3)),
      
      goalDelta: Number(goalDelta.toFixed(2)),
      sustainabilityScore,
      efficiencyStatus,
      marketVerdict,
      
      cleanSheets,
      cleanSheetLuck,
    };
  }).sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
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
  }));
}

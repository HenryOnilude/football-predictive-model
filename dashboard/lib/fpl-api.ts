'use server';

// FPL API Types
export interface FPLBootstrapResponse {
  events: FPLEvent[];
  teams: FPLTeam[];
  elements: FPLPlayer[];
  element_types: FPLPosition[];
}

export interface FPLEvent {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
  code: number;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

export interface FPLPlayer {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  team_code: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  now_cost: number; // Price in 0.1m units (e.g., 100 = £10.0m)
  total_points: number;
  points_per_game: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  form: string;
  selected_by_percent: string;
  // xG metrics (FPL added these)
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  // Per 90 stats
  expected_goals_per_90: number;
  expected_assists_per_90: number;
  goals_conceded_per_90: number;
  starts_per_90: number;
  // Status
  status: string; // 'a' = available, 'i' = injured, etc.
  chance_of_playing_next_round: number | null;
  news: string;
  news_added: string | null;
}

export interface FPLPosition {
  id: number;
  singular_name: string;
  singular_name_short: string;
  plural_name: string;
  plural_name_short: string;
}

export interface FPLPlayerHistory {
  element: number;
  fixture: number;
  opponent_team: number;
  total_points: number;
  was_home: boolean;
  kickoff_time: string;
  team_h_score: number;
  team_a_score: number;
  round: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  value: number;
  selected: number;
}

export interface FPLPlayerSummary {
  history: FPLPlayerHistory[];
  fixtures: unknown[];
  history_past: unknown[];
}

// Our mapped types
export interface MappedPlayer {
  id: number;
  name: string;
  fullName: string;
  team: string;
  teamId: number;
  position: string;
  positionShort: string;
  price: number; // In millions (e.g., 10.0)
  totalPoints: number;
  pointsPerGame: number;
  minutes: number;
  goals: number;
  assists: number;
  xG: number;
  xA: number;
  xGI: number; // Expected Goal Involvement
  goalDelta: number; // Goals - xG (positive = overperforming)
  form: number;
  selectedBy: number;
  status: 'available' | 'injured' | 'doubtful' | 'unavailable';
  news: string;
  // Calculated fields
  finishingBadge: 'SIEGE' | 'SNIPER' | 'FAIR' | 'WASTEFUL' | 'MIRAGE';
  riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
}

export interface MappedTeamStats {
  id: number;
  name: string;
  shortName: string;
  players: MappedPlayer[];
  totalGoals: number;
  totalXG: number;
  goalDelta: number;
  avgXGPerPlayer: number;
}

export interface FPLData {
  players: MappedPlayer[];
  teams: MappedTeamStats[];
  currentGameweek: number;
  lastUpdated: string;
  positions: Record<number, string>;
  teamNames: Record<number, string>;
}

// Cache for API responses (5 minute TTL)
let cachedData: FPLData | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch bootstrap data from FPL API
 */
async function fetchBootstrap(): Promise<FPLBootstrapResponse> {
  const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });

  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch detailed player history
 */
export async function fetchPlayerSummary(playerId: number): Promise<FPLPlayerSummary> {
  const response = await fetch(`https://fantasy.premierleague.com/api/element-summary/${playerId}/`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Calculate finishing badge based on goals vs xG
 */
function calculateFinishingBadge(goals: number, xG: number, minutes: number): MappedPlayer['finishingBadge'] {
  // Need minimum minutes to be meaningful
  if (minutes < 270) return 'FAIR'; // Less than 3 full games

  const delta = goals - xG;
  const deltaPerXG = xG > 0 ? delta / xG : 0;

  // SIEGE: Creating chances but not converting (unlucky)
  if (delta <= -2 || (xG >= 3 && deltaPerXG <= -0.4)) {
    return 'SIEGE';
  }

  // SNIPER: Converting at elite rate (skilled or lucky)
  if (delta >= 3 || (xG >= 2 && deltaPerXG >= 0.5)) {
    return 'SNIPER';
  }

  // MIRAGE: Results are an illusion (very lucky, unsustainable)
  if (goals >= 3 && xG < 1) {
    return 'MIRAGE';
  }

  // WASTEFUL: Poor shot selection (xG low relative to opportunities)
  if (xG < 1 && goals === 0 && minutes >= 900) {
    return 'WASTEFUL';
  }

  return 'FAIR';
}

/**
 * Calculate risk level based on performance variance
 */
function calculateRiskLevel(goals: number, xG: number, minutes: number): MappedPlayer['riskLevel'] {
  if (minutes < 270) return 'Low';

  const delta = goals - xG;
  const absDelta = Math.abs(delta);

  if (absDelta >= 4) return 'Critical';
  if (absDelta >= 2.5) return 'High';
  if (absDelta >= 1) return 'Moderate';
  return 'Low';
}

/**
 * Map player status from FPL format
 */
function mapPlayerStatus(status: string): MappedPlayer['status'] {
  switch (status) {
    case 'a': return 'available';
    case 'i': return 'injured';
    case 'd': return 'doubtful';
    default: return 'unavailable';
  }
}

/**
 * Main function to fetch and map FPL data
 */
export async function getFPLData(): Promise<FPLData> {
  // Check cache
  const now = Date.now();
  if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedData;
  }

  try {
    const bootstrap = await fetchBootstrap();

    // Build lookup maps
    const teamNames: Record<number, string> = {};
    const teamShortNames: Record<number, string> = {};
    bootstrap.teams.forEach(team => {
      teamNames[team.id] = team.name;
      teamShortNames[team.id] = team.short_name;
    });

    const positions: Record<number, string> = {};
    const positionShorts: Record<number, string> = {};
    bootstrap.element_types.forEach(pos => {
      positions[pos.id] = pos.singular_name;
      positionShorts[pos.id] = pos.singular_name_short;
    });

    // Find current gameweek
    const currentGW = bootstrap.events.find(e => e.is_current)?.id || 
                      bootstrap.events.find(e => e.is_next)?.id || 1;

    // Map players
    const players: MappedPlayer[] = bootstrap.elements.map(player => {
      const xG = parseFloat(player.expected_goals) || 0;
      const xA = parseFloat(player.expected_assists) || 0;
      const xGI = parseFloat(player.expected_goal_involvements) || 0;
      const goalDelta = player.goals_scored - xG;

      return {
        id: player.id,
        name: player.web_name,
        fullName: `${player.first_name} ${player.second_name}`,
        team: teamNames[player.team] || 'Unknown',
        teamId: player.team,
        position: positions[player.element_type] || 'Unknown',
        positionShort: positionShorts[player.element_type] || '?',
        price: player.now_cost / 10,
        totalPoints: player.total_points,
        pointsPerGame: parseFloat(player.points_per_game) || 0,
        minutes: player.minutes,
        goals: player.goals_scored,
        assists: player.assists,
        xG,
        xA,
        xGI,
        goalDelta,
        form: parseFloat(player.form) || 0,
        selectedBy: parseFloat(player.selected_by_percent) || 0,
        status: mapPlayerStatus(player.status),
        news: player.news || '',
        finishingBadge: calculateFinishingBadge(player.goals_scored, xG, player.minutes),
        riskLevel: calculateRiskLevel(player.goals_scored, xG, player.minutes),
      };
    });

    // Aggregate team stats
    const teamStatsMap = new Map<number, MappedTeamStats>();
    
    bootstrap.teams.forEach(team => {
      teamStatsMap.set(team.id, {
        id: team.id,
        name: team.name,
        shortName: team.short_name,
        players: [],
        totalGoals: 0,
        totalXG: 0,
        goalDelta: 0,
        avgXGPerPlayer: 0,
      });
    });

    players.forEach(player => {
      const teamStats = teamStatsMap.get(player.teamId);
      if (teamStats) {
        teamStats.players.push(player);
        teamStats.totalGoals += player.goals;
        teamStats.totalXG += player.xG;
      }
    });

    const teams = Array.from(teamStatsMap.values()).map(team => ({
      ...team,
      goalDelta: team.totalGoals - team.totalXG,
      avgXGPerPlayer: team.players.length > 0 ? team.totalXG / team.players.length : 0,
    }));

    const result: FPLData = {
      players,
      teams,
      currentGameweek: currentGW,
      lastUpdated: new Date().toISOString(),
      positions,
      teamNames,
    };

    // Update cache
    cachedData = result;
    cacheTimestamp = now;

    return result;
  } catch (error) {
    console.error('Failed to fetch FPL data:', error);
    
    // Return cached data if available, even if stale
    if (cachedData) {
      return cachedData;
    }
    
    throw error;
  }
}

/**
 * Get top performers by various metrics
 */
export async function getTopPerformers(limit: number = 10) {
  const data = await getFPLData();

  return {
    byPoints: [...data.players].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, limit),
    byForm: [...data.players].filter(p => p.minutes >= 270).sort((a, b) => b.form - a.form).slice(0, limit),
    byValue: [...data.players].filter(p => p.minutes >= 270).sort((a, b) => (b.totalPoints / b.price) - (a.totalPoints / a.price)).slice(0, limit),
    // Underperformers (SIEGE badge - unlucky, due a haul)
    unlucky: [...data.players].filter(p => p.finishingBadge === 'SIEGE').sort((a, b) => a.goalDelta - b.goalDelta).slice(0, limit),
    // Overperformers (SNIPER/MIRAGE - regression risk)
    lucky: [...data.players].filter(p => p.finishingBadge === 'SNIPER' || p.finishingBadge === 'MIRAGE').sort((a, b) => b.goalDelta - a.goalDelta).slice(0, limit),
    lastUpdated: data.lastUpdated,
    currentGameweek: data.currentGameweek,
  };
}

/**
 * Get players by team
 */
export async function getTeamPlayers(teamId: number) {
  const data = await getFPLData();
  const team = data.teams.find(t => t.id === teamId);
  
  if (!team) {
    throw new Error(`Team ${teamId} not found`);
  }

  return {
    team,
    players: team.players.sort((a, b) => b.totalPoints - a.totalPoints),
    lastUpdated: data.lastUpdated,
  };
}

/**
 * Get all teams with aggregated stats
 */
export async function getAllTeams() {
  const data = await getFPLData();
  
  return {
    teams: data.teams.sort((a, b) => b.totalGoals - a.totalGoals),
    lastUpdated: data.lastUpdated,
    currentGameweek: data.currentGameweek,
  };
}

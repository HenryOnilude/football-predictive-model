'use server';

import { supabaseAdmin } from '@/lib/supabase';
import {
  PlayerLuckData,
  LuckDataResponse,
  SupabaseLuckRecord,
  TEAM_SHORT_NAMES,
  FixtureData,
  TeamLuckData,
  TeamLuckResponse,
  MatchLuckScore,
  PL_TEAM_IDS,
} from '@/lib/fplTypes';
import { 
  fetchFPLDataServer, 
  FPLElement, 
  FPLTeam,
  getCurrentGameweek as getFPLGameweek,
} from '@/lib/fpl';

const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';
const PREMIER_LEAGUE_ID = 39;
const CURRENT_SEASON = 2025;

interface APIFootballResponse<T> {
  response: T;
  errors: Record<string, string>;
  results: number;
}

interface PlayerStatistics {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    photo: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
    };
    games: {
      appearences: number;
      position: string;
    };
    goals: {
      total: number | null;
    };
  }>;
}


async function fetchFromAPIFootball<T>(endpoint: string): Promise<T> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  
  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY environment variable is not set');
  }

  const response = await fetch(`${API_FOOTBALL_BASE}${endpoint}`, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'v3.football.api-sports.io',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`API-Football request failed: ${response.statusText}`);
  }

  const data: APIFootballResponse<T> = await response.json();
  
  if (Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football errors: ${JSON.stringify(data.errors)}`);
  }

  return data.response;
}

function getCurrentGameweek(): number {
  // Calculate approximate gameweek based on current date
  // Premier League typically starts mid-August
  const seasonStart = new Date(CURRENT_SEASON, 7, 16); // August 16
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24));
  const gameweek = Math.max(1, Math.min(38, Math.floor(daysSinceStart / 7) + 1));
  return gameweek;
}

function calculateLuckScore(actualGoals: number, xG: number): number {
  return Number((actualGoals - xG).toFixed(2));
}

function getVerdict(luckScore: number): { verdict: 'BUY' | 'TRAP' | 'HOLD'; label: string } {
  // CRITICAL LOGIC:
  // NEGATIVE luckScore = Player is "Unlucky" = BUY (underperforming xG)
  // POSITIVE luckScore = Player is "Overperforming" = TRAP (outperforming xG)
  
  if (luckScore <= -1.5) {
    return { verdict: 'BUY', label: 'DUE A HAUL' };
  } else if (luckScore <= -0.5) {
    return { verdict: 'BUY', label: 'UNDERVALUED' };
  } else if (luckScore >= 1.5) {
    return { verdict: 'TRAP', label: 'REGRESSION RISK' };
  } else if (luckScore >= 0.5) {
    return { verdict: 'TRAP', label: 'SELL HIGH' };
  }
  return { verdict: 'HOLD', label: 'FAIR VALUE' };
}

function calculateMetrics(luckScore: number) {
  const absLuckScore = Math.abs(luckScore);
  
  // Differential Value: How far from expected (0-100 scale)
  const differentialValue = Math.min(100, absLuckScore * 25);
  
  // Haul Potential: Likelihood of big returns (higher for unlucky players)
  const haulPotential = luckScore < 0 
    ? Math.min(100, 50 + absLuckScore * 20)
    : Math.max(0, 50 - absLuckScore * 20);
  
  // Trap Indicator: Risk of regression (higher for lucky players)
  const trapIndicator = luckScore > 0
    ? Math.min(100, 50 + absLuckScore * 20)
    : Math.max(0, 50 - absLuckScore * 20);

  return {
    differentialValue: Number(differentialValue.toFixed(1)),
    haulPotential: Number(haulPotential.toFixed(1)),
    trapIndicator: Number(trapIndicator.toFixed(1)),
  };
}

function generateMockFixtures(): FixtureData[] {
  // Mock fixtures for demo - in production, fetch from API-Football fixtures endpoint
  const opponents = ['Liverpool', 'Chelsea', 'Arsenal', 'Manchester City', 'Tottenham'];
  const shuffled = opponents.sort(() => Math.random() - 0.5).slice(0, 3);
  
  return shuffled.map((opponent, idx) => ({
    opponent,
    opponentShort: TEAM_SHORT_NAMES[opponent] || opponent.slice(0, 3).toUpperCase(),
    fdr: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
    isHome: idx % 2 === 0,
  }));
}

// Mock xG data - in production, you'd fetch this from API-Football or Understat
function getMockXGData(): Record<string, number> {
  return {
    'E. Haaland': 12.5,
    'M. Salah': 8.3,
    'C. Palmer': 7.1,
    'A. Isak': 9.2,
    'B. Saka': 5.8,
    'O. Watkins': 8.0,
    'D. Núñez': 6.5,
    'J. Solanke': 5.2,
    'N. Jackson': 6.8,
    'J. Alvarez': 4.5,
  };
}

// Mock FPL prices - in production, fetch from FPL API
function getMockPrices(): Record<string, number> {
  return {
    'E. Haaland': 15.0,
    'M. Salah': 13.5,
    'C. Palmer': 10.8,
    'A. Isak': 8.5,
    'B. Saka': 10.0,
    'O. Watkins': 9.0,
    'D. Núñez': 7.5,
    'J. Solanke': 7.8,
    'N. Jackson': 7.3,
    'J. Alvarez': 7.0,
  };
}

async function checkCachedData(gameweek: number): Promise<PlayerLuckData[] | null> {
  if (!supabaseAdmin) return null;
  
  try {
    const { data, error } = await supabaseAdmin
      .from('player_luck_data')
      .select('*')
      .eq('gameweek', gameweek)
      .eq('season', `${CURRENT_SEASON}-${CURRENT_SEASON + 1}`);

    if (error) {
      console.error('Supabase fetch error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Transform Supabase records back to PlayerLuckData
    return data.map((record: SupabaseLuckRecord) => ({
      id: record.player_id,
      name: record.player_name,
      team: record.team,
      teamShort: record.team_short,
      position: record.position,
      photo: record.photo,
      price: record.price,
      actualGoals: record.actual_goals,
      xG: record.xg,
      luckScore: record.luck_score,
      verdict: record.verdict as 'BUY' | 'TRAP' | 'HOLD',
      verdictLabel: record.verdict_label,
      differentialValue: record.differential_value,
      haulPotential: record.haul_potential,
      trapIndicator: record.trap_indicator,
      fixtures: JSON.parse(record.fixtures),
      gameweek: record.gameweek,
    }));
  } catch (error) {
    console.error('Cache check error:', error);
    return null;
  }
}

async function saveToCachе(players: PlayerLuckData[], gameweek: number): Promise<void> {
  if (!supabaseAdmin) return;
  
  try {
    const records: SupabaseLuckRecord[] = players.map((player) => ({
      player_id: player.id,
      gameweek,
      season: `${CURRENT_SEASON}-${CURRENT_SEASON + 1}`,
      player_name: player.name,
      team: player.team,
      team_short: player.teamShort,
      position: player.position,
      photo: player.photo,
      price: player.price,
      actual_goals: player.actualGoals,
      xg: player.xG,
      luck_score: player.luckScore,
      verdict: player.verdict,
      verdict_label: player.verdictLabel,
      differential_value: player.differentialValue,
      haul_potential: player.haulPotential,
      trap_indicator: player.trapIndicator,
      fixtures: JSON.stringify(player.fixtures),
    }));

    const { error } = await supabaseAdmin
      .from('player_luck_data')
      .upsert(records, { onConflict: 'player_id,gameweek,season' });

    if (error) {
      console.error('Supabase save error:', error);
    }
  } catch (error) {
    console.error('Cache save error:', error);
  }
}

async function fetchPlayersFromAPI(): Promise<PlayerLuckData[]> {
  // Fetch top scorers from API-Football
  const players = await fetchFromAPIFootball<PlayerStatistics[]>(
    `/players/topscorers?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}`
  );

  const xgData = getMockXGData();
  const priceData = getMockPrices();
  const gameweek = getCurrentGameweek();

  const luckData: PlayerLuckData[] = players.slice(0, 20).map((p) => {
    const stat = p.statistics[0];
    const actualGoals = stat?.goals?.total || 0;
    const playerName = p.player.name;
    const xG = xgData[playerName] || actualGoals * 0.85; // Fallback xG estimation
    const luckScore = calculateLuckScore(actualGoals, xG);
    const { verdict, label } = getVerdict(luckScore);
    const metrics = calculateMetrics(luckScore);
    const teamName = stat?.team?.name || 'Unknown';

    return {
      id: p.player.id,
      name: playerName,
      team: teamName,
      teamShort: TEAM_SHORT_NAMES[teamName] || teamName.slice(0, 3).toUpperCase(),
      position: stat?.games?.position || 'Forward',
      photo: p.player.photo,
      price: priceData[playerName] || 7.0,
      actualGoals,
      xG,
      luckScore,
      verdict,
      verdictLabel: label,
      differentialValue: metrics.differentialValue,
      haulPotential: metrics.haulPotential,
      trapIndicator: metrics.trapIndicator,
      fixtures: generateMockFixtures(),
      gameweek,
    };
  });

  return luckData;
}

// Fetch live player data from Official FPL API
async function fetchPlayersFromFPLAPI(): Promise<PlayerLuckData[]> {
  const data = await fetchFPLDataServer();
  const gameweek = getFPLGameweek(data);
  
  // Create team lookup map
  const teamMap = new Map<number, FPLTeam>(data.teams.map(t => [t.id, t]));
  
  // Position mapping
  const positionMap: Record<number, string> = {
    1: 'Goalkeeper',
    2: 'Defender', 
    3: 'Midfielder',
    4: 'Attacker',
  };
  
  // Filter players with goals or significant xG, sort by goals
  const relevantPlayers = data.elements
    .filter((el: FPLElement) => {
      const xG = parseFloat(el.expected_goals) || 0;
      return el.goals_scored > 0 || xG > 1.0;
    })
    .sort((a: FPLElement, b: FPLElement) => b.goals_scored - a.goals_scored)
    .slice(0, 30); // Top 30 players
  
  return relevantPlayers.map((el: FPLElement) => {
    const team = teamMap.get(el.team);
    const teamName = team?.name || 'Unknown';
    const xG = parseFloat(el.expected_goals) || 0;
    const actualGoals = el.goals_scored;
    const luckScore = calculateLuckScore(actualGoals, xG);
    const { verdict, label } = getVerdict(luckScore);
    const metrics = calculateMetrics(luckScore);
    
    return {
      id: el.id,
      name: el.web_name,
      team: teamName,
      teamShort: team?.short_name || teamName.slice(0, 3).toUpperCase(),
      position: positionMap[el.element_type] || 'Attacker',
      photo: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${el.code}.png`,
      price: el.now_cost / 10,
      actualGoals,
      xG: Number(xG.toFixed(2)),
      luckScore,
      verdict,
      verdictLabel: label,
      differentialValue: metrics.differentialValue,
      haulPotential: metrics.haulPotential,
      trapIndicator: metrics.trapIndicator,
      fixtures: generateMockFixtures(),
      gameweek,
    };
  });
}

// Fallback demo data when FPL API fails
function generateDemoData(): PlayerLuckData[] {
  const gameweek = getCurrentGameweek();
  
  const demoPlayers = [
    { id: 223094, code: 223094, name: 'E. Haaland', team: 'Manchester City', position: 'Attacker', price: 15.0, actualGoals: 15, xG: 12.5 },
    { id: 118748, code: 118748, name: 'M. Salah', team: 'Liverpool', position: 'Attacker', price: 13.5, actualGoals: 10, xG: 8.3 },
    { id: 492774, code: 492774, name: 'C. Palmer', team: 'Chelsea', position: 'Midfielder', price: 10.8, actualGoals: 9, xG: 7.1 },
    { id: 467169, code: 467169, name: 'A. Isak', team: 'Newcastle United', position: 'Attacker', price: 8.5, actualGoals: 8, xG: 9.2 },
    { id: 448334, code: 448334, name: 'B. Saka', team: 'Arsenal', position: 'Midfielder', price: 10.0, actualGoals: 6, xG: 5.8 },
    { id: 447072, code: 447072, name: 'O. Watkins', team: 'Aston Villa', position: 'Attacker', price: 9.0, actualGoals: 7, xG: 8.0 },
    { id: 482605, code: 482605, name: 'D. Núñez', team: 'Liverpool', position: 'Attacker', price: 7.5, actualGoals: 5, xG: 6.5 },
    { id: 447201, code: 447201, name: 'D. Solanke', team: 'Tottenham Hotspur', position: 'Attacker', price: 7.8, actualGoals: 4, xG: 5.2 },
    { id: 515747, code: 515747, name: 'N. Jackson', team: 'Chelsea', position: 'Attacker', price: 7.3, actualGoals: 8, xG: 6.8 },
    { id: 493105, code: 493105, name: 'A. Gordon', team: 'Newcastle United', position: 'Midfielder', price: 7.5, actualGoals: 6, xG: 7.8 },
  ];

  return demoPlayers.map((p) => {
    const luckScore = calculateLuckScore(p.actualGoals, p.xG);
    const { verdict, label } = getVerdict(luckScore);
    const metrics = calculateMetrics(luckScore);

    return {
      id: p.id,
      name: p.name,
      team: p.team,
      teamShort: TEAM_SHORT_NAMES[p.team] || p.team.slice(0, 3).toUpperCase(),
      position: p.position,
      photo: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${p.code}.png`,
      price: p.price,
      actualGoals: p.actualGoals,
      xG: p.xG,
      luckScore,
      verdict,
      verdictLabel: label,
      differentialValue: metrics.differentialValue,
      haulPotential: metrics.haulPotential,
      trapIndicator: metrics.trapIndicator,
      fixtures: generateMockFixtures(),
      gameweek,
    };
  });
}

// ============================================
// TEAM-BASED LUCK SCORE FUNCTIONS
// ============================================

interface APIFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

function getTeamStatus(luckScore: number): { status: 'UNLUCKY' | 'OVERPERFORMING' | 'NEUTRAL'; label: string } {
  if (luckScore <= -2) {
    return { status: 'UNLUCKY', label: 'Significantly Unlucky - Due for improvement' };
  } else if (luckScore < -0.5) {
    return { status: 'UNLUCKY', label: 'Slightly Unlucky' };
  } else if (luckScore >= 2) {
    return { status: 'OVERPERFORMING', label: 'Significantly Overperforming - Regression likely' };
  } else if (luckScore > 0.5) {
    return { status: 'OVERPERFORMING', label: 'Slightly Overperforming' };
  }
  return { status: 'NEUTRAL', label: 'Performing as Expected' };
}

function generateMockTeamFixtures(): APIFixture[] {
  const teamIds = Object.keys(PL_TEAM_IDS).map(Number);
  const fixtures: APIFixture[] = [];
  let fixtureId = 1;

  // Generate 10 gameweeks of fixtures (simplified)
  for (let gw = 1; gw <= 10; gw++) {
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i += 2) {
      const homeId = shuffled[i];
      const awayId = shuffled[i + 1];
      if (!homeId || !awayId) continue;

      const homeGoals = Math.floor(Math.random() * 4);
      const awayGoals = Math.floor(Math.random() * 4);

      fixtures.push({
        fixture: {
          id: fixtureId++,
          date: new Date(2025, 7 + Math.floor(gw / 4), 10 + (gw % 4) * 7).toISOString(),
          status: { short: 'FT' },
        },
        teams: {
          home: { id: homeId, name: PL_TEAM_IDS[homeId], logo: '', winner: homeGoals > awayGoals ? true : homeGoals < awayGoals ? false : null },
          away: { id: awayId, name: PL_TEAM_IDS[awayId], logo: '', winner: awayGoals > homeGoals ? true : awayGoals < homeGoals ? false : null },
        },
        goals: { home: homeGoals, away: awayGoals },
      });
    }
  }

  return fixtures;
}

function calculateTeamLuckFromFixtures(fixtures: APIFixture[]): Record<number, TeamLuckData> {
  const teamData: Record<number, {
    matches: MatchLuckScore[];
    totalGoals: number;
    totalXG: number;
    totalConceded: number;
    totalXGA: number;
    logo: string;
  }> = {};

  // Initialize all teams
  for (const teamId of Object.keys(PL_TEAM_IDS).map(Number)) {
    teamData[teamId] = {
      matches: [],
      totalGoals: 0,
      totalXG: 0,
      totalConceded: 0,
      totalXGA: 0,
      logo: '',
    };
  }

  // Process each fixture
  for (const fixture of fixtures) {
    if (fixture.fixture.status.short !== 'FT') continue; // Only finished matches
    if (fixture.goals.home === null || fixture.goals.away === null) continue;

    const homeId = fixture.teams.home.id;
    const awayId = fixture.teams.away.id;
    const homeGoals = fixture.goals.home;
    const awayGoals = fixture.goals.away;

    // Generate xG (in production, fetch real xG data)
    const homeXG = Number((Math.random() * 1.5 + homeGoals * 0.7).toFixed(2));
    const awayXG = Number((Math.random() * 1.5 + awayGoals * 0.7).toFixed(2));

    // Home team perspective
    if (teamData[homeId]) {
      const homeLuck = Number((homeGoals - homeXG).toFixed(2));
      const homeDefLuck = Number((awayXG - awayGoals).toFixed(2));
      
      teamData[homeId].matches.push({
        fixtureId: fixture.fixture.id,
        date: fixture.fixture.date,
        opponent: fixture.teams.away.name,
        opponentId: awayId,
        isHome: true,
        goalsScored: homeGoals,
        goalsConceded: awayGoals,
        xG: homeXG,
        xGA: awayXG,
        luckScore: homeLuck,
        defensiveLuck: homeDefLuck,
        result: homeGoals > awayGoals ? 'W' : homeGoals < awayGoals ? 'L' : 'D',
      });
      
      teamData[homeId].totalGoals += homeGoals;
      teamData[homeId].totalXG += homeXG;
      teamData[homeId].totalConceded += awayGoals;
      teamData[homeId].totalXGA += awayXG;
      teamData[homeId].logo = fixture.teams.home.logo;
    }

    // Away team perspective
    if (teamData[awayId]) {
      const awayLuck = Number((awayGoals - awayXG).toFixed(2));
      const awayDefLuck = Number((homeXG - homeGoals).toFixed(2));
      
      teamData[awayId].matches.push({
        fixtureId: fixture.fixture.id,
        date: fixture.fixture.date,
        opponent: fixture.teams.home.name,
        opponentId: homeId,
        isHome: false,
        goalsScored: awayGoals,
        goalsConceded: homeGoals,
        xG: awayXG,
        xGA: homeXG,
        luckScore: awayLuck,
        defensiveLuck: awayDefLuck,
        result: awayGoals > homeGoals ? 'W' : awayGoals < homeGoals ? 'L' : 'D',
      });
      
      teamData[awayId].totalGoals += awayGoals;
      teamData[awayId].totalXG += awayXG;
      teamData[awayId].totalConceded += homeGoals;
      teamData[awayId].totalXGA += homeXG;
      teamData[awayId].logo = fixture.teams.away.logo;
    }
  }

  // Build final response keyed by Team ID
  const result: Record<number, TeamLuckData> = {};

  for (const [teamIdStr, data] of Object.entries(teamData)) {
    const teamId = Number(teamIdStr);
    const teamName = PL_TEAM_IDS[teamId] || 'Unknown';
    
    // Sort matches by date (most recent first) and get last 5
    const sortedMatches = data.matches.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const last5 = sortedMatches.slice(0, 5);
    
    const seasonLuckScore = Number((data.totalGoals - data.totalXG).toFixed(2));
    const seasonDefensiveLuck = Number((data.totalXGA - data.totalConceded).toFixed(2));
    const { status, label } = getTeamStatus(seasonLuckScore);
    
    // Build form string from last 5 matches
    const form = last5.map(m => m.result).join('');

    result[teamId] = {
      teamId,
      teamName,
      teamShort: TEAM_SHORT_NAMES[teamName] || teamName.slice(0, 3).toUpperCase(),
      logo: data.logo,
      seasonLuckScore,
      seasonDefensiveLuck,
      totalGoals: data.totalGoals,
      totalXG: Number(data.totalXG.toFixed(2)),
      totalConceded: data.totalConceded,
      totalXGA: Number(data.totalXGA.toFixed(2)),
      matchesPlayed: data.matches.length,
      status,
      statusLabel: label,
      last5Matches: last5,
      form,
    };
  }

  return result;
}

async function fetchFixturesFromAPI(): Promise<APIFixture[]> {
  const fixtures = await fetchFromAPIFootball<APIFixture[]>(
    `/fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&status=FT`
  );
  return fixtures;
}

/**
 * Fetch team-based luck data from API-Football or mock data
 * Returns JSON keyed by Team ID with Season Luck Score and Last 5 Match Luck Scores
 */
export async function fetchTeamLuckData(): Promise<TeamLuckResponse> {
  let fixtures: APIFixture[];

  try {
    if (process.env.API_FOOTBALL_KEY) {
      fixtures = await fetchFixturesFromAPI();
    } else {
      console.log('API_FOOTBALL_KEY not set, using mock fixture data');
      fixtures = generateMockTeamFixtures();
    }
  } catch (error) {
    console.error('API fetch failed, using mock fixture data:', error);
    fixtures = generateMockTeamFixtures();
  }

  const teams = calculateTeamLuckFromFixtures(fixtures);

  return {
    teams,
    season: `${CURRENT_SEASON}-${CURRENT_SEASON + 1}`,
    lastUpdated: new Date().toISOString(),
    cached: false,
  };
}

// ============================================
// PLAYER-BASED LUCK SCORE FUNCTIONS (existing)
// ============================================

export async function fetchLuckData(): Promise<LuckDataResponse> {
  const gameweek = getCurrentGameweek();

  // 1. Check Supabase cache first (Write-Once logic)
  try {
    const cachedData = await checkCachedData(gameweek);
    if (cachedData && cachedData.length > 0) {
      return {
        players: cachedData,
        gameweek,
        lastUpdated: new Date().toISOString(),
        cached: true,
      };
    }
  } catch {
    console.log('Cache unavailable, proceeding with API fetch');
  }

  // 2. Fetch fresh data from Official FPL API (primary) or API-Football (fallback)
  let players: PlayerLuckData[];
  
  try {
    // Always try Official FPL API first - it's free and has real-time data
    console.log('Fetching from Official FPL API...');
    players = await fetchPlayersFromFPLAPI();
    console.log(`Loaded ${players.length} players from FPL API`);
  } catch (fplError) {
    console.error('FPL API fetch failed:', fplError);
    
    // Fallback to API-Football if available
    try {
      if (process.env.API_FOOTBALL_KEY) {
        console.log('Falling back to API-Football...');
        players = await fetchPlayersFromAPI();
      } else {
        console.log('Using demo data as final fallback');
        players = generateDemoData();
      }
    } catch (apiError) {
      console.error('All API fetches failed, using demo data:', apiError);
      players = generateDemoData();
    }
  }

  // 3. Save to Supabase cache
  try {
    await saveToCachе(players, gameweek);
  } catch {
    console.log('Cache save failed, continuing without cache');
  }

  return {
    players,
    gameweek,
    lastUpdated: new Date().toISOString(),
    cached: false,
  };
}

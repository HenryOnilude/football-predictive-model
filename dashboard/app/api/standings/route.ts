import { NextResponse } from 'next/server';

// Football-data.org API for Premier League standings
const FOOTBALL_DATA_API = 'https://api.football-data.org/v4/competitions/PL/standings';

export interface StandingTeam {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface StandingsResponse {
  competition: {
    name: string;
    code: string;
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
  };
  standings: Array<{
    stage: string;
    type: string;
    table: StandingTeam[];
  }>;
}

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  
  // If no API key, return mock data for development
  if (!apiKey) {
    console.log('FOOTBALL_DATA_API_KEY not set, using mock standings');
    return NextResponse.json(getMockStandings());
  }

  try {
    const response = await fetch(FOOTBALL_DATA_API, {
      headers: {
        'X-Auth-Token': apiKey,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`Football-data API error: ${response.status}`);
      // Fallback to mock data on error
      return NextResponse.json(getMockStandings());
    }

    const data: StandingsResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch standings:', error);
    return NextResponse.json(getMockStandings());
  }
}

// Mock standings data reflecting approximate 2025-26 mid-season positions
function getMockStandings(): StandingsResponse {
  const teams = [
    { id: 64, name: 'Liverpool FC', shortName: 'Liverpool', tla: 'LIV', pos: 1, w: 14, d: 4, l: 2, gf: 48, ga: 18 },
    { id: 65, name: 'Manchester City FC', shortName: 'Man City', tla: 'MCI', pos: 2, w: 13, d: 5, l: 2, gf: 45, ga: 20 },
    { id: 57, name: 'Arsenal FC', shortName: 'Arsenal', tla: 'ARS', pos: 3, w: 12, d: 6, l: 2, gf: 42, ga: 16 },
    { id: 66, name: 'Manchester United FC', shortName: 'Man United', tla: 'MUN', pos: 4, w: 11, d: 5, l: 4, gf: 35, ga: 22 },
    { id: 61, name: 'Chelsea FC', shortName: 'Chelsea', tla: 'CHE', pos: 5, w: 10, d: 6, l: 4, gf: 40, ga: 26 },
    { id: 73, name: 'Tottenham Hotspur FC', shortName: 'Tottenham', tla: 'TOT', pos: 6, w: 10, d: 5, l: 5, gf: 38, ga: 25 },
    { id: 58, name: 'Aston Villa FC', shortName: 'Aston Villa', tla: 'AVL', pos: 7, w: 10, d: 4, l: 6, gf: 36, ga: 28 },
    { id: 67, name: 'Newcastle United FC', shortName: 'Newcastle', tla: 'NEW', pos: 8, w: 9, d: 6, l: 5, gf: 32, ga: 24 },
    { id: 397, name: 'Brighton & Hove Albion FC', shortName: 'Brighton', tla: 'BHA', pos: 9, w: 8, d: 7, l: 5, gf: 35, ga: 30 },
    { id: 354, name: 'Crystal Palace FC', shortName: 'Crystal Palace', tla: 'CRY', pos: 10, w: 8, d: 5, l: 7, gf: 28, ga: 28 },
    { id: 63, name: 'Fulham FC', shortName: 'Fulham', tla: 'FUL', pos: 11, w: 7, d: 7, l: 6, gf: 30, ga: 28 },
    { id: 402, name: 'Brentford FC', shortName: 'Brentford', tla: 'BRE', pos: 12, w: 7, d: 6, l: 7, gf: 32, ga: 32 },
    { id: 1044, name: 'AFC Bournemouth', shortName: 'Bournemouth', tla: 'BOU', pos: 13, w: 7, d: 5, l: 8, gf: 28, ga: 32 },
    { id: 351, name: 'Nottingham Forest FC', shortName: "Nott'm Forest", tla: 'NFO', pos: 14, w: 6, d: 7, l: 7, gf: 25, ga: 28 },
    { id: 563, name: 'West Ham United FC', shortName: 'West Ham', tla: 'WHU', pos: 15, w: 6, d: 6, l: 8, gf: 26, ga: 32 },
    { id: 76, name: 'Wolverhampton Wanderers FC', shortName: 'Wolves', tla: 'WOL', pos: 16, w: 5, d: 7, l: 8, gf: 24, ga: 30 },
    { id: 62, name: 'Everton FC', shortName: 'Everton', tla: 'EVE', pos: 17, w: 5, d: 6, l: 9, gf: 22, ga: 32 },
    { id: 338, name: 'Leicester City FC', shortName: 'Leicester', tla: 'LEI', pos: 18, w: 4, d: 6, l: 10, gf: 24, ga: 38 },
    { id: 349, name: 'Ipswich Town FC', shortName: 'Ipswich', tla: 'IPS', pos: 19, w: 3, d: 5, l: 12, gf: 18, ga: 40 },
    { id: 340, name: 'Southampton FC', shortName: 'Southampton', tla: 'SOU', pos: 20, w: 2, d: 4, l: 14, gf: 15, ga: 45 },
  ];

  return {
    competition: {
      name: 'Premier League',
      code: 'PL',
    },
    season: {
      id: 2025,
      startDate: '2025-08-16',
      endDate: '2026-05-24',
      currentMatchday: 20,
    },
    standings: [
      {
        stage: 'REGULAR_SEASON',
        type: 'TOTAL',
        table: teams.map((t) => ({
          position: t.pos,
          team: {
            id: t.id,
            name: t.name,
            shortName: t.shortName,
            tla: t.tla,
            crest: `https://crests.football-data.org/${t.id}.png`,
          },
          playedGames: t.w + t.d + t.l,
          form: 'W,D,W,L,W',
          won: t.w,
          draw: t.d,
          lost: t.l,
          points: t.w * 3 + t.d,
          goalsFor: t.gf,
          goalsAgainst: t.ga,
          goalDifference: t.gf - t.ga,
        })),
      },
    ],
  };
}

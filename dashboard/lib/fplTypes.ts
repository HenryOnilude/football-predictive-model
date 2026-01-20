export interface PlayerLuckData {
  id: number;
  code: number; // Persistent player ID for images (never changes between seasons)
  name: string;
  team: string;
  teamShort: string;
  position: string;
  photo: string;
  price: number; // In millions (e.g., 8.5)
  actualGoals: number;
  xG: number;
  luckScore: number; // ActualGoals - xG
  verdict: 'BUY' | 'TRAP' | 'HOLD';
  verdictLabel: string;
  differentialValue: number; // Translated from Variance
  haulPotential: number; // Translated from Regression probability
  trapIndicator: number; // Translated from Risk
  fixtures: FixtureData[];
  gameweek: number;
}

export interface FixtureData {
  opponent: string;
  opponentShort: string;
  fdr: 1 | 2 | 3 | 4 | 5; // Fixture Difficulty Rating
  isHome: boolean;
}

export interface LuckDataResponse {
  players: PlayerLuckData[];
  gameweek: number;
  lastUpdated: string;
  cached: boolean;
}

export interface APIFootballPlayer {
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
      logo: string;
    };
    games: {
      appearences: number;
      position: string;
    };
    goals: {
      total: number;
    };
  }>;
}

export interface SupabaseLuckRecord {
  id?: number;
  player_id: number;
  gameweek: number;
  season: string;
  player_name: string;
  team: string;
  team_short: string;
  position: string;
  photo: string;
  price: number;
  actual_goals: number;
  xg: number;
  luck_score: number;
  verdict: string;
  verdict_label: string;
  differential_value: number;
  haul_potential: number;
  trap_indicator: number;
  fixtures: string; // JSON stringified
  created_at?: string;
}

// FPL Team mappings for short names
export const TEAM_SHORT_NAMES: Record<string, string> = {
  'Arsenal': 'ARS',
  'Aston Villa': 'AVL',
  'Bournemouth': 'BOU',
  'Brentford': 'BRE',
  'Brighton': 'BHA',
  'Brighton & Hove Albion': 'BHA',
  'Chelsea': 'CHE',
  'Crystal Palace': 'CRY',
  'Everton': 'EVE',
  'Fulham': 'FUL',
  'Ipswich': 'IPS',
  'Ipswich Town': 'IPS',
  'Leicester': 'LEI',
  'Leicester City': 'LEI',
  'Liverpool': 'LIV',
  'Manchester City': 'MCI',
  'Manchester United': 'MUN',
  'Newcastle': 'NEW',
  'Newcastle United': 'NEW',
  'Nottingham Forest': 'NFO',
  "Nott'ham Forest": 'NFO',
  'Southampton': 'SOU',
  'Tottenham': 'TOT',
  'Tottenham Hotspur': 'TOT',
  'West Ham': 'WHU',
  'West Ham United': 'WHU',
  'Wolverhampton': 'WOL',
  'Wolverhampton Wanderers': 'WOL',
  'Wolves': 'WOL',
};

// FDR color mapping
export const FDR_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-emerald-500', text: 'text-white' },
  2: { bg: 'bg-emerald-400', text: 'text-white' },
  3: { bg: 'bg-slate-400', text: 'text-white' },
  4: { bg: 'bg-rose-400', text: 'text-white' },
  5: { bg: 'bg-rose-600', text: 'text-white' },
};

// ============================================
// TEAM-BASED LUCK SCORE TYPES
// ============================================

export interface MatchLuckScore {
  fixtureId: number;
  date: string;
  opponent: string;
  opponentId: number;
  isHome: boolean;
  goalsScored: number;
  goalsConceded: number;
  xG: number;
  xGA: number;
  luckScore: number; // (goalsScored - xG)
  defensiveLuck: number; // (xGA - goalsConceded)
  result: 'W' | 'D' | 'L';
}

export interface TeamLuckData {
  teamId: number;
  teamName: string;
  teamShort: string;
  logo: string;
  seasonLuckScore: number; // Total season luck (ActualGoals - xG)
  seasonDefensiveLuck: number; // (xGA - GoalsConceded)
  totalGoals: number;
  totalXG: number;
  totalConceded: number;
  totalXGA: number;
  matchesPlayed: number;
  status: 'UNLUCKY' | 'OVERPERFORMING' | 'NEUTRAL';
  statusLabel: string;
  last5Matches: MatchLuckScore[];
  form: string; // e.g., "WWDLW"
}

export interface TeamLuckResponse {
  teams: Record<number, TeamLuckData>; // Keyed by Team ID
  season: string;
  lastUpdated: string;
  cached: boolean;
}

// Premier League Team IDs (API-Football)
export const PL_TEAM_IDS: Record<number, string> = {
  33: 'Manchester United',
  34: 'Newcastle United',
  35: 'Bournemouth',
  36: 'Fulham',
  39: 'Wolverhampton Wanderers',
  40: 'Liverpool',
  42: 'Arsenal',
  45: 'Everton',
  46: 'Leicester City',
  47: 'Tottenham Hotspur',
  48: 'West Ham United',
  49: 'Chelsea',
  50: 'Manchester City',
  51: 'Brighton & Hove Albion',
  52: 'Crystal Palace',
  55: 'Brentford',
  57: 'Ipswich Town',
  62: 'Aston Villa',
  63: 'Southampton',
  65: 'Nottingham Forest',
};

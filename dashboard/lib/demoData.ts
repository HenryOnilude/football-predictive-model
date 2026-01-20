/**
 * Demo Data Generator for PSxG Badge Validation
 * 
 * This file contains 5 mathematically crafted teams that prove our
 * advanced "Siege" and "Sniper" badge logic works correctly.
 * 
 * Badge Logic:
 * - SIEGE: High xG + High PSxG + Low Goals = Unlucky (hitting woodwork, keeper saves)
 * - SNIPER: High xG + Very High PSxG + High Goals = Elite Finishing Skill
 * - FAIR: xG ≈ PSxG ≈ Goals = Sustainable, no edge
 * - WASTEFUL: High xG + Low PSxG + Low Goals = Bad shot selection/technique
 * - MIRAGE: Low xG + Low PSxG + High Goals = Results are an illusion (sell)
 */

import { TeamStats } from './TeamAnalysis';

export type FinishingBadge = 
  | 'SIEGE'      // Unlucky - great chances, can't convert
  | 'SNIPER'     // Elite skill - clinical finishing
  | 'FAIR'       // Sustainable - performing as expected
  | 'WASTEFUL'   // Bad finishing - poor shot quality
  | 'MIRAGE';    // Results are an illusion - sell

export interface DemoTeam extends TeamStats {
  expectedBadge: FinishingBadge;
  badgeReason: string;
}

/**
 * Calculate the finishing badge based on PSxG analysis
 * 
 * Logic:
 * 1. PSxG vs xG tells us shot quality (are they taking good shots?)
 * 2. Goals vs PSxG tells us finishing skill (are they converting quality chances?)
 * 3. Goals vs xG tells us overall luck (are they scoring more/less than expected?)
 */
export function calculateFinishingBadge(team: TeamStats): FinishingBadge {
  // If no PSxG data, return FAIR as default
  if (!team.PSxG) {
    return 'FAIR';
  }

  const goalDelta = team.goalsFor - team.xGFor;           // Overall luck
  const psxgDelta = team.PSxG - team.xGFor;               // Shot quality (PSxG > xG = better shots)
  const finishingDelta = team.goalsFor - team.PSxG;       // Finishing skill (Goals > PSxG = clinical)

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
  // Results are an illusion - scrappy goals, deflections, penalties
  if (team.xGFor <= 15 && goalDelta >= 5) {
    return 'MIRAGE';
  }

  // FAIR: Everything roughly aligned
  return 'FAIR';
}

/**
 * Get badge display configuration
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

/**
 * 5 Demo Teams for Badge Validation
 * Each team is mathematically crafted to trigger a specific badge
 */
export const demoTeams: DemoTeam[] = [
  {
    // SIEGE: Wolves - "The Unlucky"
    // High xG (20.0), High PSxG (19.5), Low Goals (10)
    // They're creating AND hitting great chances, but keepers saving everything
    teamId: 1,
    teamName: 'Wolves',
    teamLogo: 'https://resources.premierleague.com/premierleague/badges/t39.png',
    goalsFor: 10,
    goalsAgainst: 18,
    xGFor: 20.0,
    xGAgainst: 15.0,
    matchesPlayed: 20,
    points: 22,
    PSxG: 19.5,     // Shot quality matches xG (good shots)
    xGOT: 18.0,     // High xGOT = hitting target
    expectedBadge: 'SIEGE',
    badgeReason: 'Creating quality chances (xG=20, PSxG=19.5) but keepers saving everything (Goals=10). Regression due.',
  },
  {
    // SNIPER: Man City - "The Elite"
    // High xG (30.0), Very High PSxG (35.0), High Goals (36)
    // Taking better shots than expected AND converting them
    teamId: 2,
    teamName: 'Manchester City',
    teamLogo: 'https://resources.premierleague.com/premierleague/badges/t43.png',
    goalsFor: 36,
    goalsAgainst: 12,
    xGFor: 30.0,
    xGAgainst: 10.0,
    matchesPlayed: 20,
    points: 50,
    PSxG: 35.0,     // Better shots than raw xG suggests
    xGOT: 32.0,     // Very high accuracy
    expectedBadge: 'SNIPER',
    badgeReason: 'Elite finishing skill. Taking better shots (PSxG=35 vs xG=30) AND converting (Goals=36). Sustainable.',
  },
  {
    // FAIR: Chelsea - "The Balanced"
    // xG, PSxG, and Goals all roughly equal (~22)
    // No edge either way - performing exactly as expected
    teamId: 3,
    teamName: 'Chelsea',
    teamLogo: 'https://resources.premierleague.com/premierleague/badges/t8.png',
    goalsFor: 22,
    goalsAgainst: 20,
    xGFor: 22.5,
    xGAgainst: 19.0,
    matchesPlayed: 20,
    points: 35,
    PSxG: 22.0,     // Shot quality matches xG
    xGOT: 20.0,     // Expected accuracy
    expectedBadge: 'FAIR',
    badgeReason: 'Performing exactly as expected (xG≈PSxG≈Goals≈22). No significant edge or regression expected.',
  },
  {
    // WASTEFUL: Man Utd - "The Frustrated"
    // High xG (25.0), Low PSxG (15.0), Low Goals (14)
    // Creating chances but taking bad shots (PSxG << xG)
    teamId: 4,
    teamName: 'Manchester United',
    teamLogo: 'https://resources.premierleague.com/premierleague/badges/t1.png',
    goalsFor: 14,
    goalsAgainst: 22,
    xGFor: 25.0,
    xGAgainst: 18.0,
    matchesPlayed: 20,
    points: 28,
    PSxG: 15.0,     // Much lower than xG = poor shot selection
    xGOT: 12.0,     // Low accuracy
    expectedBadge: 'WASTEFUL',
    badgeReason: 'Creating chances (xG=25) but taking poor shots (PSxG=15). Need better finishing positions.',
  },
  {
    // MIRAGE: Luton - "The Illusion"
    // Low xG (10.0), Low PSxG (11.0), High Goals (20)
    // Results are an illusion - scrappy goals, deflections
    teamId: 5,
    teamName: 'Luton Town',
    teamLogo: 'https://resources.premierleague.com/premierleague/badges/t163.png',
    goalsFor: 20,
    goalsAgainst: 30,
    xGFor: 10.0,
    xGAgainst: 28.0,
    matchesPlayed: 20,
    points: 18,
    PSxG: 11.0,     // Shot quality roughly matches low xG
    xGOT: 10.0,     // Low accuracy
    expectedBadge: 'MIRAGE',
    badgeReason: 'Results are an illusion (Goals=20 vs xG=10). Sell before regression.',
  },
];

/**
 * Validate that all demo teams produce their expected badges
 * Returns true if all badges match, throws error otherwise
 */
export function validateDemoBadges(): boolean {
  for (const team of demoTeams) {
    const calculatedBadge = calculateFinishingBadge(team);
    if (calculatedBadge !== team.expectedBadge) {
      throw new Error(
        `Badge mismatch for ${team.teamName}: expected ${team.expectedBadge}, got ${calculatedBadge}`
      );
    }
  }
  return true;
}

/**
 * Get demo teams as TeamStats (without demo metadata)
 */
export function getDemoTeamStats(): TeamStats[] {
  return demoTeams.map(({ expectedBadge, badgeReason, ...stats }) => stats);
}

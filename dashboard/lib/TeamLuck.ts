/**
 * Team Luck Analysis - Attack & Defense Targeting
 * Identifies best defenses and attacks to target based on xG variance
 */

export interface TeamStats {
  teamId: number;
  teamName: string;
  teamShort?: string;
  logo?: string;
  goalsFor: number;
  goalsAgainst: number;
  xGFor: number;
  xGAgainst: number;
  matchesPlayed: number;
  cleanSheets?: number;
}

export type AttackVerdict = 'TARGET_ATTACKERS' | 'AVOID_ATTACKERS' | 'NEUTRAL';
export type DefenseVerdict = 'BUY_DEFENSE' | 'AVOID_DEFENSE' | 'NEUTRAL';

export interface TeamLuckResult {
  teamId: number;
  teamName: string;
  teamShort: string;
  logo: string;
  
  // Attacking Luck: (ActualGoals - xG)
  attackingLuck: number;
  attackVerdict: AttackVerdict;
  attackLabel: string;
  attackDescription: string;
  
  // Defensive Luck: (GoalsConceded - xGA)
  defensiveLuck: number;
  defenseVerdict: DefenseVerdict;
  defenseLabel: string;
  defenseDescription: string;
  
  // Quadrant classification
  quadrant: 'DOUBLE_VALUE' | 'CLEAN_SHEET_CHASER' | 'GOAL_CHASER' | 'AVOID' | 'NEUTRAL';
  
  // Raw stats
  goalsFor: number;
  goalsAgainst: number;
  xGFor: number;
  xGAgainst: number;
  matchesPlayed: number;
}

/**
 * Calculate Attack Verdict based on xG Delta
 * Negative = Unlucky (missing chances) = TARGET ATTACKERS
 * Positive = Lucky (scoring worldies) = AVOID ATTACKERS
 */
function getAttackVerdict(xGDelta: number): { verdict: AttackVerdict; label: string; description: string } {
  if (xGDelta <= -3) {
    return {
      verdict: 'TARGET_ATTACKERS',
      label: 'EXPLOSIVE',
      description: 'Significantly underperforming xG. Attackers are due goals - high upside.',
    };
  } else if (xGDelta <= -1) {
    return {
      verdict: 'TARGET_ATTACKERS',
      label: 'VALUE BUY',
      description: 'Slightly underperforming xG. Good value in attack.',
    };
  } else if (xGDelta >= 3) {
    return {
      verdict: 'AVOID_ATTACKERS',
      label: 'COOLDOWN',
      description: 'Significantly overperforming xG. Scoring unsustainably - regression likely.',
    };
  } else if (xGDelta >= 1) {
    return {
      verdict: 'AVOID_ATTACKERS',
      label: 'OVERHEATED',
      description: 'Slightly overperforming xG. Finishing luck may run out.',
    };
  }
  return {
    verdict: 'NEUTRAL',
    label: 'STABLE',
    description: 'Attack performing as expected. No significant edge.',
  };
}

/**
 * Calculate Defense Verdict based on xGA Delta
 * Positive = Conceded MORE than expected = BUY DEFENSE (clean sheets due)
 * Negative = Conceded LESS than expected = AVOID DEFENSE (goals coming)
 */
function getDefenseVerdict(xGADelta: number): { verdict: DefenseVerdict; label: string; description: string } {
  if (xGADelta >= 3) {
    return {
      verdict: 'BUY_DEFENSE',
      label: 'BUY DIP',
      description: 'Conceding cheap goals. Defense undervalued - clean sheets incoming.',
    };
  } else if (xGADelta >= 1) {
    return {
      verdict: 'BUY_DEFENSE',
      label: 'UNDERVALUED',
      description: 'Slightly unlucky defensively. Good value in defenders/keepers.',
    };
  } else if (xGADelta <= -3) {
    return {
      verdict: 'AVOID_DEFENSE',
      label: 'FRAGILE',
      description: 'Keepers saving them. Defense overvalued - regression likely.',
    };
  } else if (xGADelta <= -1) {
    return {
      verdict: 'AVOID_DEFENSE',
      label: 'RISKY',
      description: 'Slightly overperforming defensively. Clean sheet odds may drop.',
    };
  }
  return {
    verdict: 'NEUTRAL',
    label: 'STABLE',
    description: 'Defense performing as expected. No significant edge.',
  };
}

/**
 * Classify team into quadrant based on attack + defense luck
 */
function getQuadrant(attackVerdict: AttackVerdict, defenseVerdict: DefenseVerdict): TeamLuckResult['quadrant'] {
  // Double Value: Unlucky in both attack and defense
  if (attackVerdict === 'TARGET_ATTACKERS' && defenseVerdict === 'BUY_DEFENSE') {
    return 'DOUBLE_VALUE';
  }
  
  // Goal Chaser: Unlucky in attack
  if (attackVerdict === 'TARGET_ATTACKERS') {
    return 'GOAL_CHASER';
  }
  
  // Clean Sheet Chaser: Unlucky in defense
  if (defenseVerdict === 'BUY_DEFENSE') {
    return 'CLEAN_SHEET_CHASER';
  }
  
  // Avoid: Lucky in both (overperforming)
  if (attackVerdict === 'AVOID_ATTACKERS' && defenseVerdict === 'AVOID_DEFENSE') {
    return 'AVOID';
  }
  
  return 'NEUTRAL';
}

/**
 * Main function: Calculate team luck for attack and defense
 */
export function calculateTeamLuck(teamStats: TeamStats): TeamLuckResult {
  // Attacking Luck: ActualGoals - xG
  // Negative = unlucky (missing chances)
  const attackingLuck = Number((teamStats.goalsFor - teamStats.xGFor).toFixed(2));
  
  // Defensive Luck: GoalsConceded - xGA
  // Positive = unlucky (conceding cheap goals)
  const defensiveLuck = Number((teamStats.goalsAgainst - teamStats.xGAgainst).toFixed(2));
  
  const { verdict: attackVerdict, label: attackLabel, description: attackDescription } = getAttackVerdict(attackingLuck);
  const { verdict: defenseVerdict, label: defenseLabel, description: defenseDescription } = getDefenseVerdict(defensiveLuck);
  const quadrant = getQuadrant(attackVerdict, defenseVerdict);

  return {
    teamId: teamStats.teamId,
    teamName: teamStats.teamName,
    teamShort: teamStats.teamShort || teamStats.teamName.slice(0, 3).toUpperCase(),
    logo: teamStats.logo || '',
    
    attackingLuck,
    attackVerdict,
    attackLabel,
    attackDescription,
    
    defensiveLuck,
    defenseVerdict,
    defenseLabel,
    defenseDescription,
    
    quadrant,
    
    goalsFor: teamStats.goalsFor,
    goalsAgainst: teamStats.goalsAgainst,
    xGFor: teamStats.xGFor,
    xGAgainst: teamStats.xGAgainst,
    matchesPlayed: teamStats.matchesPlayed,
  };
}

/**
 * Batch calculate luck for all teams
 */
export function calculateAllTeamsLuck(teams: TeamStats[]): TeamLuckResult[] {
  return teams.map(calculateTeamLuck);
}

/**
 * Filter teams by quadrant
 */
export function filterByQuadrant(teams: TeamLuckResult[], quadrant: TeamLuckResult['quadrant'] | 'ALL'): TeamLuckResult[] {
  if (quadrant === 'ALL') return teams;
  return teams.filter(t => t.quadrant === quadrant);
}

/**
 * Sort teams by best attacking value
 */
export function sortByAttackingValue(teams: TeamLuckResult[]): TeamLuckResult[] {
  return [...teams].sort((a, b) => a.attackingLuck - b.attackingLuck); // Most negative first
}

/**
 * Sort teams by best defensive value
 */
export function sortByDefensiveValue(teams: TeamLuckResult[]): TeamLuckResult[] {
  return [...teams].sort((a, b) => b.defensiveLuck - a.defensiveLuck); // Most positive first
}

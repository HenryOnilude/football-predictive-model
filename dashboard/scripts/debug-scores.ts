/**
 * Debug Script: Trace System Health calculation for Liverpool and Burnley
 * Run with: npx tsx scripts/debug-scores.ts
 */

interface FPLPlayer {
  id: number;
  web_name: string;
  team: number;
  element_type: number;
  goals_scored: number;
  expected_goals: string;
  expected_goals_conceded: string;
  expected_goals_per_90: number;
  expected_goals_conceded_per_90: number;
  minutes: number;
  clean_sheets: number;
}

interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
}

interface FPLBootstrapResponse {
  teams: FPLTeam[];
  elements: FPLPlayer[];
}

const POSITION_MAP: Record<number, string> = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

const FPL_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://fantasy.premierleague.com/',
};

async function fetchFPLData(): Promise<FPLBootstrapResponse> {
  const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
    headers: FPL_HEADERS,
  });
  if (!response.ok) throw new Error(`FPL API error: ${response.status}`);
  return response.json();
}

function parseFloatSafe(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// The penalty function from fpl.ts (updated thresholds)
function applyAbsoluteVolumePenalty(
  baseScore: number,
  totalXG: number,
  totalXGA: number
): { adjustedScore: number; penalties: string[] } {
  let penalty = 0;
  const penalties: string[] = [];
  
  // Only penalize truly terrible attack (Burnley 18.7, Wolves 20.6)
  if (totalXG < 20) {
    penalty += 30;
    penalties.push(`xG < 20 (${totalXG.toFixed(1)}): -30`);
  } else if (totalXG < 22) {
    penalty += 15;
    penalties.push(`xG < 22 (${totalXG.toFixed(1)}): -15`);
  }
  
  // Only penalize truly terrible defense (Burnley 45.4)
  if (totalXGA > 42) {
    penalty += 30;
    penalties.push(`xGA > 42 (${totalXGA.toFixed(1)}): -30`);
  } else if (totalXGA > 38) {
    penalty += 15;
    penalties.push(`xGA > 38 (${totalXGA.toFixed(1)}): -15`);
  }
  
  if (penalties.length === 0) {
    penalties.push('No penalties applied');
  }
  
  return {
    adjustedScore: Math.max(0, baseScore - penalty),
    penalties
  };
}

// FIXED: Use absolute xG difference instead of flawed per-90 averages
function calculateRawSustainabilityScore(totalXG: number, totalXGA: number): number {
  const netXGDiff = totalXG - totalXGA;
  // Scale: -30 (terrible like Burnley) to +30 (elite like Man City) -> 0-100
  const normalized = (netXGDiff + 30) / 60;
  const score = Math.round(normalized * 100);
  return Math.max(0, Math.min(100, score));
}

async function debugTeamScores() {
  console.log('DEBUG: Tracing System Health Calculation\n');
  console.log('='.repeat(60));
  
  const data = await fetchFPLData();
  
  // Find Liverpool and Burnley
  const targetTeams = ['Liverpool', 'Burnley', 'Arsenal', 'Man City', 'Chelsea', 'Newcastle'];
  
  // Build player data by team
  interface PlayerData {
    name: string;
    teamId: number;
    position: string;
    goals: number;
    xG: number;
    xGC: number;
    xGPer90: number;
    xGCPer90: number;
    minutes: number;
    cleanSheets: number;
  }
  const teamPlayers = new Map<number, PlayerData[]>();
  
  for (const player of data.elements) {
    const position = POSITION_MAP[player.element_type] || 'UNK';
    const playerData = {
      name: player.web_name,
      teamId: player.team,
      position,
      goals: player.goals_scored,
      xG: parseFloatSafe(player.expected_goals),
      xGC: parseFloatSafe(player.expected_goals_conceded),
      xGPer90: player.expected_goals_per_90,
      xGCPer90: player.expected_goals_conceded_per_90,
      minutes: player.minutes,
      cleanSheets: player.clean_sheets,
    };
    
    const existing = teamPlayers.get(player.team) || [];
    existing.push(playerData);
    teamPlayers.set(player.team, existing);
  }
  
  // Process each target team
  for (const teamName of targetTeams) {
    const team = data.teams.find(t => t.name === teamName);
    if (!team) {
      console.log(`\n[ERROR] Team not found: ${teamName}`);
      continue;
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[TEAM] ${team.name.toUpperCase()}`);
    console.log('='.repeat(60));
    
    const players = teamPlayers.get(team.id) || [];
    
    // Step 1: Aggregate stats
    const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
    const totalXG = players.reduce((sum, p) => sum + p.xG, 0);
    const totalXGC = players.reduce((sum, p) => sum + p.xGC, 0) / 11; // Normalized
    const totalXGCRaw = players.reduce((sum, p) => sum + p.xGC, 0); // Raw for penalty calc
    
    console.log('\nSTEP 1: Raw Aggregated Stats');
    console.log(`   Total Goals: ${totalGoals}`);
    console.log(`   Total xG: ${totalXG.toFixed(2)}`);
    console.log(`   Total xGC (raw): ${totalXGCRaw.toFixed(2)}`);
    console.log(`   Total xGC (normalized /11): ${totalXGC.toFixed(2)}`);
    
    // Step 2: Calculate per-90 metrics
    const starters = players.filter(p => p.minutes > 450).slice(0, 11);
    const avgXGPer90 = starters.length > 0
      ? starters.reduce((sum, p) => sum + p.xGPer90, 0) / starters.length
      : 0;
    const defenders = starters.filter(p => p.position === 'DEF' || p.position === 'GK');
    const avgXGCPer90 = defenders.length > 0
      ? defenders.reduce((sum, p) => sum + p.xGCPer90, 0) / defenders.length
      : 0;
    
    console.log('\nSTEP 2: Per-90 Metrics');
    console.log(`   Starters (>450 min): ${starters.length}`);
    console.log(`   Defenders/GKs: ${defenders.length}`);
    console.log(`   Avg xG/90: ${avgXGPer90.toFixed(4)}`);
    console.log(`   Avg xGC/90: ${avgXGCPer90.toFixed(4)}`);
    
    // Step 3: Calculate net xG per 90
    const netXGPer90 = avgXGPer90 - avgXGCPer90;
    
    console.log('\nSTEP 3: Net xG Per 90');
    console.log(`   Net xG/90 = ${avgXGPer90.toFixed(4)} - ${avgXGCPer90.toFixed(4)} = ${netXGPer90.toFixed(4)}`);
    
    // Step 4: Calculate base sustainability score (using absolute totals)
    const baseScore = calculateRawSustainabilityScore(totalXG, totalXGC);
    
    console.log('\nSTEP 4: Base Sustainability Score');
    console.log(`   Formula: (netXGPer90 + 1.5) / 3.0 * 100`);
    console.log(`   = (${netXGPer90.toFixed(4)} + 1.5) / 3.0 * 100`);
    console.log(`   = ${((netXGPer90 + 1.5) / 3.0 * 100).toFixed(2)}`);
    console.log(`   Base Score (clamped 0-100): ${baseScore}`);
    
    // Step 5: Apply penalty (using normalized totalXGC directly)
    const penaltyXGA = totalXGC; // FIXED: Use normalized value directly
    const { adjustedScore, penalties } = applyAbsoluteVolumePenalty(baseScore, totalXG, penaltyXGA);
    
    console.log('\nSTEP 5: Apply Absolute Volume Penalty');
    console.log(`   Input to penalty function:`);
    console.log(`     - baseScore: ${baseScore}`);
    console.log(`     - totalXG: ${totalXG.toFixed(2)}`);
    console.log(`     - totalXGA (xGC * 11): ${penaltyXGA.toFixed(2)}`);
    console.log(`   Penalties:`);
    for (const p of penalties) {
      console.log(`     - ${p}`);
    }
    console.log(`   Final Score: ${adjustedScore}`);
    
    // Step 6: Check for NaN/Infinity
    console.log('\nSTEP 6: NaN/Infinity Check');
    console.log(`   avgXGPer90 isNaN: ${isNaN(avgXGPer90)}`);
    console.log(`   avgXGCPer90 isNaN: ${isNaN(avgXGCPer90)}`);
    console.log(`   netXGPer90 isNaN: ${isNaN(netXGPer90)}`);
    console.log(`   baseScore isNaN: ${isNaN(baseScore)}`);
    console.log(`   adjustedScore isNaN: ${isNaN(adjustedScore)}`);
  }
  
  // Show ALL teams sorted by raw score
  console.log('\n\n' + '='.repeat(60));
  console.log('ALL TEAMS SUMMARY (Sorted by Final Score)');
  console.log('='.repeat(60));
  
  const allTeamScores: { name: string; baseScore: number; finalScore: number; totalXG: number; totalXGA: number }[] = [];
  
  for (const team of data.teams) {
    const players = teamPlayers.get(team.id) || [];
    const totalXG = players.reduce((sum, p) => sum + p.xG, 0);
    const totalXGC = players.reduce((sum, p) => sum + p.xGC, 0) / 11;
    
    const starters = players.filter(p => p.minutes > 450).slice(0, 11);
    const avgXGPer90 = starters.length > 0
      ? starters.reduce((sum, p) => sum + p.xGPer90, 0) / starters.length
      : 0;
    const defenders = starters.filter(p => p.position === 'DEF' || p.position === 'GK');
    const avgXGCPer90 = defenders.length > 0
      ? defenders.reduce((sum, p) => sum + p.xGCPer90, 0) / defenders.length
      : 0;
    
    // netXGPer90 kept for reference but not used in new calculation
    const _netXGPer90 = avgXGPer90 - avgXGCPer90;
    void _netXGPer90; // Suppress unused warning
    const baseScore = calculateRawSustainabilityScore(totalXG, totalXGC);
    const penaltyXGA = totalXGC; // FIXED: Use normalized value directly
    const { adjustedScore } = applyAbsoluteVolumePenalty(baseScore, totalXG, penaltyXGA);
    
    allTeamScores.push({
      name: team.name,
      baseScore,
      finalScore: adjustedScore,
      totalXG,
      totalXGA: penaltyXGA
    });
  }
  
  allTeamScores.sort((a, b) => b.finalScore - a.finalScore);
  
  console.log('\n| # | Team | Base | Final | xG | xGA | Notes |');
  console.log('|---|------|------|-------|----|----|-------|');
  
  allTeamScores.forEach((t, i) => {
    const notes: string[] = [];
    if (t.totalXG < 30) notes.push('Low xG');
    if (t.totalXGA > 30) notes.push('High xGA');
    console.log(`| ${i + 1} | ${t.name.padEnd(15)} | ${t.baseScore.toString().padStart(4)} | ${t.finalScore.toString().padStart(5)} | ${t.totalXG.toFixed(1).padStart(4)} | ${t.totalXGA.toFixed(1).padStart(4)} | ${notes.join(', ')} |`);
  });
}

debugTeamScores().catch(console.error);

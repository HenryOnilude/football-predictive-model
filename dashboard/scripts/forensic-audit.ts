/**
 * FORENSIC DATA AUDIT SCRIPT
 * Fetches raw, unprocessed API data to verify data integrity
 * Run with: npx tsx scripts/forensic-audit.ts
 */

interface FPLPlayer {
  id: number;
  web_name: string;
  team: number;
  goals_scored: number;
  expected_goals: string;
  goals_conceded: number;
  expected_goals_conceded: string;
  minutes: number;
  total_points: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
}

interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
  strength: number;
}

const FPL_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://fantasy.premierleague.com/',
};

async function fetchRawData() {
  console.log('\nFORENSIC DATA AUDIT - Premier League Dataset\n');
  console.log('='.repeat(80));
  
  // Fetch FPL API data (xG metrics)
  const fplRes = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
    headers: FPL_HEADERS,
  });
  const fplData = await fplRes.json();
  
  const teams: FPLTeam[] = fplData.teams;
  const players: FPLPlayer[] = fplData.elements;
  
  // Calculate RAW stats per team from player data
  interface TeamRawStats {
    id: number;
    name: string;
    shortName: string;
    rawGoals: number;
    rawXG: number;
    rawGoalsAgainst: number;
    rawXGA: number;
    totalPoints: number;
  }
  
  const teamStats: TeamRawStats[] = [];
  
  for (const team of teams) {
    const teamPlayers = players.filter(p => p.team === team.id);
    
    // Sum up raw xG from all players (this is cumulative season xG)
    const rawXG = teamPlayers.reduce((sum, p) => sum + parseFloat(p.expected_goals || '0'), 0);
    
    // Sum up raw goals from all players
    const rawGoals = teamPlayers.reduce((sum, p) => sum + p.goals_scored, 0);
    
    // Goals Against: Sum from GKs (they track goals conceded)
    const goalkeepers = teamPlayers.filter(p => p.element_type === 1);
    const rawGoalsAgainst = Math.max(...goalkeepers.map(p => p.goals_conceded), 0);
    
    // xGA: Take max GK's xGC as team xGA (main keeper)
    const maxXGA = Math.max(...goalkeepers.map(p => parseFloat(p.expected_goals_conceded || '0')), 0);
    
    // Total FPL points (proxy for team quality)
    const totalPoints = teamPlayers.reduce((sum, p) => sum + p.total_points, 0);
    
    teamStats.push({
      id: team.id,
      name: team.name,
      shortName: team.short_name,
      rawGoals,
      rawXG: Math.round(rawXG * 10) / 10,
      rawGoalsAgainst,
      rawXGA: Math.round(maxXGA * 10) / 10,
      totalPoints,
    });
  }
  
  // Sort by total FPL points (proxy for league position since we can't get actual standings)
  // But also show raw goals as another sort metric
  const sortedByGoals = [...teamStats].sort((a, b) => b.rawGoals - a.rawGoals);
  
  // Build the truth table
  console.log('\n## THE TRUTH TABLE (Raw FPL API Data - Sorted by Goals Scored)\n');
  console.log('| # | Team         | GF  | xG    | GF-xG  | GA  | xGA   | GA-xGA | FPL Pts |');
  console.log('|---|--------------|-----|-------|--------|-----|-------|--------|---------|');
  
  const sign = (n: number) => n > 0 ? `+${n.toFixed(1)}` : `${n.toFixed(1)}`;
  
  sortedByGoals.forEach((t, i) => {
    const gfDiff = t.rawGoals - t.rawXG;
    const gaDiff = t.rawGoalsAgainst - t.rawXGA;
    console.log(`| ${String(i + 1).padStart(2)} | ${t.name.padEnd(12)} | ${String(t.rawGoals).padStart(3)} | ${t.rawXG.toFixed(1).padStart(5)} | ${sign(gfDiff).padStart(6)} | ${String(t.rawGoalsAgainst).padStart(3)} | ${t.rawXGA.toFixed(1).padStart(5)} | ${sign(gaDiff).padStart(6)} | ${String(t.totalPoints).padStart(7)} |`);
  });
  
  // Evidence Analysis
  console.log('\n\n## EVIDENCE ANALYSIS\n');
  
  // Find specific teams
  const burnley = teamStats.find(t => t.name.toLowerCase().includes('burnley'));
  const spurs = teamStats.find(t => t.name.toLowerCase().includes('spurs'));
  const arsenal = teamStats.find(t => t.name.toLowerCase().includes('arsenal'));
  const manCity = teamStats.find(t => t.name.toLowerCase().includes('man city'));
  const liverpool = teamStats.find(t => t.name.toLowerCase().includes('liverpool'));
  
  console.log('### Evidence A: The Burnley Check');
  if (burnley) {
    const burnleyRank = sortedByGoals.findIndex(t => t.id === burnley.id) + 1;
    console.log(`- Goals Scored Rank: ${burnleyRank}/20`);
    console.log(`- Raw Goals (GF): ${burnley.rawGoals}`);
    console.log(`- Raw xG: ${burnley.rawXG}`);
    console.log(`- GF - xG: ${(burnley.rawGoals - burnley.rawXG).toFixed(1)} (${burnley.rawGoals > burnley.rawXG ? 'OVERPERFORMING' : 'UNDERPERFORMING'})`);
    console.log(`- Raw Goals Against (GA): ${burnley.rawGoalsAgainst}`);
    console.log(`- Raw xGA: ${burnley.rawXGA}`);
    
    if (burnley.rawXG > 35) {
      console.log('\n[X] VERDICT: DATA BUG - API is sending unrealistic xG data for Burnley');
    } else if (burnley.rawXG < 25) {
      console.log('\n[OK] VERDICT: LOGIC BUG CONFIRMED');
      console.log('   → Burnley has LOW xG (expected for relegation team)');
      console.log('   → But our System Health algorithm is giving them high scores');
      console.log('   → ROOT CAUSE: Net xG calculation not weighted by actual output');
    }
  } else {
    console.log('Burnley not found in dataset');
  }
  
  console.log('\n### Evidence B: The Spurs Check');
  if (spurs) {
    const spursRank = sortedByGoals.findIndex(t => t.id === spurs.id) + 1;
    console.log(`- Goals Scored Rank: ${spursRank}/20`);
    console.log(`- Raw Goals (GF): ${spurs.rawGoals}`);
    console.log(`- Raw xG: ${spurs.rawXG}`);
    console.log(`- Raw Goals Against (GA): ${spurs.rawGoalsAgainst}`);
    console.log(`- Raw xGA: ${spurs.rawXGA}`);
    console.log(`- GA - xGA: ${(spurs.rawGoalsAgainst - spurs.rawXGA).toFixed(1)}`);
    
    if (spurs.rawXGA > 28 || spurs.rawGoalsAgainst > 30) {
      console.log('\n[X] VERDICT: LOGIC BUG CONFIRMED');
      console.log('   → Spurs defense is statistically POOR (high xGA/GA)');
      console.log('   → But labeled "DOMINANT" because high attack masks bad defense');
      console.log('   → ROOT CAUSE: Missing "Defense Gate" in verdict logic');
    } else {
      console.log('\n[!] VERDICT: Possible DATA BUG');
      console.log('   → API says defense is elite, which may contradict match results');
    }
  } else {
    console.log('Spurs not found in dataset');
  }
  
  console.log('\n### Evidence C: The Arsenal Check');
  if (arsenal) {
    const arsenalRank = sortedByGoals.findIndex(t => t.id === arsenal.id) + 1;
    console.log(`- Goals Scored Rank: ${arsenalRank}/20`);
    console.log(`- Raw Goals (GF): ${arsenal.rawGoals}`);
    console.log(`- Raw xG: ${arsenal.rawXG}`);
    console.log(`- Raw Goals Against (GA): ${arsenal.rawGoalsAgainst}`);
    console.log(`- Raw xGA: ${arsenal.rawXGA}`);
    console.log(`- FPL Points (quality proxy): ${arsenal.totalPoints}`);
    
    // Compare to top teams
    const avgTopXG = manCity && liverpool ? (manCity.rawXG + liverpool.rawXG) / 2 : 50;
    if (arsenal.rawXG < avgTopXG * 0.8) {
      console.log('\n[!] VERDICT: POSSIBLE LOGIC ISSUE');
      console.log('   → Arsenal is a "Control" team (efficiency > volume)');
      console.log('   → Lower xG than expected for top team');
      console.log('   → Algorithm may be under-rating them vs volume teams');
    } else {
      console.log('\n[OK] Arsenal data appears consistent with top-team metrics');
    }
  } else {
    console.log('Arsenal not found in dataset');
  }
  
  // Summary comparison
  console.log('\n\n### TOP 5 vs BOTTOM 5 COMPARISON\n');
  const top5 = sortedByGoals.slice(0, 5);
  const bottom5 = sortedByGoals.slice(-5);
  
  console.log('**TOP 5 by Goals:**');
  top5.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.name}: ${t.rawGoals} goals, ${t.rawXG} xG, ${t.rawGoalsAgainst} GA`);
  });
  
  console.log('\n**BOTTOM 5 by Goals:**');
  bottom5.forEach((t, i) => {
    console.log(`  ${16 + i}. ${t.name}: ${t.rawGoals} goals, ${t.rawXG} xG, ${t.rawGoalsAgainst} GA`);
  });
  
  // Check if Burnley is in top 5 by xG (would indicate data bug)
  const sortedByXG = [...teamStats].sort((a, b) => b.rawXG - a.rawXG);
  const burnleyXGRank = sortedByXG.findIndex(t => t.name.includes('Burnley')) + 1;
  
  console.log('\n\n### FINAL DIAGNOSIS\n');
  console.log(`Burnley xG Rank: ${burnleyXGRank}/20`);
  
  if (burnleyXGRank <= 10) {
    console.log('\n[ALERT] DATA ANOMALY DETECTED:');
    console.log('   Burnley has top-half xG despite being a relegation team.');
    console.log('   This could indicate:');
    console.log('   1. FPL API aggregates xG differently than expected');
    console.log('   2. Burnley genuinely creates chances but fails to convert');
    console.log('   3. Our algorithm correctly reflects xG but xG != quality');
  } else {
    console.log('\n[OK] DATA APPEARS VALID:');
    console.log('   Burnley has low xG as expected for a relegation team.');
    console.log('   The bug is in our ALGORITHM, not the data.');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('AUDIT COMPLETE\n');
}

fetchRawData().catch(console.error);

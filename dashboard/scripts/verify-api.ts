export {};

/**
 * Forensic API Smoke Test & Validation Script
 * Tests FPL API connectivity and 2025-26 season data integrity
 * 
 * Run: npm run verify-api
 */

// Browser spoofing headers - exact match from fpl-fetch.ts
const FPL_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://fantasy.premierleague.com/',
  'Cache-Control': 'no-cache',
};

const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';
const FPL_IMAGE_CDN = 'https://resources.premierleague.com/premierleague/photos/players';

// 2025-26 Season validation constants
const RELEGATED_TEAMS_2024_25 = ['Luton', 'Luton Town'];
const PROMOTED_TEAMS_2025_26 = ['Leeds', 'Leeds United', 'Burnley', 'Sunderland', 'Sunderland AFC'];

interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
  code: number;
}

interface FPLPlayer {
  id: number;
  web_name: string;
  code: number;
  team: number;
  photo: string;
}

interface BootstrapData {
  teams: FPLTeam[];
  elements: FPLPlayer[];
  events: Array<{ id: number; is_current: boolean; finished: boolean }>;
}

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

const results: TestResult[] = [];

function logTest(result: TestResult) {
  results.push(result);
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log(`   └─ ${result.details}`);
  }
}

async function testAPIConnectivity(): Promise<BootstrapData | null> {
  console.log('\n🔍 TEST 1: API Connectivity & 403 Bypass\n');
  
  const cacheBuster = `?_cb=${Date.now()}`;
  const url = `${FPL_BASE_URL}/bootstrap-static/${cacheBuster}`;
  
  try {
    const response = await fetch(url, {
      headers: FPL_HEADERS,
    });

    if (response.status === 403) {
      logTest({
        name: 'API Access',
        passed: false,
        message: '403 FORBIDDEN - Headers bypass FAILED',
        details: 'FPL API is blocking requests. Check User-Agent and Referer headers.',
      });
      return null;
    }

    if (!response.ok) {
      logTest({
        name: 'API Access',
        passed: false,
        message: `HTTP ${response.status} ${response.statusText}`,
        details: 'Unexpected error from FPL API.',
      });
      return null;
    }

    const data: BootstrapData = await response.json();
    
    logTest({
      name: 'API Access',
      passed: true,
      message: `200 OK - ${data.teams.length} teams, ${data.elements.length} players loaded`,
      details: `Cache-buster: ${cacheBuster}`,
    });

    return data;
  } catch (error) {
    logTest({
      name: 'API Access',
      passed: false,
      message: 'Network error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

function testSeasonIntegrity(data: BootstrapData): void {
  console.log('\n🔍 TEST 2: 2025-26 Season Data Integrity\n');

  const teamNames = data.teams.map(t => t.name);
  
  // Validation A: Check for stale data (relegated teams)
  const staleTeams = RELEGATED_TEAMS_2024_25.filter(team => 
    teamNames.some(name => name.toLowerCase().includes(team.toLowerCase()))
  );

  if (staleTeams.length > 0) {
    logTest({
      name: 'Stale Data Check',
      passed: false,
      message: `STALE DATA DETECTED - Found relegated team(s): ${staleTeams.join(', ')}`,
      details: 'Data is from 2024-25 season or earlier. Cache is not busting correctly.',
    });
  } else {
    logTest({
      name: 'Stale Data Check',
      passed: true,
      message: 'No relegated teams found (Luton Town absent)',
      details: 'Data appears to be from 2025-26 season.',
    });
  }

  // Validation B: Check for promoted teams
  const foundPromoted = PROMOTED_TEAMS_2025_26.filter(team =>
    teamNames.some(name => name.toLowerCase().includes(team.toLowerCase()))
  );

  if (foundPromoted.length === 0) {
    logTest({
      name: 'Promoted Teams Check',
      passed: false,
      message: 'SEASON MISMATCH - No promoted teams found',
      details: `Expected at least one of: ${PROMOTED_TEAMS_2025_26.join(', ')}`,
    });
  } else {
    logTest({
      name: 'Promoted Teams Check',
      passed: true,
      message: `Found promoted team(s): ${foundPromoted.join(', ')}`,
      details: '2025-26 season data confirmed.',
    });
  }

  // Log all teams for debugging
  console.log('\n   📋 Current Teams:');
  teamNames.forEach((name, i) => {
    console.log(`      ${String(i + 1).padStart(2, ' ')}. ${name}`);
  });
}

async function testPlayerImages(data: BootstrapData): Promise<void> {
  console.log('\n🔍 TEST 3: Player Image CDN Validation\n');

  // Test 3 random players - prefer established players with likely photos
  const samplePlayers = data.elements
    .filter(p => p.code > 0 && p.code < 500000) // Established players have lower codes
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  let passedCount = 0;
  const imageResults: string[] = [];

  for (const player of samplePlayers) {
    const imageUrl = `${FPL_IMAGE_CDN}/110x140/p${player.code}.png`;
    
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      
      if (response.ok) {
        passedCount++;
        imageResults.push(`   ✅ ${player.web_name}: 200 OK`);
      } else {
        imageResults.push(`   ⚠️ ${player.web_name}: HTTP ${response.status} (may lack photo)`);
      }
    } catch (error) {
      imageResults.push(`   ⚠️ ${player.web_name}: Network error`);
    }
  }

  // Print individual results (informational only)
  imageResults.forEach(r => console.log(r));

  // At least 1 image should work (some new players lack photos)
  const imageTestPassed = passedCount >= 1;
  logTest({
    name: 'Image CDN',
    passed: imageTestPassed,
    message: `${passedCount}/${samplePlayers.length} player images accessible`,
    details: imageTestPassed ? 'CDN is reachable' : 'CDN may be blocked - all images failed',
  });
}

function testCurrentGameweek(data: BootstrapData): void {
  console.log('\n🔍 TEST 4: Gameweek Status\n');

  const currentEvent = data.events.find(e => e.is_current);
  const finishedEvents = data.events.filter(e => e.finished).length;

  if (currentEvent) {
    logTest({
      name: 'Current Gameweek',
      passed: true,
      message: `GW${currentEvent.id} is active`,
      details: `${finishedEvents} gameweeks completed`,
    });
  } else {
    const nextEvent = data.events.find(e => !e.finished);
    logTest({
      name: 'Current Gameweek',
      passed: true,
      message: nextEvent ? `GW${nextEvent.id} upcoming` : 'Season not started',
      details: `${finishedEvents} gameweeks completed`,
    });
  }
}

async function runAllTests(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║        AXIOM TERMINAL - FORENSIC API SMOKE TEST          ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║  Testing FPL API connectivity and 2025-26 data integrity ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Test 1: API Connectivity
  const data = await testAPIConnectivity();
  
  if (!data) {
    printFinalReport();
    process.exit(1);
  }

  // Test 2: Season Integrity
  testSeasonIntegrity(data);

  // Test 3: Player Images
  await testPlayerImages(data);

  // Test 4: Gameweek Status
  testCurrentGameweek(data);

  // Final Report
  printFinalReport();
}

function printFinalReport(): void {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  
  if (failed === 0) {
    console.log('║              🟢 ALPHA SIGNAL: SECURE 🟢                   ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  All ${total} tests passed. Ready for Vercel deployment.       ║`);
  } else {
    console.log('║              🔴 ALPHA SIGNAL: BLOCKED 🔴                  ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  ${failed} of ${total} tests failed. Do NOT deploy until fixed.      ║`);
  }
  
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Results: ${passed}/${total} passed | ${failed} failed\n`);

  if (failed > 0) {
    console.log('❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`);
    });
    console.log('');
    process.exit(1);
  }

  process.exit(0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

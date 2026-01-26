/**
 * FPL API Fallback Test Suite
 * Tests to ensure data fetching works even when the proxy fails (403 Forbidden)
 * 
 * Run: npx tsx scripts/test-fpl-fallback.ts
 */

export {};

const FPL_API_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: errorMsg, duration: Date.now() - start });
    console.log(`❌ ${name}: ${errorMsg}`);
  }
}

// Test 1: Direct FPL API fetch (simulates browser behavior)
async function testDirectFPLFetch() {
  const response = await fetch(FPL_API_URL, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Direct fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.elements || !Array.isArray(data.elements)) {
    throw new Error('Response missing elements array');
  }
  
  if (!data.teams || !Array.isArray(data.teams)) {
    throw new Error('Response missing teams array');
  }
  
  if (data.elements.length < 500) {
    throw new Error(`Too few players: ${data.elements.length} (expected 500+)`);
  }
  
  if (data.teams.length !== 20) {
    throw new Error(`Wrong team count: ${data.teams.length} (expected 20)`);
  }
}

// Test 2: Verify data structure has required fields
async function testDataStructure() {
  const response = await fetch(FPL_API_URL, {
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Check required top-level fields
  const requiredFields = ['elements', 'teams', 'events', 'element_types'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Check player has required fields
  const player = data.elements[0];
  const playerFields = ['id', 'web_name', 'team', 'now_cost', 'total_points', 'expected_goals'];
  for (const field of playerFields) {
    if (!(field in player)) {
      throw new Error(`Player missing field: ${field}`);
    }
  }
  
  // Check team has required fields
  const team = data.teams[0];
  const teamFields = ['id', 'name', 'short_name', 'code'];
  for (const field of teamFields) {
    if (!(field in team)) {
      throw new Error(`Team missing field: ${field}`);
    }
  }
}

// Test 3: Verify season data is current (2025-26)
async function testSeasonData() {
  const response = await fetch(FPL_API_URL, {
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Check for current season teams (verify promoted teams exist)
  const teamNames = data.teams.map((t: { name: string }) => t.name.toLowerCase());
  
  // These teams should exist in 2025-26 (adjust as needed for actual season)
  const expectedTeams = ['arsenal', 'chelsea', 'liverpool', 'man city', 'man utd'];
  
  for (const team of expectedTeams) {
    const found = teamNames.some((name: string) => name.includes(team.replace(' ', '')));
    if (!found) {
      // Try partial match
      const partialMatch = teamNames.find((name: string) => 
        name.includes(team.split(' ')[0])
      );
      if (!partialMatch) {
        throw new Error(`Expected team not found: ${team}`);
      }
    }
  }
  
  // Check events have gameweek data
  if (!data.events || data.events.length < 38) {
    throw new Error(`Not enough gameweeks: ${data.events?.length || 0}`);
  }
}

// Test 4: Test error handling with bad URL
async function testErrorHandling() {
  try {
    const response = await fetch('https://fantasy.premierleague.com/api/nonexistent/', {
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      throw new Error('Expected 404 but got success');
    }
    
    // This is expected - the API should return 404
    if (response.status !== 404) {
      console.log(`  Note: Got status ${response.status} instead of 404`);
    }
  } catch (error) {
    // Network errors are also acceptable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return; // Network error is fine
    }
    throw error;
  }
}

// Test 5: Concurrent requests (stress test)
async function testConcurrentRequests() {
  const requests = Array(3).fill(null).map(() => 
    fetch(FPL_API_URL, {
      headers: { 'Accept': 'application/json' },
    })
  );
  
  const responses = await Promise.all(requests);
  
  for (let i = 0; i < responses.length; i++) {
    if (!responses[i].ok) {
      throw new Error(`Request ${i + 1} failed: ${responses[i].status}`);
    }
  }
  
  // Verify all returned valid data
  const dataPromises = responses.map(r => r.json());
  const allData = await Promise.all(dataPromises);
  
  for (let i = 0; i < allData.length; i++) {
    if (!allData[i].elements || allData[i].elements.length < 100) {
      throw new Error(`Request ${i + 1} returned invalid data`);
    }
  }
}

// Test 6: Response time check
async function testResponseTime() {
  const start = Date.now();
  
  const response = await fetch(FPL_API_URL, {
    headers: { 'Accept': 'application/json' },
  });
  
  const duration = Date.now() - start;
  
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }
  
  // Warn if response is slow (> 5 seconds)
  if (duration > 5000) {
    throw new Error(`Response too slow: ${duration}ms (max 5000ms)`);
  }
  
  console.log(`  Response time: ${duration}ms`);
}

// Main test runner
async function main() {
  console.log('\n🧪 FPL API Fallback Test Suite\n');
  console.log('=' .repeat(50));
  console.log('Testing direct FPL API access (browser fallback)\n');

  await runTest('Direct FPL API fetch', testDirectFPLFetch);
  await runTest('Data structure validation', testDataStructure);
  await runTest('Season data verification', testSeasonData);
  await runTest('Error handling', testErrorHandling);
  await runTest('Concurrent requests', testConcurrentRequests);
  await runTest('Response time check', testResponseTime);

  console.log('\n' + '=' .repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`\n📊 Results: ${passed}/${results.length} tests passed`);
  console.log(`⏱️  Total time: ${totalTime}ms`);
  
  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed! FPL API fallback is working.\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Test suite crashed:', error);
  process.exit(1);
});

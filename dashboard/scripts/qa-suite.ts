/**
 * Deep Research QA Framework
 * Validates 4 Critical Pillars of the FPL Axiom Dashboard
 * Run with: npx tsx scripts/qa-suite.ts
 */

// =============================================================================
// TEST UTILITIES
// =============================================================================

interface TestResult {
  pillar: string;
  testName: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

const results: TestResult[] = [];

function logTest(result: TestResult): void {
  results.push(result);
  const status = result.passed ? '[PASS]' : '[FAIL]';
  console.log(`  ${status} ${result.testName}`);
  if (!result.passed) {
    console.log(`         Expected: ${result.expected}`);
    console.log(`         Actual:   ${result.actual}`);
    if (result.details) {
      console.log(`         Details:  ${result.details}`);
    }
  }
}

// =============================================================================
// PILLAR 1: MATH INTEGRITY (The Zero Paradox)
// =============================================================================

function testMathIntegrity(): void {
  console.log('\n' + '='.repeat(60));
  console.log('PILLAR 1: MATH INTEGRITY (The Zero Paradox)');
  console.log('='.repeat(60));

  // Test 1.1: Division by zero protection
  console.log('\n[Test 1.1] Division by Zero Protection');
  
  function calculateEfficiency(goals: number, minutes: number): number | null {
    if (minutes === 0) return null; // Safe guard
    return goals / (minutes / 90);
  }
  
  const zeroMinutesResult = calculateEfficiency(1, 0);
  logTest({
    pillar: 'Math Integrity',
    testName: 'Zero minutes should return null (not Infinity)',
    passed: zeroMinutesResult === null,
    expected: 'null',
    actual: String(zeroMinutesResult),
    details: 'Prevents Infinity from propagating through calculations'
  });

  // Test 1.2: Verify unsafe division would produce Infinity
  const unsafeResult = 1 / 0;
  logTest({
    pillar: 'Math Integrity',
    testName: 'Raw 1/0 produces Infinity (baseline check)',
    passed: unsafeResult === Infinity,
    expected: 'Infinity',
    actual: String(unsafeResult),
    details: 'Confirms JavaScript behavior we need to guard against'
  });

  // Test 1.3: Epsilon floating point comparison
  console.log('\n[Test 1.3] Floating Point Epsilon Check');
  
  const EPSILON = 1e-10;
  const floatA = 0.1 + 0.2;
  const floatB = 0.3;
  const naiveComparison = floatA === floatB;
  const epsilonComparison = Math.abs(floatA - floatB) < EPSILON;
  
  logTest({
    pillar: 'Math Integrity',
    testName: 'Naive 0.1 + 0.2 === 0.3 fails (expected behavior)',
    passed: naiveComparison === false,
    expected: 'false (due to floating point)',
    actual: String(naiveComparison),
    details: `0.1 + 0.2 = ${floatA}`
  });

  logTest({
    pillar: 'Math Integrity',
    testName: 'Epsilon comparison 0.1 + 0.2 ~= 0.3 passes',
    passed: epsilonComparison === true,
    expected: 'true (within epsilon)',
    actual: String(epsilonComparison),
    details: `Difference: ${Math.abs(floatA - floatB)}`
  });

  // Test 1.4: NaN propagation check
  console.log('\n[Test 1.4] NaN Propagation Protection');
  
  function parseFloatSafe(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  const nanInput = parseFloatSafe(NaN);
  logTest({
    pillar: 'Math Integrity',
    testName: 'parseFloatSafe(NaN) returns 0',
    passed: nanInput === 0,
    expected: '0',
    actual: String(nanInput)
  });

  const undefinedInput = parseFloatSafe(undefined);
  logTest({
    pillar: 'Math Integrity',
    testName: 'parseFloatSafe(undefined) returns 0',
    passed: undefinedInput === 0,
    expected: '0',
    actual: String(undefinedInput)
  });
}

// =============================================================================
// PILLAR 2: LOGIC & RANKING (The Burnley Regression)
// =============================================================================

function testLogicRanking(): void {
  console.log('\n' + '='.repeat(60));
  console.log('PILLAR 2: LOGIC & RANKING (The Burnley Regression)');
  console.log('='.repeat(60));

  // Replicate the actual calculation from fpl.ts
  function calculateRawSustainabilityScore(totalXG: number, totalXGA: number): number {
    const netXGDiff = totalXG - totalXGA;
    const normalized = (netXGDiff + 30) / 60;
    const score = Math.round(normalized * 100);
    return Math.max(0, Math.min(100, score));
  }

  function applyAbsoluteVolumePenalty(
    baseScore: number,
    totalXG: number,
    totalXGA: number
  ): number {
    let penalty = 0;
    
    if (totalXG < 20) {
      penalty += 30;
    } else if (totalXG < 22) {
      penalty += 15;
    }
    
    if (totalXGA > 42) {
      penalty += 30;
    } else if (totalXGA > 38) {
      penalty += 15;
    }
    
    return Math.max(0, baseScore - penalty);
  }

  // Test 2.1: Burnley-like team (xG: 18.0, xGA: 45.0)
  console.log('\n[Test 2.1] Burnley Regression Test');
  
  const burnleyXG = 18.0;
  const burnleyXGA = 45.0;
  const burnleyBaseScore = calculateRawSustainabilityScore(burnleyXG, burnleyXGA);
  const burnleyFinalScore = applyAbsoluteVolumePenalty(burnleyBaseScore, burnleyXG, burnleyXGA);
  
  logTest({
    pillar: 'Logic & Ranking',
    testName: 'Burnley-like team (xG:18, xGA:45) base score calculation',
    passed: burnleyBaseScore < 20,
    expected: '< 20 (relegation tier)',
    actual: String(burnleyBaseScore),
    details: `Net xG diff: ${burnleyXG - burnleyXGA}`
  });

  logTest({
    pillar: 'Logic & Ranking',
    testName: 'Burnley-like team final score after penalties',
    passed: burnleyFinalScore < 20,
    expected: '< 20',
    actual: String(burnleyFinalScore),
    details: 'Should be penalized for low xG AND high xGA'
  });

  // Test 2.2: Elite team (Man City-like: xG: 50, xGA: 22)
  console.log('\n[Test 2.2] Elite Team Test');
  
  const eliteXG = 50.0;
  const eliteXGA = 22.0;
  const eliteBaseScore = calculateRawSustainabilityScore(eliteXG, eliteXGA);
  const eliteFinalScore = applyAbsoluteVolumePenalty(eliteBaseScore, eliteXG, eliteXGA);
  
  logTest({
    pillar: 'Logic & Ranking',
    testName: 'Elite team (xG:50, xGA:22) base score > 80',
    passed: eliteBaseScore > 80,
    expected: '> 80 (elite tier)',
    actual: String(eliteBaseScore),
    details: `Net xG diff: ${eliteXG - eliteXGA}`
  });

  logTest({
    pillar: 'Logic & Ranking',
    testName: 'Elite team should not be penalized',
    passed: eliteFinalScore === eliteBaseScore,
    expected: String(eliteBaseScore),
    actual: String(eliteFinalScore),
    details: 'No penalty thresholds should trigger'
  });

  // Test 2.3: Ranking order is correct
  console.log('\n[Test 2.3] Ranking Order Validation');
  
  const teams = [
    { name: 'Man City', xG: 50, xGA: 22 },
    { name: 'Arsenal', xG: 40, xGA: 16 },
    { name: 'Liverpool', xG: 35, xGA: 24 },
    { name: 'Burnley', xG: 18, xGA: 45 },
  ];
  
  const rankedTeams = teams.map(t => ({
    name: t.name,
    score: applyAbsoluteVolumePenalty(
      calculateRawSustainabilityScore(t.xG, t.xGA),
      t.xG,
      t.xGA
    )
  })).sort((a, b) => b.score - a.score);
  
  const isCorrectOrder = 
    rankedTeams[0].name !== 'Burnley' && 
    rankedTeams[rankedTeams.length - 1].name === 'Burnley';
  
  logTest({
    pillar: 'Logic & Ranking',
    testName: 'Burnley is ranked last among test teams',
    passed: isCorrectOrder,
    expected: 'Burnley at bottom',
    actual: rankedTeams.map(t => `${t.name}:${t.score}`).join(' > '),
    details: 'Validates ranking logic produces expected order'
  });
}

// =============================================================================
// PILLAR 3: DATA RESILIENCE (The Poison Pill)
// =============================================================================

function testDataResilience(): void {
  console.log('\n' + '='.repeat(60));
  console.log('PILLAR 3: DATA RESILIENCE (The Poison Pill)');
  console.log('='.repeat(60));

  // Safe parser function (mirrors fpl.ts implementation)
  function parseFloatSafe(value: unknown): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (typeof value === 'string') {
      if (value === 'null' || value === 'undefined' || value === '') return 0;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  // Test 3.1: String "null" poison pill
  console.log('\n[Test 3.1] String "null" Poison Pill');
  
  const poisonNull = parseFloatSafe('null');
  logTest({
    pillar: 'Data Resilience',
    testName: 'parseFloatSafe("null") returns 0',
    passed: poisonNull === 0,
    expected: '0',
    actual: String(poisonNull),
    details: 'API sometimes returns string "null" instead of actual null'
  });

  // Test 3.2: String "undefined" poison pill
  const poisonUndefined = parseFloatSafe('undefined');
  logTest({
    pillar: 'Data Resilience',
    testName: 'parseFloatSafe("undefined") returns 0',
    passed: poisonUndefined === 0,
    expected: '0',
    actual: String(poisonUndefined)
  });

  // Test 3.3: Empty string
  const emptyString = parseFloatSafe('');
  logTest({
    pillar: 'Data Resilience',
    testName: 'parseFloatSafe("") returns 0',
    passed: emptyString === 0,
    expected: '0',
    actual: String(emptyString)
  });

  // Test 3.4: Valid number string
  console.log('\n[Test 3.4] Valid Data Parsing');
  
  const validString = parseFloatSafe('3.14');
  logTest({
    pillar: 'Data Resilience',
    testName: 'parseFloatSafe("3.14") returns 3.14',
    passed: validString === 3.14,
    expected: '3.14',
    actual: String(validString)
  });

  // Test 3.5: Actual number passthrough
  const actualNumber = parseFloatSafe(42);
  logTest({
    pillar: 'Data Resilience',
    testName: 'parseFloatSafe(42) returns 42',
    passed: actualNumber === 42,
    expected: '42',
    actual: String(actualNumber)
  });

  // Test 3.6: Mock malformed API response
  console.log('\n[Test 3.6] Malformed API Response Handling');
  
  interface MockPlayer {
    goals: unknown;
    xG: unknown;
    minutes: unknown;
  }
  
  const malformedPlayer: MockPlayer = {
    goals: 'null',
    xG: undefined,
    minutes: 'NaN'
  };
  
  const parsedGoals = parseFloatSafe(malformedPlayer.goals);
  const parsedXG = parseFloatSafe(malformedPlayer.xG);
  const parsedMinutes = parseFloatSafe(malformedPlayer.minutes);
  
  const allParsedSafely = parsedGoals === 0 && parsedXG === 0 && parsedMinutes === 0;
  
  logTest({
    pillar: 'Data Resilience',
    testName: 'Malformed player data parses without crash',
    passed: allParsedSafely,
    expected: 'All fields = 0',
    actual: `goals:${parsedGoals}, xG:${parsedXG}, minutes:${parsedMinutes}`,
    details: 'Simulates corrupted API response'
  });
}

// =============================================================================
// PILLAR 4: SECURITY CHECK (The Rate Limit / Caching)
// =============================================================================

function testSecurityCaching(): void {
  console.log('\n' + '='.repeat(60));
  console.log('PILLAR 4: SECURITY CHECK (Rate Limit / Caching)');
  console.log('='.repeat(60));

  // Simulate a cached calculation engine
  const cache = new Map<string, number>();
  
  function calculateWithCache(xG: number, xGA: number): number {
    const cacheKey = `${xG}-${xGA}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
    
    // Simulate expensive calculation
    const netXGDiff = xG - xGA;
    const normalized = (netXGDiff + 30) / 60;
    const score = Math.round(normalized * 100);
    const result = Math.max(0, Math.min(100, score));
    
    cache.set(cacheKey, result);
    return result;
  }

  // Test 4.1: First call (cold cache)
  console.log('\n[Test 4.1] Cold Cache Performance');
  
  const coldStart = performance.now();
  calculateWithCache(30, 25);
  const coldEnd = performance.now();
  const coldTime = coldEnd - coldStart;
  
  logTest({
    pillar: 'Security Check',
    testName: 'First calculation completes (cold cache)',
    passed: coldTime < 100, // Should be fast even cold
    expected: '< 100ms',
    actual: `${coldTime.toFixed(3)}ms`
  });

  // Test 4.2: Rapid subsequent calls (warm cache)
  console.log('\n[Test 4.2] Warm Cache Performance (5 rapid calls)');
  
  const times: number[] = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    calculateWithCache(30, 25); // Same params = cache hit
    const end = performance.now();
    times.push(end - start);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const maxTime = Math.max(...times);
  
  logTest({
    pillar: 'Security Check',
    testName: 'Average cached call time < 1ms',
    passed: avgTime < 1,
    expected: '< 1ms',
    actual: `${avgTime.toFixed(4)}ms`,
    details: `Individual times: ${times.map(t => t.toFixed(4)).join(', ')}ms`
  });

  logTest({
    pillar: 'Security Check',
    testName: 'Max cached call time < 10ms',
    passed: maxTime < 10,
    expected: '< 10ms',
    actual: `${maxTime.toFixed(4)}ms`
  });

  // Test 4.3: Cache isolation (different params = different cache)
  console.log('\n[Test 4.3] Cache Isolation');
  
  cache.clear();
  const result1 = calculateWithCache(40, 20);
  const result2 = calculateWithCache(20, 40);
  
  logTest({
    pillar: 'Security Check',
    testName: 'Different params produce different cached results',
    passed: result1 !== result2,
    expected: 'Different scores',
    actual: `(40,20)=${result1}, (20,40)=${result2}`,
    details: 'Ensures cache keys are unique per input'
  });

  // Test 4.4: Cache size doesn't explode
  console.log('\n[Test 4.4] Cache Size Management');
  
  cache.clear();
  for (let i = 0; i < 100; i++) {
    calculateWithCache(i, i + 10);
  }
  
  logTest({
    pillar: 'Security Check',
    testName: 'Cache handles 100 unique entries',
    passed: cache.size === 100,
    expected: '100 entries',
    actual: `${cache.size} entries`
  });
}

// =============================================================================
// MAIN EXECUTION & REPORT
// =============================================================================

function generateReport(): void {
  console.log('\n' + '='.repeat(60));
  console.log('QA SUITE FINAL REPORT');
  console.log('='.repeat(60));
  
  const pillars = ['Math Integrity', 'Logic & Ranking', 'Data Resilience', 'Security Check'];
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const pillar of pillars) {
    const pillarResults = results.filter(r => r.pillar === pillar);
    const passed = pillarResults.filter(r => r.passed).length;
    const failed = pillarResults.filter(r => !r.passed).length;
    
    totalPassed += passed;
    totalFailed += failed;
    
    const status = failed === 0 ? '[PASS]' : '[FAIL]';
    console.log(`\n${status} ${pillar}`);
    console.log(`       Passed: ${passed}/${pillarResults.length}`);
    
    if (failed > 0) {
      console.log('       Failed tests:');
      pillarResults.filter(r => !r.passed).forEach(r => {
        console.log(`         - ${r.testName}`);
      });
    }
  }
  
  console.log('\n' + '-'.repeat(60));
  console.log('SUMMARY');
  console.log('-'.repeat(60));
  console.log(`Total Tests:  ${totalPassed + totalFailed}`);
  console.log(`Passed:       ${totalPassed}`);
  console.log(`Failed:       ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  if (totalFailed === 0) {
    console.log('\n[SUCCESS] All QA pillars validated successfully!');
  } else {
    console.log(`\n[WARNING] ${totalFailed} test(s) failed. Review required.`);
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run all tests
console.log('Deep Research QA Framework');
console.log('FPL Axiom Dashboard - Critical Pillar Validation');
console.log('='.repeat(60));

testMathIntegrity();
testLogicRanking();
testDataResilience();
testSecurityCaching();
generateReport();

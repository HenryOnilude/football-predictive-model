import { NextResponse } from 'next/server';

const FPL_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';
const IP_CHECK_URL = 'https://api.ipify.org?format=json';

interface TestResult {
  status: number;
  latency: number;
  blocked_by: string | null;
  cf_ray: string | null;
  server: string | null;
  content_type: string | null;
  body_snippet: string;
  html_title: string | null;
  is_json: boolean;
  data_preview: string | null;
}

/**
 * Deep Forensic FPL API Probe
 * Multi-vector connection test to diagnose 403 blocks
 */
export async function GET() {
  const results: {
    server_identity: { outgoing_ip: string; region: string };
    tests: {
      no_headers: TestResult;
      minimalist: TestResult;
      impersonator: TestResult;
    };
    verdict: string;
    recommendations: string[];
    timestamp: string;
  } = {
    server_identity: { outgoing_ip: 'unknown', region: 'unknown' },
    tests: {
      no_headers: createEmptyResult(),
      minimalist: createEmptyResult(),
      impersonator: createEmptyResult(),
    },
    verdict: '',
    recommendations: [],
    timestamp: new Date().toISOString(),
  };

  // Step 1: Identity Check - Get outgoing IP
  try {
    const ipResponse = await fetch(IP_CHECK_URL, {
      signal: AbortSignal.timeout(5000),
    });
    if (ipResponse.ok) {
      const ipData = await ipResponse.json();
      results.server_identity.outgoing_ip = ipData.ip || 'unknown';
    }
  } catch {
    results.server_identity.outgoing_ip = 'fetch_failed';
  }

  // Detect Vercel region from environment
  results.server_identity.region = process.env.VERCEL_REGION || process.env.AWS_REGION || 'local';

  // Step 2: Multi-Vector Tests (run in parallel)
  const [testA, testB, testC] = await Promise.all([
    // Test A: The Bot (no headers)
    runTest('no_headers', {}),
    
    // Test B: The Minimalist (simple User-Agent)
    runTest('minimalist', {
      'User-Agent': 'FPL-App/1.0',
    }),
    
    // Test C: The Impersonator (full browser headers)
    runTest('impersonator', {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Referer': 'https://fantasy.premierleague.com/',
    }),
  ]);

  results.tests.no_headers = testA;
  results.tests.minimalist = testB;
  results.tests.impersonator = testC;

  // Step 3: Analyze and generate verdict
  const analysis = analyzeResults(results);
  results.verdict = analysis.verdict;
  results.recommendations = analysis.recommendations;

  return NextResponse.json(results, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

async function runTest(
  name: string,
  headers: Record<string, string>
): Promise<TestResult> {
  const startTime = Date.now();
  const result = createEmptyResult();

  try {
    const response = await fetch(FPL_URL, {
      method: 'GET',
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });

    result.latency = Date.now() - startTime;
    result.status = response.status;
    result.cf_ray = response.headers.get('cf-ray');
    result.server = response.headers.get('server');
    result.content_type = response.headers.get('content-type');

    // Read body
    const body = await response.text();
    result.body_snippet = body.substring(0, 1000);
    result.is_json = isValidJSON(body);

    // Extract HTML title if present
    const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
    result.html_title = titleMatch ? titleMatch[1].trim() : null;

    // Determine blocker
    if (response.status === 200) {
      result.blocked_by = null;
      if (result.is_json) {
        try {
          const data = JSON.parse(body);
          result.data_preview = `Teams: ${data.teams?.length || 0}, Players: ${data.elements?.length || 0}`;
        } catch {
          result.data_preview = 'JSON parse error';
        }
      }
    } else if (response.status === 403) {
      result.blocked_by = detectBlocker(body, response.headers);
    } else {
      result.blocked_by = `HTTP ${response.status}`;
    }

  } catch (err) {
    result.latency = Date.now() - startTime;
    result.status = 0;
    result.blocked_by = err instanceof Error ? err.message : 'Unknown error';
  }

  return result;
}

function createEmptyResult(): TestResult {
  return {
    status: 0,
    latency: 0,
    blocked_by: null,
    cf_ray: null,
    server: null,
    content_type: null,
    body_snippet: '',
    html_title: null,
    is_json: false,
    data_preview: null,
  };
}

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function detectBlocker(body: string, headers: Headers): string {
  const bodyLower = body.toLowerCase();
  const server = headers.get('server')?.toLowerCase() || '';

  // Cloudflare detection
  if (server.includes('cloudflare') || headers.get('cf-ray')) {
    if (bodyLower.includes('challenge') || bodyLower.includes('turnstile')) {
      return 'Cloudflare JS Challenge';
    }
    if (bodyLower.includes('captcha') || bodyLower.includes('hcaptcha')) {
      return 'Cloudflare CAPTCHA';
    }
    if (bodyLower.includes('access denied') || bodyLower.includes('blocked')) {
      return 'Cloudflare WAF Block';
    }
    if (bodyLower.includes('rate limit') || bodyLower.includes('too many')) {
      return 'Cloudflare Rate Limit';
    }
    return 'Cloudflare (Generic 403)';
  }

  // Origin server detection
  if (bodyLower.includes('access denied') || bodyLower.includes('forbidden')) {
    return 'Origin Server Block';
  }
  if (bodyLower.includes('bot') || bodyLower.includes('automated')) {
    return 'Bot Detection';
  }

  return 'Unknown (check body_snippet)';
}

function analyzeResults(results: {
  server_identity: { outgoing_ip: string };
  tests: {
    no_headers: TestResult;
    minimalist: TestResult;
    impersonator: TestResult;
  };
}): { verdict: string; recommendations: string[] } {
  const { no_headers, minimalist, impersonator } = results.tests;
  const recommendations: string[] = [];

  // All passed
  if (no_headers.status === 200 && minimalist.status === 200 && impersonator.status === 200) {
    return {
      verdict: '✅ ALL TESTS PASSED - FPL API is fully accessible from this server',
      recommendations: ['Server-side fetching should work without issues'],
    };
  }

  // Only impersonator passed
  if (impersonator.status === 200 && (no_headers.status === 403 || minimalist.status === 403)) {
    return {
      verdict: '🟡 HEADER-BASED BLOCK - Requests without browser headers are rejected',
      recommendations: [
        'Always include full browser headers in server-side requests',
        'Current implementation should work with proper headers',
      ],
    };
  }

  // All blocked
  if (no_headers.status === 403 && minimalist.status === 403 && impersonator.status === 403) {
    const blocker = impersonator.blocked_by || 'Unknown';
    
    if (blocker.includes('Cloudflare')) {
      recommendations.push(`IP ${results.server_identity.outgoing_ip} is blocked at Cloudflare level`);
      recommendations.push('Use client-side fetching as fallback (browser IPs not blocked)');
      recommendations.push('Consider using a proxy service or different hosting region');
      
      if (blocker.includes('Challenge') || blocker.includes('CAPTCHA')) {
        return {
          verdict: '🔴 CLOUDFLARE CHALLENGE - JavaScript execution or CAPTCHA required',
          recommendations,
        };
      }
      
      return {
        verdict: '🔴 CLOUDFLARE WAF BLOCK - Server IP/ASN is blacklisted',
        recommendations,
      };
    }

    recommendations.push('All request types blocked - likely IP-based block');
    recommendations.push('Use client-side fetching as primary method');
    
    return {
      verdict: '🔴 COMPLETE BLOCK - All server-side requests are rejected',
      recommendations,
    };
  }

  // Mixed results
  return {
    verdict: '🟡 PARTIAL ACCESS - Some request types blocked',
    recommendations: [
      'Check individual test results for details',
      'Use the passing configuration for server-side requests',
    ],
  };
}

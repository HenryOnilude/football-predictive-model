import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * Deep Diagnostics Probe for FPL API
 * Performs forensic analysis of 403/503 errors to identify blocking cause
 */
export async function GET() {
  const FPL_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';
  const startTime = Date.now();
  
  // Get client/request info from incoming headers
  const requestHeaders = await headers();
  const clientIP = requestHeaders.get('x-forwarded-for') 
    || requestHeaders.get('x-real-ip') 
    || requestHeaders.get('cf-connecting-ip')
    || 'unknown';
  const vercelRegion = requestHeaders.get('x-vercel-id') || 'unknown';
  
  let responseStatus = 0;
  const responseHeaders: Record<string, string> = {};
  let bodyPreview = '';
  let fullBody = '';
  let error: string | undefined;
  let latency = 0;

  try {
    // Raw fetch with strict Chrome Mac Desktop User-Agent
    const response = await fetch(FPL_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });

    latency = Date.now() - startTime;
    responseStatus = response.status;

    // Capture all response headers
    response.headers.forEach((value: string, key: string) => {
      responseHeaders[key] = value;
    });

    // Read full response body (text or JSON)
    fullBody = await response.text();
    bodyPreview = fullBody.substring(0, 500);

  } catch (err) {
    latency = Date.now() - startTime;
    error = err instanceof Error ? err.message : String(err);
  }

  // Analyze the response
  const analysis = analyzeResponse(responseStatus, fullBody, responseHeaders);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    probe: {
      url: FPL_URL,
      latency: `${latency}ms`,
      status: responseStatus,
      statusText: getStatusText(responseStatus),
    },
    environment: {
      clientIP,
      vercelRegion,
      runtime: process.env.VERCEL ? 'vercel-edge' : 'local',
    },
    headers: {
      // Key Cloudflare/Security headers
      'cf-ray': responseHeaders['cf-ray'] || null,
      'cf-cache-status': responseHeaders['cf-cache-status'] || null,
      'server': responseHeaders['server'] || null,
      'retry-after': responseHeaders['retry-after'] || null,
      'x-robots-tag': responseHeaders['x-robots-tag'] || null,
      'content-type': responseHeaders['content-type'] || null,
      // All headers for deep inspection
      all: responseHeaders,
    },
    body: {
      preview: bodyPreview,
      length: fullBody.length,
      isJSON: isValidJSON(fullBody),
      isHTML: fullBody.trim().startsWith('<'),
    },
    analysis,
    error,
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

function getStatusText(status: number): string {
  const codes: Record<number, string> = {
    200: 'OK',
    301: 'Moved Permanently',
    302: 'Found (Redirect)',
    400: 'Bad Request',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    520: 'Cloudflare Unknown Error',
    521: 'Cloudflare Web Server Down',
    522: 'Cloudflare Connection Timed Out',
    523: 'Cloudflare Origin Unreachable',
  };
  return codes[status] || 'Unknown';
}

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function analyzeResponse(
  status: number, 
  body: string, 
  headers: Record<string, string>
): {
  verdict: string;
  blockType: string | null;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let verdict = 'Unknown';
  let blockType: string | null = null;

  if (status === 200) {
    verdict = '✅ SUCCESS - API is accessible from this server';
    recommendations.push('Server-side fetching should work');
  } else if (status === 403) {
    // Analyze the 403 response
    const bodyLower = body.toLowerCase();
    
    if (bodyLower.includes('cloudflare') || headers['server']?.includes('cloudflare')) {
      if (bodyLower.includes('challenge') || bodyLower.includes('captcha')) {
        verdict = '🔴 CLOUDFLARE CHALLENGE - JavaScript challenge or CAPTCHA required';
        blockType = 'cloudflare-challenge';
        recommendations.push('Cannot bypass - requires browser JavaScript execution');
        recommendations.push('Use client-side fetching as fallback');
      } else if (bodyLower.includes('access denied') || bodyLower.includes('blocked')) {
        verdict = '🔴 WAF BLOCK - IP or ASN is blocked by Cloudflare WAF';
        blockType = 'waf-block';
        recommendations.push('Vercel IP range may be blocked');
        recommendations.push('Use client-side fetching to bypass server IP block');
      } else {
        verdict = '🟡 CLOUDFLARE 403 - Blocked but reason unclear';
        blockType = 'cloudflare-generic';
        recommendations.push('Check body preview for specific error message');
      }
    } else if (bodyLower.includes('access denied') || bodyLower.includes('forbidden')) {
      verdict = '🔴 SERVER BLOCK - FPL origin server rejected request';
      blockType = 'origin-block';
      recommendations.push('Headers may be flagged as bot traffic');
      recommendations.push('Try different User-Agent');
    } else {
      verdict = '🟡 403 FORBIDDEN - Cause unclear';
      blockType = 'unknown-403';
      recommendations.push('Inspect body preview for clues');
    }
  } else if (status === 429) {
    verdict = '🟡 RATE LIMITED - Too many requests';
    blockType = 'rate-limit';
    recommendations.push(`Retry after: ${headers['retry-after'] || 'unknown'}`);
  } else if (status >= 500) {
    verdict = '🔴 SERVER ERROR - FPL API is down or overloaded';
    blockType = 'server-error';
    recommendations.push('Wait and retry later');
  } else if (status === 0) {
    verdict = '🔴 CONNECTION FAILED - Could not reach FPL servers';
    blockType = 'network-error';
    recommendations.push('Check DNS resolution and network connectivity');
  }

  return { verdict, blockType, recommendations };
}

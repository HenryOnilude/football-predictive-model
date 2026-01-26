import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint for FPL Alpha
 * Returns API status, latency, and connection mode
 */
export async function GET() {
  const startTime = Date.now();
  
  let fplStatus: 'ok' | 'degraded' | 'down' = 'down';
  let fplLatency = 0;
  let fplError: string | undefined;
  let teamCount = 0;
  let playerCount = 0;

  try {
    // Test FPL API directly
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    fplLatency = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      teamCount = data.teams?.length || 0;
      playerCount = data.elements?.length || 0;
      
      // Validate data quality
      if (teamCount === 20 && playerCount > 500) {
        fplStatus = 'ok';
      } else {
        fplStatus = 'degraded';
        fplError = `Data incomplete: ${teamCount} teams, ${playerCount} players`;
      }
    } else {
      fplStatus = 'down';
      fplError = `HTTP ${response.status}`;
    }
  } catch (error) {
    fplLatency = Date.now() - startTime;
    fplStatus = 'down';
    fplError = error instanceof Error ? error.message : 'Unknown error';
  }

  const health = {
    status: fplStatus === 'ok' ? 'healthy' : fplStatus === 'degraded' ? 'degraded' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    fpl: {
      status: fplStatus,
      latency: fplLatency,
      teams: teamCount,
      players: playerCount,
      error: fplError,
    },
    uptime: process.uptime(),
  };

  const statusCode = fplStatus === 'ok' ? 200 : fplStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

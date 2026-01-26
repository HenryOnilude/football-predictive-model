import { NextResponse } from 'next/server';
import { sendDiscordNotification } from '@/lib/notifications';

// Track previous status to only notify on changes
let previousStatus: 'ok' | 'degraded' | 'down' | null = null;

/**
 * Health Check Endpoint for FPL Alpha
 * Returns API status, latency, and connection mode
 * Sends Discord notifications on status changes
 */
export async function GET() {
  const startTime = Date.now();
  
  let fplStatus: 'ok' | 'degraded' | 'down' = 'down';
  let fplLatency = 0;
  let fplError: string | undefined;
  let teamCount = 0;
  let playerCount = 0;
  let serverBlocked = false;

  // Step 1: Test server-side proxy (simulates Vercel environment)
  try {
    const proxyResponse = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    fplLatency = Date.now() - startTime;

    if (proxyResponse.status === 403) {
      serverBlocked = true;
      fplError = 'Server blocked (403 Forbidden)';
    } else if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      teamCount = data.teams?.length || 0;
      playerCount = data.elements?.length || 0;
      
      if (teamCount === 20 && playerCount > 500) {
        fplStatus = 'ok';
      } else {
        fplStatus = 'degraded';
        fplError = `Data incomplete: ${teamCount} teams, ${playerCount} players`;
      }
    } else {
      fplStatus = 'down';
      fplError = `HTTP ${proxyResponse.status}`;
    }
  } catch (error) {
    fplLatency = Date.now() - startTime;
    serverBlocked = true;
    fplError = error instanceof Error ? error.message : 'Unknown error';
  }

  // Step 2: If server blocked, mark as degraded (client fallback will work)
  if (serverBlocked) {
    fplStatus = 'degraded';
  }

  // Step 3: Send Discord notification on status change
  if (previousStatus !== fplStatus) {
    if (fplStatus === 'degraded') {
      // Warning: 403 detected, fallback active
      await sendDiscordNotification('warning', 'Degraded - Fallback Active', fplLatency, fplError);
    } else if (fplStatus === 'down') {
      // Critical: Both server and client failed
      await sendDiscordNotification('critical', 'Disconnected', fplLatency, fplError);
    } else if (fplStatus === 'ok' && previousStatus !== null) {
      // Recovery: Back to normal
      await sendDiscordNotification('success', 'Healthy', fplLatency);
    }
    previousStatus = fplStatus;
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
      serverBlocked,
    },
    uptime: process.uptime(),
    notificationsEnabled: !!process.env.DISCORD_WEBHOOK_URL,
  };

  const statusCode = fplStatus === 'ok' ? 200 : fplStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

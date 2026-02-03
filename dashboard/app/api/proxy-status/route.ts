import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Proxy Configuration Status Endpoint
 * Reports whether RESIDENTIAL_PROXY_URL is configured
 */
export async function GET() {
  const proxyUrl = process.env.RESIDENTIAL_PROXY_URL;

  const status = {
    proxyConfigured: !!proxyUrl,
    proxyHost: proxyUrl ? new URL(proxyUrl).hostname : null,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

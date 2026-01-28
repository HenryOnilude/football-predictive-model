import { NextResponse } from 'next/server';
import { fetchBootstrapStatic } from '@/lib/fpl-fetch';

// Extend Vercel function timeout for slow proxy connections
export const maxDuration = 60;

// Proxy endpoint for FPL API to avoid CORS issues
export async function GET() {
  try {
    const data = await fetchBootstrapStatic(300);
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('FPL API fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FPL data' },
      { status: 500 }
    );
  }
}

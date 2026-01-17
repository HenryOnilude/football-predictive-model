import { NextResponse } from 'next/server';

// Proxy endpoint for FPL API to avoid CORS issues
export async function GET() {
  try {
    const response = await fetch(
      'https://fantasy.premierleague.com/api/bootstrap-static/',
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FPL-Dashboard/1.0)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`FPL API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
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

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Cache Revalidation Endpoint
 * Purges Next.js cache for specified paths
 *
 * Usage:
 * - GET /api/revalidate?path=/ (revalidate home page)
 * - GET /api/revalidate?path=/fpl (revalidate FPL page)
 * - GET /api/revalidate?secret=YOUR_SECRET&path=/ (with secret protection)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '/';
  const secret = searchParams.get('secret');

  // Optional: Protect with secret (set REVALIDATE_SECRET in env vars)
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Invalid secret' },
      { status: 401 }
    );
  }

  try {
    // Revalidate the specified path
    revalidatePath(path);

    // Also revalidate related paths if home page
    if (path === '/') {
      revalidatePath('/fpl');
      revalidatePath('/api/fpl');
    }

    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: new Date().toISOString(),
      message: `Cache cleared for ${path}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to revalidate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

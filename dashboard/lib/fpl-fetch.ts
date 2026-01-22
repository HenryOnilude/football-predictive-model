/**
 * Centralized FPL API Fetch Helper
 * Handles User-Agent headers to prevent 403 Forbidden errors in production
 * Includes cache-busting for fresh 2025-26 season data
 */

const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

// 2025-26 Season identifier for cache validation
const CURRENT_SEASON = '2025-26';

// Browser-like headers to prevent 403 blocks
const FPL_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://fantasy.premierleague.com/',
  'Cache-Control': 'no-cache',
} as const;

interface FPLFetchOptions {
  /** Next.js revalidate time in seconds (default: 60 = 1 minute for fresher data) */
  revalidate?: number;
  /** Additional headers to merge */
  headers?: Record<string, string>;
  /** Force cache bust with timestamp */
  bustCache?: boolean;
}

/**
 * Fetch from FPL API with proper browser headers
 * Prevents 403 Forbidden errors in production
 * Includes cache-busting to ensure fresh 2025-26 data
 * 
 * @param endpoint - API endpoint (e.g., 'bootstrap-static/' or 'element-summary/123/')
 * @param options - Fetch options including revalidate time
 * @returns Parsed JSON response
 */
export async function fplFetch<T>(
  endpoint: string,
  options: FPLFetchOptions = {}
): Promise<T> {
  const { revalidate = 60, headers = {}, bustCache = true } = options;
  
  // Ensure endpoint doesn't have leading slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Add cache-busting parameter to prevent stale data
  const cacheBuster = bustCache ? `?_cb=${Date.now()}` : '';
  const url = `${FPL_BASE_URL}/${cleanEndpoint}${cacheBuster}`;
  
  const response = await fetch(url, {
    next: { revalidate },
    headers: {
      ...FPL_HEADERS,
      ...headers,
    },
    cache: 'no-store', // Force fresh data, bypass Vercel edge cache
  });

  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status} ${response.statusText} for ${url}`);
  }

  return response.json();
}

/**
 * Fetch bootstrap-static data (main FPL data endpoint)
 */
export async function fetchBootstrapStatic<T>(revalidate = 300): Promise<T> {
  return fplFetch<T>('bootstrap-static/', { revalidate });
}

/**
 * Fetch player element summary (history, fixtures)
 */
export async function fetchElementSummary<T>(playerId: number, revalidate = 300): Promise<T> {
  return fplFetch<T>(`element-summary/${playerId}/`, { revalidate });
}

export { FPL_HEADERS, FPL_BASE_URL };

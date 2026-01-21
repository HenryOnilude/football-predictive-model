/**
 * Centralized FPL API Fetch Helper
 * Handles User-Agent headers to prevent 403 Forbidden errors in production
 */

const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

// Browser-like headers to prevent 403 blocks
const FPL_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://fantasy.premierleague.com/',
} as const;

interface FPLFetchOptions {
  /** Next.js revalidate time in seconds (default: 300 = 5 minutes) */
  revalidate?: number;
  /** Additional headers to merge */
  headers?: Record<string, string>;
}

/**
 * Fetch from FPL API with proper browser headers
 * Prevents 403 Forbidden errors in production
 * 
 * @param endpoint - API endpoint (e.g., 'bootstrap-static/' or 'element-summary/123/')
 * @param options - Fetch options including revalidate time
 * @returns Parsed JSON response
 */
export async function fplFetch<T>(
  endpoint: string,
  options: FPLFetchOptions = {}
): Promise<T> {
  const { revalidate = 300, headers = {} } = options;
  
  // Ensure endpoint doesn't have leading slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${FPL_BASE_URL}/${cleanEndpoint}`;
  
  const response = await fetch(url, {
    next: { revalidate },
    headers: {
      ...FPL_HEADERS,
      ...headers,
    },
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

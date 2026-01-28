/**
 * Centralized FPL API Fetch Helper
 * Uses residential proxy to bypass Cloudflare WAF blocks
 * Includes 4-hour caching to save proxy bandwidth
 */

import { ProxyAgent } from 'undici';

const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

// 2025-26 Season identifier for cache validation
export const CURRENT_SEASON = '2025-26';

// Browser-like headers to prevent 403 blocks
const FPL_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-GB,en;q=0.9',
  'Referer': 'https://fantasy.premierleague.com/',
} as const;

// Create proxy agent if URL is configured
function getProxyAgent(): ProxyAgent | undefined {
  const proxyUrl = process.env.RESIDENTIAL_PROXY_URL;
  if (proxyUrl) {
    return new ProxyAgent(proxyUrl);
  }
  return undefined;
}

interface FPLFetchOptions {
  /** Next.js revalidate time in seconds (default: 14400 = 4 hours to save proxy bandwidth) */
  revalidate?: number;
  /** Additional headers to merge */
  headers?: Record<string, string>;
  /** Force cache bust with timestamp */
  bustCache?: boolean;
}

/**
 * Fetch from FPL API via residential proxy
 * Bypasses Cloudflare WAF blocks that affect datacenter IPs
 * 
 * @param endpoint - API endpoint (e.g., 'bootstrap-static/' or 'element-summary/123/')
 * @param options - Fetch options including revalidate time
 * @returns Parsed JSON response
 */
export async function fplFetch<T>(
  endpoint: string,
  options: FPLFetchOptions = {}
): Promise<T> {
  const { revalidate = 14400, headers = {}, bustCache = false } = options;
  
  // Ensure endpoint doesn't have leading slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Only bust cache if explicitly requested (saves proxy bandwidth)
  const cacheBuster = bustCache ? `?_cb=${Date.now()}` : '';
  const url = `${FPL_BASE_URL}/${cleanEndpoint}${cacheBuster}`;
  
  const proxyAgent = getProxyAgent();
  
  const fetchOptions: RequestInit & { dispatcher?: ProxyAgent } = {
    next: { revalidate },
    headers: {
      ...FPL_HEADERS,
      ...headers,
    },
  };
  
  // Add proxy dispatcher if available
  if (proxyAgent) {
    fetchOptions.dispatcher = proxyAgent;
    console.log('[FPL Fetch] Using residential proxy');
  } else {
    console.warn('[FPL Fetch] No RESIDENTIAL_PROXY_URL configured, using direct fetch');
  }
  
  const response = await fetch(url, fetchOptions);

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

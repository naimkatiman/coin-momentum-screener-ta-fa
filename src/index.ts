import { ScannerService } from '../server/src/services/scanner';
import { coinGeckoService } from '../server/src/services/coingecko';
import { ScannerFilters } from '../server/src/types';

interface AssetsBinding {
  fetch(request: Request | string, init?: RequestInit): Promise<Response>;
}

export interface Env {
  ASSETS: AssetsBinding;
  COINGECKO_API_KEY?: string;
}

const appStart = Date.now();

const jsonHeaders: Record<string, string> = {
  'content-type': 'application/json; charset=UTF-8',
  'cache-control': 'no-store',
};

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders,
  });
}

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseScannerFilters(url: URL): ScannerFilters {
  const signalsRaw = url.searchParams.get('signals');
  const signals = signalsRaw
    ? signalsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  return {
    minMarketCap: parseNumber(url.searchParams.get('minMarketCap')),
    maxMarketCap: parseNumber(url.searchParams.get('maxMarketCap')),
    minVolume: parseNumber(url.searchParams.get('minVolume')),
    minMomentumScore: parseNumber(url.searchParams.get('minMomentumScore')),
    signals,
    sortBy: (url.searchParams.get('sortBy') as ScannerFilters['sortBy']) || 'momentum',
    limit: parseNumber(url.searchParams.get('limit')) || 50,
  };
}

async function handleApi(request: Request, url: URL, env: Env): Promise<Response> {
  if (request.method !== 'GET') {
    return jsonResponse(
      { success: false, error: 'Method Not Allowed', message: 'Only GET endpoints are supported.' },
      405
    );
  }

  const apiKey = env.COINGECKO_API_KEY;
  const path = url.pathname;
  const pathParts = path.split('/').filter(Boolean);

  try {
    if (path === '/api/health') {
      return jsonResponse({
        status: 'running',
        timestamp: new Date().toISOString(),
        service: 'Coin Momentum Screener API',
        runtime: 'cloudflare-workers',
        version: '2.0.0',
      });
    }

    if (path === '/api/scanner') {
      const filters = parseScannerFilters(url);
      const results = await ScannerService.scanMarket(filters, apiKey);
      return jsonResponse({
        success: true,
        count: results.length,
        timestamp: new Date().toISOString(),
        data: results,
      });
    }

    if (pathParts.length === 3 && pathParts[0] === 'api' && pathParts[1] === 'coin') {
      const coinId = decodeURIComponent(pathParts[2]);
      const result = await ScannerService.detailedAnalysis(coinId, apiKey);
      return jsonResponse({
        success: true,
        timestamp: new Date().toISOString(),
        data: result,
      });
    }

    if (path === '/api/portfolio/simulate') {
      const initial = parseNumber(url.searchParams.get('initial')) || 100;
      const target = parseNumber(url.searchParams.get('target')) || 1000;
      const requestedRisk = (url.searchParams.get('risk') || 'medium').toLowerCase();
      const riskProfile = requestedRisk === 'low' || requestedRisk === 'high' ? requestedRisk : 'medium';
      const result = await ScannerService.simulatePortfolio(initial, target, riskProfile, apiKey);
      return jsonResponse({
        success: true,
        timestamp: new Date().toISOString(),
        data: result,
      });
    }

    if (path === '/api/trending') {
      const trending = await coinGeckoService.getTrending(apiKey);
      return jsonResponse({
        success: true,
        timestamp: new Date().toISOString(),
        data: trending,
      });
    }

    if (path === '/api/global') {
      const global = await coinGeckoService.getGlobalData(apiKey);
      return jsonResponse({
        success: true,
        timestamp: new Date().toISOString(),
        data: global,
      });
    }

    if (pathParts.length === 3 && pathParts[0] === 'api' && pathParts[1] === 'chart') {
      const coinId = decodeURIComponent(pathParts[2]);
      const days = parseNumber(url.searchParams.get('days')) || 30;
      const chart = await coinGeckoService.getMarketChart(coinId, days, apiKey);
      return jsonResponse({
        success: true,
        timestamp: new Date().toISOString(),
        data: chart,
      });
    }

    if (path === '/api/stats') {
      return jsonResponse({
        success: true,
        runtime: 'cloudflare-workers',
        uptimeSeconds: Math.floor((Date.now() - appStart) / 1000),
        cache: coinGeckoService.getCacheStats(),
      });
    }

    return jsonResponse(
      {
        success: false,
        error: 'Not Found',
        message: `Unknown API endpoint: ${path}`,
      },
      404
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected API error';
    console.error(`API error for ${path}:`, message);
    return jsonResponse(
      {
        success: false,
        error: message,
        message: 'Request failed. Please try again.',
      },
      500
    );
  }
}

async function handleAssets(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  const url = new URL(request.url);
  const indexRequest = new Request(new URL('/index.html', url).toString(), request);
  return env.ASSETS.fetch(indexRequest);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, url, env);
    }

    return handleAssets(request, env);
  },
};

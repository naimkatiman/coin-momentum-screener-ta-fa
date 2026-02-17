// ============================================================
// CoinGecko API Service
// Professional-grade integration with caching & rate limiting
// ============================================================

import { CoinMarketData, CoinDetailData, OHLCData, TrendingCoin } from '../types';
import { TTLCache } from '../utils/ttlCache';

class CoinGeckoService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3/';
  private readonly cache = new TTLCache(60);
  private lastRequestTime = 0;
  private readonly minRequestIntervalMs = 1500; // 1.5s between requests for demo API key

  constructor() {
    console.log('CoinGecko API Service initialized');
  }

  private async throttledRequest<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestIntervalMs) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestIntervalMs - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
    return fn();
  }

  private getDefaultApiKey(): string {
    const processRef = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    return processRef?.env?.COINGECKO_API_KEY || '';
  }

  private async request<T>(
    path: string,
    params: Record<string, string | number | boolean> = {},
    apiKey?: string
  ): Promise<T> {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(normalizedPath, this.baseUrl);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'coin-momentum-screener-ta-fa/2.0 (+https://coin-momentum-screener-ta-fa.m-naim.workers.dev)',
    };

    const key = apiKey || this.getDefaultApiKey();
    if (key) {
      headers['x-cg-demo-api-key'] = key;
    }

    return this.throttledRequest(async () => {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`CoinGecko API ${response.status}: ${body.slice(0, 200)}`);
      }

      const payload = await response.json();
      return payload as T;
    });
  }

  async getMarketData(
    page: number = 1, 
    perPage: number = 100,
    sparkline: boolean = true,
    apiKey?: string
  ): Promise<CoinMarketData[]> {
    const cacheKey = `market_${page}_${perPage}_${sparkline}`;
    const cached = this.cache.get<CoinMarketData[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.request<CoinMarketData[]>(
        '/coins/markets',
        {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: perPage,
          page,
          sparkline,
          price_change_percentage: '1h,24h,7d,14d,30d',
          locale: 'en',
        },
        apiKey
      );

      this.cache.set(cacheKey, data, 60);
      return data;
    } catch (error: any) {
      console.error('Error fetching market data:', error.message);
      throw new Error(`Failed to fetch market data: ${error.message}`);
    }
  }

  async getCoinDetail(coinId: string, apiKey?: string): Promise<CoinDetailData> {
    const cacheKey = `detail_${coinId}`;
    const cached = this.cache.get<CoinDetailData>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.request<CoinDetailData>(
        `/coins/${coinId}`,
        {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: true,
          sparkline: false,
        },
        apiKey
      );

      this.cache.set(cacheKey, data, 300);
      return data;
    } catch (error: any) {
      console.error(`Error fetching coin detail for ${coinId}:`, error.message);
      throw new Error(`Failed to fetch coin detail: ${error.message}`);
    }
  }

  async getOHLC(coinId: string, days: number = 30, apiKey?: string): Promise<OHLCData[]> {
    const cacheKey = `ohlc_${coinId}_${days}`;
    const cached = this.cache.get<OHLCData[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.request<number[][]>(
        `/coins/${coinId}/ohlc`,
        {
          vs_currency: 'usd',
          days,
        },
        apiKey
      );

      const ohlcData: OHLCData[] = data.map((item: number[]) => ({
        timestamp: item[0],
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
      }));

      this.cache.set(cacheKey, ohlcData, 300);
      return ohlcData;
    } catch (error: any) {
      console.error(`Error fetching OHLC for ${coinId}:`, error.message);
      throw new Error(`Failed to fetch OHLC data: ${error.message}`);
    }
  }

  async getMarketChart(coinId: string, days: number = 30, apiKey?: string): Promise<{
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
  }> {
    const cacheKey = `chart_${coinId}_${days}`;
    const cached = this.cache.get<{
      prices: [number, number][];
      market_caps: [number, number][];
      total_volumes: [number, number][];
    }>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.request<{
        prices: [number, number][];
        market_caps: [number, number][];
        total_volumes: [number, number][];
      }>(
        `/coins/${coinId}/market_chart`,
        {
          vs_currency: 'usd',
          days,
        },
        apiKey
      );

      this.cache.set(cacheKey, data, 300);
      return data;
    } catch (error: any) {
      console.error(`Error fetching market chart for ${coinId}:`, error.message);
      throw new Error(`Failed to fetch market chart: ${error.message}`);
    }
  }

  async getTrending(apiKey?: string): Promise<TrendingCoin[]> {
    const cacheKey = 'trending';
    const cached = this.cache.get<TrendingCoin[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.request<{ coins: Array<{ item: TrendingCoin }> }>(
        '/search/trending',
        {},
        apiKey
      );

      const coins = data.coins.map((item) => item.item);
      this.cache.set(cacheKey, coins, 300);
      return coins;
    } catch (error: any) {
      console.error('Error fetching trending:', error.message);
      throw new Error(`Failed to fetch trending: ${error.message}`);
    }
  }

  async getGlobalData(apiKey?: string): Promise<any> {
    const cacheKey = 'global';
    const cached = this.cache.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.request<{ data: any }>(
        '/global',
        {},
        apiKey
      );

      this.cache.set(cacheKey, data.data, 120);
      return data.data;
    } catch (error: any) {
      console.error('Error fetching global data:', error.message);
      throw new Error(`Failed to fetch global data: ${error.message}`);
    }
  }

  getCacheStats() {
    const stats = this.cache.getStats();
    return {
      keys: this.cache.keys().length,
      hits: stats.hits,
      misses: stats.misses,
    };
  }
}

export const coinGeckoService = new CoinGeckoService();

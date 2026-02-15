// ============================================================
// CoinGecko API Service
// Professional-grade integration with caching & rate limiting
// ============================================================

import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';
import { CoinMarketData, CoinDetailData, OHLCData, TrendingCoin } from '../types';

class CoinGeckoService {
  private client: AxiosInstance;
  private cache: NodeCache;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1500; // 1.5s between requests for demo API key

  constructor() {
    const apiKey = process.env.COINGECKO_API_KEY || '';
    
    this.client = axios.create({
      baseURL: 'https://api.coingecko.com/api/v3',
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'x-cg-demo-api-key': apiKey,
      },
    });

    // Cache: 60s for market data, 300s for detail data
    this.cache = new NodeCache({ 
      stdTTL: 60,
      checkperiod: 30,
      useClones: false
    });

    console.log('CoinGecko API Service initialized');
  }

  private async throttledRequest<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
    return fn();
  }

  async getMarketData(
    page: number = 1, 
    perPage: number = 100,
    sparkline: boolean = true
  ): Promise<CoinMarketData[]> {
    const cacheKey = `market_${page}_${perPage}_${sparkline}`;
    const cached = this.cache.get<CoinMarketData[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.throttledRequest(() =>
        this.client.get('/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: perPage,
            page,
            sparkline,
            price_change_percentage: '1h,24h,7d,14d,30d',
            locale: 'en',
          },
        })
      );

      this.cache.set(cacheKey, response.data, 60);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching market data:', error.message);
      throw new Error(`Failed to fetch market data: ${error.message}`);
    }
  }

  async getCoinDetail(coinId: string): Promise<CoinDetailData> {
    const cacheKey = `detail_${coinId}`;
    const cached = this.cache.get<CoinDetailData>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.throttledRequest(() =>
        this.client.get(`/coins/${coinId}`, {
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: true,
            developer_data: true,
            sparkline: false,
          },
        })
      );

      this.cache.set(cacheKey, response.data, 300);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching coin detail for ${coinId}:`, error.message);
      throw new Error(`Failed to fetch coin detail: ${error.message}`);
    }
  }

  async getOHLC(coinId: string, days: number = 30): Promise<OHLCData[]> {
    const cacheKey = `ohlc_${coinId}_${days}`;
    const cached = this.cache.get<OHLCData[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.throttledRequest(() =>
        this.client.get(`/coins/${coinId}/ohlc`, {
          params: {
            vs_currency: 'usd',
            days,
          },
        })
      );

      const ohlcData: OHLCData[] = response.data.map((item: number[]) => ({
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

  async getMarketChart(coinId: string, days: number = 30): Promise<{
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
  }> {
    const cacheKey = `chart_${coinId}_${days}`;
    const cached = this.cache.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.throttledRequest(() =>
        this.client.get(`/coins/${coinId}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days,
          },
        })
      );

      this.cache.set(cacheKey, response.data, 300);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching market chart for ${coinId}:`, error.message);
      throw new Error(`Failed to fetch market chart: ${error.message}`);
    }
  }

  async getTrending(): Promise<TrendingCoin[]> {
    const cacheKey = 'trending';
    const cached = this.cache.get<TrendingCoin[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.throttledRequest(() =>
        this.client.get('/search/trending')
      );

      const coins = response.data.coins.map((item: any) => item.item);
      this.cache.set(cacheKey, coins, 300);
      return coins;
    } catch (error: any) {
      console.error('Error fetching trending:', error.message);
      throw new Error(`Failed to fetch trending: ${error.message}`);
    }
  }

  async getGlobalData(): Promise<any> {
    const cacheKey = 'global';
    const cached = this.cache.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.throttledRequest(() =>
        this.client.get('/global')
      );

      this.cache.set(cacheKey, response.data.data, 120);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching global data:', error.message);
      throw new Error(`Failed to fetch global data: ${error.message}`);
    }
  }

  getCacheStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
    };
  }
}

export const coinGeckoService = new CoinGeckoService();

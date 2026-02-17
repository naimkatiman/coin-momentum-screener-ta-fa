// ============================================================
// Scanner Service - Orchestrates TA, FA, Momentum Scoring
// ============================================================

import { coinGeckoService } from './coingecko';
import { TechnicalAnalysisEngine } from './technicalAnalysis';
import { FundamentalAnalysisEngine } from './fundamentalAnalysis';
import { MomentumScoringEngine } from './momentumScoring';
import {
  ScannedCoin,
  ScannerFilters,
  PortfolioSimulation,
  CoinMarketData,
  PortfolioRiskProfile,
} from '../types';
import { TTLCache } from '../utils/ttlCache';

const scanCache = new TTLCache(120);

export class ScannerService {

  // ============================================================
  // Full Scanner - Analyze top coins with TA + FA
  // ============================================================
  static async scanMarket(filters: ScannerFilters = {}, apiKey?: string): Promise<ScannedCoin[]> {
    const cacheKey = `scan_${JSON.stringify(filters)}`;
    const cached = scanCache.get<ScannedCoin[]>(cacheKey);
    if (cached) return cached;

    const limit = filters.limit || 50;
    const perPage = Math.min(limit, 100);

    // Fetch market data with sparklines
    const marketData = await coinGeckoService.getMarketData(1, perPage, true, apiKey);

    // Process each coin
    const scannedCoins: ScannedCoin[] = [];

    for (const coin of marketData) {
      try {
        // Apply pre-filters
        if (filters.minMarketCap && coin.market_cap < filters.minMarketCap) continue;
        if (filters.maxMarketCap && coin.market_cap > filters.maxMarketCap) continue;
        if (filters.minVolume && coin.total_volume < filters.minVolume) continue;

        const scanned = await this.analyzeCoin(coin);
        
        // Apply momentum filter
        if (filters.minMomentumScore && scanned.momentumScore.overallScore < filters.minMomentumScore) continue;
        
        // Apply signal filter
        if (filters.signals && filters.signals.length > 0) {
          if (!filters.signals.includes(scanned.momentumScore.signal)) continue;
        }

        scannedCoins.push(scanned);
      } catch (error) {
        console.error(`Error analyzing ${coin.id}:`, error);
        // Still include with basic analysis
        scannedCoins.push(this.basicAnalysis(coin));
      }
    }

    // Sort results
    const sortBy = filters.sortBy || 'momentum';
    scannedCoins.sort((a, b) => {
      switch (sortBy) {
        case 'momentum': return b.momentumScore.overallScore - a.momentumScore.overallScore;
        case 'price_change': return b.priceChange24h - a.priceChange24h;
        case 'volume': return b.volume24h - a.volume24h;
        case 'market_cap': return b.marketCap - a.marketCap;
        default: return b.momentumScore.overallScore - a.momentumScore.overallScore;
      }
    });

    scanCache.set(cacheKey, scannedCoins);
    return scannedCoins;
  }

  // ============================================================
  // Analyze a single coin
  // ============================================================
  static async analyzeCoin(coin: CoinMarketData): Promise<ScannedCoin> {
    const sparkline = coin.sparkline_in_7d?.price || [];
    
    // Technical Analysis from sparkline
    const ta = TechnicalAnalysisEngine.analyzeFromSparkline(
      sparkline,
      coin.total_volume,
      coin.total_volume * 0.8 // Estimate avg volume
    );

    // Fundamental Analysis
    const fa = FundamentalAnalysisEngine.analyze(coin, null);

    // Momentum Scoring
    const priceChange30d = coin.price_change_percentage_30d_in_currency || 0;
    const momentum = MomentumScoringEngine.calculate(ta, fa, priceChange30d);

    return {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      volume24h: coin.total_volume,
      priceChange24h: coin.price_change_percentage_24h,
      priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
      priceChange30d: priceChange30d,
      sparkline: sparkline.slice(-48), // Last 48 data points
      technicalIndicators: ta,
      fundamentalAnalysis: fa,
      momentumScore: momentum,
      lastUpdated: coin.last_updated,
    };
  }

  // ============================================================
  // Detailed Coin Analysis (with OHLC + detail data)
  // ============================================================
  static async detailedAnalysis(
    coinId: string,
    apiKey?: string
  ): Promise<ScannedCoin & { ohlc: any[]; chartData: any }> {
    const cacheKey = `detailed_${coinId}`;
    const cached = scanCache.get<any>(cacheKey);
    if (cached) return cached;

    // Fetch all data in parallel
    const [marketDataArr, detail, ohlc, chartData] = await Promise.all([
      coinGeckoService.getMarketData(1, 250, true, apiKey),
      coinGeckoService.getCoinDetail(coinId, apiKey),
      coinGeckoService.getOHLC(coinId, 30, apiKey),
      coinGeckoService.getMarketChart(coinId, 30, apiKey),
    ]);

    const coin = marketDataArr.find(c => c.id === coinId);
    if (!coin) throw new Error(`Coin ${coinId} not found in market data`);

    // Advanced TA from OHLC
    const taOHLC = TechnicalAnalysisEngine.analyzeFromOHLC(ohlc);
    
    // Merge with sparkline TA for volume data
    const sparkline = coin.sparkline_in_7d?.price || [];
    const taSparkline = TechnicalAnalysisEngine.analyzeFromSparkline(
      sparkline,
      coin.total_volume,
      coin.total_volume * 0.8
    );
    
    // Use OHLC TA as primary, fill gaps with sparkline TA
    const ta = {
      ...taOHLC,
      volumeAnalysis: taSparkline.volumeAnalysis,
    };

    // Full Fundamental Analysis with detail data
    const fa = FundamentalAnalysisEngine.analyze(coin, detail);

    // Momentum Score
    const priceChange30d = coin.price_change_percentage_30d_in_currency || 0;
    const momentum = MomentumScoringEngine.calculate(ta, fa, priceChange30d);

    const result = {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      volume24h: coin.total_volume,
      priceChange24h: coin.price_change_percentage_24h,
      priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
      priceChange30d: priceChange30d,
      sparkline: sparkline.slice(-48),
      technicalIndicators: ta,
      fundamentalAnalysis: fa,
      momentumScore: momentum,
      lastUpdated: coin.last_updated,
      ohlc,
      chartData: {
        prices: chartData.prices,
        volumes: chartData.total_volumes,
        marketCaps: chartData.market_caps,
      },
    };

    scanCache.set(cacheKey, result, 180);
    return result;
  }

  // ============================================================
  // Portfolio Simulation - $100 to $1000
  // ============================================================
  static async simulatePortfolio(
    initialInvestment: number = 100,
    targetAmount: number = 1000,
    riskProfile: PortfolioRiskProfile = 'medium',
    apiKey?: string
  ): Promise<PortfolioSimulation> {
    const minMomentumByProfile: Record<PortfolioRiskProfile, number> = {
      low: 58,
      medium: 55,
      high: 50,
    };

    const scanned = await this.scanMarket({
      sortBy: 'momentum',
      limit: 80,
      minMomentumScore: minMomentumByProfile[riskProfile]
    }, apiKey);

    const riskRank = { LOW: 1, MEDIUM: 2, HIGH: 3, EXTREME: 4 } as const;
    const riskScoreMap = { LOW: 20, MEDIUM: 40, HIGH: 65, EXTREME: 90 } as const;
    const allowedRiskLevels: Record<PortfolioRiskProfile, Array<keyof typeof riskRank>> = {
      low: ['LOW', 'MEDIUM'],
      medium: ['LOW', 'MEDIUM', 'HIGH'],
      high: ['MEDIUM', 'HIGH', 'EXTREME'],
    };

    const profileScore = (coin: ScannedCoin): number => {
      const base = coin.momentumScore.overallScore;
      const confidence = coin.momentumScore.confidence;
      const potential = coin.momentumScore.potentialMultiplier;
      const riskBucket = riskRank[coin.momentumScore.riskLevel];
      const marketCapStrength = Math.log10(Math.max(coin.marketCap, 1));
      const weeklyVolatility = Math.abs(coin.priceChange7d || 0);

      if (riskProfile === 'low') {
        return (
          base * 0.58 +
          confidence * 0.26 +
          marketCapStrength * 3.2 -
          riskBucket * 13 -
          weeklyVolatility * 0.16
        );
      }

      if (riskProfile === 'high') {
        return (
          base * 0.45 +
          potential * 13 +
          Math.max(coin.priceChange7d, 0) * 0.35 +
          weeklyVolatility * 0.18 -
          riskBucket * 4
        );
      }

      return (
        base * 0.57 +
        potential * 9 +
        confidence * 0.16 -
        riskBucket * 7 -
        weeklyVolatility * 0.08
      );
    };

    const scored = scanned.map((coin) => ({ coin, score: profileScore(coin) }));
    const filteredScored = scored.filter(({ coin }) =>
      allowedRiskLevels[riskProfile].includes(coin.momentumScore.riskLevel)
    );

    const candidatePool = (filteredScored.length >= 5 ? filteredScored : scored)
      .sort((a, b) => b.score - a.score);

    const selected = candidatePool.slice(0, 5);

    if (selected.length === 0) {
      const fallbackDays = riskProfile === 'low' ? 90 : riskProfile === 'medium' ? 70 : 50;
      return {
        initialInvestment,
        targetAmount,
        currentValue: initialInvestment,
        totalReturn: 0,
        totalReturnPercent: 0,
        allocations: [],
        projectedDays: fallbackDays,
        riskScore: 50,
        riskProfile,
      };
    }

    const allocationExponentByProfile: Record<PortfolioRiskProfile, number> = {
      low: 0.9,
      medium: 1,
      high: 1.24,
    };
    const returnAdjustmentByProfile: Record<PortfolioRiskProfile, number> = {
      low: 0.88,
      medium: 1,
      high: 1.12,
    };
    const projectionHorizonByProfile: Record<PortfolioRiskProfile, number> = {
      low: 60,
      medium: 45,
      high: 30,
    };
    const maxProjectedDaysByProfile: Record<PortfolioRiskProfile, number> = {
      low: 90,
      medium: 70,
      high: 50,
    };

    const weighted = selected.map(({ coin, score }) => {
      const riskBucket = riskRank[coin.momentumScore.riskLevel];
      const baseWeight = Math.pow(Math.max(22, score + 70), allocationExponentByProfile[riskProfile]);

      if (riskProfile === 'low') {
        return {
          coin,
          weight: baseWeight * Math.max(0.65, 1 - (riskBucket - 1) * 0.14),
        };
      }

      if (riskProfile === 'high') {
        return {
          coin,
          weight: baseWeight * (1 + (riskBucket - 2) * 0.12),
        };
      }

      return { coin, weight: baseWeight };
    });

    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);

    const allocations = weighted.map(({ coin, weight }) => {
      const allocationPercent = (weight / totalWeight) * 100;
      const investedAmount = (allocationPercent / 100) * initialInvestment;
      const projectedReturn = coin.momentumScore.potentialMultiplier * returnAdjustmentByProfile[riskProfile];
      const currentValue = investedAmount * projectedReturn;
      
      return {
        coinId: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        allocationPercent: Math.round(allocationPercent * 10) / 10,
        investedAmount: Math.round(investedAmount * 100) / 100,
        currentValue: Math.round(currentValue * 100) / 100,
        returnPercent: Math.round((projectedReturn - 1) * 10000) / 100,
      };
    });

    const currentValue = allocations.reduce((sum, a) => sum + a.currentValue, 0);
    const totalReturn = currentValue - initialInvestment;
    const totalReturnPercent = (totalReturn / initialInvestment) * 100;

    const dailyReturn = totalReturnPercent / projectionHorizonByProfile[riskProfile];
    const multiplierNeeded = targetAmount / initialInvestment;
    const rawProjectedDays = dailyReturn > 0 
      ? Math.ceil(Math.log(multiplierNeeded) / Math.log(1 + dailyReturn / 100))
      : maxProjectedDaysByProfile[riskProfile];

    const projectedDays = Math.max(7, Math.min(rawProjectedDays, maxProjectedDaysByProfile[riskProfile]));

    const avgRisk = selected.reduce((sum, item) => {
      return sum + riskScoreMap[item.coin.momentumScore.riskLevel];
    }, 0) / selected.length;

    return {
      initialInvestment,
      targetAmount,
      currentValue: Math.round(currentValue * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
      allocations,
      projectedDays,
      riskScore: Math.round(avgRisk),
      riskProfile,
    };
  }

  // Basic analysis fallback
  private static basicAnalysis(coin: CoinMarketData): ScannedCoin {
    const sparkline = coin.sparkline_in_7d?.price || [];
    const ta = TechnicalAnalysisEngine.analyzeFromSparkline(sparkline);
    const fa = FundamentalAnalysisEngine.analyze(coin);
    const momentum = MomentumScoringEngine.calculate(ta, fa, 0);

    return {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      volume24h: coin.total_volume,
      priceChange24h: coin.price_change_percentage_24h || 0,
      priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
      priceChange30d: coin.price_change_percentage_30d_in_currency || 0,
      sparkline: sparkline.slice(-48),
      technicalIndicators: ta,
      fundamentalAnalysis: fa,
      momentumScore: momentum,
      lastUpdated: coin.last_updated,
    };
  }
}

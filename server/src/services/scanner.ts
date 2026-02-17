// ============================================================
// Scanner Service - Orchestrates TA, FA, Momentum Scoring
// ============================================================

import { coinGeckoService } from './coingecko';
import { TechnicalAnalysisEngine } from './technicalAnalysis';
import { FundamentalAnalysisEngine } from './fundamentalAnalysis';
import { MomentumScoringEngine } from './momentumScoring';
import { ScannedCoin, ScannerFilters, PortfolioSimulation, CoinMarketData } from '../types';
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
    apiKey?: string
  ): Promise<PortfolioSimulation> {
    // Get top momentum coins
    const scanned = await this.scanMarket({ 
      sortBy: 'momentum',
      limit: 50,
      minMomentumScore: 55
    }, apiKey);

    // Select top 5 coins by momentum with diversification
    const selected = scanned.slice(0, 5);
    
    if (selected.length === 0) {
      return {
        initialInvestment,
        targetAmount,
        currentValue: initialInvestment,
        totalReturn: 0,
        totalReturnPercent: 0,
        allocations: [],
        projectedDays: 365,
        riskScore: 50,
      };
    }

    // Allocate based on momentum scores
    const totalScore = selected.reduce((sum, c) => sum + c.momentumScore.overallScore, 0);
    
    const allocations = selected.map(coin => {
      const allocationPercent = (coin.momentumScore.overallScore / totalScore) * 100;
      const investedAmount = (allocationPercent / 100) * initialInvestment;
      const projectedReturn = coin.momentumScore.potentialMultiplier;
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

    // Estimate days to target
    const dailyReturn = totalReturnPercent / 30; // Based on 30-day projection
    const multiplierNeeded = targetAmount / initialInvestment;
    const projectedDays = dailyReturn > 0 
      ? Math.ceil(Math.log(multiplierNeeded) / Math.log(1 + dailyReturn / 100))
      : 365;

    // Risk assessment
    const avgRisk = selected.reduce((sum, c) => {
      const riskMap = { LOW: 20, MEDIUM: 40, HIGH: 60, EXTREME: 90 };
      return sum + riskMap[c.momentumScore.riskLevel];
    }, 0) / selected.length;

    return {
      initialInvestment,
      targetAmount,
      currentValue: Math.round(currentValue * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
      allocations,
      projectedDays: Math.min(projectedDays, 365),
      riskScore: Math.round(avgRisk),
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

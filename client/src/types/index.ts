// ============================================================
// Shared Types for Frontend
// ============================================================

export interface TechnicalIndicators {
  rsi: number | null;
  rsiSignal: 'oversold' | 'neutral' | 'overbought';
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    signal: 'bullish' | 'bearish' | 'neutral';
  } | null;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    percentB: number;
    bandwidth: number;
    signal: 'oversold' | 'neutral' | 'overbought';
  } | null;
  sma: {
    sma20: number;
    sma50: number;
    sma200: number;
    goldenCross: boolean;
    deathCross: boolean;
  } | null;
  ema: {
    ema12: number;
    ema26: number;
    signal: 'bullish' | 'bearish';
  } | null;
  volumeAnalysis: {
    currentVolume: number;
    averageVolume: number;
    volumeRatio: number;
    signal: 'high' | 'normal' | 'low';
  } | null;
  atr: number | null;
  stochastic: {
    k: number;
    d: number;
    signal: 'oversold' | 'neutral' | 'overbought';
  } | null;
  momentum: number | null;
}

export interface FundamentalAnalysis {
  marketCapScore: number;
  volumeToMarketCapRatio: number;
  supplyMetrics: {
    circulatingRatio: number;
    isDeflationary: boolean;
  };
  communityScore: number;
  developerScore: number;
  sentimentScore: number;
  athRecoveryPotential: number;
  overallFundamentalScore: number;
}

export interface MomentumScore {
  technicalScore: number;
  fundamentalScore: number;
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  signal: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  potentialMultiplier: number;
  confidence: number;
}

export interface ScannedCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  volume24h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  sparkline: number[];
  technicalIndicators: TechnicalIndicators;
  fundamentalAnalysis: FundamentalAnalysis;
  momentumScore: MomentumScore;
  lastUpdated: string;
}

export interface PortfolioSimulation {
  initialInvestment: number;
  targetAmount: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  allocations: {
    coinId: string;
    symbol: string;
    name: string;
    allocationPercent: number;
    investedAmount: number;
    currentValue: number;
    returnPercent: number;
  }[];
  projectedDays: number;
  riskScore: number;
  riskProfile: PortfolioRiskProfile;
}

export type PortfolioRiskProfile = 'low' | 'medium' | 'high';

export interface TrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
  data?: {
    price: number;
    price_change_percentage_24h: { usd: number };
    market_cap: string;
    total_volume: string;
    sparkline: string;
  };
}

export interface GlobalData {
  active_cryptocurrencies: number;
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
  market_cap_change_percentage_24h_usd: number;
}

export type SortOption = 'momentum' | 'price_change' | 'volume' | 'market_cap';
export type SignalFilter = 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL' | 'ALL';

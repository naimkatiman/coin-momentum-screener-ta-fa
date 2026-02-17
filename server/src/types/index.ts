// ============================================================
// Type Definitions for Coin Momentum Screener
// ============================================================

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_14d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinDetailData {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
    repos_url: { github: string[] };
  };
  image: { thumb: string; small: string; large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_1h_in_currency: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_14d: number;
    price_change_percentage_30d: number;
    price_change_percentage_60d: number;
    price_change_percentage_200d: number;
    price_change_percentage_1y: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
  };
  community_data: {
    twitter_followers: number | null;
    reddit_subscribers: number | null;
    reddit_average_posts_48h: number | null;
    reddit_average_comments_48h: number | null;
  };
  developer_data: {
    forks: number | null;
    stars: number | null;
    subscribers: number | null;
    total_issues: number | null;
    closed_issues: number | null;
    pull_requests_merged: number | null;
    commit_count_4_weeks: number | null;
  };
  public_interest_stats: {
    alexa_rank: number | null;
  };
  sentiment_votes_up_percentage: number | null;
  sentiment_votes_down_percentage: number | null;
  watchlist_portfolio_users: number | null;
  market_cap_rank: number | null;
}

export interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

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
    image: string;
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
  data: {
    price: number;
    price_change_percentage_24h: { usd: number };
    market_cap: string;
    total_volume: string;
    sparkline: string;
  };
}

export interface ScannerFilters {
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
  minMomentumScore?: number;
  signals?: string[];
  sortBy?: 'momentum' | 'price_change' | 'volume' | 'market_cap';
  limit?: number;
}

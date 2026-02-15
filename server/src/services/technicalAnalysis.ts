// ============================================================
// Technical Analysis Engine
// RSI, MACD, Bollinger Bands, SMA, EMA, Stochastic, ATR
// ============================================================

import { TechnicalIndicators, OHLCData } from '../types';

export class TechnicalAnalysisEngine {
  
  // ---- RSI (Relative Strength Index) ----
  static calculateRSI(prices: number[], period: number = 14): number | null {
    if (prices.length < period + 1) return null;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // ---- MACD (Moving Average Convergence Divergence) ----
  static calculateMACD(
    prices: number[], 
    fastPeriod: number = 12, 
    slowPeriod: number = 26, 
    signalPeriod: number = 9
  ): { macdLine: number; signalLine: number; histogram: number; signal: 'bullish' | 'bearish' | 'neutral' } | null {
    if (prices.length < slowPeriod + signalPeriod) return null;

    const fastEMA = this.calculateEMAValues(prices, fastPeriod);
    const slowEMA = this.calculateEMAValues(prices, slowPeriod);

    if (!fastEMA.length || !slowEMA.length) return null;

    const macdLine: number[] = [];
    const startIdx = slowPeriod - fastPeriod;
    
    for (let i = 0; i < slowEMA.length; i++) {
      macdLine.push(fastEMA[i + startIdx] - slowEMA[i]);
    }

    const signalLine = this.calculateEMAValues(macdLine, signalPeriod);
    
    if (!signalLine.length) return null;

    const lastMACD = macdLine[macdLine.length - 1];
    const lastSignal = signalLine[signalLine.length - 1];
    const histogram = lastMACD - lastSignal;

    const prevMACD = macdLine[macdLine.length - 2];
    const prevSignal = signalLine.length > 1 ? signalLine[signalLine.length - 2] : lastSignal;

    let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (prevMACD <= prevSignal && lastMACD > lastSignal) signal = 'bullish';
    else if (prevMACD >= prevSignal && lastMACD < lastSignal) signal = 'bearish';
    else if (histogram > 0) signal = 'bullish';
    else if (histogram < 0) signal = 'bearish';

    return { macdLine: lastMACD, signalLine: lastSignal, histogram, signal };
  }

  // ---- EMA Helper ----
  static calculateEMAValues(prices: number[], period: number): number[] {
    if (prices.length < period) return [];

    const multiplier = 2 / (period + 1);
    const emaValues: number[] = [];
    
    // First EMA is SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += prices[i];
    }
    emaValues.push(sum / period);

    for (let i = period; i < prices.length; i++) {
      const ema = (prices[i] - emaValues[emaValues.length - 1]) * multiplier + emaValues[emaValues.length - 1];
      emaValues.push(ema);
    }

    return emaValues;
  }

  // ---- Bollinger Bands ----
  static calculateBollingerBands(
    prices: number[], 
    period: number = 20, 
    stdDevMultiplier: number = 2
  ): { upper: number; middle: number; lower: number; percentB: number; bandwidth: number; signal: 'oversold' | 'neutral' | 'overbought' } | null {
    if (prices.length < period) return null;

    const recentPrices = prices.slice(-period);
    const middle = recentPrices.reduce((a, b) => a + b, 0) / period;
    
    const variance = recentPrices.reduce((sum, price) => 
      sum + Math.pow(price - middle, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const upper = middle + (stdDevMultiplier * stdDev);
    const lower = middle - (stdDevMultiplier * stdDev);
    
    const currentPrice = prices[prices.length - 1];
    const percentB = (currentPrice - lower) / (upper - lower);
    const bandwidth = (upper - lower) / middle;

    let signal: 'oversold' | 'neutral' | 'overbought' = 'neutral';
    if (percentB < 0.2) signal = 'oversold';
    else if (percentB > 0.8) signal = 'overbought';

    return { upper, middle, lower, percentB, bandwidth, signal };
  }

  // ---- SMA (Simple Moving Average) ----
  static calculateSMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }

  // ---- Stochastic Oscillator ----
  static calculateStochastic(
    highs: number[], 
    lows: number[], 
    closes: number[], 
    kPeriod: number = 14, 
    dPeriod: number = 3
  ): { k: number; d: number; signal: 'oversold' | 'neutral' | 'overbought' } | null {
    if (closes.length < kPeriod + dPeriod) return null;

    const kValues: number[] = [];
    
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
      const periodLows = lows.slice(i - kPeriod + 1, i + 1);
      
      const highestHigh = Math.max(...periodHighs);
      const lowestLow = Math.min(...periodLows);
      
      const k = highestHigh === lowestLow ? 50 : 
        ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(k);
    }

    const recentK = kValues.slice(-dPeriod);
    const d = recentK.reduce((a, b) => a + b, 0) / dPeriod;
    const k = kValues[kValues.length - 1];

    let signal: 'oversold' | 'neutral' | 'overbought' = 'neutral';
    if (k < 20 && d < 20) signal = 'oversold';
    else if (k > 80 && d > 80) signal = 'overbought';

    return { k, d, signal };
  }

  // ---- ATR (Average True Range) ----
  static calculateATR(
    highs: number[], 
    lows: number[], 
    closes: number[], 
    period: number = 14
  ): number | null {
    if (closes.length < period + 1) return null;

    const trueRanges: number[] = [];
    
    for (let i = 1; i < closes.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);
    }

    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < trueRanges.length; i++) {
      atr = ((atr * (period - 1)) + trueRanges[i]) / period;
    }

    return atr;
  }

  // ---- Momentum ----
  static calculateMomentum(prices: number[], period: number = 10): number | null {
    if (prices.length < period + 1) return null;
    return prices[prices.length - 1] - prices[prices.length - 1 - period];
  }

  // ============================================================
  // Full Technical Analysis from OHLC data
  // ============================================================
  static analyzeFromOHLC(ohlcData: OHLCData[]): TechnicalIndicators {
    const closes = ohlcData.map(d => d.close);
    const highs = ohlcData.map(d => d.high);
    const lows = ohlcData.map(d => d.low);
    const volumes = ohlcData.map(() => 0); // OHLC doesn't have volume

    const rsi = this.calculateRSI(closes);
    let rsiSignal: 'oversold' | 'neutral' | 'overbought' = 'neutral';
    if (rsi !== null) {
      if (rsi < 30) rsiSignal = 'oversold';
      else if (rsi > 70) rsiSignal = 'overbought';
    }

    const macd = this.calculateMACD(closes);
    const bollingerBands = this.calculateBollingerBands(closes);
    
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, Math.min(50, closes.length));
    const sma200 = this.calculateSMA(closes, Math.min(200, closes.length));
    
    const ema12Values = this.calculateEMAValues(closes, 12);
    const ema26Values = this.calculateEMAValues(closes, Math.min(26, closes.length));

    const stochastic = this.calculateStochastic(highs, lows, closes);
    const atr = this.calculateATR(highs, lows, closes);
    const momentum = this.calculateMomentum(closes);

    return {
      rsi,
      rsiSignal,
      macd,
      bollingerBands,
      sma: sma20 !== null ? {
        sma20: sma20,
        sma50: sma50 || sma20,
        sma200: sma200 || sma20,
        goldenCross: (sma50 || 0) > (sma200 || 0),
        deathCross: (sma50 || 0) < (sma200 || 0) && (sma50 || 0) !== 0,
      } : null,
      ema: ema12Values.length > 0 && ema26Values.length > 0 ? {
        ema12: ema12Values[ema12Values.length - 1],
        ema26: ema26Values[ema26Values.length - 1],
        signal: ema12Values[ema12Values.length - 1] > ema26Values[ema26Values.length - 1] ? 'bullish' : 'bearish',
      } : null,
      volumeAnalysis: null,
      atr,
      stochastic,
      momentum,
    };
  }

  // ============================================================
  // Full Technical Analysis from sparkline prices
  // ============================================================
  static analyzeFromSparkline(prices: number[], volume24h?: number, avgVolume?: number): TechnicalIndicators {
    const rsi = this.calculateRSI(prices);
    let rsiSignal: 'oversold' | 'neutral' | 'overbought' = 'neutral';
    if (rsi !== null) {
      if (rsi < 30) rsiSignal = 'oversold';
      else if (rsi > 70) rsiSignal = 'overbought';
    }

    const macd = this.calculateMACD(prices);
    const bollingerBands = this.calculateBollingerBands(prices);

    const sma20 = this.calculateSMA(prices, Math.min(20, prices.length));
    const sma50 = this.calculateSMA(prices, Math.min(50, prices.length));
    const sma200 = this.calculateSMA(prices, Math.min(200, prices.length));

    const ema12Values = this.calculateEMAValues(prices, Math.min(12, prices.length));
    const ema26Values = this.calculateEMAValues(prices, Math.min(26, prices.length));

    const momentum = this.calculateMomentum(prices);

    // Simulate volume analysis with available data
    let volumeAnalysis = null;
    if (volume24h && avgVolume) {
      const volumeRatio = volume24h / avgVolume;
      volumeAnalysis = {
        currentVolume: volume24h,
        averageVolume: avgVolume,
        volumeRatio,
        signal: volumeRatio > 1.5 ? 'high' as const : volumeRatio < 0.5 ? 'low' as const : 'normal' as const,
      };
    }

    return {
      rsi,
      rsiSignal,
      macd,
      bollingerBands,
      sma: sma20 !== null ? {
        sma20: sma20,
        sma50: sma50 || sma20,
        sma200: sma200 || sma20,
        goldenCross: (sma50 || 0) > (sma200 || 0),
        deathCross: (sma50 || 0) < (sma200 || 0) && (sma50 || 0) !== 0,
      } : null,
      ema: ema12Values.length > 0 && ema26Values.length > 0 ? {
        ema12: ema12Values[ema12Values.length - 1],
        ema26: ema26Values[ema26Values.length - 1],
        signal: ema12Values[ema12Values.length - 1] > ema26Values[ema26Values.length - 1] ? 'bullish' : 'bearish',
      } : null,
      volumeAnalysis,
      atr: null,
      stochastic: null,
      momentum,
    };
  }
}

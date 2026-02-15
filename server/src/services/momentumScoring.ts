// ============================================================
// Momentum Scoring Engine
// Combines TA + FA into actionable signals
// ============================================================

import { TechnicalIndicators, FundamentalAnalysis, MomentumScore } from '../types';

export class MomentumScoringEngine {

  // ---- Calculate Technical Score (0-100) ----
  static calculateTechnicalScore(ta: TechnicalIndicators): number {
    let score = 0;
    let weights = 0;

    // RSI Score (weight: 20)
    if (ta.rsi !== null) {
      let rsiScore = 50;
      if (ta.rsi < 30) rsiScore = 85; // Oversold = buying opportunity
      else if (ta.rsi < 40) rsiScore = 70;
      else if (ta.rsi > 70) rsiScore = 25; // Overbought = risk
      else if (ta.rsi > 60) rsiScore = 40;
      else rsiScore = 55; // Neutral is slightly positive
      score += rsiScore * 20;
      weights += 20;
    }

    // MACD Score (weight: 20)
    if (ta.macd) {
      let macdScore = 50;
      if (ta.macd.signal === 'bullish') {
        macdScore = ta.macd.histogram > 0 ? 80 : 65;
      } else if (ta.macd.signal === 'bearish') {
        macdScore = ta.macd.histogram < 0 ? 20 : 35;
      }
      score += macdScore * 20;
      weights += 20;
    }

    // Bollinger Bands Score (weight: 15)
    if (ta.bollingerBands) {
      let bbScore = 50;
      if (ta.bollingerBands.signal === 'oversold') bbScore = 80;
      else if (ta.bollingerBands.signal === 'overbought') bbScore = 25;
      else bbScore = 55;
      score += bbScore * 15;
      weights += 15;
    }

    // SMA Score (weight: 15)
    if (ta.sma) {
      let smaScore = 50;
      if (ta.sma.goldenCross) smaScore = 90;
      else if (ta.sma.deathCross) smaScore = 15;
      score += smaScore * 15;
      weights += 15;
    }

    // EMA Score (weight: 10)
    if (ta.ema) {
      const emaScore = ta.ema.signal === 'bullish' ? 75 : 30;
      score += emaScore * 10;
      weights += 10;
    }

    // Volume Score (weight: 10)
    if (ta.volumeAnalysis) {
      let volScore = 50;
      if (ta.volumeAnalysis.signal === 'high') volScore = 80;
      else if (ta.volumeAnalysis.signal === 'low') volScore = 30;
      score += volScore * 10;
      weights += 10;
    }

    // Stochastic Score (weight: 5)
    if (ta.stochastic) {
      let stochScore = 50;
      if (ta.stochastic.signal === 'oversold') stochScore = 80;
      else if (ta.stochastic.signal === 'overbought') stochScore = 25;
      score += stochScore * 5;
      weights += 5;
    }

    // Momentum Score (weight: 5)
    if (ta.momentum !== null) {
      const momScore = ta.momentum > 0 ? 70 : 30;
      score += momScore * 5;
      weights += 5;
    }

    return weights > 0 ? Math.round(score / weights) : 50;
  }

  // ---- Determine Grade ----
  static getGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D';
    return 'F';
  }

  // ---- Determine Signal ----
  static getSignal(score: number): 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL' {
    if (score >= 80) return 'STRONG BUY';
    if (score >= 65) return 'BUY';
    if (score >= 45) return 'HOLD';
    if (score >= 30) return 'SELL';
    return 'STRONG SELL';
  }

  // ---- Risk Level ----
  static getRiskLevel(
    ta: TechnicalIndicators,
    fa: FundamentalAnalysis
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    let riskScore = 0;

    // Market cap risk
    if (fa.marketCapScore < 30) riskScore += 3;
    else if (fa.marketCapScore < 50) riskScore += 2;
    else if (fa.marketCapScore < 70) riskScore += 1;

    // Volatility risk (Bollinger bandwidth)
    if (ta.bollingerBands && ta.bollingerBands.bandwidth > 0.15) riskScore += 2;
    else if (ta.bollingerBands && ta.bollingerBands.bandwidth > 0.08) riskScore += 1;

    // RSI extremes
    if (ta.rsi !== null && (ta.rsi > 85 || ta.rsi < 15)) riskScore += 2;
    else if (ta.rsi !== null && (ta.rsi > 75 || ta.rsi < 25)) riskScore += 1;

    // Developer/community risk
    if (fa.developerScore < 30) riskScore += 1;
    if (fa.communityScore < 30) riskScore += 1;

    if (riskScore >= 7) return 'EXTREME';
    if (riskScore >= 5) return 'HIGH';
    if (riskScore >= 3) return 'MEDIUM';
    return 'LOW';
  }

  // ---- Potential Multiplier ----
  static calculatePotentialMultiplier(
    ta: TechnicalIndicators,
    fa: FundamentalAnalysis,
    priceChange30d: number
  ): number {
    let base = 1.0;

    // Oversold + good fundamentals = high potential
    if (ta.rsi !== null && ta.rsi < 30 && fa.overallFundamentalScore > 60) {
      base += 2.0;
    } else if (ta.rsi !== null && ta.rsi < 40) {
      base += 1.0;
    }

    // MACD bullish crossover
    if (ta.macd?.signal === 'bullish') base += 0.5;

    // ATH recovery potential
    if (fa.athRecoveryPotential > 80) base += 1.5;
    else if (fa.athRecoveryPotential > 60) base += 0.8;

    // Volume surge
    if (ta.volumeAnalysis?.signal === 'high') base += 0.5;

    // Recent momentum
    if (priceChange30d < -30) base += 1.0; // Bounce potential
    else if (priceChange30d > 50) base -= 0.5; // Already pumped

    // Community & developer backing
    if (fa.communityScore > 70 && fa.developerScore > 70) base += 0.5;

    return Math.round(Math.max(1.0, Math.min(10.0, base)) * 10) / 10;
  }

  // ---- Confidence Level (0-100) ----
  static calculateConfidence(
    ta: TechnicalIndicators,
    fa: FundamentalAnalysis
  ): number {
    let confidence = 50;
    let factors = 0;

    // More indicators available = higher confidence
    if (ta.rsi !== null) { confidence += 5; factors++; }
    if (ta.macd) { confidence += 5; factors++; }
    if (ta.bollingerBands) { confidence += 5; factors++; }
    if (ta.sma) { confidence += 3; factors++; }
    if (ta.ema) { confidence += 3; factors++; }
    if (ta.volumeAnalysis) { confidence += 5; factors++; }
    if (ta.stochastic) { confidence += 3; factors++; }

    // Indicator agreement bonus
    const signals: string[] = [];
    if (ta.rsi !== null) signals.push(ta.rsi < 50 ? 'bullish' : 'bearish');
    if (ta.macd) signals.push(ta.macd.signal);
    if (ta.ema) signals.push(ta.ema.signal);
    
    const bullishCount = signals.filter(s => s === 'bullish').length;
    const bearishCount = signals.filter(s => s === 'bearish').length;
    
    if (bullishCount === signals.length || bearishCount === signals.length) {
      confidence += 15; // Strong agreement
    } else if (bullishCount >= signals.length * 0.7 || bearishCount >= signals.length * 0.7) {
      confidence += 8; // Moderate agreement
    }

    // Fundamental data bonus
    if (fa.communityScore > 0) confidence += 3;
    if (fa.developerScore > 0) confidence += 3;

    return Math.min(95, Math.max(20, confidence));
  }

  // ============================================================
  // Complete Momentum Score
  // ============================================================
  static calculate(
    ta: TechnicalIndicators,
    fa: FundamentalAnalysis,
    priceChange30d: number = 0
  ): MomentumScore {
    const technicalScore = this.calculateTechnicalScore(ta);
    const fundamentalScore = fa.overallFundamentalScore;
    
    // Weighted overall: 60% technical, 40% fundamental
    const overallScore = Math.round(technicalScore * 0.6 + fundamentalScore * 0.4);

    return {
      technicalScore,
      fundamentalScore,
      overallScore,
      grade: this.getGrade(overallScore),
      signal: this.getSignal(overallScore),
      riskLevel: this.getRiskLevel(ta, fa),
      potentialMultiplier: this.calculatePotentialMultiplier(ta, fa, priceChange30d),
      confidence: this.calculateConfidence(ta, fa),
    };
  }
}

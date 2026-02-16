import React from 'react';
import { X, BarChart3, Activity, Shield, Users, Code, Heart, TrendingUp, Gauge } from 'lucide-react';
import Lottie from 'lottie-react';
import TradingViewMiniChart from '../Charts/TradingViewMiniChart';

interface CoinDetailModalProps {
  coinId: string;
  detail: any;
  loading: boolean;
  onClose: () => void;
}

// Simple loading dots animation
const loadingDotsData = {
  v: "5.7.4", fr: 30, ip: 0, op: 60, w: 120, h: 40, nm: "dots",
  layers: [{
    ty: 4, nm: "d1", ip: 0, op: 60, st: 0,
    ks: {
      o: { a: 1, k: [{ t: 0, s: [40], e: [100] }, { t: 10, s: [100], e: [40] }, { t: 20, s: [40] }] },
      p: { a: 0, k: [30, 20] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }
    },
    shapes: [{ ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [10, 10] } },
    { ty: "fl", c: { a: 0, k: [0.39, 0.4, 0.95, 1] }, o: { a: 0, k: 100 } }]
  }, {
    ty: 4, nm: "d2", ip: 0, op: 60, st: 0,
    ks: {
      o: { a: 1, k: [{ t: 7, s: [40], e: [100] }, { t: 17, s: [100], e: [40] }, { t: 27, s: [40] }] },
      p: { a: 0, k: [60, 20] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }
    },
    shapes: [{ ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [10, 10] } },
    { ty: "fl", c: { a: 0, k: [0.55, 0.36, 0.96, 1] }, o: { a: 0, k: 100 } }]
  }, {
    ty: 4, nm: "d3", ip: 0, op: 60, st: 0,
    ks: {
      o: { a: 1, k: [{ t: 14, s: [40], e: [100] }, { t: 24, s: [100], e: [40] }, { t: 34, s: [40] }] },
      p: { a: 0, k: [90, 20] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }
    },
    shapes: [{ ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [10, 10] } },
    { ty: "fl", c: { a: 0, k: [0.13, 0.83, 0.93, 1] }, o: { a: 0, k: 100 } }]
  }]
};

const formatPrice = (price: number): string => {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
};

const getSignalClass = (signal: string): string => {
  const map: Record<string, string> = {
    'STRONG BUY': 'signal-strong-buy', 'BUY': 'signal-buy',
    'HOLD': 'signal-hold', 'SELL': 'signal-sell', 'STRONG SELL': 'signal-strong-sell',
  };
  return map[signal] || 'signal-hold';
};

const getGradeClass = (grade: string): string => {
  const map: Record<string, string> = {
    'A+': 'grade-a-plus', 'A': 'grade-a', 'B+': 'grade-b-plus',
    'B': 'grade-b', 'C+': 'grade-c-plus', 'C': 'grade-c',
    'D': 'grade-d', 'F': 'grade-f',
  };
  return map[grade] || 'grade-c';
};

export const CoinDetailModal: React.FC<CoinDetailModalProps> = ({ coinId, detail, loading, onClose }) => {
  if (loading || !detail) {
    return (
      <div className="detail-overlay" onClick={onClose}>
        <div className="detail-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
          <div className="loading-container" style={{ padding: '48px 20px' }}>
            <div style={{ width: 120, height: 40 }}>
              <Lottie animationData={loadingDotsData} loop />
            </div>
            <div className="loading-text">Analyzing {coinId}...</div>
            <div className="loading-subtext">Fetching OHLC, community & dev metrics</div>
          </div>
        </div>
      </div>
    );
  }

  const { technicalIndicators: ta, fundamentalAnalysis: fa, momentumScore: ms } = detail;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-header">
          <div className="detail-coin-info">
            <img className="detail-coin-icon" src={detail.image} alt={detail.name} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{detail.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {detail.symbol}
                </span>
                <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                  {formatPrice(detail.currentPrice)}
                </span>
                <span className={`change-badge ${detail.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                  {detail.priceChange24h >= 0 ? '+' : ''}{detail.priceChange24h?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <button className="detail-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="detail-body">
          {/* Momentum Overview */}
          <div className="momentum-overview">
            <div className="momentum-gauge">
              <div className="gauge-circle" style={{ '--gauge-percent': `${ms.overallScore * 3.6}deg` } as any}>
                <div className="gauge-inner">
                  <div className="gauge-value" style={{
                    color: ms.overallScore >= 65 ? 'var(--accent-green)' :
                           ms.overallScore >= 45 ? 'var(--accent-yellow)' : 'var(--accent-red)'
                  }}>
                    {ms.overallScore}
                  </div>
                  <div className="gauge-label">Score</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`grade-badge ${getGradeClass(ms.grade)}`} style={{ fontSize: '14px', padding: '5px 12px' }}>
                  {ms.grade}
                </span>
                <span className={`signal-badge ${getSignalClass(ms.signal)}`} style={{ fontSize: '11px', padding: '5px 12px' }}>
                  {ms.signal}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                {[
                  { label: 'Technical', value: ms.technicalScore, icon: <BarChart3 size={11} /> },
                  { label: 'Fundamental', value: ms.fundamentalScore, icon: <Activity size={11} /> },
                  { label: 'Potential', value: `${ms.potentialMultiplier}x`, icon: <TrendingUp size={11} />, color: 'var(--accent-cyan)' },
                  { label: 'Confidence', value: `${ms.confidence}%`, icon: <Gauge size={11} /> },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '2px' }}>
                      {item.icon} {item.label}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: item.color || 'var(--text-primary)' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price Chart - TradingView Mini Chart Widget */}
          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title">7-Day Price Chart</h3>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Powered by TradingView
              </span>
            </div>
            <TradingViewMiniChart
              symbol={detail.symbol}
              coinId={coinId}
              height={220}
            />
          </div>

          {/* TA & FA Grid */}
          <div className="detail-grid">
            {/* Technical Indicators */}
            <div className="detail-section">
              <div className="detail-section-title">
                <BarChart3 size={15} />
                Technical Indicators
              </div>

              {ta.rsi !== null && (
                <div className="indicator-row">
                  <span className="indicator-label">RSI (14)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="indicator-value">{ta.rsi.toFixed(1)}</span>
                    <span className={`ta-pill ${ta.rsiSignal}`}>{ta.rsiSignal}</span>
                  </div>
                </div>
              )}

              {ta.macd && (
                <>
                  <div className="indicator-row">
                    <span className="indicator-label">MACD Line</span>
                    <span className="indicator-value">{ta.macd.macdLine.toFixed(4)}</span>
                  </div>
                  <div className="indicator-row">
                    <span className="indicator-label">MACD Signal</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="indicator-value">{ta.macd.signalLine.toFixed(4)}</span>
                      <span className={`ta-pill ${ta.macd.signal}`}>{ta.macd.signal}</span>
                    </div>
                  </div>
                  <div className="indicator-row">
                    <span className="indicator-label">Histogram</span>
                    <span className="indicator-value" style={{ 
                      color: ta.macd.histogram >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' 
                    }}>
                      {ta.macd.histogram.toFixed(4)}
                    </span>
                  </div>
                </>
              )}

              {ta.bollingerBands && (
                <>
                  <div className="indicator-row">
                    <span className="indicator-label">BB Upper</span>
                    <span className="indicator-value">{formatPrice(ta.bollingerBands.upper)}</span>
                  </div>
                  <div className="indicator-row">
                    <span className="indicator-label">BB Lower</span>
                    <span className="indicator-value">{formatPrice(ta.bollingerBands.lower)}</span>
                  </div>
                  <div className="indicator-row">
                    <span className="indicator-label">BB %B</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="indicator-value">{(ta.bollingerBands.percentB * 100).toFixed(1)}%</span>
                      <span className={`ta-pill ${ta.bollingerBands.signal}`}>{ta.bollingerBands.signal}</span>
                    </div>
                  </div>
                </>
              )}

              {ta.ema && (
                <div className="indicator-row">
                  <span className="indicator-label">EMA Cross (12/26)</span>
                  <span className={`ta-pill ${ta.ema.signal}`}>{ta.ema.signal}</span>
                </div>
              )}

              {ta.sma && (
                <div className="indicator-row">
                  <span className="indicator-label">SMA Cross (50/200)</span>
                  <span className={`ta-pill ${ta.sma.goldenCross ? 'bullish' : ta.sma.deathCross ? 'bearish' : 'neutral'}`}>
                    {ta.sma.goldenCross ? 'Golden Cross' : ta.sma.deathCross ? 'Death Cross' : 'Neutral'}
                  </span>
                </div>
              )}

              {ta.volumeAnalysis && (
                <div className="indicator-row">
                  <span className="indicator-label">Volume Ratio</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="indicator-value">{ta.volumeAnalysis.volumeRatio.toFixed(2)}x</span>
                    <span className={`ta-pill ${ta.volumeAnalysis.signal === 'high' ? 'bullish' : ta.volumeAnalysis.signal === 'low' ? 'bearish' : 'neutral'}`}>
                      {ta.volumeAnalysis.signal}
                    </span>
                  </div>
                </div>
              )}

              {ta.stochastic && (
                <div className="indicator-row">
                  <span className="indicator-label">Stochastic (%K/%D)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="indicator-value">
                      {ta.stochastic.k.toFixed(1)} / {ta.stochastic.d.toFixed(1)}
                    </span>
                    <span className={`ta-pill ${ta.stochastic.signal}`}>{ta.stochastic.signal}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Fundamental Analysis */}
            <div className="detail-section">
              <div className="detail-section-title">
                <Activity size={15} />
                Fundamental Analysis
              </div>

              <div className="indicator-row">
                <span className="indicator-label">
                  <Shield size={11} /> Market Cap Score
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="score-bar" style={{ width: '70px' }}>
                    <div 
                      className={`score-bar-fill ${fa.marketCapScore >= 65 ? 'high' : fa.marketCapScore >= 45 ? 'medium' : 'low'}`}
                      style={{ width: `${fa.marketCapScore}%` }}
                    />
                  </div>
                  <span className="indicator-value">{fa.marketCapScore}</span>
                </div>
              </div>

              <div className="indicator-row">
                <span className="indicator-label">Vol/MCap Ratio</span>
                <span className="indicator-value">{(fa.volumeToMarketCapRatio * 100).toFixed(2)}%</span>
              </div>

              <div className="indicator-row">
                <span className="indicator-label">Circulating Ratio</span>
                <span className="indicator-value">{(fa.supplyMetrics.circulatingRatio * 100).toFixed(1)}%</span>
              </div>

              <div className="indicator-row">
                <span className="indicator-label">Deflationary</span>
                <span className="indicator-value" style={{ 
                  color: fa.supplyMetrics.isDeflationary ? 'var(--accent-green)' : 'var(--accent-yellow)' 
                }}>
                  {fa.supplyMetrics.isDeflationary ? 'Yes' : 'No'}
                </span>
              </div>

              {[
                { label: 'Community', score: fa.communityScore, icon: <Users size={11} /> },
                { label: 'Developer', score: fa.developerScore, icon: <Code size={11} /> },
                { label: 'Sentiment', score: fa.sentimentScore, icon: <Heart size={11} /> },
                { label: 'ATH Recovery', score: fa.athRecoveryPotential, icon: <TrendingUp size={11} /> },
              ].map((item) => (
                <div className="indicator-row" key={item.label}>
                  <span className="indicator-label">
                    {item.icon} {item.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="score-bar" style={{ width: '70px' }}>
                      <div 
                        className={`score-bar-fill ${item.score >= 65 ? 'high' : item.score >= 45 ? 'medium' : 'low'}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="indicator-value">{item.score}</span>
                  </div>
                </div>
              ))}

              <div className="indicator-row" style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: '10px', marginTop: '4px' }}>
                <span className="indicator-label" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  Overall FA Score
                </span>
                <span className="indicator-value" style={{ fontSize: '15px', color: 'var(--accent-indigo)' }}>
                  {fa.overallFundamentalScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

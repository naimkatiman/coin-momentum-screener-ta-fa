import React from 'react';
import { X, TrendingUp, BarChart3, Activity, Shield, Users, Code, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface CoinDetailModalProps {
  coinId: string;
  detail: any;
  loading: boolean;
  onClose: () => void;
}

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
        <div className="detail-modal" onClick={e => e.stopPropagation()}>
          <div className="loading-container" style={{ padding: '60px' }}>
            <div className="loading-spinner" />
            <div className="loading-text">Loading deep analysis for {coinId}...</div>
            <div className="loading-subtext">Fetching OHLC, community & developer metrics</div>
          </div>
        </div>
      </div>
    );
  }

  const { technicalIndicators: ta, fundamentalAnalysis: fa, momentumScore: ms } = detail;

  // Prepare chart data from sparkline
  const chartData = detail.sparkline?.map((price: number, i: number) => ({
    index: i,
    price: price,
  })) || [];

  const priceColor = detail.priceChange24h >= 0 ? '#10b981' : '#ef4444';

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-header">
          <div className="detail-coin-info">
            <img className="detail-coin-icon" src={detail.image} alt={detail.name} />
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{detail.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {detail.symbol}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatPrice(detail.currentPrice)}
                </span>
                <span className={`change-badge ${detail.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                  {detail.priceChange24h >= 0 ? '+' : ''}{detail.priceChange24h?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <button className="detail-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="detail-body">
          {/* Momentum Overview */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '32px',
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '24px'
          }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`grade-badge ${getGradeClass(ms.grade)}`} style={{ fontSize: '16px', padding: '6px 14px' }}>
                  {ms.grade}
                </span>
                <span className={`signal-badge ${getSignalClass(ms.signal)}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {ms.signal}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Technical</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{ms.technicalScore}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fundamental</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{ms.fundamentalScore}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Potential</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-cyan)' }}>{ms.potentialMultiplier}x</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confidence</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{ms.confidence}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Chart */}
          {chartData.length > 0 && (
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">7-Day Price Chart</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={priceColor} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={priceColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="index" hide />
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [formatPrice(Number(value)), 'Price']}
                    labelFormatter={() => ''}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={priceColor}
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* TA & FA Grid */}
          <div className="detail-grid">
            {/* Technical Indicators */}
            <div className="detail-section">
              <div className="detail-section-title">
                <BarChart3 size={16} />
                Technical Indicators
              </div>

              {ta.rsi !== null && (
                <div className="indicator-row">
                  <span className="indicator-label">RSI (14)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="indicator-value">{ta.macd.signalLine.toFixed(4)}</span>
                      <span className={`ta-pill ${ta.macd.signal}`}>{ta.macd.signal}</span>
                    </div>
                  </div>
                  <div className="indicator-row">
                    <span className="indicator-label">MACD Histogram</span>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <Activity size={16} />
                Fundamental Analysis
              </div>

              <div className="indicator-row">
                <span className="indicator-label">
                  <Shield size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Market Cap Score
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="score-bar" style={{ width: '80px' }}>
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

              <div className="indicator-row">
                <span className="indicator-label">
                  <Users size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Community Score
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="score-bar" style={{ width: '80px' }}>
                    <div 
                      className={`score-bar-fill ${fa.communityScore >= 65 ? 'high' : fa.communityScore >= 45 ? 'medium' : 'low'}`}
                      style={{ width: `${fa.communityScore}%` }}
                    />
                  </div>
                  <span className="indicator-value">{fa.communityScore}</span>
                </div>
              </div>

              <div className="indicator-row">
                <span className="indicator-label">
                  <Code size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Developer Score
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="score-bar" style={{ width: '80px' }}>
                    <div 
                      className={`score-bar-fill ${fa.developerScore >= 65 ? 'high' : fa.developerScore >= 45 ? 'medium' : 'low'}`}
                      style={{ width: `${fa.developerScore}%` }}
                    />
                  </div>
                  <span className="indicator-value">{fa.developerScore}</span>
                </div>
              </div>

              <div className="indicator-row">
                <span className="indicator-label">
                  <Heart size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Sentiment Score
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="score-bar" style={{ width: '80px' }}>
                    <div 
                      className={`score-bar-fill ${fa.sentimentScore >= 65 ? 'high' : fa.sentimentScore >= 45 ? 'medium' : 'low'}`}
                      style={{ width: `${fa.sentimentScore}%` }}
                    />
                  </div>
                  <span className="indicator-value">{fa.sentimentScore}</span>
                </div>
              </div>

              <div className="indicator-row">
                <span className="indicator-label">ATH Recovery Potential</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="score-bar" style={{ width: '80px' }}>
                    <div 
                      className={`score-bar-fill high`}
                      style={{ width: `${fa.athRecoveryPotential}%` }}
                    />
                  </div>
                  <span className="indicator-value">{fa.athRecoveryPotential}</span>
                </div>
              </div>

              <div className="indicator-row" style={{ borderTop: '2px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                <span className="indicator-label" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  Overall FA Score
                </span>
                <span className="indicator-value" style={{ fontSize: '16px', color: 'var(--accent-blue)' }}>
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

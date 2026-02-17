import React from 'react';
import { RefreshCw, Zap, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import Lottie from 'lottie-react';
import { ScannedCoin, SortOption, SignalFilter } from '../../types';
import { MiniSparkline } from '../Charts/MiniSparkline';

// Inline Lottie animation data for crypto/chart loading
const loadingAnimationData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Loading",
  layers: [{
    ty: 4,
    nm: "circle1",
    ip: 0, op: 60, st: 0,
    ks: {
      o: { a: 1, k: [{ t: 0, s: [30], e: [100] }, { t: 15, s: [100], e: [30] }, { t: 30, s: [30] }] },
      p: { a: 1, k: [{ t: 0, s: [70, 100], e: [70, 80] }, { t: 15, s: [70, 80], e: [70, 100] }, { t: 30, s: [70, 100] }] },
      s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }
    },
    shapes: [{
      ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [16, 16] }
    }, {
      ty: "fl", c: { a: 0, k: [0.39, 0.4, 0.95, 1] }, o: { a: 0, k: 100 }
    }]
  }, {
    ty: 4,
    nm: "circle2",
    ip: 0, op: 60, st: 0,
    ks: {
      o: { a: 1, k: [{ t: 5, s: [30], e: [100] }, { t: 20, s: [100], e: [30] }, { t: 35, s: [30] }] },
      p: { a: 1, k: [{ t: 5, s: [100, 100], e: [100, 80] }, { t: 20, s: [100, 80], e: [100, 100] }, { t: 35, s: [100, 100] }] },
      s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }
    },
    shapes: [{
      ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [16, 16] }
    }, {
      ty: "fl", c: { a: 0, k: [0.55, 0.36, 0.96, 1] }, o: { a: 0, k: 100 }
    }]
  }, {
    ty: 4,
    nm: "circle3",
    ip: 0, op: 60, st: 0,
    ks: {
      o: { a: 1, k: [{ t: 10, s: [30], e: [100] }, { t: 25, s: [100], e: [30] }, { t: 40, s: [30] }] },
      p: { a: 1, k: [{ t: 10, s: [130, 100], e: [130, 80] }, { t: 25, s: [130, 80], e: [130, 100] }, { t: 40, s: [130, 100] }] },
      s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }
    },
    shapes: [{
      ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [16, 16] }
    }, {
      ty: "fl", c: { a: 0, k: [0.13, 0.83, 0.93, 1] }, o: { a: 0, k: 100 }
    }]
  }]
};

interface ScannerViewProps {
  coins: ScannedCoin[];
  loading: boolean;
  error: string | null;
  sortBy: SortOption;
  signalFilter: SignalFilter;
  onSortChange: (sort: SortOption) => void;
  onSignalFilterChange: (filter: SignalFilter) => void;
  onCoinClick: (coinId: string) => void;
  onRefresh: () => void;
}

const formatPrice = (price: number): string => {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
};

const formatLargeNumber = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  return `$${num.toLocaleString()}`;
};

const getGradeClass = (grade: string): string => {
  const map: Record<string, string> = {
    'A+': 'grade-a-plus', 'A': 'grade-a', 'B+': 'grade-b-plus',
    'B': 'grade-b', 'C+': 'grade-c-plus', 'C': 'grade-c',
    'D': 'grade-d', 'F': 'grade-f',
  };
  return map[grade] || 'grade-c';
};

const getSignalClass = (signal: string): string => {
  const map: Record<string, string> = {
    'STRONG BUY': 'signal-strong-buy', 'BUY': 'signal-buy',
    'HOLD': 'signal-hold', 'SELL': 'signal-sell', 'STRONG SELL': 'signal-strong-sell',
  };
  return map[signal] || 'signal-hold';
};

const getRiskClass = (risk: string): string => `risk-${risk.toLowerCase()}`;

const signals: SignalFilter[] = ['ALL', 'STRONG BUY', 'BUY', 'HOLD', 'SELL', 'STRONG SELL'];

const SkeletonRows = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.05}s` }}>
        <div className="skeleton skeleton-cell" style={{ width: '20px', height: '12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 160px' }}>
          <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
          <div>
            <div className="skeleton" style={{ width: '72px', height: '12px', marginBottom: '4px' }} />
            <div className="skeleton" style={{ width: '36px', height: '9px' }} />
          </div>
        </div>
        <div className="skeleton skeleton-cell" style={{ width: '70px' }} />
        <div className="skeleton" style={{ width: '54px', height: '20px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ width: '46px', height: '20px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ width: '46px', height: '20px', borderRadius: '6px' }} />
        <div className="skeleton skeleton-cell" style={{ width: '64px' }} />
        <div className="skeleton skeleton-cell" style={{ width: '64px' }} />
        <div className="skeleton" style={{ width: '90px', height: '26px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '52px', height: '4px', borderRadius: '2px' }} />
        <div className="skeleton" style={{ width: '52px', height: '4px', borderRadius: '2px' }} />
        <div className="skeleton skeleton-cell" style={{ width: '28px' }} />
        <div className="skeleton" style={{ width: '28px', height: '20px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ width: '64px', height: '20px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ width: '42px', height: '18px', borderRadius: '6px' }} />
        <div className="skeleton skeleton-cell" style={{ width: '28px' }} />
      </div>
    ))}
  </>
);

export const ScannerView: React.FC<ScannerViewProps> = ({
  coins, loading, error, sortBy, signalFilter,
  onSortChange, onSignalFilterChange, onCoinClick, onRefresh
}) => {

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <AlertTriangle size={24} />
        </div>
        <div className="error-message">{error}</div>
        <button className="retry-btn" onClick={onRefresh}>
          <RefreshCw size={14} />
          Retry Scan
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="scanner-header">
        <div className="scanner-title-section">
          <h2 className="scanner-title">
            <Zap size={20} style={{ color: 'var(--accent-yellow)' }} />
            <span className="scanner-title-text">Momentum Scanner</span>
          </h2>
          <p className="scanner-subtitle">
            Real-time TA & FA of top {coins.length || 50} cryptocurrencies
          </p>
        </div>

        <div className="scanner-controls">
          <div className="scanner-filters">
            {signals.map(sig => (
              <button
                key={sig}
                className={`filter-chip ${signalFilter === sig ? 'active' : ''}`}
                onClick={() => onSignalFilterChange(sig)}
              >
                {sig}
              </button>
            ))}
          </div>
          
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="momentum">Momentum</option>
            <option value="price_change">24h Change</option>
            <option value="volume">Volume</option>
            <option value="market_cap">Market Cap</option>
          </select>

          <button 
            className="icon-btn" 
            onClick={onRefresh} 
            title="Refresh data"
          >
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
        </div>
      </div>

      <div className="scanner-table-container">
        {loading ? (
          <div>
            <div className="loading-container" style={{ padding: '40px 20px 20px' }}>
              <div className="lottie-loading">
                <Lottie animationData={loadingAnimationData} loop />
              </div>
              <div className="loading-text">Scanning markets...</div>
              <div className="loading-subtext">Analyzing technical & fundamental indicators</div>
            </div>
            <SkeletonRows />
          </div>
        ) : (
          <table className="scanner-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Coin</th>
                <th>Price</th>
                <th>24h</th>
                <th>7d</th>
                <th>30d</th>
                <th>Market Cap</th>
                <th>Volume (24h)</th>
                <th>7d Chart</th>
                <th>TA Score</th>
                <th>FA Score</th>
                <th>Momentum</th>
                <th>Grade</th>
                <th>Signal</th>
                <th>Risk</th>
                <th>Potential</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin) => (
                <tr key={coin.id} onClick={() => onCoinClick(coin.id)}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500 }}>
                    {coin.marketCapRank}
                  </td>
                  <td>
                    <div className="coin-info">
                      <img className="coin-icon" src={coin.image} alt={coin.name} loading="lazy" />
                      <div className="coin-name-wrapper">
                        <span className="coin-name">{coin.name}</span>
                        <span className="coin-symbol">{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="price-value">{formatPrice(coin.currentPrice)}</span>
                  </td>
                  <td>
                    <span className={`change-badge ${coin.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                      {coin.priceChange24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(coin.priceChange24h).toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <span className={`change-badge ${coin.priceChange7d >= 0 ? 'positive' : 'negative'}`}>
                      {Math.abs(coin.priceChange7d).toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <span className={`change-badge ${coin.priceChange30d >= 0 ? 'positive' : 'negative'}`}>
                      {Math.abs(coin.priceChange30d).toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {formatLargeNumber(coin.marketCap)}
                  </td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {formatLargeNumber(coin.volume24h)}
                  </td>
                  <td>
                    <MiniSparkline
                      data={coin.sparkline}
                      color={coin.priceChange7d >= 0 ? '#10b981' : '#f43f5e'}
                      width={160}
                      height={60}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div className="score-bar">
                        <div 
                          className={`score-bar-fill ${coin.momentumScore.technicalScore >= 65 ? 'high' : coin.momentumScore.technicalScore >= 45 ? 'medium' : 'low'}`}
                          style={{ width: `${coin.momentumScore.technicalScore}%` }}
                        />
                      </div>
                      <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {coin.momentumScore.technicalScore}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div className="score-bar">
                        <div 
                          className={`score-bar-fill ${coin.momentumScore.fundamentalScore >= 65 ? 'high' : coin.momentumScore.fundamentalScore >= 45 ? 'medium' : 'low'}`}
                          style={{ width: `${coin.momentumScore.fundamentalScore}%` }}
                        />
                      </div>
                      <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {coin.momentumScore.fundamentalScore}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="momentum-badge" style={{
                      color: coin.momentumScore.overallScore >= 65 ? 'var(--accent-emerald)' :
                             coin.momentumScore.overallScore >= 45 ? 'var(--accent-yellow)' : 'var(--accent-red)'
                    }}>
                      {coin.momentumScore.overallScore}
                    </span>
                  </td>
                  <td>
                    <span className={`grade-badge ${getGradeClass(coin.momentumScore.grade)}`}>
                      {coin.momentumScore.grade}
                    </span>
                  </td>
                  <td>
                    <span className={`signal-badge ${getSignalClass(coin.momentumScore.signal)}`}>
                      {coin.momentumScore.signal}
                    </span>
                  </td>
                  <td>
                    <span className={`risk-badge ${getRiskClass(coin.momentumScore.riskLevel)}`}>
                      {coin.momentumScore.riskLevel}
                    </span>
                  </td>
                  <td>
                    <span className="multiplier-badge">
                      {coin.momentumScore.potentialMultiplier}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

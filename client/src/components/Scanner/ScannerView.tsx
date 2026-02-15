import React from 'react';
import { RefreshCw, ArrowUpDown, Filter, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { ScannedCoin, SortOption, SignalFilter } from '../../types';
import { MiniSparkline } from '../Charts/MiniSparkline';

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

const getRiskClass = (risk: string): string => {
  return `risk-${risk.toLowerCase()}`;
};

const signals: SignalFilter[] = ['ALL', 'STRONG BUY', 'BUY', 'HOLD', 'SELL', 'STRONG SELL'];

export const ScannerView: React.FC<ScannerViewProps> = ({
  coins, loading, error, sortBy, signalFilter,
  onSortChange, onSignalFilterChange, onCoinClick, onRefresh
}) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <div className="loading-text">Scanning market momentum...</div>
        <div className="loading-subtext">Analyzing {50} coins with TA & FA engines</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">&#9888;&#65039;</div>
        <div className="error-message">{error}</div>
        <button className="retry-btn" onClick={onRefresh}>
          <RefreshCw size={14} style={{ marginRight: '6px' }} />
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
            <Zap size={22} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            Momentum Scanner
          </h2>
          <p className="scanner-subtitle">
            Real-time technical & fundamental analysis of top cryptocurrencies
          </p>
        </div>

        <div className="scanner-filters">
          {signals.map(sig => (
            <button
              key={sig}
              className={`filter-btn ${signalFilter === sig ? 'active' : ''}`}
              onClick={() => onSignalFilterChange(sig)}
            >
              {sig}
            </button>
          ))}
          
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="momentum">Sort: Momentum</option>
            <option value="price_change">Sort: 24h Change</option>
            <option value="volume">Sort: Volume</option>
            <option value="market_cap">Sort: Market Cap</option>
          </select>

          <button className="filter-btn" onClick={onRefresh} title="Refresh data">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      <div className="scanner-table-container">
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
            {coins.map((coin, index) => (
              <tr key={coin.id} onClick={() => onCoinClick(coin.id)}>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {coin.marketCapRank}
                </td>
                <td>
                  <div className="coin-info">
                    <img 
                      className="coin-icon" 
                      src={coin.image} 
                      alt={coin.name}
                      loading="lazy"
                    />
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
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                  {formatLargeNumber(coin.marketCap)}
                </td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                  {formatLargeNumber(coin.volume24h)}
                </td>
                <td>
                  <MiniSparkline data={coin.sparkline} />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="score-bar">
                      <div 
                        className={`score-bar-fill ${coin.momentumScore.technicalScore >= 65 ? 'high' : coin.momentumScore.technicalScore >= 45 ? 'medium' : 'low'}`}
                        style={{ width: `${coin.momentumScore.technicalScore}%` }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                      {coin.momentumScore.technicalScore}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="score-bar">
                      <div 
                        className={`score-bar-fill ${coin.momentumScore.fundamentalScore >= 65 ? 'high' : coin.momentumScore.fundamentalScore >= 45 ? 'medium' : 'low'}`}
                        style={{ width: `${coin.momentumScore.fundamentalScore}%` }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                      {coin.momentumScore.fundamentalScore}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="momentum-badge" style={{
                    color: coin.momentumScore.overallScore >= 65 ? 'var(--accent-green)' :
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
      </div>
    </div>
  );
};

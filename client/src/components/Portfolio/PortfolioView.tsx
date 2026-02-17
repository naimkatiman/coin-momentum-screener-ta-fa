import React from 'react';
import { Wallet, TrendingUp, Target, Clock, Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import Lottie from 'lottie-react';
import { PortfolioSimulation, PortfolioRiskProfile } from '../../types';

// Simple pulsing animation for portfolio loading
const portfolioLoadingData = {
  v: "5.7.4", fr: 30, ip: 0, op: 60, w: 160, h: 160, nm: "wallet",
  layers: [{
    ty: 4, nm: "ring", ip: 0, op: 60, st: 0,
    ks: {
      o: { a: 1, k: [{ t: 0, s: [40], e: [80] }, { t: 30, s: [80], e: [40] }, { t: 60, s: [40] }] },
      p: { a: 0, k: [80, 80] },
      s: { a: 1, k: [{ t: 0, s: [80, 80], e: [100, 100] }, { t: 30, s: [100, 100], e: [80, 80] }, { t: 60, s: [80, 80] }] },
      r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 60, s: [360] }] }
    },
    shapes: [{
      ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [80, 80] }
    }, {
      ty: "st", c: { a: 0, k: [0.39, 0.4, 0.95, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 },
      d: [{ n: "d", nm: "dash", v: { a: 0, k: 20 } }, { n: "g", nm: "gap", v: { a: 0, k: 10 } }]
    }]
  }, {
    ty: 4, nm: "center", ip: 0, op: 60, st: 0,
    ks: {
      o: { a: 1, k: [{ t: 0, s: [60], e: [100] }, { t: 30, s: [100], e: [60] }, { t: 60, s: [60] }] },
      p: { a: 0, k: [80, 80] },
      s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }
    },
    shapes: [{
      ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [24, 24] }
    }, {
      ty: "fl", c: { a: 0, k: [0.39, 0.4, 0.95, 1] }, o: { a: 0, k: 100 }
    }]
  }]
};

interface PortfolioViewProps {
  portfolio: PortfolioSimulation | null;
  loading: boolean;
  riskProfile: PortfolioRiskProfile;
  onRiskProfileChange: (profile: PortfolioRiskProfile) => void;
  onRefresh: () => void;
}

const formatCurrency = (num: number): string => {
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const riskProfileOptions: Array<{
  value: PortfolioRiskProfile;
  label: string;
  hint: string;
}> = [
  { value: 'low', label: 'Low Risk', hint: 'Defensive short-term picks' },
  { value: 'medium', label: 'Medium Risk', hint: 'Balanced short-term mix' },
  { value: 'high', label: 'High Risk', hint: 'Aggressive momentum hunt' },
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolio,
  loading,
  riskProfile,
  onRiskProfileChange,
  onRefresh
}) => {
  if (!portfolio) {
    return (
      <div className="loading-container">
        <div className="lottie-loading">
          <Lottie animationData={portfolioLoadingData} loop />
        </div>
        <div className="loading-text">Building short-term portfolio...</div>
        <div className="loading-subtext">Analyzing momentum signals for best allocation</div>
      </div>
    );
  }

  const riskColor = portfolio.riskScore <= 30 ? 'var(--accent-green)' :
                    portfolio.riskScore <= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)';

  return (
    <div className="fade-in">
      <div className="portfolio-hero">
        <h2 className="portfolio-title">
          <span className="amount-start">{formatCurrency(portfolio.initialInvestment)}</span>
          <span className="arrow">&rarr;</span>
          <span className="amount-end">{formatCurrency(portfolio.targetAmount)}</span>
        </h2>
        <p className="portfolio-description">
          AI-powered short-term portfolio allocation based on momentum scoring.
          Choose a risk profile, then recalculate to refresh this portfolio.
        </p>

        <div className="portfolio-controls">
          <div className="portfolio-risk-selector" role="radiogroup" aria-label="Short-term risk profile">
            {riskProfileOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`portfolio-risk-option ${riskProfile === option.value ? 'active' : ''}`}
                onClick={() => onRiskProfileChange(option.value)}
                aria-pressed={riskProfile === option.value}
              >
                <span className="portfolio-risk-label">{option.label}</span>
                <span className="portfolio-risk-hint">{option.hint}</span>
              </button>
            ))}
          </div>

          <div className="portfolio-actions">
            <button type="button" className="retry-btn portfolio-refresh-btn" onClick={onRefresh} disabled={loading}>
              <RefreshCw size={13} className={loading ? 'spin-icon' : ''} />
              {loading ? 'Recalculating...' : 'Recalculate'}
            </button>
          </div>
        </div>

        <div className="portfolio-stats">
          <div className="portfolio-stat">
            <div className="portfolio-stat-label">
              <Wallet size={11} />
              Projected Value
            </div>
            <div className={`portfolio-stat-value ${portfolio.currentValue > portfolio.initialInvestment ? 'positive' : 'negative'}`}>
              {formatCurrency(portfolio.currentValue)}
            </div>
          </div>

          <div className="portfolio-stat">
            <div className="portfolio-stat-label">
              <TrendingUp size={11} />
              Projected Return
            </div>
            <div className={`portfolio-stat-value ${portfolio.totalReturnPercent >= 0 ? 'positive' : 'negative'}`}>
              {portfolio.totalReturnPercent >= 0 ? '+' : ''}{portfolio.totalReturnPercent.toFixed(1)}%
            </div>
          </div>

          <div className="portfolio-stat">
            <div className="portfolio-stat-label">
              <Clock size={11} />
              Days to Target
            </div>
            <div className="portfolio-stat-value accent-cyan">
              {portfolio.projectedDays}
            </div>
          </div>

          <div className="portfolio-stat">
            <div className="portfolio-stat-label">
              <Shield size={11} />
              Risk Score
            </div>
            <div className="portfolio-stat-value" style={{ color: riskColor }}>
              {portfolio.riskScore}/100
            </div>
          </div>
        </div>

        {/* Allocation Table */}
        {portfolio.allocations.length > 0 && (
          <div className="allocation-section">
            <h3 className="allocation-title">
              <Target size={15} />
              Recommended Allocation
            </h3>
            <div className="allocation-table-shell">
              <table className="allocation-table">
                <thead>
                  <tr>
                    <th>Coin</th>
                    <th>Allocation</th>
                    <th>Invested</th>
                    <th>Projected Value</th>
                    <th>Est. Return</th>
                    <th>Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.allocations.map((alloc, i) => {
                    const allocationColor = `hsl(${i * 72}, 65%, 50%)`;
                    return (
                      <tr key={alloc.coinId}>
                        <td>
                          <div className="allocation-coin">
                            <span className="allocation-rank-badge" style={{ background: allocationColor }}>
                              {i + 1}
                            </span>
                            <div>
                              <div className="allocation-coin-name">{alloc.name}</div>
                              <div className="allocation-coin-symbol">{alloc.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="allocation-percent">{alloc.allocationPercent.toFixed(1)}%</span>
                        </td>
                        <td>
                          <span className="allocation-currency">{formatCurrency(alloc.investedAmount)}</span>
                        </td>
                        <td>
                          <span
                            className={`allocation-currency ${alloc.currentValue > alloc.investedAmount ? 'positive' : 'negative'}`}
                          >
                            {formatCurrency(alloc.currentValue)}
                          </span>
                        </td>
                        <td>
                          <span className={`change-badge ${alloc.returnPercent >= 0 ? 'positive' : 'negative'}`}>
                            {alloc.returnPercent >= 0 ? '+' : ''}{alloc.returnPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <div className="allocation-bar-container">
                            <div
                              className="allocation-bar"
                              style={{
                                width: `${alloc.allocationPercent}%`,
                                background: allocationColor
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="portfolio-risk-note">
          <AlertTriangle size={14} />
          Simulated portfolio based on momentum analysis. Past performance does not guarantee future results. DYOR.
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Wallet, TrendingUp, Target, Clock, Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import Lottie from 'lottie-react';
import { PortfolioSimulation } from '../../types';

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
  onRefresh: () => void;
}

const formatCurrency = (num: number): string => {
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const PortfolioView: React.FC<PortfolioViewProps> = ({ portfolio, loading, onRefresh }) => {
  if (loading || !portfolio) {
    return (
      <div className="loading-container">
        <div className="lottie-loading">
          <Lottie animationData={portfolioLoadingData} loop />
        </div>
        <div className="loading-text">Building optimal portfolio...</div>
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
          AI-powered portfolio allocation based on momentum scoring. 
          Top coins selected by combined Technical & Fundamental Analysis.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <button className="retry-btn" onClick={onRefresh} style={{ fontSize: '12px', padding: '8px 20px' }}>
            <RefreshCw size={13} />
            Recalculate
          </button>
        </div>

        <div className="portfolio-stats">
          <div className="portfolio-stat">
            <div className="portfolio-stat-label">
              <Wallet size={11} />
              Projected Value
            </div>
            <div className="portfolio-stat-value" style={{ 
              color: portfolio.currentValue > portfolio.initialInvestment ? 'var(--accent-green)' : 'var(--accent-red)' 
            }}>
              {formatCurrency(portfolio.currentValue)}
            </div>
          </div>

          <div className="portfolio-stat">
            <div className="portfolio-stat-label">
              <TrendingUp size={11} />
              Projected Return
            </div>
            <div className="portfolio-stat-value" style={{ 
              color: portfolio.totalReturnPercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' 
            }}>
              {portfolio.totalReturnPercent >= 0 ? '+' : ''}{portfolio.totalReturnPercent.toFixed(1)}%
            </div>
          </div>

          <div className="portfolio-stat">
            <div className="portfolio-stat-label">
              <Clock size={11} />
              Days to Target
            </div>
            <div className="portfolio-stat-value" style={{ color: 'var(--accent-cyan)' }}>
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
          <div style={{ marginTop: '28px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={15} />
              Recommended Allocation
            </h3>
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
                {portfolio.allocations.map((alloc, i) => (
                  <tr key={alloc.coinId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          width: '22px', 
                          height: '22px', 
                          borderRadius: '50%',
                          background: `hsl(${i * 72}, 65%, 50%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          fontWeight: 700,
                          color: 'white',
                          flexShrink: 0,
                        }}>
                          {i + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{alloc.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {alloc.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: '12.5px' }}>
                        {alloc.allocationPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12.5px' }}>
                        {formatCurrency(alloc.investedAmount)}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontFamily: "'JetBrains Mono', monospace", 
                        fontWeight: 600,
                        fontSize: '12.5px',
                        color: alloc.currentValue > alloc.investedAmount ? 'var(--accent-green)' : 'var(--accent-red)'
                      }}>
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
                            background: `hsl(${i * 72}, 65%, 50%)`
                          }} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          padding: '14px 16px', 
          background: 'rgba(251, 191, 36, 0.06)', 
          border: '1px solid rgba(251, 191, 36, 0.15)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11.5px',
          color: 'var(--accent-yellow)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <AlertTriangle size={14} />
          Simulated portfolio based on momentum analysis. Past performance does not guarantee future results. DYOR.
        </div>
      </div>
    </div>
  );
};

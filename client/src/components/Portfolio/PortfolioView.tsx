import React from 'react';
import { Wallet, TrendingUp, Target, Clock, Shield, RefreshCw } from 'lucide-react';
import { PortfolioSimulation } from '../../types';

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
        <div className="loading-spinner" />
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

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <button className="filter-btn active" onClick={onRefresh}>
            <RefreshCw size={12} style={{ marginRight: '4px' }} />
            Recalculate
          </button>
        </div>

        <div className="portfolio-stats">
          <div className="portfolio-stat">
            <div className="portfolio-stat-label">
              <Wallet size={12} style={{ display: 'inline', marginRight: '4px' }} />
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
              <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
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
              <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Est. Days to Target
            </div>
            <div className="portfolio-stat-value" style={{ color: 'var(--accent-cyan)' }}>
              {portfolio.projectedDays}
            </div>
          </div>

          <div className="portfolio-stat">
            <div className="portfolio-stat-label">
              <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Risk Score
            </div>
            <div className="portfolio-stat-value" style={{ color: riskColor }}>
              {portfolio.riskScore}/100
            </div>
          </div>
        </div>

        {/* Allocation Table */}
        {portfolio.allocations.length > 0 && (
          <div style={{ marginTop: '32px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              <Target size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
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
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%',
                          background: `hsl(${i * 72}, 70%, 50%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'white'
                        }}>
                          {i + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{alloc.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {alloc.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                        {alloc.allocationPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatCurrency(alloc.investedAmount)}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontFamily: "'JetBrains Mono', monospace", 
                        fontWeight: 600,
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
                            background: `hsl(${i * 72}, 70%, 50%)`
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
          marginTop: '24px', 
          padding: '16px', 
          background: 'rgba(245, 158, 11, 0.08)', 
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          color: 'var(--accent-yellow)',
          textAlign: 'center'
        }}>
          &#9888;&#65039; This is a simulated portfolio based on momentum analysis. Past performance does not guarantee future results. 
          Always do your own research (DYOR) before investing.
        </div>
      </div>
    </div>
  );
};

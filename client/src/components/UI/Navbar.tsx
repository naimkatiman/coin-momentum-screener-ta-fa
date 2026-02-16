import React from 'react';
import { BarChart3, Wallet, Zap } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'portfolio';
  onTabChange: (tab: 'scanner' | 'portfolio') => void;
  lastUpdated: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, lastUpdated }) => {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <img 
            className="navbar-logo-img"
            src="/coingecko-logo.png" 
            alt="CoinGecko" 
          />
          <div>
            <div className="navbar-title">Coin Momentum Screener</div>
            <div className="navbar-subtitle">Technical & Fundamental Analysis</div>
          </div>
        </div>

        <div className="navbar-nav">
          <button
            className={`nav-tab ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => onTabChange('scanner')}
          >
            <BarChart3 size={14} />
            Scanner
          </button>
          <button
            className={`nav-tab ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => onTabChange('portfolio')}
          >
            <Wallet size={14} />
            Portfolio
          </button>
        </div>

        <div className="navbar-actions">
          {lastUpdated && (
            <div className="live-indicator">
              <div className="live-dot" />
              <span>Live</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '10.5px' }}>
                {lastUpdated}
              </span>
            </div>
          )}
          <div className="powered-by">
            <img 
              src="/coingecko-logo.png" 
              alt="CoinGecko" 
            />
            <span>Powered by <strong style={{ color: 'var(--accent-emerald)' }}>CoinGecko</strong></span>
          </div>
        </div>
      </div>
    </nav>
  );
};

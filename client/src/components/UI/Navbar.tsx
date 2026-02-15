import React from 'react';
import { Activity, BarChart3, Wallet, RefreshCw } from 'lucide-react';

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
          <div className="navbar-logo">CM</div>
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
            Portfolio Simulator
          </button>
        </div>

        <div className="navbar-actions">
          {lastUpdated && (
            <div className="live-indicator">
              <div className="live-dot" />
              <span>Live</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                {lastUpdated}
              </span>
            </div>
          )}
          <div className="powered-by">
            <img src="https://static.coingecko.com/s/thumbnail-007177f3eca9ea8e8b8b40dd076e85af5cdd7e29e30517a02beb32e3e5e4c3c3.png" alt="CoinGecko" />
            <span>CoinGecko</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

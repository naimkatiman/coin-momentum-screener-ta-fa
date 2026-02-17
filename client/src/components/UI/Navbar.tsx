import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock3, Wallet } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'portfolio';
  onTabChange: (tab: 'scanner' | 'portfolio') => void;
  lastUpdated: string;
}

const tabs: Array<{ id: 'scanner' | 'portfolio'; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: 'scanner', label: 'Scanner', icon: BarChart3 },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, lastUpdated }) => {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <img className="navbar-logo-img" src="/coingecko-logo.png" alt="CoinGecko" />
          <div>
            <div className="navbar-title">Coin Momentum Studio</div>
            <div className="navbar-subtitle">TA + FA Intelligence Deck</div>
          </div>
        </div>

        <div className="navbar-nav" role="tablist" aria-label="Market views">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                className={`nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-section`}
                id={`tab-${tab.id}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-tab-pill"
                    className="nav-tab-pill"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="nav-tab-content">
                  <TabIcon size={14} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="navbar-actions">
          {lastUpdated && (
            <div className="live-indicator">
              <div className="live-dot" />
              <span>Live</span>
              <span className="live-time">
                <Clock3 size={11} />
                {lastUpdated}
              </span>
            </div>
          )}
          <div className="powered-by">
            <img src="/coingecko-logo.png" alt="CoinGecko" />
            <span>
              Powered by <strong>CoinGecko</strong>
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

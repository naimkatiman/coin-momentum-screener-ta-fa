import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Coins } from 'lucide-react';
import { GlobalData } from '../../types';

interface GlobalStatsProps {
  data: GlobalData;
  coinCount: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
};

export const GlobalStats: React.FC<GlobalStatsProps> = ({ data, coinCount }) => {
  const marketCapChange = data.market_cap_change_percentage_24h_usd;
  const isPositive = marketCapChange >= 0;

  return (
    <div className="global-stats-bar fade-in">
      <div className="stat-card">
        <div className="stat-label">
          <DollarSign size={11} />
          Total Market Cap
        </div>
        <div className="stat-value">{formatNumber(data.total_market_cap?.usd || 0)}</div>
        <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {marketCapChange?.toFixed(2)}% (24h)
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <Activity size={11} />
          24h Volume
        </div>
        <div className="stat-value">{formatNumber(data.total_volume?.usd || 0)}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <img src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" alt="BTC" style={{ width: '12px', height: '12px', borderRadius: '50%' }} />
          BTC Dominance
        </div>
        <div className="stat-value" style={{ color: 'var(--accent-yellow)' }}>
          {data.market_cap_percentage?.btc?.toFixed(1)}%
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <img src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="ETH" style={{ width: '12px', height: '12px', borderRadius: '50%' }} />
          ETH Dominance
        </div>
        <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>
          {data.market_cap_percentage?.eth?.toFixed(1)}%
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <Coins size={11} />
          Coins Scanned
        </div>
        <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
          {coinCount}
        </div>
        <div className="stat-change positive">
          of {data.active_cryptocurrencies?.toLocaleString()} active
        </div>
      </div>
    </div>
  );
};

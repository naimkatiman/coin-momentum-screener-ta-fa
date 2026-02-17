import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Coins, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
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

  const cards = [
    {
      label: 'Total Market Cap',
      icon: <DollarSign size={11} />,
      value: formatNumber(data.total_market_cap?.usd || 0),
      change: `${marketCapChange?.toFixed(2)}% (24h)`,
      changePositive: isPositive,
    },
    {
      label: '24h Volume',
      icon: <Activity size={11} />,
      value: formatNumber(data.total_volume?.usd || 0),
    },
    {
      label: 'BTC Dominance',
      icon: <BarChart3 size={11} />,
      value: `${data.market_cap_percentage?.btc?.toFixed(1)}%`,
      valueClass: 'accent-yellow',
    },
    {
      label: 'ETH Dominance',
      icon: <BarChart3 size={11} />,
      value: `${data.market_cap_percentage?.eth?.toFixed(1)}%`,
      valueClass: 'accent-cyan',
    },
    {
      label: 'Coins Scanned',
      icon: <Coins size={11} />,
      value: coinCount.toLocaleString(),
      valueClass: 'accent-teal',
      change: `of ${data.active_cryptocurrencies?.toLocaleString()} active`,
      changePositive: true,
    },
  ];

  return (
    <div className="global-stats-bar">
      {cards.map((card, index) => (
        <motion.article
          className="stat-card"
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.06 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="stat-label">
            {card.icon}
            {card.label}
          </div>
          <div className={`stat-value ${card.valueClass ?? ''}`}>{card.value}</div>
          {card.change && (
            <div className={`stat-change ${card.changePositive ? 'positive' : 'negative'}`}>
              {card.label === 'Total Market Cap' &&
                (card.changePositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />)}
              {card.change}
            </div>
          )}
        </motion.article>
      ))}
    </div>
  );
};

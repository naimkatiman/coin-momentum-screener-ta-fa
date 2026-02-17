import React, { useEffect, useRef, memo } from 'react';

interface TradingViewTableChartProps {
  symbol: string;   // CoinGecko symbol like "btc", "eth"
  coinId: string;   // CoinGecko ID like "bitcoin", "ethereum"
  width?: number;
  height?: number;
}

// Map common CoinGecko coin IDs to TradingView symbols on Binance
const SYMBOL_MAP: Record<string, string> = {
  bitcoin: 'BINANCE:BTCUSDT',
  ethereum: 'BINANCE:ETHUSDT',
  tether: 'BINANCE:BTCUSDT',
  binancecoin: 'BINANCE:BNBUSDT',
  solana: 'BINANCE:SOLUSDT',
  ripple: 'BINANCE:XRPUSDT',
  'usd-coin': 'BINANCE:BTCUSDT',
  cardano: 'BINANCE:ADAUSDT',
  dogecoin: 'BINANCE:DOGEUSDT',
  tron: 'BINANCE:TRXUSDT',
  avalanche: 'BINANCE:AVAXUSDT',
  polkadot: 'BINANCE:DOTUSDT',
  chainlink: 'BINANCE:LINKUSDT',
  'shiba-inu': 'BINANCE:SHIBUSDT',
  polygon: 'BINANCE:MATICUSDT',
  'matic-network': 'BINANCE:MATICUSDT',
  litecoin: 'BINANCE:LTCUSDT',
  dai: 'BINANCE:BTCUSDT',
  uniswap: 'BINANCE:UNIUSDT',
  cosmos: 'BINANCE:ATOMUSDT',
  stellar: 'BINANCE:XLMUSDT',
  monero: 'BINANCE:XMRUSDT',
  'bitcoin-cash': 'BINANCE:BCHUSDT',
  'ethereum-classic': 'BINANCE:ETCUSDT',
  filecoin: 'BINANCE:FILUSDT',
  'internet-computer': 'BINANCE:ICPUSDT',
  hedera: 'BINANCE:HBARUSDT',
  'hedera-hashgraph': 'BINANCE:HBARUSDT',
  aptos: 'BINANCE:APTUSDT',
  arbitrum: 'BINANCE:ARBUSDT',
  optimism: 'BINANCE:OPUSDT',
  vechain: 'BINANCE:VETUSDT',
  near: 'BINANCE:NEARUSDT',
  'near-protocol': 'BINANCE:NEARUSDT',
  algorand: 'BINANCE:ALGOUSDT',
  aave: 'BINANCE:AAVEUSDT',
  'the-graph': 'BINANCE:GRTUSDT',
  fantom: 'BINANCE:FTMUSDT',
  'the-sandbox': 'BINANCE:SANDUSDT',
  decentraland: 'BINANCE:MANAUSDT',
  'axie-infinity': 'BINANCE:AXSUSDT',
  eos: 'BINANCE:EOSUSDT',
  'flow-token': 'BINANCE:FLOWUSDT',
  flow: 'BINANCE:FLOWUSDT',
  tezos: 'BINANCE:XTZUSDT',
  theta: 'BINANCE:THETAUSDT',
  'theta-token': 'BINANCE:THETAUSDT',
  iota: 'BINANCE:IOTAUSDT',
  'render-token': 'BINANCE:RENDERUSDT',
  injective: 'BINANCE:INJUSDT',
  'injective-protocol': 'BINANCE:INJUSDT',
  sei: 'BINANCE:SEIUSDT',
  'sei-network': 'BINANCE:SEIUSDT',
  sui: 'BINANCE:SUIUSDT',
  celestia: 'BINANCE:TIAUSDT',
  pepe: 'BINANCE:PEPEUSDT',
  kaspa: 'BINANCE:KASUSDT',
  bonk: 'BINANCE:BONKUSDT',
  jupiter: 'BINANCE:JUPUSDT',
  'staked-ether': 'BINANCE:ETHUSDT',
  'wrapped-bitcoin': 'BINANCE:BTCUSDT',
  maker: 'BINANCE:MKRUSDT',
  'leo-token': 'BINANCE:BTCUSDT',
  okb: 'OKX:OKBUSDT',
  cronos: 'BINANCE:CROUSDT',
  'crypto-com-chain': 'BINANCE:CROUSDT',
  immutable: 'BINANCE:IMXUSDT',
  'immutable-x': 'BINANCE:IMXUSDT',
  fetch: 'BINANCE:FETUSDT',
  'fetch-ai': 'BINANCE:FETUSDT',
  worldcoin: 'BINANCE:WLDUSDT',
  'worldcoin-wld': 'BINANCE:WLDUSDT',
  ondo: 'BINANCE:ONDOUSDT',
  'ondo-finance': 'BINANCE:ONDOUSDT',
  floki: 'BINANCE:FLOKIUSDT',
  'floki-inu': 'BINANCE:FLOKIUSDT',
  pendle: 'BINANCE:PENDLEUSDT',
  pyth: 'BINANCE:PYTHUSDT',
  'pyth-network': 'BINANCE:PYTHUSDT',
  'starknet-token': 'BINANCE:STRKUSDT',
  starknet: 'BINANCE:STRKUSDT',
};

function getTradingViewSymbol(coinId: string, symbol: string): string {
  const mapped = SYMBOL_MAP[coinId.toLowerCase()];
  if (mapped) return mapped;
  const sym = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `BINANCE:${sym}USDT`;
}

/**
 * Compact TradingView Mini Chart for use inside scanner table cells.
 * Uses chartOnly mode with no time scale - just the price line chart.
 */
const TradingViewTableChart: React.FC<TradingViewTableChartProps> = ({
  symbol,
  coinId,
  width = 160,
  height = 60,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const tvSymbol = getTradingViewSymbol(coinId, symbol);

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = `${width}px`;
    widgetContainer.style.height = `${height}px`;

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    widgetContainer.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.textContent = JSON.stringify({
      symbol: tvSymbol,
      width: width,
      height: height,
      locale: 'en',
      dateRange: '7D',
      colorTheme: 'light',
      trendLineColor: 'rgba(15, 118, 110, 1)',
      underLineColor: 'rgba(15, 118, 110, 0.18)',
      underLineBottomColor: 'rgba(15, 118, 110, 0)',
      isTransparent: true,
      autosize: false,
      largeChartUrl: '',
      chartOnly: true,
      noTimeScale: true,
    });

    widgetContainer.appendChild(script);
    container.appendChild(widgetContainer);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [coinId, symbol, width, height]);

  return (
    <div
      ref={containerRef}
      className="tv-table-chart"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden',
        borderRadius: '4px',
      }}
    />
  );
};

export default memo(TradingViewTableChart);

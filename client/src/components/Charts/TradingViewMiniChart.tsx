import React, { useEffect, useRef, memo } from 'react';

interface TradingViewMiniChartProps {
  symbol: string; // CoinGecko symbol like "btc", "eth", "sol"
  coinId: string; // CoinGecko ID like "bitcoin", "ethereum"
  width?: string;
  height?: number;
}

// Map common CoinGecko coin IDs to TradingView symbols on Binance
const SYMBOL_MAP: Record<string, string> = {
  bitcoin: 'BINANCE:BTCUSDT',
  ethereum: 'BINANCE:ETHUSDT',
  tether: 'BINANCE:BTCUSDT', // Stablecoin, show BTC instead
  binancecoin: 'BINANCE:BNBUSDT',
  solana: 'BINANCE:SOLUSDT',
  ripple: 'BINANCE:XRPUSDT',
  'usd-coin': 'BINANCE:BTCUSDT', // Stablecoin
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
  dai: 'BINANCE:BTCUSDT', // Stablecoin
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

/**
 * Resolve a CoinGecko coin ID + symbol to a TradingView chart symbol.
 * Falls back to constructing BINANCE:<SYMBOL>USDT if not in the map.
 */
function getTradingViewSymbol(coinId: string, symbol: string): string {
  // Check the explicit map first
  const mapped = SYMBOL_MAP[coinId.toLowerCase()];
  if (mapped) return mapped;

  // Fallback: construct from the ticker symbol
  const sym = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `BINANCE:${sym}USDT`;
}

const TradingViewMiniChart: React.FC<TradingViewMiniChartProps> = ({
  symbol,
  coinId,
  width = '100%',
  height = 220,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = '';

    const tvSymbol = getTradingViewSymbol(coinId, symbol);

    // Create the widget container structure
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = width;
    widgetContainer.style.height = `${height}px`;

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    widgetContainer.appendChild(widgetDiv);

    // Copyright notice (required by TradingView)
    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = `<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>`;
    widgetContainer.appendChild(copyright);

    // Create and configure the script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.textContent = JSON.stringify({
      symbol: tvSymbol,
      width: '100%',
      height: '100%',
      locale: 'en',
      dateRange: '7D',
      colorTheme: 'dark',
      trendLineColor: 'rgba(99, 102, 241, 1)',
      underLineColor: 'rgba(99, 102, 241, 0.3)',
      underLineBottomColor: 'rgba(99, 102, 241, 0)',
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
      chartOnly: false,
      noTimeScale: false,
    });

    widgetContainer.appendChild(script);
    container.appendChild(widgetContainer);

    return () => {
      // Cleanup on unmount or symbol change
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [coinId, symbol, width, height]);

  return (
    <div
      ref={containerRef}
      className="tv-mini-chart-wrapper"
      style={{ width, height: `${height}px`, overflow: 'hidden', borderRadius: '8px' }}
    />
  );
};

export default memo(TradingViewMiniChart);

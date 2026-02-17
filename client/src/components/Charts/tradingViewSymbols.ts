const SYMBOL_MAP: Record<string, string> = {
  bitcoin: 'BINANCE:BTCUSDT',
  ethereum: 'BINANCE:ETHUSDT',
  binancecoin: 'BINANCE:BNBUSDT',
  solana: 'BINANCE:SOLUSDT',
  ripple: 'BINANCE:XRPUSDT',
  cardano: 'BINANCE:ADAUSDT',
  dogecoin: 'BINANCE:DOGEUSDT',
  tron: 'BINANCE:TRXUSDT',
  avalanche: 'BINANCE:AVAXUSDT',
  'avalanche-2': 'BINANCE:AVAXUSDT',
  polkadot: 'BINANCE:DOTUSDT',
  chainlink: 'BINANCE:LINKUSDT',
  'shiba-inu': 'BINANCE:SHIBUSDT',
  polygon: 'BINANCE:MATICUSDT',
  'matic-network': 'BINANCE:MATICUSDT',
  litecoin: 'BINANCE:LTCUSDT',
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
  maker: 'BINANCE:MKRUSDT',
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
  bittensor: 'BINANCE:TAOUSDT',
  'the-open-network': 'BINANCE:TONUSDT',
  mantle: 'BINANCE:MNTUSDT',
  hyperliquid: 'BINANCE:HYPEUSDT',
  'bitget-token': 'BINANCE:BGBUSDT',
  okb: 'OKX:OKBUSDT',
};

const NON_TRADABLE_IDS = new Set<string>([
  'tether',
  'usd-coin',
  'dai',
  'staked-ether',
  'wrapped-bitcoin',
  'leo-token',
  'ethena-usde',
  'falcon-finance',
  'usd1-wlfi',
  'rain',
  'world-liberty-financial',
  'paypal-usd',
  'global-dollar',
  'figure-heloc',
  'hashnote-usyc',
  'usds',
  'blackrock-usd-institutional-digital-liquidity-fund',
]);

const NON_TRADABLE_SYMBOLS = new Set<string>([
  'USDT',
  'USDC',
  'DAI',
  'USDE',
  'USD1',
  'USDS',
  'USDG',
  'USYC',
  'PYUSD',
]);

const INVALID_WIDGET_SYMBOLS = new Set<string>();

export function markTradingViewSymbolInvalid(tvSymbol: string): void {
  INVALID_WIDGET_SYMBOLS.add(tvSymbol);
}

export function isTradingViewSymbolInvalid(tvSymbol: string): boolean {
  return INVALID_WIDGET_SYMBOLS.has(tvSymbol);
}

export function resolveTradingViewSymbol(coinId: string, symbol: string): string | null {
  const normalizedId = coinId.toLowerCase();
  const mapped = SYMBOL_MAP[normalizedId];
  if (mapped) return mapped;

  if (NON_TRADABLE_IDS.has(normalizedId)) return null;

  const normalizedSymbol = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!normalizedSymbol || normalizedSymbol.length < 2 || normalizedSymbol.length > 10) {
    return null;
  }

  if (NON_TRADABLE_SYMBOLS.has(normalizedSymbol)) return null;

  // Avoid guessed ticker pairs because many CoinGecko symbols are not listed on TradingView,
  // which produces noisy "Invalid symbol" widgets. Unmapped assets use sparkline fallback.
  return null;
}

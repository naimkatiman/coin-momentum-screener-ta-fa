# Coin Momentum Screener - Technical & Fundamental Analysis

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![CoinGecko](https://img.shields.io/badge/Powered%20by-CoinGecko%20API-green.svg)

**Flip $100 to $1,000 with data-driven crypto momentum analysis**

*Real-time cryptocurrency scanner combining Technical Analysis (TA) and Fundamental Analysis (FA) to identify high-momentum investment opportunities.*

</div>

---

## Overview

The **Coin Momentum Screener** is a professional-grade cryptocurrency analysis platform that scans the top cryptocurrencies in real-time, applying both Technical Analysis and Fundamental Analysis to generate momentum scores, trading signals, and portfolio allocation recommendations.

### Key Features

- **Real-Time Market Scanner** - Scans top 50 cryptocurrencies with live data from CoinGecko API
- **Technical Analysis Engine** - RSI, MACD, Bollinger Bands, SMA/EMA crossovers, Stochastic Oscillator, ATR, Volume Analysis
- **Fundamental Analysis Engine** - Market cap scoring, community metrics, developer activity, sentiment analysis, supply metrics
- **Momentum Scoring System** - Weighted composite score (0-100) with grade (A+ to F) and trading signals
- **Portfolio Simulator** - $100 to $1,000 allocation optimizer based on momentum scores
- **Interactive Charts** - Sparkline price charts, gauge visualizations, and score bars
- **Professional UI** - Dark theme, responsive design, real-time updates

## Architecture

```
coin-momentum-screener-ta-fa/
+-- server/                    # Node.js + TypeScript Backend
|   +-- src/
|   |   +-- index.ts           # Express server entry point
|   |   +-- routes/
|   |   |   +-- api.ts         # REST API endpoints
|   |   +-- services/
|   |   |   +-- coingecko.ts   # CoinGecko API integration with caching
|   |   |   +-- technicalAnalysis.ts    # TA engine (RSI, MACD, BB, etc.)
|   |   |   +-- fundamentalAnalysis.ts  # FA engine (community, dev, sentiment)
|   |   |   +-- momentumScoring.ts      # Composite scoring system
|   |   |   +-- scanner.ts     # Market scanner orchestrator
|   |   +-- types/
|   |   |   +-- index.ts       # TypeScript type definitions
|   |   +-- middleware/
|   |       +-- errorHandler.ts
|   +-- package.json
|   +-- tsconfig.json
+-- client/                    # React + TypeScript Frontend
|   +-- src/
|   |   +-- App.tsx            # Main application component
|   |   +-- index.css          # Global styles (dark theme)
|   |   +-- components/
|   |   |   +-- Dashboard/     # Global stats display
|   |   |   +-- Scanner/       # Main scanner table view
|   |   |   +-- CoinDetail/    # Detailed coin analysis modal
|   |   |   +-- Portfolio/     # Portfolio simulator view
|   |   |   +-- Charts/        # Chart components (sparklines)
|   |   |   +-- UI/            # Navbar, common UI components
|   |   +-- services/
|   |   |   +-- api.ts         # HTTP client for backend API
|   |   +-- types/
|   |       +-- index.ts       # Frontend type definitions
|   +-- package.json
+-- package.json               # Root orchestration
+-- README.md
```

## Technical Analysis Indicators

| Indicator | Description | Signal Logic |
|-----------|-------------|--------------|
| **RSI (14)** | Relative Strength Index | < 30 = Oversold (Buy), > 70 = Overbought (Sell) |
| **MACD (12,26,9)** | Moving Average Convergence Divergence | Bullish/Bearish crossover detection |
| **Bollinger Bands (20,2)** | Volatility bands | %B < 0.2 = Oversold, > 0.8 = Overbought |
| **SMA Cross (50/200)** | Simple Moving Average | Golden Cross / Death Cross detection |
| **EMA Cross (12/26)** | Exponential Moving Average | Bullish/Bearish trend detection |
| **Stochastic (14,3)** | Stochastic Oscillator | < 20 = Oversold, > 80 = Overbought |
| **ATR (14)** | Average True Range | Volatility measurement |
| **Volume Analysis** | Volume vs average ratio | High/Normal/Low volume detection |

## Fundamental Analysis Metrics

| Metric | Weight | Description |
|--------|--------|-------------|
| Market Cap Score | 20% | Rank-based stability scoring |
| Volume/MCap Ratio | 15% | Liquidity and trading activity |
| Supply Metrics | 10% | Circulating ratio, deflationary check |
| Community Score | 15% | Twitter followers, Reddit activity, watchlist users |
| Developer Score | 15% | GitHub stars, forks, commits, PR merges |
| Sentiment Score | 10% | CoinGecko sentiment votes |
| ATH Recovery | 15% | Distance from all-time-high (upside potential) |

## Momentum Scoring

The momentum score combines Technical (60%) and Fundamental (40%) analysis:

| Score Range | Grade | Signal | Description |
|-------------|-------|--------|-------------|
| 90-100 | A+ | STRONG BUY | Exceptional momentum with strong fundamentals |
| 80-89 | A | STRONG BUY | Very strong indicators across the board |
| 70-79 | B+ | BUY | Good momentum, favorable conditions |
| 65-69 | B | BUY | Decent momentum with some positive signals |
| 50-64 | C+/C | HOLD | Mixed signals, monitor closely |
| 30-49 | D | SELL | Weak momentum, bearish indicators |
| 0-29 | F | STRONG SELL | Very weak across all metrics |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/scanner` | GET | Scan market with filters |
| `/api/coin/:id` | GET | Detailed coin analysis |
| `/api/portfolio/simulate` | GET | Portfolio simulation |
| `/api/trending` | GET | Trending coins |
| `/api/global` | GET | Global market data |
| `/api/chart/:id` | GET | Price chart data |
| `/api/stats` | GET | Cache & system stats |

### Scanner Query Parameters

- `sortBy` - `momentum` | `price_change` | `volume` | `market_cap`
- `limit` - Number of coins (default: 50)
- `minMomentumScore` - Minimum momentum score filter
- `signals` - Comma-separated signal filters (`STRONG BUY,BUY`)
- `minMarketCap` / `maxMarketCap` - Market cap range filter
- `minVolume` - Minimum 24h volume

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- CoinGecko API Key (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/naimkatiman/coin-momentum-screener-ta-fa.git
cd coin-momentum-screener-ta-fa

# Install all dependencies
npm run install-all

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your CoinGecko API key
```

### Configuration

Create `server/.env`:

```env
COINGECKO_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
```

### Running

```bash
# Development (both server & client)
npm run dev

# Server only
npm run server

# Client only
npm run client
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## Tech Stack

### Backend
- **Node.js** + **Express** - HTTP server
- **TypeScript** - Type safety
- **Axios** - HTTP client for CoinGecko API
- **node-cache** - In-memory caching (60s market data, 300s detail data)
- **express-rate-limit** - API rate limiting

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Recharts** - Charts and sparklines
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Framer Motion** - Animations

### APIs
- **CoinGecko API** - Market data, OHLC, trending, global stats

## Screenshots

The application features:
1. **Scanner Dashboard** - Main table with all coins, their TA/FA scores, signals, and risk levels
2. **Coin Detail Modal** - Deep-dive with all technical indicators and fundamental metrics
3. **Portfolio Simulator** - $100 to $1,000 allocation strategy
4. **Global Stats Bar** - Total market cap, volume, BTC/ETH dominance

## Disclaimer

This is an educational investment screening tool. The momentum scores, signals, and portfolio recommendations are generated algorithmically and should NOT be considered financial advice. Always Do Your Own Research (DYOR) before making any investment decisions. Cryptocurrency investments carry significant risk including the potential loss of principal.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Powered By

<a href="https://www.coingecko.com/en/api">
  <img src="https://static.coingecko.com/s/coingecko-branding-guide-8447f506a22d30e0415a8c5e2a0b06fa373aeabb2bae9c91e12a7b1bc0e3f27f.png" width="200" alt="CoinGecko" />
</a>

Data provided by CoinGecko API

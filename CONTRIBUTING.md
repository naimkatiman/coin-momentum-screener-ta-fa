# Contributing to Coin Momentum Screener

Thank you for your interest in contributing to the Coin Momentum Screener!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm run install-all`
3. Copy `server/.env.example` to `server/.env` and add your CoinGecko API key
4. Run development servers: `npm run dev`

## Project Structure

- `server/` - Node.js + TypeScript backend (Express API)
- `client/` - React + TypeScript frontend
- `server/src/services/` - Core analysis engines (TA, FA, Momentum Scoring)

## Adding New Technical Indicators

1. Add the calculation method to `server/src/services/technicalAnalysis.ts`
2. Update the `TechnicalIndicators` type in both `server/src/types/index.ts` and `client/src/types/index.ts`
3. Include the indicator in the momentum scoring weights in `server/src/services/momentumScoring.ts`
4. Display the indicator in `client/src/components/CoinDetail/CoinDetailModal.tsx`

## Code Style

- TypeScript strict mode enabled
- Use descriptive variable names
- Add JSDoc comments for complex functions
- Follow existing patterns for consistency

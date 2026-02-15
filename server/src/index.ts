// ============================================================
// Coin Momentum Screener - Technical & Fundamental Analysis
// Backend Server - CoinGecko API Integration
// ============================================================

import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { router as apiRouter } from './routes/api';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'running',
    timestamp: new Date().toISOString(),
    service: 'Coin Momentum Screener API',
    version: '1.0.0'
  });
});

// API routes
app.use('/api', apiRouter);

// Serve static frontend
const clientBuildPath = path.join(__dirname, '../../client/build');
app.use(express.static(clientBuildPath));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║   🚀 Coin Momentum Screener API                        ║
  ║   📡 Running on port ${PORT}                              ║
  ║   🔗 http://localhost:${PORT}/api/health                  ║
  ║   📊 Technical & Fundamental Analysis Engine Active     ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;

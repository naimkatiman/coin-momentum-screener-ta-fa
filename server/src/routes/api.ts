// ============================================================
// API Routes
// ============================================================

import { Router, Request, Response } from 'express';
import { ScannerService } from '../services/scanner';
import { coinGeckoService } from '../services/coingecko';
import { ScannerFilters } from '../types';

export const router = Router();

// ---- Scanner Endpoint ----
router.get('/scanner', async (req: Request, res: Response) => {
  try {
    const filters: ScannerFilters = {
      minMarketCap: req.query.minMarketCap ? Number(req.query.minMarketCap) : undefined,
      maxMarketCap: req.query.maxMarketCap ? Number(req.query.maxMarketCap) : undefined,
      minVolume: req.query.minVolume ? Number(req.query.minVolume) : undefined,
      minMomentumScore: req.query.minMomentumScore ? Number(req.query.minMomentumScore) : undefined,
      signals: req.query.signals ? String(req.query.signals).split(',') : undefined,
      sortBy: (req.query.sortBy as any) || 'momentum',
      limit: req.query.limit ? Number(req.query.limit) : 50,
    };

    const results = await ScannerService.scanMarket(filters);
    
    res.json({
      success: true,
      count: results.length,
      timestamp: new Date().toISOString(),
      data: results,
    });
  } catch (error: any) {
    console.error('Scanner error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to scan market. Please try again.'
    });
  }
});

// ---- Detailed Coin Analysis ----
router.get('/coin/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await ScannerService.detailedAnalysis(id);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: result,
    });
  } catch (error: any) {
    console.error(`Coin detail error for ${req.params.id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ---- Portfolio Simulation ----
router.get('/portfolio/simulate', async (req: Request, res: Response) => {
  try {
    const initial = Number(req.query.initial) || 100;
    const target = Number(req.query.target) || 1000;
    
    const result = await ScannerService.simulatePortfolio(initial, target);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: result,
    });
  } catch (error: any) {
    console.error('Portfolio simulation error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ---- Trending Coins ----
router.get('/trending', async (_req: Request, res: Response) => {
  try {
    const trending = await coinGeckoService.getTrending();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: trending,
    });
  } catch (error: any) {
    console.error('Trending error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ---- Global Market Data ----
router.get('/global', async (_req: Request, res: Response) => {
  try {
    const global = await coinGeckoService.getGlobalData();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: global,
    });
  } catch (error: any) {
    console.error('Global data error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ---- Market Chart ----
router.get('/chart/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const days = Number(req.query.days) || 30;
    const chart = await coinGeckoService.getMarketChart(String(id), days);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: chart,
    });
  } catch (error: any) {
    console.error(`Chart error for ${req.params.id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ---- Cache Stats ----
router.get('/stats', (_req: Request, res: Response) => {
  const cacheStats = coinGeckoService.getCacheStats();
  
  res.json({
    success: true,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: cacheStats,
  });
});

// ============================================================
// API Service - Frontend HTTP Client
// ============================================================

import axios from 'axios';
import { ScannedCoin, PortfolioSimulation, PortfolioRiskProfile, TrendingCoin, GlobalData } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export interface ScannerParams {
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
  minMomentumScore?: number;
  signals?: string;
  sortBy?: string;
  limit?: number;
}

export const apiService = {
  // Scanner
  async getScannedCoins(params: ScannerParams = {}): Promise<ScannedCoin[]> {
    const { data } = await api.get('/scanner', { params });
    return data.data;
  },

  // Coin Detail
  async getCoinDetail(id: string): Promise<any> {
    const { data } = await api.get(`/coin/${id}`);
    return data.data;
  },

  // Portfolio Simulation
  async getPortfolioSimulation(
    initial: number = 100,
    target: number = 1000,
    risk: PortfolioRiskProfile = 'medium'
  ): Promise<PortfolioSimulation> {
    const { data } = await api.get('/portfolio/simulate', {
      params: { initial, target, risk, ts: Date.now() },
    });
    return data.data;
  },

  // Trending
  async getTrending(): Promise<TrendingCoin[]> {
    const { data } = await api.get('/trending');
    return data.data;
  },

  // Global Data
  async getGlobalData(): Promise<GlobalData> {
    const { data } = await api.get('/global');
    return data.data;
  },

  // Chart Data
  async getChartData(id: string, days: number = 30): Promise<any> {
    const { data } = await api.get(`/chart/${id}`, { params: { days } });
    return data.data;
  },

  // Health Check
  async healthCheck(): Promise<any> {
    const { data } = await api.get('/health');
    return data;
  }
};

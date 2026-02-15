import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/UI/Navbar';
import { GlobalStats } from './components/Dashboard/GlobalStats';
import { ScannerView } from './components/Scanner/ScannerView';
import { PortfolioView } from './components/Portfolio/PortfolioView';
import { CoinDetailModal } from './components/CoinDetail/CoinDetailModal';
import { apiService } from './services/api';
import { ScannedCoin, GlobalData, PortfolioSimulation, SortOption, SignalFilter } from './types';

type TabType = 'scanner' | 'portfolio';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [coins, setCoins] = useState<ScannedCoin[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioSimulation | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [coinDetail, setCoinDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('momentum');
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('ALL');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [scannerData, globalResult] = await Promise.all([
        apiService.getScannedCoins({ sortBy, limit: 50 }),
        apiService.getGlobalData(),
      ]);
      setCoins(scannerData);
      setGlobalData(globalResult);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await apiService.getPortfolioSimulation(100, 1000);
      setPortfolio(data);
    } catch (err: any) {
      console.error('Portfolio error:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === 'portfolio' && !portfolio) {
      fetchPortfolio();
    }
  }, [activeTab, portfolio, fetchPortfolio]);

  const handleCoinClick = async (coinId: string) => {
    setSelectedCoin(coinId);
    setDetailLoading(true);
    try {
      const detail = await apiService.getCoinDetail(coinId);
      setCoinDetail(detail);
    } catch (err) {
      console.error('Detail error:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCoin(null);
    setCoinDetail(null);
  };

  const filteredCoins = signalFilter === 'ALL' 
    ? coins 
    : coins.filter(c => c.momentumScore.signal === signalFilter);

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        lastUpdated={lastUpdated}
      />
      
      <div className="main-content">
        {globalData && <GlobalStats data={globalData} coinCount={coins.length} />}
        
        {activeTab === 'scanner' && (
          <ScannerView
            coins={filteredCoins}
            loading={loading}
            error={error}
            sortBy={sortBy}
            signalFilter={signalFilter}
            onSortChange={setSortBy}
            onSignalFilterChange={setSignalFilter}
            onCoinClick={handleCoinClick}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioView
            portfolio={portfolio}
            loading={!portfolio}
            onRefresh={fetchPortfolio}
          />
        )}
      </div>

      {selectedCoin && (
        <CoinDetailModal
          coinId={selectedCoin}
          detail={coinDetail}
          loading={detailLoading}
          onClose={handleCloseDetail}
        />
      )}

      <div className="disclaimer">
        <p>Powered by <a href="https://www.coingecko.com/en/api" target="_blank" rel="noreferrer">CoinGecko API</a> | This is an investment screening tool for educational purposes. Not financial advice.</p>
        <p style={{ marginTop: '4px' }}>Built with React, TypeScript & Node.js | Coin Momentum Screener v1.0</p>
      </div>
    </div>
  );
}

export default App;

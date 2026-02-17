import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Brain, Radar, Sparkles } from 'lucide-react';
import { Navbar } from './components/UI/Navbar';
import { GlobalStats } from './components/Dashboard/GlobalStats';
import { ScannerView } from './components/Scanner/ScannerView';
import { PortfolioView } from './components/Portfolio/PortfolioView';
import { CoinDetailModal } from './components/CoinDetail/CoinDetailModal';
import { WebGLBackdrop } from './components/Effects/WebGLBackdrop';
import { SplineShowcase } from './components/Effects/SplineShowcase';
import { apiService } from './services/api';
import {
  ScannedCoin,
  GlobalData,
  PortfolioSimulation,
  PortfolioRiskProfile,
  SortOption,
  SignalFilter
} from './types';

type TabType = 'scanner' | 'portfolio';

const formatCompactCurrency = (value: number) => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
};

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const viewAnchorRef = useRef<HTMLDivElement>(null);
  const scannerSectionRef = useRef<HTMLElement>(null);
  const portfolioSectionRef = useRef<HTMLElement>(null);
  const pendingTabScrollRef = useRef<TabType | null>(null);
  const portfolioRequestIdRef = useRef(0);

  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [coins, setCoins] = useState<ScannedCoin[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioSimulation | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioRiskProfile, setPortfolioRiskProfile] = useState<PortfolioRiskProfile>('medium');
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

  const fetchPortfolio = useCallback(async (riskProfile: PortfolioRiskProfile) => {
    const requestId = ++portfolioRequestIdRef.current;
    setPortfolioLoading(true);
    try {
      const data = await apiService.getPortfolioSimulation(100, 1000, riskProfile);
      if (requestId === portfolioRequestIdRef.current) {
        setPortfolio(data);
      }
    } catch (err) {
      console.error('Portfolio error:', err);
    } finally {
      if (requestId === portfolioRequestIdRef.current) {
        setPortfolioLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchPortfolio(portfolioRiskProfile);
  }, [fetchPortfolio, portfolioRiskProfile]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.08,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
    });

    let frameId = 0;

    const frame = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(frame);
    };

    frameId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.from('.hero-animate', {
        y: 44,
        autoAlpha: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.1,
      });

      gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((element, index) => {
        gsap.fromTo(
          element,
          { y: 50, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.95,
            ease: 'power2.out',
            delay: index * 0.03,
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              once: true,
            },
          }
        );
      });
    }, appRef);

    return () => {
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

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

  const scrollToView = useCallback((tab: TabType, behavior: ScrollBehavior = 'smooth') => {
    const sectionTarget = tab === 'portfolio' ? portfolioSectionRef.current : scannerSectionRef.current;
    (sectionTarget ?? viewAnchorRef.current)?.scrollIntoView({ behavior, block: 'start' });
  }, []);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      pendingTabScrollRef.current = tab;
      setActiveTab((prev) => (prev === tab ? prev : tab));
      if (activeTab === tab) {
        scrollToView(tab);
        pendingTabScrollRef.current = null;
      }
    },
    [activeTab, scrollToView]
  );

  useEffect(() => {
    if (pendingTabScrollRef.current !== activeTab) return;
    const timeoutId = window.setTimeout(() => {
      scrollToView(activeTab);
      pendingTabScrollRef.current = null;
    }, 36);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, scrollToView]);

  const handleLaunchScanner = () => {
    handleTabChange('scanner');
  };

  const handlePortfolioRefresh = useCallback(() => {
    fetchPortfolio(portfolioRiskProfile);
  }, [fetchPortfolio, portfolioRiskProfile]);

  const handlePortfolioRiskChange = useCallback((nextProfile: PortfolioRiskProfile) => {
    if (nextProfile === portfolioRiskProfile) return;
    setPortfolioRiskProfile(nextProfile);
  }, [portfolioRiskProfile]);

  const filteredCoins = signalFilter === 'ALL' ? coins : coins.filter((coin) => coin.momentumScore.signal === signalFilter);

  const marketIntelligence = useMemo(() => {
    const bullishUniverse = coins.filter(
      (coin) => coin.momentumScore.signal === 'BUY' || coin.momentumScore.signal === 'STRONG BUY'
    ).length;

    const avgMomentum = coins.length
      ? coins.reduce((score, coin) => score + coin.momentumScore.overallScore, 0) / coins.length
      : 0;

    const highConfidence = coins.filter((coin) => coin.momentumScore.confidence >= 70).length;

    return {
      pulse: globalData?.market_cap_change_percentage_24h_usd ?? 0,
      marketCap: globalData?.total_market_cap?.usd ?? 0,
      bullishUniverse,
      avgMomentum,
      highConfidence,
    };
  }, [coins, globalData]);

  const marketPulseLabel =
    marketIntelligence.pulse >= 2 ? 'Risk-on rotation' : marketIntelligence.pulse <= -2 ? 'Defensive tape' : 'Mixed momentum';

  return (
    <div className="app-container" ref={appRef}>
      <WebGLBackdrop />
      <div className="atmosphere-layer" aria-hidden="true" />

      <Navbar activeTab={activeTab} onTabChange={handleTabChange} lastUpdated={lastUpdated} />

      <header className="hero-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="hero-chip hero-animate">
              <Sparkles size={14} />
              Real-time market intelligence
            </span>

            <h1 className="hero-title">
              <span className="hero-animate">Signal-first crypto screening</span>
              <span className="hero-gradient hero-animate">crafted like a portfolio flagship.</span>
            </h1>

            <p className="hero-subtitle hero-animate">
              Blend technical structure, fundamental quality, and conviction scoring in one cinematic control surface.
            </p>

            <div className="hero-actions hero-animate">
              <button className="hero-btn hero-btn-primary" onClick={handleLaunchScanner}>
                Launch Scanner
                <ArrowRight size={16} />
              </button>
              <button
                className="hero-btn hero-btn-ghost"
                onClick={() => handleTabChange(activeTab === 'scanner' ? 'portfolio' : 'scanner')}
              >
                {activeTab === 'scanner' ? 'Open Portfolio Lab' : 'Return to Scanner'}
              </button>
            </div>

            <div className="hero-intelligence-grid hero-animate">
              <article className="hero-intel-card">
                <span>Global Market Cap</span>
                <strong>{formatCompactCurrency(marketIntelligence.marketCap)}</strong>
                <p>Live macro liquidity context</p>
              </article>
              <article className="hero-intel-card">
                <span>Market Pulse</span>
                <strong className={marketIntelligence.pulse >= 0 ? 'positive' : 'negative'}>
                  {marketIntelligence.pulse >= 0 ? '+' : ''}
                  {marketIntelligence.pulse.toFixed(2)}%
                </strong>
                <p>{marketPulseLabel}</p>
              </article>
              <article className="hero-intel-card">
                <span>Bullish Universe</span>
                <strong>{marketIntelligence.bullishUniverse}</strong>
                <p>Coins flagged BUY / STRONG BUY</p>
              </article>
              <article className="hero-intel-card">
                <span>Confidence Set</span>
                <strong>{marketIntelligence.highConfidence}</strong>
                <p>Assets above 70% signal confidence</p>
              </article>
              <article className="hero-intel-card">
                <span>Average Momentum</span>
                <strong>{marketIntelligence.avgMomentum.toFixed(1)}</strong>
                <p>Across active watchlist</p>
              </article>
            </div>
          </div>

          <div className="hero-scene reveal-up">
            <div className="scene-shell">
              <div className="scene-label">
                <Brain size={15} />
                Figma-grade spatial composition
              </div>
              <SplineShowcase portfolio={portfolio} />
              <div className="scene-meta">
                <Radar size={14} />
                WebGL + Spline stage for immersive storytelling
              </div>
            </div>
          </div>
        </div>
      </header>

      <motion.main className="main-content" layout>
        {globalData && (
          <div className="reveal-up">
            <GlobalStats data={globalData} coinCount={coins.length} />
          </div>
        )}

        <div ref={viewAnchorRef} className="view-anchor" />

        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'scanner' ? (
            <motion.section
              key="scanner"
              id="scanner-section"
              ref={scannerSectionRef}
              className="reveal-up"
              role="tabpanel"
              aria-labelledby="tab-scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
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
            </motion.section>
          ) : (
            <motion.section
              key="portfolio"
              id="portfolio-section"
              ref={portfolioSectionRef}
              className="reveal-up"
              role="tabpanel"
              aria-labelledby="tab-portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <PortfolioView
                portfolio={portfolio}
                loading={portfolioLoading}
                riskProfile={portfolioRiskProfile}
                onRiskProfileChange={handlePortfolioRiskChange}
                onRefresh={handlePortfolioRefresh}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </motion.main>

      {selectedCoin && (
        <CoinDetailModal coinId={selectedCoin} detail={coinDetail} loading={detailLoading} onClose={handleCloseDetail} />
      )}

      <footer className="disclaimer reveal-up">
        <div className="footer-brand">
          <img src="/coingecko-logo.png" alt="CoinGecko" />
          <span>
            Data powered by{' '}
            <a href="https://www.coingecko.com/en/api" target="_blank" rel="noreferrer">
              CoinGecko API
            </a>
          </span>
        </div>
        <p>Educational screening interface only. Not financial advice. Always do your own research.</p>
        <p style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
          Crafted with React, TypeScript, Framer Motion, GSAP, Three.js, Lenis and a Spline-ready stage.
        </p>
      </footer>
    </div>
  );
}

export default App;

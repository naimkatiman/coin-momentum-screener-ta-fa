import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { MiniSparkline } from './MiniSparkline';
import {
  isTradingViewSymbolInvalid,
  markTradingViewSymbolInvalid,
  resolveTradingViewSymbol,
} from './tradingViewSymbols';

interface TradingViewTableChartProps {
  symbol: string;
  coinId: string;
  sparkline?: number[];
  priceChange7d?: number;
  width?: number;
  height?: number;
}

function getTrendColors(isBullish: boolean) {
  if (isBullish) {
    return {
      line: 'rgba(16, 185, 129, 1)',
      underLine: 'rgba(16, 185, 129, 0.24)',
      underLineBottom: 'rgba(16, 185, 129, 0)',
    };
  }

  return {
    line: 'rgba(244, 63, 94, 1)',
    underLine: 'rgba(244, 63, 94, 0.24)',
    underLineBottom: 'rgba(244, 63, 94, 0)',
  };
}

/**
 * Compact TradingView 7D chart for scanner table cells.
 * Lazy mounts while visible to keep initial table rendering fast.
 */
const TradingViewTableChart: React.FC<TradingViewTableChartProps> = ({
  symbol,
  coinId,
  sparkline = [],
  priceChange7d,
  width = 160,
  height = 60,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [useSparklineFallback, setUseSparklineFallback] = useState(false);

  const isBullish = useMemo(() => {
    if (typeof priceChange7d === 'number') return priceChange7d >= 0;
    if (sparkline.length >= 2) return sparkline[sparkline.length - 1] >= sparkline[0];
    return true;
  }, [priceChange7d, sparkline]);

  const trendColors = useMemo(() => getTrendColors(isBullish), [isBullish]);
  const tvSymbol = useMemo(() => resolveTradingViewSymbol(coinId, symbol), [coinId, symbol]);

  useEffect(() => {
    setHasEnteredView(false);
    setUseSparklineFallback(false);
  }, [coinId, symbol]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || hasEnteredView) return;

    if (!('IntersectionObserver' in window)) {
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHasEnteredView(true);
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: '220px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [hasEnteredView]);

  useEffect(() => {
    const widgetHost = widgetRef.current;
    if (!widgetHost) return;

    if (!tvSymbol || !hasEnteredView || useSparklineFallback) {
      widgetHost.innerHTML = '';
      return;
    }

    if (isTradingViewSymbolInvalid(tvSymbol)) {
      setUseSparklineFallback(true);
      widgetHost.innerHTML = '';
      return;
    }

    widgetHost.innerHTML = '';

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
      width,
      height,
      locale: 'en',
      dateRange: '7D',
      colorTheme: 'light',
      trendLineColor: trendColors.line,
      underLineColor: trendColors.underLine,
      underLineBottomColor: trendColors.underLineBottom,
      isTransparent: true,
      autosize: false,
      largeChartUrl: '',
      chartOnly: true,
      noTimeScale: true,
    });

    widgetContainer.appendChild(script);
    widgetHost.appendChild(widgetContainer);

    const detectInvalidSymbol = () => {
      const text = widgetHost.textContent?.toLowerCase() || '';
      if (text.includes('invalid symbol') || text.includes('no data here yet')) {
        markTradingViewSymbolInvalid(tvSymbol);
        setUseSparklineFallback(true);
        return true;
      }
      return false;
    };

    const invalidTextObserver = new MutationObserver(() => {
      detectInvalidSymbol();
    });
    invalidTextObserver.observe(widgetHost, { childList: true, subtree: true, characterData: true });

    const fallbackTimer = window.setTimeout(() => {
      detectInvalidSymbol();
    }, 3200);

    return () => {
      window.clearTimeout(fallbackTimer);
      invalidTextObserver.disconnect();
      widgetHost.innerHTML = '';
    };
  }, [hasEnteredView, height, tvSymbol, trendColors, useSparklineFallback, width]);

  const shouldUseSparkline = useSparklineFallback || !tvSymbol || !hasEnteredView;

  return (
    <div
      ref={rootRef}
      className="tv-table-chart"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden',
        borderRadius: '6px',
      }}
    >
      {shouldUseSparkline ? (
        sparkline.length >= 2 ? (
          <MiniSparkline data={sparkline} color={trendColors.line} width="100%" height={height} />
        ) : (
          <div className="tv-table-fallback-text">Chart unavailable</div>
        )
      ) : (
        <div ref={widgetRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};

export default memo(TradingViewTableChart);

import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { MiniSparkline } from './MiniSparkline';
import { resolveTradingViewSymbol } from './tradingViewSymbols';

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
  const [isInView, setIsInView] = useState(false);
  const [useSparklineFallback, setUseSparklineFallback] = useState(false);

  const isBullish = useMemo(() => {
    if (typeof priceChange7d === 'number') return priceChange7d >= 0;
    if (sparkline.length >= 2) return sparkline[sparkline.length - 1] >= sparkline[0];
    return true;
  }, [priceChange7d, sparkline]);

  const trendColors = useMemo(() => getTrendColors(isBullish), [isBullish]);
  const tvSymbol = useMemo(() => resolveTradingViewSymbol(coinId, symbol), [coinId, symbol]);

  useEffect(() => {
    setUseSparklineFallback(false);
  }, [coinId, symbol]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '160px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const widgetHost = widgetRef.current;
    if (!widgetHost) return;

    if (!tvSymbol || !isInView || useSparklineFallback) {
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

    const fallbackTimer = window.setTimeout(() => {
      const text = widgetHost.textContent?.toLowerCase() || '';
      if (text.includes('invalid symbol') || text.includes('no data here yet')) {
        setUseSparklineFallback(true);
      }
    }, 2600);

    return () => {
      window.clearTimeout(fallbackTimer);
      widgetHost.innerHTML = '';
    };
  }, [height, isInView, tvSymbol, trendColors, useSparklineFallback, width]);

  const shouldUseSparkline = useSparklineFallback || !tvSymbol || !isInView;

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

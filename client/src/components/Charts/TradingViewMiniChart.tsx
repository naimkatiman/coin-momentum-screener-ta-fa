import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { MiniSparkline } from './MiniSparkline';
import { resolveTradingViewSymbol } from './tradingViewSymbols';

interface TradingViewMiniChartProps {
  symbol: string;
  coinId: string;
  sparkline?: number[];
  priceChange7d?: number;
  width?: string;
  height?: number;
}

function getTrendColors(isBullish: boolean) {
  if (isBullish) {
    return {
      line: 'rgba(16, 185, 129, 1)',
      underLine: 'rgba(16, 185, 129, 0.28)',
      underLineBottom: 'rgba(16, 185, 129, 0)',
    };
  }

  return {
    line: 'rgba(244, 63, 94, 1)',
    underLine: 'rgba(244, 63, 94, 0.28)',
    underLineBottom: 'rgba(244, 63, 94, 0)',
  };
}

const TradingViewMiniChart: React.FC<TradingViewMiniChartProps> = ({
  symbol,
  coinId,
  sparkline = [],
  priceChange7d,
  width = '100%',
  height = 220,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useSparklineFallback, setUseSparklineFallback] = useState(false);

  const isBullish = useMemo(() => {
    if (typeof priceChange7d === 'number') return priceChange7d >= 0;
    if (sparkline.length >= 2) return sparkline[sparkline.length - 1] >= sparkline[0];
    return true;
  }, [priceChange7d, sparkline]);

  const tvSymbol = useMemo(() => resolveTradingViewSymbol(coinId, symbol), [coinId, symbol]);
  const trendColors = useMemo(() => getTrendColors(isBullish), [isBullish]);

  useEffect(() => {
    setUseSparklineFallback(false);
  }, [coinId, symbol]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!tvSymbol || useSparklineFallback) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = width;
    widgetContainer.style.height = `${height}px`;

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    widgetContainer.appendChild(widgetDiv);

    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML =
      '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';
    widgetContainer.appendChild(copyright);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.textContent = JSON.stringify({
      symbol: tvSymbol,
      width: '100%',
      height: '100%',
      locale: 'en',
      dateRange: '7D',
      colorTheme: 'light',
      trendLineColor: trendColors.line,
      underLineColor: trendColors.underLine,
      underLineBottomColor: trendColors.underLineBottom,
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
      chartOnly: false,
      noTimeScale: false,
    });

    widgetContainer.appendChild(script);
    container.appendChild(widgetContainer);

    const fallbackTimer = window.setTimeout(() => {
      const text = container.textContent?.toLowerCase() || '';
      if (text.includes('invalid symbol') || text.includes('no data here yet')) {
        setUseSparklineFallback(true);
      }
    }, 2600);

    return () => {
      window.clearTimeout(fallbackTimer);
      container.innerHTML = '';
    };
  }, [tvSymbol, width, height, trendColors, useSparklineFallback]);

  return (
    <div
      className="tv-mini-chart-wrapper"
      style={{ width, height: `${height}px`, overflow: 'hidden', borderRadius: '8px' }}
    >
      {useSparklineFallback || !tvSymbol ? (
        sparkline.length >= 2 ? (
          <MiniSparkline data={sparkline} color={trendColors.line} width="100%" height={height - 12} />
        ) : (
          <div className="tv-fallback-text">Chart unavailable</div>
        )
      ) : (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};

export default memo(TradingViewMiniChart);

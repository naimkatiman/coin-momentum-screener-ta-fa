import React, { useMemo } from 'react';
import { Cuboid } from 'lucide-react';
import { PortfolioSimulation } from '../../types';

const sceneUrl = process.env.REACT_APP_SPLINE_SCENE_URL;

interface SplineShowcaseProps {
  portfolio: PortfolioSimulation | null;
}

interface SplinePoint {
  symbol: string;
  name: string;
  allocation: number;
  returnPercent: number;
}

const defaultPoints: SplinePoint[] = [
  { symbol: 'BTC', name: 'Bitcoin', allocation: 26, returnPercent: 8 },
  { symbol: 'ETH', name: 'Ethereum', allocation: 22, returnPercent: 11 },
  { symbol: 'SOL', name: 'Solana', allocation: 18, returnPercent: 17 },
  { symbol: 'LINK', name: 'Chainlink', allocation: 14, returnPercent: 9 },
  { symbol: 'AVAX', name: 'Avalanche', allocation: 12, returnPercent: 13 },
  { symbol: 'XRP', name: 'XRP', allocation: 8, returnPercent: 7 },
];

interface PlotPoint extends SplinePoint {
  x: number;
  y: number;
}

const toLinePath = (points: PlotPoint[]) => {
  if (points.length < 2) return '';

  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
};

export const SplineShowcase: React.FC<SplineShowcaseProps> = ({ portfolio }) => {
  const chartModel = useMemo(() => {
    const points: SplinePoint[] = portfolio?.allocations?.length
      ? [...portfolio.allocations]
          .sort((a, b) => b.allocationPercent - a.allocationPercent)
          .slice(0, 6)
          .map((allocation) => ({
            symbol: allocation.symbol.toUpperCase(),
            name: allocation.name,
            allocation: allocation.allocationPercent,
            returnPercent: allocation.returnPercent,
          }))
      : defaultPoints;

    const left = 14;
    const right = 96;
    const top = 12;
    const bottom = 74;
    const returns = points.map((point) => point.returnPercent);
    const rawMin = Math.min(...returns, 0);
    const rawMax = Math.max(...returns, 0);
    const padding = Math.max((rawMax - rawMin) * 0.16, 4);
    const domainMin = Math.floor((rawMin - padding) / 5) * 5;
    const domainMax = Math.ceil((rawMax + padding) / 5) * 5;
    const domainSpan = Math.max(domainMax - domainMin, 1);

    const yFromValue = (value: number) => top + ((domainMax - value) / domainSpan) * (bottom - top);

    const plottedPoints: PlotPoint[] = points.map((point, index) => {
      const x = points.length === 1 ? (left + right) / 2 : left + ((right - left) / (points.length - 1)) * index;
      return {
        ...point,
        x,
        y: yFromValue(point.returnPercent),
      };
    });

    const yTicks = Array.from({ length: 5 }, (_, index) => {
      const value = domainMin + ((domainMax - domainMin) / 4) * index;
      return {
        value,
        y: yFromValue(value),
      };
    });

    return {
      points: plottedPoints,
      yTicks,
      left,
      right,
      top,
      bottom,
      zeroY: yFromValue(0),
    };
  }, [portfolio]);

  if (sceneUrl) {
    return (
      <iframe
        title="Spline Showcase"
        src={sceneUrl}
        className="spline-embed"
        loading="lazy"
        allow="fullscreen"
      />
    );
  }

  const { points, yTicks, left, right, top, bottom, zeroY } = chartModel;
  const linePath = toLinePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;

  return (
    <div className="spline-fallback spline-portfolio-fallback">
      <div className="spline-fallback-headline">
        <div className="spline-fallback-icon">
          <Cuboid size={20} />
        </div>
        <div>
          <h3>Simple Portfolio View</h3>
          <p>Each point is a coin. Left-to-right shows portfolio share, height shows expected return.</p>
        </div>
      </div>

      <div className="spline-chart-shell">
        <svg className="spline-portfolio-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Portfolio spline chart">
          <defs>
            <linearGradient id="portfolio-spline-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="60%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="portfolio-spline-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(8, 145, 178, 0.26)" />
              <stop offset="100%" stopColor="rgba(8, 145, 178, 0.02)" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => (
            <line key={tick.value} x1={left} y1={tick.y} x2={right} y2={tick.y} className="spline-grid-line" />
          ))}

          <line x1={left} y1={top} x2={left} y2={bottom} className="spline-axis-line" />
          <line x1={left} y1={bottom} x2={right} y2={bottom} className="spline-axis-line" />
          {zeroY >= top && zeroY <= bottom && (
            <line x1={left} y1={zeroY} x2={right} y2={zeroY} className="spline-zero-line" />
          )}

          {yTicks.map((tick) => (
            <text
              key={`y-${tick.value}`}
              x={left - 1}
              y={tick.y + 0.8}
              className="spline-y-tick-label"
              textAnchor="end"
            >
              {`${Math.round(tick.value)}%`}
            </text>
          ))}

          {points.map((point) => (
            <text key={`x-${point.symbol}`} x={point.x} y={bottom + 4.8} className="spline-x-tick-label" textAnchor="middle">
              {point.symbol}
            </text>
          ))}

          <text x={(left + right) / 2} y={94} className="spline-axis-title" textAnchor="middle">
            Coins
          </text>
          <text
            x={3.4}
            y={(top + bottom) / 2}
            className="spline-axis-title"
            textAnchor="middle"
            transform={`rotate(-90 3.4 ${(top + bottom) / 2})`}
          >
            Expected Return
          </text>

          <path d={areaPath} className="spline-area-path" />
          <path d={linePath} className="spline-line-path" />

          {points.map((point) => (
            <g key={`${point.symbol}-${point.x}`}>
              <circle cx={point.x} cy={point.y} r="1.3" className="spline-node-core" />
              <circle cx={point.x} cy={point.y} r="2.2" className="spline-node-ring" />
              <text x={point.x} y={point.y - 3.2} className="spline-point-label" textAnchor="middle">
                {point.symbol}
              </text>
              <title>
                {`${point.name}: ${point.allocation.toFixed(1)}% of portfolio, ${point.returnPercent.toFixed(1)}% expected return`}
              </title>
            </g>
          ))}
        </svg>
      </div>

      <div className="spline-chart-legend" role="list" aria-label="Coin legend">
        {points.map((point) => (
          <div key={`legend-${point.symbol}`} className="spline-chart-legend-item" role="listitem">
            <span className="spline-chart-legend-dot" aria-hidden="true" />
            <span className="spline-chart-legend-symbol">{point.symbol}</span>
            <span className="spline-chart-legend-meta">
              {point.allocation.toFixed(1)}% share | {point.returnPercent.toFixed(1)}% expected
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};

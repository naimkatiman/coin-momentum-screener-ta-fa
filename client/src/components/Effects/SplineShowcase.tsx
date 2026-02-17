import React, { useMemo } from 'react';
import { Cuboid, TrendingUp } from 'lucide-react';
import { PortfolioSimulation } from '../../types';

const sceneUrl = process.env.REACT_APP_SPLINE_SCENE_URL;

interface SplineShowcaseProps {
  portfolio: PortfolioSimulation | null;
}

interface SplinePoint {
  x: number;
  y: number;
  symbol: string;
  allocation: number;
  returnPercent: number;
}

const defaultPoints: SplinePoint[] = [
  { x: 8, y: 62, symbol: 'A', allocation: 18, returnPercent: 8 },
  { x: 24, y: 54, symbol: 'B', allocation: 24, returnPercent: 14 },
  { x: 40, y: 48, symbol: 'C', allocation: 22, returnPercent: 11 },
  { x: 56, y: 44, symbol: 'D', allocation: 16, returnPercent: 20 },
  { x: 72, y: 35, symbol: 'E', allocation: 12, returnPercent: 26 },
  { x: 92, y: 30, symbol: 'F', allocation: 8, returnPercent: 30 },
];

const formatCompactCurrency = (value: number) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const toSplinePath = (points: SplinePoint[]) => {
  if (points.length < 2) return '';

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

export const SplineShowcase: React.FC<SplineShowcaseProps> = ({ portfolio }) => {
  const dataPoints = useMemo(() => {
    if (!portfolio?.allocations?.length) {
      return defaultPoints;
    }

    const sorted = [...portfolio.allocations]
      .sort((a, b) => b.allocationPercent - a.allocationPercent)
      .slice(0, 6);

    const scores = sorted.map((allocation) => allocation.returnPercent * 0.78 + allocation.allocationPercent * 0.45);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const spread = Math.max(max - min, 1);

    return sorted.map((allocation, index) => {
      const x = sorted.length === 1 ? 50 : 8 + (84 / (sorted.length - 1)) * index;
      const normalized = (scores[index] - min) / spread;

      return {
        x,
        y: 68 - normalized * 36,
        symbol: allocation.symbol.toUpperCase(),
        allocation: allocation.allocationPercent,
        returnPercent: allocation.returnPercent,
      };
    });
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

  const linePath = toSplinePath(dataPoints);
  const areaPath = `${linePath} L ${dataPoints[dataPoints.length - 1].x} 92 L ${dataPoints[0].x} 92 Z`;
  const portfolioGrowth = portfolio
    ? ((portfolio.currentValue - portfolio.initialInvestment) / Math.max(portfolio.initialInvestment, 1)) * 100
    : null;
  const portfolioProgress = portfolio
    ? (portfolio.currentValue / Math.max(portfolio.targetAmount, 1)) * 100
    : null;

  return (
    <div className="spline-fallback spline-portfolio-fallback">
      <div className="spline-fallback-headline">
        <div className="spline-fallback-icon">
          <Cuboid size={20} />
        </div>
        <div>
          <h3>Portfolio Spline Flow</h3>
          <p>Curve built from allocation weight and projected return per asset.</p>
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

          {[18, 34, 50, 66, 82].map((y) => (
            <line key={y} x1="4" y1={y} x2="96" y2={y} className="spline-grid-line" />
          ))}

          <path d={areaPath} className="spline-area-path" />
          <path d={linePath} className="spline-line-path" />

          {dataPoints.map((point) => (
            <g key={`${point.symbol}-${point.x}`}>
              <circle cx={point.x} cy={point.y} r="1.3" className="spline-node-core" />
              <circle cx={point.x} cy={point.y} r="2.2" className="spline-node-ring" />
            </g>
          ))}
        </svg>
      </div>

      <div className="spline-footer">
        <div className="spline-pills">
          {dataPoints.slice(0, 4).map((point) => (
            <span className="spline-pill" key={`${point.symbol}-pill`}>
              {point.symbol} {point.allocation.toFixed(1)}%
            </span>
          ))}
        </div>

        <div className="spline-metrics">
          <span className="spline-metric">
            <TrendingUp size={13} />
            Growth {portfolioGrowth !== null ? `${portfolioGrowth >= 0 ? '+' : ''}${portfolioGrowth.toFixed(1)}%` : 'pending'}
          </span>
          <span className="spline-metric">
            Target {portfolioProgress !== null ? `${portfolioProgress.toFixed(1)}%` : 'pending'}
          </span>
          <span className="spline-metric">
            {portfolio ? formatCompactCurrency(portfolio.currentValue) : 'Awaiting portfolio model'}
          </span>
        </div>
      </div>
    </div>
  );
};

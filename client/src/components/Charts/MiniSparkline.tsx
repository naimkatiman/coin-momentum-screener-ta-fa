import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LineChart, Line } from 'recharts';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  width?: number | string;
  height?: number;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({ 
  data, 
  color, 
  width = 100, 
  height = 32 
}) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>(typeof width === 'number' ? width : 0);

  useEffect(() => {
    if (typeof width === 'number') {
      setMeasuredWidth(width);
      return;
    }

    const node = wrapperRef.current;
    if (!node) return;

    const updateWidth = () => {
      const nextWidth = Math.floor(node.getBoundingClientRect().width);
      if (nextWidth > 0) {
        setMeasuredWidth(nextWidth);
      }
    };

    updateWidth();

    const resizeObserverCtor = (globalThis as Window & typeof globalThis).ResizeObserver;
    if (!resizeObserverCtor) return;

    const observer = new resizeObserverCtor(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, [width]);

  const chartData = useMemo(() => data.map((value, index) => ({ index, value })), [data]);
  const chartWidth = typeof width === 'number' ? Math.max(1, Math.floor(width)) : Math.max(1, measuredWidth || 100);
  const chartHeight = Math.max(1, Math.floor(height));

  if (!hasData) return null;

  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = color || (isPositive ? '#10b981' : '#ef4444');
  const wrapperStyle: React.CSSProperties = {
    width,
    height: chartHeight,
    minHeight: chartHeight,
  };

  if (typeof width === 'number') {
    wrapperStyle.minWidth = width;
  } else {
    wrapperStyle.minWidth = 0;
  }

  return (
    <div ref={wrapperRef} className="mini-sparkline" style={wrapperStyle}>
      <LineChart width={chartWidth} height={chartHeight} data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
          strokeLinecap="round"
        />
      </LineChart>
    </div>
  );
};

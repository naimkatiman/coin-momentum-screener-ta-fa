import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

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
  if (!data || data.length === 0) return null;

  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = color || (isPositive ? '#10b981' : '#ef4444');

  const chartData = data.map((value, index) => ({ index, value }));
  const wrapperStyle: React.CSSProperties = {
    width,
    height,
    minHeight: height,
  };

  if (typeof width === 'number') {
    wrapperStyle.minWidth = width;
  }

  return (
    <div className="mini-sparkline" style={wrapperStyle}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
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
      </ResponsiveContainer>
    </div>
  );
};

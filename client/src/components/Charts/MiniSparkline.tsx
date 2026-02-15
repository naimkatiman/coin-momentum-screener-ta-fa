import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  width?: number;
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

  return (
    <div className="mini-sparkline" style={{ width, height, minWidth: width, minHeight: height }}>
      <ResponsiveContainer width={width} height={height} minWidth={width} minHeight={height}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

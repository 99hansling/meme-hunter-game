import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { PropagationParams } from '../types';
import { calculatePriceAtDistance } from '../utils/math';

interface ChartProps {
  params: PropagationParams;
  entryD: number;
  exitD: number | null;
}

export const ResultChart: React.FC<ChartProps> = ({ params, entryD, exitD }) => {
  // Generate data points for the curve
  const data = [];
  const maxD = 10; // Render up to d=10
  const step = 0.2;

  for (let d = 0; d <= maxD; d += step) {
    // Remove random noise for the "Theoretical" curve
    // We need a clean version of calculatePrice
    const trustFactor = Math.exp(-params.beta * d);
    const scarcityFactor = Math.exp(-params.R * d);
    const audienceFactor = Math.exp(-params.lambda * Math.pow(d - params.d_peak_est, 2));
    const capitalFactor = Math.pow(d + 0.5, -params.delta);
    const price = params.P0 * trustFactor * scarcityFactor * audienceFactor * capitalFactor;

    data.push({
      d: parseFloat(d.toFixed(1)),
      price: price
    });
  }

  const entryPoint = data.find(p => Math.abs(p.d - entryD) < step);
  const exitPoint = exitD ? data.find(p => Math.abs(p.d - exitD) < step) : null;

  return (
    <div className="w-full h-64 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="d" 
            stroke="#94a3b8" 
            label={{ value: '传播距离 (d)', position: 'insideBottomRight', offset: -5 }} 
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            labelFormatter={(label) => `d = ${label}`}
            formatter={(value: number) => [`$${value.toFixed(2)}`, '价格']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#8884d8" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
          
          {entryPoint && (
            <ReferenceDot 
              x={entryPoint.d} 
              y={entryPoint.price} 
              r={6} 
              fill="#22c55e" 
              stroke="white" 
            />
          )}
          {entryPoint && (
            <ReferenceLine x={entryPoint.d} stroke="#22c55e" strokeDasharray="3 3" label="买入" />
          )}

          {exitPoint && (
            <ReferenceDot 
              x={exitPoint.d} 
              y={exitPoint.price} 
              r={6} 
              fill="#ef4444" 
              stroke="white" 
            />
          )}
           {exitPoint && (
            <ReferenceLine x={exitPoint.d} stroke="#ef4444" strokeDasharray="3 3" label="卖出" />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
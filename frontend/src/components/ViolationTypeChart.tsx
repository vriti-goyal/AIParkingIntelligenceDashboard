import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ViolationTypeTrend } from '../types';
import { BarChart2 } from 'lucide-react';
import { formatViolationType, safeNumber } from '../utils/safe';

interface ViolationTypeChartProps {
  data: ViolationTypeTrend[];
}

const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export const ViolationTypeChart: React.FC<ViolationTypeChartProps> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="glass-panel p-6 h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400">
        <div className="bg-gray-800/50 p-4 rounded-full mb-4">
          <BarChart2 size={48} className="opacity-70 text-gray-500" />
        </div>
        <p className="font-medium text-lg">No violation data</p>
        <p className="text-sm mt-1 text-center">Data required to render the violation type chart is missing.</p>
      </div>
    );
  }

  const safeData = data.map(item => ({
    type: formatViolationType(item.violation_type),
    count: safeNumber(item.count, 0),
    percentage: safeNumber(item.percentage, 0)
  }));

  return (
    <div className="glass-panel p-6 h-full min-h-[300px] flex flex-col">
      <h3 className="text-lg font-bold text-white mb-4">Violations by Type</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} opacity={0.5} />
            <XAxis type="number" stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <YAxis 
              dataKey="type" 
              type="category" 
              stroke="#9CA3AF" 
              fontSize={12}
              width={140}
              tick={{ fill: '#D1D5DB' }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#E5E7EB' }}
              formatter={(value: any, _name: any, props: any) => [
                `${safeNumber(value, 0)} (${safeNumber(props.payload?.percentage, 0).toFixed(1)}%)`,
                'Count'
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {safeData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

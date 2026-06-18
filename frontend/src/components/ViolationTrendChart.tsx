import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyTrend } from '../types';
import { Activity } from 'lucide-react';
import { safeText, safeNumber } from '../utils/safe';

interface ViolationTrendChartProps {
  data: DailyTrend[];
}

export const ViolationTrendChart: React.FC<ViolationTrendChartProps> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="glass-panel p-6 h-full min-h-[300px] flex flex-col items-center justify-center text-gray-500">
        <Activity size={48} className="mb-4 opacity-50" />
        <p>No trend data available for this period</p>
      </div>
    );
  }

  const safeData = data.map(item => ({
    date: safeText(item.date, new Date().toISOString()),
    violations: safeNumber(item.violations, 0),
    resolved: safeNumber(item.resolved, 0)
  }));

  return (
    <div className="glass-panel p-6 h-full min-h-[300px] flex flex-col">
      <h3 className="text-lg font-bold text-white mb-4">Daily Violation Trends</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#D1D5DB" 
              fontSize={12} 
              tickMargin={10}
              tickFormatter={(val) => {
                try {
                  const date = new Date(val);
                  if (isNaN(date.getTime())) return "Unknown";
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                } catch {
                  return "Unknown";
                }
              }}
            />
            <YAxis stroke="#D1D5DB" fontSize={12} tickMargin={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Line 
              type="monotone" 
              dataKey="violations" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Violations"
            />
            <Line 
              type="monotone" 
              dataKey="resolved" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Resolved"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

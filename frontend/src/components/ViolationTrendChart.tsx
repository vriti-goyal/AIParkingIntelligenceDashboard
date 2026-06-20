import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <div className="glass-panel p-6 h-full min-h-[300px] flex flex-col border border-gray-800/60 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Activity className="text-primary" size={18} />
        Daily Violation Trends
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={safeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.4} />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF" 
              fontSize={11} 
              tickMargin={12}
              tickLine={false}
              axisLine={false}
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
            <YAxis stroke="#9CA3AF" fontSize={11} tickMargin={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#374151', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#E5E7EB', fontSize: '13px', fontWeight: 500 }}
              labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="violations" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorViolations)"
              activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 0, stroke: '#fff' }}
              name="Violations"
            />
            <Area 
              type="monotone" 
              dataKey="resolved" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorResolved)"
              activeDot={{ r: 6, fill: '#8B5CF6', strokeWidth: 0, stroke: '#fff' }}
              name="Resolved"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

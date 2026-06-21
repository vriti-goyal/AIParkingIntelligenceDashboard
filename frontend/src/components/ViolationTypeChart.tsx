import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ViolationTypeTrend } from '../types';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatViolationType, safeNumber } from '../utils/safe';

interface ViolationTypeChartProps {
  data: ViolationTypeTrend[];
}

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#4B5563'];

export const ViolationTypeChart: React.FC<ViolationTypeChartProps> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="glass-panel p-6 h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400">
        <div className="bg-gray-800/50 p-4 rounded-full mb-4">
          <PieChartIcon size={48} className="opacity-70 text-gray-500" />
        </div>
        <p className="font-medium text-lg">No violation data</p>
        <p className="text-sm mt-1 text-center">Data required to render the violation type chart is missing.</p>
      </div>
    );
  }

  // Format and aggregate data
  const aggregatedMap = new Map<string, { type: string, count: number, percentage: number }>();
  
  data.forEach(item => {
    const formattedType = formatViolationType(item.violation_type).trim() || 'Unknown';
    const count = safeNumber(item.count, 0);
    const percentage = safeNumber(item.percentage, 0);
    
    if (aggregatedMap.has(formattedType)) {
      const existing = aggregatedMap.get(formattedType)!;
      existing.count += count;
      existing.percentage += percentage;
    } else {
      aggregatedMap.set(formattedType, { type: formattedType, count, percentage });
    }
  });

  const sortedData = Array.from(aggregatedMap.values()).sort((a, b) => b.count - a.count);
  
  // Keep Top 6, aggregate the rest into "Other"
  const topData = sortedData.slice(0, 6);
  if (sortedData.length > 6) {
    const others = sortedData.slice(6);
    const othersCount = others.reduce((acc, curr) => acc + curr.count, 0);
    const othersPercentage = others.reduce((acc, curr) => acc + curr.percentage, 0);
    topData.push({
      type: "Other Violations",
      count: othersCount,
      percentage: othersPercentage
    });
  }

  return (
    <div className="glass-panel p-5 md:p-6 h-full min-h-[400px] flex flex-col group">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          <div className="p-1.5 bg-primary/20 rounded-md border border-primary/30">
            <PieChartIcon className="text-primary" size={16} />
          </div>
          Violations by Type
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold border border-gray-700/50 px-2 py-1 rounded-md bg-gray-800/30">
          Distribution
        </span>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topData}
              cx="40%"
              cy="50%"
              innerRadius={75}
              outerRadius={105}
              paddingAngle={4}
              dataKey="count"
              nameKey="type"
              stroke="none"
              cornerRadius={6}
            >
              {topData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PIE_COLORS[index % PIE_COLORS.length]} 
                  style={{ filter: `drop-shadow(0px 4px 6px ${PIE_COLORS[index % PIE_COLORS.length]}40)` }}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              itemStyle={{ color: '#E5E7EB', fontSize: '13px', fontWeight: 600 }}
              formatter={(value: any, name: any) => [
                `${safeNumber(value, 0).toLocaleString()}`,
                name
              ]}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              iconType="circle"
              wrapperStyle={{ 
                fontSize: '11px', 
                color: '#D1D5DB', 
                width: '45%', 
                paddingLeft: '10px',
                lineHeight: '24px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

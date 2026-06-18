import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PoliceStationWorkload } from '../types';
import { Shield } from 'lucide-react';
import { safeText, safeNumber } from '../utils/safe';

interface PoliceStationChartProps {
  data: PoliceStationWorkload[];
}

export const PoliceStationChart: React.FC<PoliceStationChartProps> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="glass-panel p-6 h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400">
        <div className="bg-gray-800/50 p-4 rounded-full mb-4">
          <Shield size={48} className="opacity-70 text-gray-500" />
        </div>
        <p className="font-medium text-lg">No police station data</p>
        <p className="text-sm mt-1 text-center">Data required to render the police station workload chart is missing.</p>
      </div>
    );
  }

  const safeData = data.map(item => ({
    station_name: item.police_station,
    active_cases: safeNumber(item.count, 0),
    resolved_cases: 0
  }));

  // Sort by total cases (active + resolved) and take top 10
  const top10Data = [...safeData]
    .sort((a, b) => b.active_cases - a.active_cases)
    .slice(0, 10);

  return (
    <div className="glass-panel p-6 h-full min-h-[300px] flex flex-col">
      <h3 className="text-lg font-bold text-white mb-4">Top 10 Police Station Workloads</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top10Data} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} opacity={0.5} />
            <XAxis type="number" stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <YAxis 
              dataKey="station_name" 
              type="category" 
              stroke="#9CA3AF" 
              fontSize={12} 
              width={130}
              tick={{fill: '#D1D5DB'}}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#E5E7EB' }}
              cursor={{fill: '#374151', opacity: 0.4}}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#D1D5DB' }} />
            <Bar dataKey="active_cases" stackId="a" name="Active Cases" fill="#F59E0B" radius={[0, 0, 0, 0]} />
            <Bar dataKey="resolved_cases" stackId="a" name="Resolved Cases" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

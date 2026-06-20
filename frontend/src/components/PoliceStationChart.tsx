import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PoliceStationWorkload } from '../types';
import { Shield } from 'lucide-react';
import { safeNumber } from '../utils/safe';

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
    <div className="glass-panel p-6 h-full min-h-[300px] flex flex-col border border-gray-800/60 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Shield className="text-accent" size={18} />
        Top 10 Police Station Workloads
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top10Data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} vertical={true} opacity={0.3} />
            <XAxis type="number" stroke="#9CA3AF" fontSize={11} tick={{ fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <YAxis 
              dataKey="station_name" 
              type="category" 
              stroke="#9CA3AF" 
              fontSize={11} 
              width={130}
              tick={{fill: '#D1D5DB'}}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#374151', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#E5E7EB', fontSize: '13px', fontWeight: 500 }}
              labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF', paddingTop: '10px' }} />
            <Bar dataKey="active_cases" stackId="a" name="Active Cases" fill="#F59E0B" radius={[0, 0, 0, 0]} barSize={20} />
            <Bar dataKey="resolved_cases" stackId="a" name="Resolved Cases" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

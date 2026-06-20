import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { safeText } from '../utils/safe';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  colorClass?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, colorClass = "text-primary" }) => {
  const safeTitle = safeText(title, "Unknown KPI");
  const safeValue = safeText(value, "0");
  const safeTrend = safeText(trend, "");

  return (
    <div className="glass-panel-hover p-4 md:p-6 flex items-center justify-between h-auto min-h-[100px] border border-gray-800/60 bg-gradient-to-br from-surface/80 to-surface/40 rounded-2xl relative overflow-hidden group shadow-lg">
      {/* Subtle background glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-white opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`} />
      
      <div className="flex flex-col justify-center z-10 relative">
        <p className="text-gray-400 text-[11px] md:text-xs font-medium mb-1.5 uppercase tracking-widest">{safeTitle}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{safeValue}</h3>
        {safeTrend && safeTrend !== "Unknown" && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${safeTrend.startsWith('+') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
              {safeTrend}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">vs last week</span>
          </div>
        )}
      </div>
      
      <div className={`p-3.5 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 flex-shrink-0 z-10 relative shadow-inner group-hover:scale-110 transition-transform duration-300 ${colorClass}`}>
        <Icon size={24} className="md:w-7 md:h-7" strokeWidth={1.5} />
      </div>
    </div>
  );
};

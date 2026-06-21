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
    <div className="glass-panel glass-panel-hover p-5 md:p-6 flex items-center justify-between h-full min-h-[120px] group cursor-default">
      {/* Dynamic ambient glow based on color class */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-current opacity-10 blur-3xl rounded-full ${colorClass} group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`} />
      
      <div className="flex flex-col justify-center z-10 relative">
        <p className="text-gray-400 text-[11px] md:text-xs font-semibold mb-2 uppercase tracking-widest">{safeTitle}</p>
        <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight drop-shadow-sm">{safeValue}</h3>
        {safeTrend && safeTrend !== "Unknown" && (
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-xs font-bold px-2 py-1 rounded-md shadow-sm ${safeTrend.startsWith('+') ? 'bg-danger/20 text-red-400 border border-danger/20' : 'bg-success/20 text-emerald-400 border border-success/20'}`}>
              {safeTrend}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">vs last week</span>
          </div>
        )}
      </div>
      
      <div className={`relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-800/40 backdrop-blur-md border border-white/5 flex-shrink-0 z-10 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out ${colorClass}`}>
        <div className="absolute inset-0 bg-current opacity-10 rounded-2xl blur-md" />
        <Icon size={28} className="md:w-8 md:h-8 relative z-10" strokeWidth={1.5} />
      </div>
    </div>
  );
};

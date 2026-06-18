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
    <div className="glass-panel p-3 md:p-4 flex items-center justify-between h-[85px] transition-transform hover:scale-[1.02]">
      <div className="flex flex-col justify-center">
        <p className="text-gray-400 text-[10px] md:text-xs font-semibold mb-0.5 uppercase tracking-wider">{safeTitle}</p>
        <h3 className="text-xl md:text-2xl font-bold text-white leading-none">{safeValue}</h3>
        {safeTrend && safeTrend !== "Unknown" && (
          <p className="text-[9px] md:text-[10px] text-gray-500 mt-1 font-medium">
            <span className={safeTrend.startsWith('+') ? 'text-danger' : 'text-success'}>
              {safeTrend}
            </span> vs last week
          </p>
        )}
      </div>
      <div className={`p-2.5 rounded-lg bg-gray-800/50 flex-shrink-0 ${colorClass}`}>
        <Icon size={20} className="md:w-6 md:h-6" />
      </div>
    </div>
  );
};

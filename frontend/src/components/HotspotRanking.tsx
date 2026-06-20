import React from 'react';
import type { Hotspot } from '../types';
import { AlertTriangle, Clock, MapPin, Target } from 'lucide-react';

interface HotspotRankingProps {
  hotspots: Hotspot[];
}

import { safeText, safeNumber, formatViolationType } from '../utils/safe';

export const HotspotRanking: React.FC<HotspotRankingProps> = ({ hotspots }) => {
  if (!hotspots || !Array.isArray(hotspots) || hotspots.length === 0) {
    return (
      <div className="glass-panel p-6 h-full flex flex-col items-center justify-center text-gray-400">
        <div className="bg-gray-800/50 p-4 rounded-full mb-4">
          <Target size={48} className="opacity-70 text-gray-500" />
        </div>
        <p className="font-medium text-lg">No hotpots found</p>
        <p className="text-sm mt-1">Try adjusting the filters or uploading new data.</p>
      </div>
    );
  }

  // Sort by priority score and take top 10 safely
  const sorted = [...hotspots]
    .sort((a, b) => safeNumber(b.priority_score) - safeNumber(a.priority_score))
    .slice(0, 10);

  const getPriorityInfo = (score: number) => {
    if (score >= 80) return { label: 'CRITICAL', color: 'bg-danger/10 text-danger border-danger/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]' };
    if (score >= 60) return { label: 'HIGH', color: 'bg-warning/10 text-warning border-warning/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]' };
    if (score >= 40) return { label: 'MEDIUM', color: 'bg-primary/10 text-primary border-primary/40 shadow-[0_0_8px_rgba(59,130,246,0.2)]' };
    return { label: 'LOW', color: 'bg-success/10 text-success border-success/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]' };
  };

  return (
    <div className="glass-panel p-6 h-full flex flex-col border border-gray-800/60 shadow-lg relative overflow-hidden bg-gradient-to-b from-surface/80 to-surface/40">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary opacity-50"></div>
      
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="text-accent" size={22} />
            AI Enforcement Priority
          </h3>
          <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide">TOP 10 PREDICTED CONGESTION NODES</p>
        </div>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {sorted.map((hotspot, idx) => {
          const priorityScore = safeNumber(hotspot.priority_score);
          const badge = getPriorityInfo(priorityScore);
          
          let locationName = safeText(hotspot.junction_name, "");
          if (locationName === "" || locationName.toLowerCase() === "no junction" || locationName.toLowerCase() === "unknown") {
            locationName = safeText(hotspot.police_station, `Zone ${safeText(hotspot.id).substring(0, 4)}`);
          }

          const violationTypeRaw = hotspot.primary_violation_type;
          const violationType = formatViolationType(violationTypeRaw);
          const totalViolations = safeNumber(hotspot.violation_count);
          const peakHour = hotspot.peak_hour ?? "14:00 - 18:00";
          const lat = safeNumber(hotspot.latitude);
          const lng = safeNumber(hotspot.longitude);

          return (
            <div key={`rank-${hotspot.id || idx}`} className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-300 group shadow-sm hover:shadow-md relative overflow-hidden">
              {idx < 3 && <div className={`absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity ${badge.color.split(' ')[1]}`}></div>}
              
              <div className="flex justify-between items-start mb-2 pl-1">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold shrink-0 shadow-inner ${idx === 0 ? 'bg-warning/20 text-warning border border-warning/30' : idx === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/30' : idx === 2 ? 'bg-orange-800/30 text-orange-400 border border-orange-800/50' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-tight group-hover:text-accent transition-colors">{locationName}</h4>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block mt-1 font-medium">
                      {violationType}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-gray-300">
                    Score: {priorityScore.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2.5 pt-2 border-t border-gray-700/30 pl-1">
                <div className="flex items-center gap-1.5 bg-gray-900/50 px-2 py-1 rounded-md" title="Total Violations">
                  <AlertTriangle size={12} className="text-gray-400" />
                  <span className="font-semibold text-gray-300">{totalViolations}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-900/50 px-2 py-1 rounded-md" title="Peak Hour">
                  <Clock size={12} className="text-gray-400" />
                  <span className="font-semibold text-gray-300">{peakHour}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-900/50 px-2 py-1 rounded-md" title="Coordinates">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="font-mono text-[10px]">{lat.toFixed(2)}, {lng.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="text-accent" size={20} />
            AI Enforcement Priority
          </h3>
          <p className="text-xs text-gray-400 mt-1">Top 10 predicted congestion nodes</p>
        </div>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {sorted.map((hotspot, idx) => {
          const priorityScore = safeNumber(hotspot.priority_score);
          const badge = getPriorityInfo(priorityScore);
          
          let locationName = safeText(hotspot.junction_name, "");
          if (locationName === "" || locationName.toLowerCase() === "no junction" || locationName.toLowerCase() === "unknown") {
            locationName = safeText(hotspot.police_station, `Zone ${safeText(hotspot.id).substring(0, 4)}`);
          }

          // Use primary_violation_type per our Hotspot interface, or fallback
          const violationTypeRaw = hotspot.primary_violation_type;
          const violationType = formatViolationType(violationTypeRaw);
          const totalViolations = safeNumber(hotspot.violation_count);
          const peakHour = hotspot.peak_hour ?? "14:00 - 18:00";
          const lat = safeNumber(hotspot.latitude);
          const lng = safeNumber(hotspot.longitude);

          return (
            <div key={`rank-${hotspot.id || idx}`} className="bg-surfaceHover/80 p-2.5 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors group">
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-5 h-5 rounded bg-gray-800 text-[10px] font-bold text-gray-400 group-hover:text-white border border-gray-600 shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white leading-tight">{locationName}</h4>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block mt-0.5">
                      {violationType}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-gray-300">
                    Score: {priorityScore.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-1.5 border-t border-gray-700/50">
                <div className="flex items-center gap-1" title="Total Violations">
                  <AlertTriangle size={10} className="text-gray-500" />
                  <span className="font-semibold text-gray-300">{totalViolations}</span> <span className="hidden sm:inline">cases</span>
                </div>
                <div className="flex items-center gap-1" title="Peak Hour">
                  <Clock size={10} className="text-gray-500" />
                  <span className="font-semibold text-gray-300">{peakHour}</span>
                </div>
                <div className="flex items-center gap-1" title="Coordinates">
                  <MapPin size={10} className="text-gray-500" />
                  <span className="font-mono">{lat.toFixed(2)}, {lng.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

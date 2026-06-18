import React from 'react';
import type { Recommendation } from '../types';
import { Lightbulb, Settings, ShieldAlert, Truck, Route, Clock } from 'lucide-react';
import { safeText } from '../utils/safe';

interface RecommendationPanelProps {
  recommendations: Recommendation[];
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ recommendations }) => {
  if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    return (
      <div className="glass-panel p-6 h-full flex flex-col items-center justify-center text-gray-500">
        <Lightbulb size={48} className="mb-4 opacity-50" />
        <p>No AI recommendations at this time</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deployment': return <Truck className="text-primary mt-0.5" size={18} />;
      case 'infrastructure': return <Settings className="text-secondary mt-0.5" size={18} />;
      case 'policy': return <ShieldAlert className="text-warning mt-0.5" size={18} />;
      default: return <Lightbulb className="text-accent mt-0.5" size={18} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
      case 'high': return 'text-danger border-danger/30 bg-danger/10';
      case 'medium': return 'text-warning border-warning/30 bg-warning/10';
      default: return 'text-primary border-primary/30 bg-primary/10';
    }
  };

  const handleGeneratePlan = () => {
    alert("Patrol route optimization will be added in future scope.");
  };

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Lightbulb className="text-accent" size={20} />
          AI Recommendations
        </h3>
        <button 
          onClick={handleGeneratePlan}
          className="flex items-center gap-2 bg-secondary/20 text-secondary hover:bg-secondary/30 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-medium border border-secondary/30 text-xs"
        >
          <Route size={14} />
          Generate Patrol Plan
        </button>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {recommendations.map((rec, idx) => {
          const type = safeText(rec.type, "general");
          const title = safeText(rec.title, "Unnamed Recommendation");
          const priority = safeText(rec.priority, "low");
          const desc = safeText(rec.description, "No description available.");
          const patrolWindow = safeText(rec.patrol_time_window, "16:00 - 20:00");
          const impact = safeText(rec.expected_impact, "Unknown impact");

          return (
            <div key={`rec-${rec.id || idx}`} className="bg-surfaceHover p-4 rounded-xl border border-gray-700/80 hover:bg-gray-800 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-2.5">
                  {getIcon(type)}
                  <h4 className="text-white font-semibold text-sm leading-tight pt-0.5">{title}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border whitespace-nowrap ml-2 ${getPriorityColor(priority)}`}>
                  {priority}
                </span>
              </div>
              
              <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                {desc}
              </p>
              
              <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-gray-700/50">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Clock size={14} className="text-gray-500" />
                  <span className="font-medium text-gray-400">Patrol Window:</span> 
                  <span className="font-semibold text-white">{patrolWindow}</span>
                </div>
                
                <div className="bg-success/10 border border-success/20 p-2.5 rounded-lg text-xs mt-1">
                  <span className="font-medium text-success">Expected Impact:</span>
                  <p className="text-gray-300 mt-0.5">{impact}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

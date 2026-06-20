import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { 
  SummaryMetrics, 
  Hotspot, 
  MapPoint, 
  DailyTrend, 
  ViolationTypeTrend, 
  PoliceStationWorkload, 
  Recommendation,
  DashboardFilters
} from '../types';

import { KPICard } from '../components/KPICard';
import { HotspotMap } from '../components/HotspotMap';
import { HotspotRanking } from '../components/HotspotRanking';
import { ViolationTrendChart } from '../components/ViolationTrendChart';
import { ViolationTypeChart } from '../components/ViolationTypeChart';
import { PoliceStationChart } from '../components/PoliceStationChart';
import { RecommendationPanel } from '../components/RecommendationPanel';
import { FilterBar } from '../components/FilterBar';
import { UploadData } from '../components/UploadData';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DashboardSkeleton } from '../components/DashboardSkeleton';

import { AlertTriangle, Car, Activity, Clock, ShieldCheck, Map, BarChart2, LayoutDashboard, Database } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'analytics' | 'data'>('overview');
  
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [violationTypes, setViolationTypes] = useState<ViolationTypeTrend[]>([]);
  const [policeWorkload, setPoliceWorkload] = useState<PoliceStationWorkload[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ police_stations: string[], violation_types: string[], vehicle_types: string[] }>({
    police_stations: [], violation_types: [], vehicle_types: []
  });
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        api.getSummary(filters),
        api.getHotspots(filters),
        api.getMapPoints(filters),
        api.getDailyTrends(filters),
        api.getViolationTypes(filters),
        api.getPoliceStationWorkload(filters),
        api.getRecommendations(filters),
        api.getFilterOptions()
      ]);

      const [
        sumData, 
        hotspotData, 
        pointsData, 
        trendsData, 
        typesData, 
        workloadData, 
        recData,
        optionsData
      ] = results;

      setSummary(sumData.status === 'fulfilled' ? sumData.value : null);
      setHotspots(hotspotData.status === 'fulfilled' ? hotspotData.value : []);
      setMapPoints(pointsData.status === 'fulfilled' ? pointsData.value : []);
      setDailyTrends(trendsData.status === 'fulfilled' ? trendsData.value : []);
      setViolationTypes(typesData.status === 'fulfilled' ? typesData.value : []);
      setPoliceWorkload(workloadData.status === 'fulfilled' ? workloadData.value : []);
      setRecommendations(recData.status === 'fulfilled' ? recData.value : []);
      
      if (optionsData.status === 'fulfilled') {
        setFilterOptions(optionsData.value);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error loading dashboard data", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [filters]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Map & Hotspots', icon: Map },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart2 },
    { id: 'data', label: 'Data Management', icon: Database },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-gray-200 flex flex-col xl:flex-row font-sans">
      
      {/* Sidebar Layout */}
      <aside className="w-full xl:w-80 flex-shrink-0 bg-surface/50 border-r border-gray-800 flex flex-col h-auto xl:h-screen sticky top-0 z-20 custom-scrollbar overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-3">
            <Activity className="text-primary" size={28} />
            AI Parking Intelligence
          </h1>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">Illegal Parking Hotspot Detection & Congestion Impact Analysis</p>
        </div>
        
        <div className="flex-1 p-6 flex flex-col gap-8">
          {/* Filters Section */}
          <section className="flex-1">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Filters & Controls</h2>
            <ErrorBoundary fallbackText="Failed to load Filters.">
              <FilterBar 
                filters={filters} 
                onFilterChange={setFilters} 
                onRefresh={fetchData} 
                lastUpdated={lastUpdated}
                isSidebar={true}
                filterOptions={filterOptions}
              />
            </ErrorBoundary>
          </section>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 overflow-y-auto h-screen relative custom-scrollbar">

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-800 pb-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors border-b-2 font-medium text-sm
                    ${activeTab === tab.id 
                      ? 'border-primary text-white bg-primary/10' 
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && !summary ? (
          <div className="glass-panel p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
            <AlertTriangle size={64} className="text-danger mb-4 opacity-80" />
            <h2 className="text-2xl font-bold text-white mb-2">System Error</h2>
            <p className="text-gray-400 mb-6 max-w-md">{error}</p>
            <button 
              onClick={fetchData}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : loading && !summary ? (
          <DashboardSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                  <ErrorBoundary fallbackText="Failed to load Total Violations KPI">
                    <KPICard 
                      title="Total Violations" 
                      value={summary?.total_violations?.toLocaleString() || "0"} 
                      icon={Car} 
                      trend="+5.2%" 
                      colorClass="text-primary"
                    />
                  </ErrorBoundary>
                  <ErrorBoundary fallbackText="Failed to load Critical Hotspots KPI">
                    <KPICard 
                      title="Critical Hotspots" 
                      value={summary?.critical_hotspots || "0"} 
                      icon={AlertTriangle} 
                      trend="+1.0%" 
                      colorClass="text-danger"
                    />
                  </ErrorBoundary>
                  <ErrorBoundary fallbackText="Failed to load Estimated Avg Delay KPI">
                    <KPICard 
                      title="Estimated Avg Delay" 
                      value={summary?.estimated_avg_delay != null ? `${Number(summary.estimated_avg_delay).toFixed(1)} min` : "N/A"} 
                      icon={Clock} 
                      trend="-2.1%" 
                      colorClass="text-warning"
                    />
                  </ErrorBoundary>
                  <ErrorBoundary fallbackText="Failed to load Enforcement Rate KPI">
                    <KPICard 
                      title="Enforcement Rate" 
                      value={summary?.enforcement_rate != null ? `${Number(summary.enforcement_rate).toFixed(1)}%` : "0%"} 
                      icon={ShieldCheck} 
                      trend="+4.3%"
                      colorClass="text-success"
                    />
                  </ErrorBoundary>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-[400px]">
                    <ErrorBoundary fallbackText="Failed to load Hotspot Ranking">
                      <HotspotRanking hotspots={hotspots.slice(0, 5)} />
                    </ErrorBoundary>
                  </div>
                  <div className="h-[400px]">
                    <ErrorBoundary fallbackText="Failed to load AI Recommendations">
                      <RecommendationPanel recommendations={recommendations.slice(0, 5)} />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            )}

            {/* MAP & HOTSPOTS TAB */}
            {activeTab === 'map' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[600px] xl:min-h-[700px]">
                  <div className="lg:col-span-2 xl:col-span-3 h-[600px] xl:h-full min-h-[500px]">
                    <ErrorBoundary fallbackText="Failed to load Hotspot Map">
                      <HotspotMap hotspots={hotspots} mapPoints={mapPoints} isLoading={loading} />
                    </ErrorBoundary>
                  </div>
                  <div className="lg:col-span-1 xl:col-span-1 h-[600px] xl:h-full">
                    <ErrorBoundary fallbackText="Failed to load Hotspot Ranking">
                      <HotspotRanking hotspots={hotspots} />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            )}

            {/* ANALYTICS & TRENDS TAB */}
            {activeTab === 'analytics' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="h-[400px]">
                    <ErrorBoundary fallbackText="Failed to load Daily Trends">
                      <ViolationTrendChart data={dailyTrends} />
                    </ErrorBoundary>
                  </div>
                  <div className="h-[400px]">
                    <ErrorBoundary fallbackText="Failed to load Police Station Workload">
                      <PoliceStationChart data={policeWorkload} />
                    </ErrorBoundary>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="h-[400px]">
                    <ErrorBoundary fallbackText="Failed to load Violation Types">
                      <ViolationTypeChart data={violationTypes} />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            )}

            {/* DATA MANAGEMENT TAB */}
            {activeTab === 'data' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
                <div className="glass-panel p-6 border border-gray-800 rounded-xl">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Database size={24} className="text-primary" />
                    Data Management
                  </h2>
                  <ErrorBoundary fallbackText="Failed to load Upload component.">
                    <UploadData onUploadSuccess={fetchData} />
                  </ErrorBoundary>
                </div>
              </div>
            )}
            
            {/* Footer */}
            <footer className="mt-8 pt-6 pb-2 text-center text-sm text-gray-500 border-t border-gray-800/50">
              <p>AI-powered illegal parking hotspot detection using geospatial clustering and congestion impact scoring.</p>
            </footer>

          </div>
        )}
      </main>
    </div>
  );
};

import React from 'react';
import { Calendar, Filter, RefreshCcw, Shield, Car } from 'lucide-react';
import type { DashboardFilters } from '../types';

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  lastUpdated: Date;
  isSidebar?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onRefresh, lastUpdated, isSidebar = false }) => {
  
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const now = new Date();
    let start_date = '';
    
    if (value === '24h') {
      now.setHours(now.getHours() - 24);
      start_date = now.toISOString();
    } else if (value === '7d') {
      now.setDate(now.getDate() - 7);
      start_date = now.toISOString();
    } else if (value === '30d') {
      now.setDate(now.getDate() - 30);
      start_date = now.toISOString();
    } else {
      start_date = '';
    }
    
    onFilterChange({ ...filters, start_date, end_date: '' });
  };

  const currentRangeValue = () => {
    if (!filters.start_date) return 'all';
    
    const start = new Date(filters.start_date);
    const now = new Date();
    const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (diffHours <= 24) return '24h';
    if (diffHours <= 168) return '7d';
    return '30d';
  };

  const containerClass = isSidebar 
    ? "flex flex-col gap-4" 
    : "glass-panel p-4 flex flex-col md:flex-row justify-between items-center gap-4";

  const wrapperClass = isSidebar
    ? "flex flex-col gap-4 w-full"
    : "flex flex-wrap items-center gap-4 w-full md:w-auto";

  const itemClass = "relative w-full";

  return (
    <div className={containerClass}>
      <div className={wrapperClass}>
        
        {/* Police Station Dropdown */}
        <div className={itemClass}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Shield size={16} className="text-gray-400" />
          </div>
          <select 
            value={filters.police_station || ''}
            onChange={(e) => onFilterChange({ ...filters, police_station: e.target.value || undefined })}
            className="bg-surfaceHover border border-gray-700 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 appearance-none"
          >
            <option value="">All Police Stations</option>
            <option value="Central District">Central District</option>
            <option value="North District">North District</option>
            <option value="South District">South District</option>
          </select>
        </div>

        {/* Violation Type Dropdown */}
        <div className={itemClass}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={16} className="text-gray-400" />
          </div>
          <select 
            value={filters.violation_type || ''}
            onChange={(e) => onFilterChange({ ...filters, violation_type: e.target.value || undefined })}
            className="bg-surfaceHover border border-gray-700 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 appearance-none"
          >
            <option value="">All Violations</option>
            <option value="WRONG PARKING">Wrong Parking</option>
            <option value="PARKING NEAR ROAD CROSSING">Parking Near Road Crossing</option>
            <option value="PARKING ON FOOTPATH">Parking on Footpath</option>
            <option value="NO PARKING">No Parking Zone</option>
          </select>
        </div>

        {/* Vehicle Type Dropdown */}
        <div className={itemClass}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Car size={16} className="text-gray-400" />
          </div>
          <select 
            value={filters.vehicle_type || ''}
            onChange={(e) => onFilterChange({ ...filters, vehicle_type: e.target.value || undefined })}
            className="bg-surfaceHover border border-gray-700 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 appearance-none"
          >
            <option value="">All Vehicles</option>
            <option value="TWO WHEELER">Two Wheeler</option>
            <option value="CAR">Car</option>
            <option value="TRUCK">Truck</option>
            <option value="AUTO">Auto</option>
          </select>
        </div>

        {/* Date Range Dropdown */}
        <div className={itemClass}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={16} className="text-gray-400" />
          </div>
          <select 
            value={currentRangeValue()}
            onChange={handleDateRangeChange}
            className="bg-surfaceHover border border-gray-700 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 appearance-none"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className={`flex items-center gap-4 text-sm text-gray-400 w-full ${isSidebar ? 'flex-col items-start mt-2' : 'justify-between md:justify-end'}`}>
        {!isSidebar && <span className="hidden lg:inline">Last updated: {lastUpdated.toLocaleTimeString()}</span>}
        <div className={`flex items-center gap-2 ${isSidebar ? 'w-full justify-between' : ''}`}>
          <button 
            onClick={() => onFilterChange({})}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2.5 rounded-lg transition-colors font-medium border border-gray-700"
            title="Reset Filters"
          >
            Reset
          </button>
          <button 
            onClick={onRefresh}
            className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2.5 rounded-lg transition-colors font-medium border border-primary/20"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
        {isSidebar && <span className="text-xs text-gray-500 w-full text-center mt-2">Last updated: {lastUpdated.toLocaleTimeString()}</span>}
      </div>
    </div>
  );
};

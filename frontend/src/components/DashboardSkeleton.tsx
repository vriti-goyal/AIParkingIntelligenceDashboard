import React from 'react';
import { Skeleton } from './Skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel p-4 h-[100px] flex items-center justify-between">
            <div className="flex flex-col gap-3 w-2/3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-3/4" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main section: Map & Ranking */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[600px]">
        <div className="xl:col-span-3 h-full glass-panel flex flex-col p-0 overflow-hidden">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
        <div className="h-full glass-panel p-6 flex flex-col gap-4">
          <Skeleton className="h-6 w-1/2 mb-2" />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>

      {/* Bottom section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2 glass-panel p-6 min-h-[300px]">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-[220px] w-full" />
        </div>
        <div className="xl:col-span-1 glass-panel p-6 min-h-[300px]">
          <Skeleton className="h-6 w-1/2 mb-4" />
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        </div>
        <div className="xl:col-span-1 glass-panel p-6 min-h-[300px]">
          <Skeleton className="h-6 w-1/2 mb-4" />
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        </div>
      </div>
    </div>
  );
};

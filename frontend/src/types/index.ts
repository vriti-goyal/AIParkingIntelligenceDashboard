export interface DashboardFilters {
  police_station?: string;
  violation_type?: string;
  vehicle_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface SummaryMetrics {
  total_violations: number;
  total_active_hotspots: number;
  critical_hotspots: number;
  high_risk_zones: number;
  estimated_avg_delay?: string;
  enforcement_rate?: string;
}

export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  severity: "critical" | "high" | "medium" | "low";
  violation_count: number;
  priority_score: number;
  congestion_impact: number;
  primary_violation_type: string;
  police_station?: string;
  junction_name?: string;
  peak_hour?: string;
}

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  violation_type: string;
  severity: string;
  timestamp: string;
  police_station?: string;
  junction_name?: string;
}

export interface DailyTrend {
  date: string;
  violations: number;
  resolved: number;
}

export interface ViolationTypeTrend {
  violation_type: string;
  count: number;
  percentage?: number;
}

export interface PoliceStationWorkload {
  police_station: string;
  count: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: "deployment" | "infrastructure" | "policy" | "patrol";
  priority: "high" | "medium" | "low";
  expected_impact: string;
  patrol_time_window?: string;
}

export interface UploadResponse {
  message: string;
  rows_imported: number;
  rows_skipped: number;
}

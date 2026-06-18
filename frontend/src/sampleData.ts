import type {
  SummaryMetrics,
  Hotspot,
  MapPoint,
  DailyTrend,
  ViolationTypeTrend,
  PoliceStationWorkload,
  Recommendation,
} from "./types";

export const sampleSummary: SummaryMetrics = {
  total_violations: 298445,
  critical_hotspots: 66,
  estimated_avg_delay: 8.7,
  enforcement_rate: 58.0,
  top_violation_type: "WRONG PARKING",
  most_affected_police_station: "Upparpet",
};

export const sampleHotspots: Hotspot[] = [
  {
    id: "1",
    cluster_id: 1,
    latitude: 12.9716,
    longitude: 77.5946,
    violation_count: 850,
    primary_violation_type: "WRONG PARKING",
    severity: "CRITICAL",
    priority_score: 95.5,
    junction_name: "MG Road Junction",
    police_station: "Cubbon Park",
    peak_hour: 17,
  },
  {
    id: "2",
    cluster_id: 2,
    latitude: 12.9345,
    longitude: 77.6266,
    violation_count: 620,
    primary_violation_type: "NO PARKING",
    severity: "HIGH",
    priority_score: 75.0,
    junction_name: "Koramangala Sony World",
    police_station: "Koramangala",
    peak_hour: 19,
  },
  {
    id: "3",
    cluster_id: 3,
    latitude: 13.0012,
    longitude: 77.5702,
    violation_count: 410,
    primary_violation_type: "PARKING NEAR ROAD CROSSING",
    severity: "MEDIUM",
    priority_score: 55.2,
    junction_name: "Malleshwaram 8th Cross",
    police_station: "Malleshwaram",
    peak_hour: 11,
  },
];

export const sampleMapPoints: MapPoint[] = [
  {
    id: "m1",
    latitude: 12.9716,
    longitude: 77.5946,
    location: "MG Road",
    vehicle_type: "CAR",
    violation_type: "WRONG PARKING",
    created_datetime: new Date().toISOString(),
    police_station: "Cubbon Park",
    junction_name: "MG Road Junction",
    validation_status: "Pending",
  },
  {
    id: "m2",
    latitude: 12.9345,
    longitude: 77.6266,
    location: "Koramangala",
    vehicle_type: "TWO WHEELER",
    violation_type: "NO PARKING",
    created_datetime: new Date().toISOString(),
    police_station: "Koramangala",
    junction_name: "Sony World",
    validation_status: "Valid",
  },
];

export const sampleDailyTrends: DailyTrend[] = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    date: d.toISOString(),
    violations: Math.floor(Math.random() * 500) + 1000,
    resolved: Math.floor(Math.random() * 300) + 500,
  };
});

export const sampleViolationTypes: ViolationTypeTrend[] = [
  { violation_type: "WRONG PARKING", count: 125000, percentage: 41.8 },
  { violation_type: "NO PARKING", count: 85000, percentage: 28.4 },
  { violation_type: "PARKING ON FOOTPATH", count: 45000, percentage: 15.0 },
  { violation_type: "PARKING NEAR JUNCTION", count: 25000, percentage: 8.3 },
  { violation_type: "OTHER", count: 18445, percentage: 6.5 },
];

export const samplePoliceStations: PoliceStationWorkload[] = [
  { police_station: "Upparpet", count: 25000, active_cases: 15000, resolved_cases: 10000 },
  { police_station: "Shivajinagar", count: 22000, active_cases: 12000, resolved_cases: 10000 },
  { police_station: "Malleshwaram", count: 18000, active_cases: 8000, resolved_cases: 10000 },
  { police_station: "HAL Old Airport", count: 15000, active_cases: 7000, resolved_cases: 8000 },
  { police_station: "City Market", count: 12000, active_cases: 6000, resolved_cases: 6000 },
];

export const sampleRecommendations: Recommendation[] = [
  {
    title: "Deploy enforcement near MG Road Junction",
    priority: "Critical",
    reason: "High density of Wrong Parking violations during peak hours.",
    recommended_time_window: "16:00 - 18:00",
    expected_impact: "Reduce estimated congestion by 19-24%",
    hotspot_id: 1,
  },
  {
    title: "Deploy enforcement near Koramangala Sony World",
    priority: "High",
    reason: "High density of No Parking violations during peak hours.",
    recommended_time_window: "18:00 - 20:00",
    expected_impact: "Reduce estimated congestion by 15-20%",
    hotspot_id: 2,
  },
];

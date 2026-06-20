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
  total_active_hotspots: 100,
  critical_hotspots: 66,
  high_risk_zones: 34,
  estimated_avg_delay: "8.7",
  enforcement_rate: "58.0",
};

export const sampleHotspots: Hotspot[] = [
  {
    id: "1",
    latitude: 12.9716,
    longitude: 77.5946,
    radius: 100,
    violation_count: 850,
    primary_violation_type: "WRONG PARKING",
    severity: "critical",
    priority_score: 95.5,
    congestion_impact: 90,
    junction_name: "MG Road Junction",
    police_station: "Cubbon Park",
    peak_hour: "17",
  },
  {
    id: "2",
    latitude: 12.9345,
    longitude: 77.6266,
    radius: 80,
    violation_count: 620,
    primary_violation_type: "NO PARKING",
    severity: "high",
    priority_score: 75.0,
    congestion_impact: 70,
    junction_name: "Koramangala Sony World",
    police_station: "Koramangala",
    peak_hour: "19",
  },
  {
    id: "3",
    latitude: 13.0012,
    longitude: 77.5702,
    radius: 60,
    violation_count: 410,
    primary_violation_type: "PARKING NEAR ROAD CROSSING",
    severity: "medium",
    priority_score: 55.2,
    congestion_impact: 50,
    junction_name: "Malleshwaram 8th Cross",
    police_station: "Malleshwaram",
    peak_hour: "11",
  },
];

export const sampleMapPoints: MapPoint[] = [
  {
    id: "m1",
    latitude: 12.9716,
    longitude: 77.5946,
    violation_type: "WRONG PARKING",
    severity: "critical",
    timestamp: new Date().toISOString(),
    police_station: "Cubbon Park",
    junction_name: "MG Road Junction",
  },
  {
    id: "m2",
    latitude: 12.9345,
    longitude: 77.6266,
    violation_type: "NO PARKING",
    severity: "high",
    timestamp: new Date().toISOString(),
    police_station: "Koramangala",
    junction_name: "Sony World",
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
  { police_station: "Upparpet", count: 25000 },
  { police_station: "Shivajinagar", count: 22000 },
  { police_station: "Malleshwaram", count: 18000 },
  { police_station: "HAL Old Airport", count: 15000 },
  { police_station: "City Market", count: 12000 },
];

export const sampleRecommendations: Recommendation[] = [
  {
    id: "r1",
    title: "Deploy enforcement near MG Road Junction",
    priority: "high",
    description: "High density of Wrong Parking violations during peak hours.",
    type: "deployment",
    patrol_time_window: "16:00 - 18:00",
    expected_impact: "Reduce estimated congestion by 19-24%",
  },
  {
    id: "r2",
    title: "Deploy enforcement near Koramangala Sony World",
    priority: "high",
    description: "High density of No Parking violations during peak hours.",
    type: "deployment",
    patrol_time_window: "18:00 - 20:00",
    expected_impact: "Reduce estimated congestion by 15-20%",
  },
];

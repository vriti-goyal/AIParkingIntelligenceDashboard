import axios from "axios";
import type {
  SummaryMetrics,
  Hotspot,
  MapPoint,
  DailyTrend,
  ViolationTypeTrend,
  PoliceStationWorkload,
  Recommendation,
  UploadResponse,
  DashboardFilters,
} from "../types";

import {
  sampleSummary,
  sampleHotspots,
  sampleMapPoints,
  sampleDailyTrends,
  sampleViolationTypes,
  samplePoliceStations,
  sampleRecommendations,
} from "../sampleData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const USE_SAMPLE_DATA = import.meta.env.VITE_USE_SAMPLE_DATA === 'true';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to remove empty strings, nulls, or "all" from params
const cleanFilters = (filters?: DashboardFilters) => {
  if (!filters) return undefined;
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "" && String(value).toLowerCase() !== "all") {
      cleaned[key] = value;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

export const api = {
  getSummary: async (filters?: DashboardFilters): Promise<SummaryMetrics> => {
    if (USE_SAMPLE_DATA) return Promise.resolve(sampleSummary);
    try {
      const response = await apiClient.get<SummaryMetrics>("/summary", { params: cleanFilters(filters) });
      console.log("Response from /summary:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching summary:", error);
      return {
        total_violations: 0,
        total_active_hotspots: 0,
        critical_hotspots: 0,
        high_risk_zones: 0,
      };
    }
  },

  getHotspots: async (filters?: DashboardFilters): Promise<Hotspot[]> => {
    if (USE_SAMPLE_DATA) return Promise.resolve(sampleHotspots);
    try {
      const response = await apiClient.get<Hotspot[]>("/hotspots", { params: cleanFilters(filters) });
      console.log("Response from /hotspots:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching hotspots:", error);
      return [];
    }
  },

  getMapPoints: async (filters?: DashboardFilters): Promise<MapPoint[]> => {
    if (USE_SAMPLE_DATA) return Promise.resolve(sampleMapPoints);
    try {
      const response = await apiClient.get<MapPoint[]>("/map-points", { params: cleanFilters(filters) });
      return response.data;
    } catch (error) {
      console.error("Error fetching map points:", error);
      return [];
    }
  },

  getDailyTrends: async (filters?: DashboardFilters): Promise<DailyTrend[]> => {
    if (USE_SAMPLE_DATA) return Promise.resolve(sampleDailyTrends);
    try {
      const response = await apiClient.get<DailyTrend[]>("/trends/daily", { params: cleanFilters(filters) });
      return response.data;
    } catch (error) {
      console.error("Error fetching daily trends:", error);
      return [];
    }
  },

  getViolationTypes: async (filters?: DashboardFilters): Promise<ViolationTypeTrend[]> => {
    if (USE_SAMPLE_DATA) return Promise.resolve(sampleViolationTypes);
    try {
      const response = await apiClient.get<ViolationTypeTrend[]>("/trends/violation-types", { params: cleanFilters(filters) });
      console.log("Response from /trends/violation-types:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching violation types:", error);
      return [];
    }
  },

  getPoliceStationWorkload: async (filters?: DashboardFilters): Promise<PoliceStationWorkload[]> => {
    if (USE_SAMPLE_DATA) return Promise.resolve(samplePoliceStations);
    try {
      const response = await apiClient.get<PoliceStationWorkload[]>("/trends/police-stations", { params: cleanFilters(filters) });
      console.log("Response from /trends/police-stations:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching police station workload:", error);
      return [];
    }
  },

  getRecommendations: async (filters?: DashboardFilters): Promise<Recommendation[]> => {
    if (USE_SAMPLE_DATA) return Promise.resolve(sampleRecommendations);
    try {
      const response = await apiClient.get<Recommendation[]>("/recommendations", { params: cleanFilters(filters) });
      return response.data;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
  },

  getFilterOptions: async (): Promise<{ police_stations: string[], violation_types: string[], vehicle_types: string[] }> => {
    if (USE_SAMPLE_DATA) {
      return Promise.resolve({
        police_stations: ["Central District", "North District", "South District"],
        violation_types: ["WRONG PARKING", "PARKING NEAR ROAD CROSSING", "PARKING ON FOOTPATH", "NO PARKING"],
        vehicle_types: ["TWO WHEELER", "CAR", "TRUCK", "AUTO"]
      });
    }
    try {
      const response = await apiClient.get("/filters");
      return response.data;
    } catch (error) {
      console.error("Error fetching filter options:", error);
      return { police_stations: [], violation_types: [], vehicle_types: [] };
    }
  },

  uploadCSV: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await apiClient.post<UploadResponse>("/import-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading CSV:", error);
      throw error;
    }
  },
};


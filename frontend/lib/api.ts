import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================
// TYPES
// =========================================

export interface RouteRequest {
  source: string;
  destination: string;
  travel_date: string;
  booking_date: string;
  budget?: number;
  preferred_time?: string;
}

export interface RouteSegment {
  mode: "flight" | "train";
  from_city: string;
  from_code: string;
  to_city: string;
  to_code: string;
  cost: number;
  distance_km?: number;
}

export interface RouteResponse {
  route_type: string;

  // Enriched city names
  source_city?: string;
  destination_city?: string;
  from_city?: string;
  from_code?: string;
  to_city?: string;
  to_code?: string;

  // Legacy fields
  from_airport?: string;
  to_airport?: string;
  from_station?: string;
  to_station?: string;

  // Distance
  airport_distance_to_destination?: number;
  station_distance_to_destination?: number;
  source_airport_distance?: number;
  source_station_distance?: number;

  // Cost
  total_cost: number;
  flight_cost?: number;
  train_cost?: number;

  // Time
  travel_time?: string;

  // AI features
  recommendation?: string;
  recommendation_reason?: string;
  tags?: string[];

  // Multimodal segments
  segments?: RouteSegment[];

  // Train info
  train_distance_km?: number;
}

export interface LocationItem {
  name: string;
  code: string;
  type: "airport" | "station";
  state?: string;
  display: string;
}

// =========================================
// API METHODS
// =========================================

export const routeAPI = {
  getLocations: async (query?: string): Promise<LocationItem[]> => {
    try {
      const params = query ? { q: query } : {};
      const response = await api.get("/locations", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
  },

  generateRoutes: async (params: RouteRequest): Promise<RouteResponse[]> => {
    try {
      const response = await api.post("/generate_routes", params);
      return response.data;
    } catch (error) {
      console.error("Error generating routes:", error);
      throw error;
    }
  },

  getRoutes: async (
    source: string,
    destination: string,
    travel_date: string,
    booking_date: string,
    budget?: number
  ): Promise<RouteResponse[]> => {
    try {
      const response = await api.post("/routes", {
        source,
        destination,
        travel_date,
        booking_date,
        budget: budget || null,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching routes:", error);
      throw error;
    }
  },
};

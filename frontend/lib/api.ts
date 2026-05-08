import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RouteRequest {
  source: string;
  destination: string;
  travel_date: string;
  booking_date: string;
  budget?: number;
  preferred_time?: string;
}

export interface RouteResponse {
  route_type: string;
  from_airport?: string;
  to_airport?: string;
  from_station?: string;
  to_station?: string;
  airport_distance_to_destination?: number;
  station_distance_to_destination?: number;
  total_cost: number;
  travel_time?: string;
  recommendation?: string;
}

export const routeAPI = {
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
    booking_date: string
  ): Promise<RouteResponse[]> => {
    try {
      const response = await api.post("/routes", {
        source,
        destination,
        travel_date,
        booking_date,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching routes:", error);
      throw error;
    }
  },
};

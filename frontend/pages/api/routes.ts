import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { source, destination, travel_date, booking_date } = req.body;

    const response = await axios.post(`${API_BASE_URL}/routes`, {
      source,
      destination,
      travel_date,
      booking_date,
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(error?.response?.status || 500).json({
      error: error?.response?.data?.detail || "Failed to fetch routes",
    });
  }
}

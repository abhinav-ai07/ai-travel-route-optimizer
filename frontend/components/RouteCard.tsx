import React from "react";
import {
  Plane,
  Train,
  MapPin,
  DollarSign,
  TrendingDown,
  Star,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";
import { RouteResponse } from "../lib/api";

interface RouteCardProps {
  route: RouteResponse;
  routeType: string;
  index: number;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, routeType, index }) => {
  const isFlightOnly = routeType === "✈️ Direct Flights";
  const isTrainOnly = routeType === "🚆 Direct Trains";
  const isFlightTrain = routeType === "🛫➡️🚆 Flight → Train";
  const isTrainFlight = routeType === "🚆➡️🛫 Train → Flight";

  const getRecommendationTag = () => {
    if (!route.total_cost) return null;

    // Simple logic for demo - you can enhance with actual comparison
    if (route.total_cost < 200) {
      return { label: "💰 Budget Friendly", color: "badge-success" };
    } else if (route.total_cost < 500) {
      return { label: "⭐ Recommended", color: "badge-info" };
    } else {
      return { label: "⚡ Premium", color: "badge-warning" };
    }
  };

  const recommendation = getRecommendationTag();

  return (
    <div className="group glass rounded-2xl p-6 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 card-hover overflow-hidden relative">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {isFlightOnly || isFlightTrain ? (
              <Plane className="w-8 h-8 text-cyan-400" />
            ) : isTrainOnly || isTrainFlight ? (
              <Train className="w-8 h-8 text-purple-400" />
            ) : (
              <div className="flex gap-1">
                <Plane className="w-6 h-6 text-cyan-400" />
                <ArrowRight className="w-6 h-6 text-slate-400" />
                <Train className="w-6 h-6 text-purple-400" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-white text-lg">
                {isFlightOnly
                  ? "Direct Flight"
                  : isTrainOnly
                  ? "Direct Train"
                  : isFlightTrain
                  ? "Flight → Train"
                  : "Train → Flight"}
              </h3>
              <p className="text-xs text-slate-400">Option {index + 1}</p>
            </div>
          </div>

          {recommendation && (
            <span className={`text-xs font-semibold whitespace-nowrap ${recommendation.color}`}>
              {recommendation.label}
            </span>
          )}
        </div>

        {/* Route Details */}
        <div className="space-y-3 mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800/50">
          {/* From/To */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Departure</p>
              <p className="font-semibold text-cyan-300">
                {isFlightOnly || isFlightTrain
                  ? route.from_airport
                  : route.from_station}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Arrival</p>
              <p className="font-semibold text-cyan-300">
                {isFlightOnly || isFlightTrain
                  ? route.to_airport
                  : route.to_station}
              </p>
            </div>
          </div>

          {/* Distance to destination */}
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              {(route.airport_distance_to_destination ||
                route.station_distance_to_destination ||
                0).toFixed(1)}{" "}
              km to destination
            </span>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">
            Total Estimated Cost
          </p>
          <p className="text-3xl font-bold text-cyan-300">
            ₹{route.total_cost.toFixed(2)}
          </p>
          <p className="text-xs text-cyan-400/70 mt-1">All-inclusive fare</p>
        </div>

        {/* Travel Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {route.travel_time && (
            <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg">
              <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div className="text-xs">
                <p className="text-slate-400">Duration</p>
                <p className="font-semibold text-white">{route.travel_time}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg">
            <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="text-slate-400">Route</p>
              <p className="font-semibold text-white">
                {isFlightTrain ? "Multimodal" : "Direct"}
              </p>
            </div>
          </div>
        </div>

        {/* Features/Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {isFlightOnly && (
            <>
              <span className="badge-info">Non-stop</span>
              <span className="badge-info">Fastest Option</span>
            </>
          )}
          {isTrainOnly && (
            <>
              <span className="badge-info">Scenic Route</span>
              <span className="badge-success">Eco-Friendly</span>
            </>
          )}
          {isFlightTrain && (
            <>
              <span className="badge-info">Multimodal</span>
              <span className="badge-warning">2 Transfers</span>
            </>
          )}
          {isTrainFlight && (
            <>
              <span className="badge-info">Multimodal</span>
              <span className="badge-warning">2 Transfers</span>
            </>
          )}
        </div>

        {/* CTA Button */}
        <button className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn">
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default RouteCard;

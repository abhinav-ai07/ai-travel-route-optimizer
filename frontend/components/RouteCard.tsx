import React from "react";
import {
  Plane,
  Train,
  MapPin,
  ArrowRight,
  Zap,
  Clock,
  IndianRupee,
  Info,
} from "lucide-react";
import { RouteResponse, RouteSegment } from "../lib/api";

interface RouteCardProps {
  route: RouteResponse;
  routeType: string;
  index: number;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, routeType, index }) => {
  const isMultimodal =
    route.route_type === "flight_plus_train" ||
    route.route_type === "train_plus_flight";

  // Get display names
  const sourceCityDisplay = route.source_city || route.from_city || "—";
  const destCityDisplay = route.destination_city || route.to_city || "—";

  // Get tag styles
  const getTagStyle = (tag: string) => {
    switch (tag) {
      case "Cheapest":
        return "tag-cheapest";
      case "Fastest":
        return "tag-fastest";
      case "Recommended":
        return "tag-recommended";
      case "Budget Friendly":
        return "tag-budget";
      case "Best Connectivity":
        return "tag-connectivity";
      default:
        return "tag-default";
    }
  };

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "Cheapest":
        return "💰";
      case "Fastest":
        return "⚡";
      case "Recommended":
        return "⭐";
      case "Budget Friendly":
        return "🏷️";
      case "Best Connectivity":
        return "🔗";
      default:
        return "📌";
    }
  };

  // Get route type label and icon
  const getRouteTypeInfo = () => {
    switch (route.route_type) {
      case "direct_flight":
        return { label: "Direct Flight", icon: "✈️", accent: "accent-flight" };
      case "direct_train":
        return { label: "Direct Train", icon: "🚆", accent: "accent-train" };
      case "flight_plus_train":
        return { label: "Flight → Train", icon: "✈️🚆", accent: "accent-multi-ft" };
      case "train_plus_flight":
        return { label: "Train → Flight", icon: "🚆✈️", accent: "accent-multi-tf" };
      default:
        return { label: "Route", icon: "📍", accent: "" };
    }
  };

  const routeInfo = getRouteTypeInfo();

  // Render a single segment in the timeline
  const renderSegment = (segment: RouteSegment, segIndex: number, total: number) => {
    const isLast = segIndex === total - 1;
    const isFlight = segment.mode === "flight";

    return (
      <div key={segIndex} className="timeline-segment">
        {/* Timeline dot and line */}
        <div className="timeline-track">
          <div className={`timeline-dot ${isFlight ? "dot-flight" : "dot-train"}`}>
            {isFlight ? (
              <Plane className="w-3.5 h-3.5 text-white" />
            ) : (
              <Train className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          {!isLast && <div className="timeline-line"></div>}
        </div>

        {/* Segment details */}
        <div className="timeline-content">
          <div className="segment-header">
            <span className={`segment-mode ${isFlight ? "mode-flight" : "mode-train"}`}>
              {isFlight ? "✈️ Flight" : "🚆 Train"}
            </span>
            <span className="segment-cost">
              ₹{segment.cost?.toLocaleString("en-IN") || "—"}
            </span>
          </div>
          <div className="segment-route">
            <div className="segment-city">
              <span className="city-name">{segment.from_city}</span>
              <span className="city-code">{segment.from_code}</span>
            </div>
            <div className="segment-arrow">
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </div>
            <div className="segment-city">
              <span className="city-name">{segment.to_city}</span>
              <span className="city-code">{segment.to_code}</span>
            </div>
          </div>
          {segment.distance_km && segment.distance_km > 0 && (
            <div className="segment-distance">
              <MapPin className="w-3 h-3" />
              <span>{segment.distance_km} km</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render simple route (non-multimodal) with city names
  const renderSimpleRoute = () => {
    const fromCode = route.from_code || route.from_airport || route.from_station || "";
    const toCode = route.to_code || route.to_airport || route.to_station || "";
    const fromCity = route.from_city || sourceCityDisplay;
    const toCity = route.to_city || destCityDisplay;

    return (
      <div className="simple-route-display">
        <div className="route-endpoint">
          <div className="endpoint-icon">
            {route.route_type === "direct_flight" ? (
              <Plane className="w-5 h-5 text-cyan-400" />
            ) : (
              <Train className="w-5 h-5 text-purple-400" />
            )}
          </div>
          <div>
            <div className="endpoint-city">{fromCity}</div>
            <div className="endpoint-code">{fromCode}</div>
          </div>
        </div>

        <div className="route-flow-line">
          <div className="flow-line"></div>
          <div className="flow-icon">
            {route.route_type === "direct_flight" ? (
              <Plane className="w-4 h-4 text-cyan-400 transform rotate-90" />
            ) : (
              <Train className="w-4 h-4 text-purple-400" />
            )}
          </div>
          <div className="flow-line"></div>
        </div>

        <div className="route-endpoint">
          <div className="endpoint-icon endpoint-icon-dest">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="endpoint-city">{toCity}</div>
            <div className="endpoint-code">{toCode}</div>
          </div>
        </div>
      </div>
    );
  };

  // Distance info (smart — only shown when > 0)
  const distance =
    route.airport_distance_to_destination ||
    route.station_distance_to_destination ||
    0;

  return (
    <div
      className={`route-card ${routeInfo.accent}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Top accent line */}
      <div className="route-card-accent"></div>

      {/* Header */}
      <div className="route-card-header">
        <div className="route-type-info">
          <span className="route-type-icon">{routeInfo.icon}</span>
          <div>
            <h3 className="route-type-label">{routeInfo.label}</h3>
            <span className="route-option-num">Option {index + 1}</span>
          </div>
        </div>

        {/* Tags */}
        {route.tags && route.tags.length > 0 && (
          <div className="route-tags">
            {route.tags.map((tag, i) => (
              <span key={i} className={`route-tag ${getTagStyle(tag)}`}>
                {getTagIcon(tag)} {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Journey Header */}
      <div className="journey-header">
        <span className="journey-city">{sourceCityDisplay}</span>
        <ArrowRight className="w-5 h-5 text-slate-500" />
        <span className="journey-city">{destCityDisplay}</span>
      </div>

      {/* Route Body */}
      <div className="route-card-body">
        {isMultimodal && route.segments ? (
          <div className="timeline-container">
            {route.segments.map((seg, i) =>
              renderSegment(seg, i, route.segments!.length)
            )}
            {/* Final destination dot */}
            <div className="timeline-segment timeline-end">
              <div className="timeline-track">
                <div className="timeline-dot dot-destination">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="timeline-content">
                <span className="text-sm font-semibold text-emerald-400">
                  {destCityDisplay}
                </span>
                <span className="text-xs text-slate-500">Destination</span>
              </div>
            </div>
          </div>
        ) : (
          renderSimpleRoute()
        )}

        {/* Distance to destination (only if > 0) */}
        {distance > 0 && (
          <div className="distance-badge">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {distance.toFixed(1)} km from {destCityDisplay}
            </span>
          </div>
        )}
      </div>

      {/* Cost Section */}
      <div className="route-cost-section">
        {isMultimodal && (
          <div className="cost-breakdown">
            {route.flight_cost && (
              <div className="cost-item">
                <span className="cost-label">✈️ Flight</span>
                <span className="cost-value">
                  ₹{route.flight_cost.toLocaleString("en-IN")}
                </span>
              </div>
            )}
            {route.train_cost && (
              <div className="cost-item">
                <span className="cost-label">🚆 Train</span>
                <span className="cost-value">
                  ₹{route.train_cost.toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="cost-divider"></div>
          </div>
        )}
        <div className="cost-total">
          <div>
            <span className="cost-total-label">Total Estimated Cost</span>
            <span className="cost-total-value">
              ₹{route.total_cost.toLocaleString("en-IN")}
            </span>
          </div>
          <IndianRupee className="w-8 h-8 text-cyan-400/30" />
        </div>
      </div>

      {/* Recommendation reason */}
      {route.recommendation_reason && (
        <div className="recommendation-reason">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{route.recommendation_reason}</span>
        </div>
      )}
    </div>
  );
};

export default RouteCard;

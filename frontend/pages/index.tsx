import React, { useMemo, useState } from "react";
import {
  Plane,
  Train,
  ArrowRight,
  RotateCcw,
  TrendingDown,
  Zap,
  Star,
  BarChart3,
} from "lucide-react";
import { routeAPI, RouteResponse, RouteSegment } from "../lib/api";
import toast from "react-hot-toast";
import SearchForm from "../components/SearchForm";
import RouteCard from "../components/RouteCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import HeroSection from "../components/HeroSection";
import BackgroundGradient from "../components/BackgroundGradient";

interface SearchParams {
  source: string;
  destination: string;
  travelDate: string;
  budget: string;
}

export default function Home() {
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: SearchParams) => {
    try {
      setLoading(true);
      setSearchParams(params);
      setSearched(true);
      setError(null);

      const today = new Date().toISOString().split("T")[0];
      const budget = params.budget ? parseFloat(params.budget) : undefined;

      const routeData = await routeAPI.getRoutes(
        params.source,
        params.destination,
        params.travelDate,
        today,
        budget
      );

      setRoutes(routeData || []);

      if (!routeData || routeData.length === 0) {
        toast.error("No routes found. Please try different locations.");
      } else {
        toast.success(`Found ${routeData.length} route(s)!`);
      }
    } catch (error: any) {
      console.error("Error fetching routes:", error);
      const errorMsg =
        error?.response?.data?.detail || "Failed to fetch routes. Please try again.";
      toast.error(errorMsg);
      setError(errorMsg);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeCity = (value?: string) =>
    (value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const isSameLogicalPlace = (a?: string, b?: string) => {
    const normalizedA = normalizeCity(a);
    const normalizedB = normalizeCity(b);
    if (!normalizedA || !normalizedB) {
      return false;
    }
    return (
      normalizedA === normalizedB ||
      normalizedA.includes(normalizedB) ||
      normalizedB.includes(normalizedA)
    );
  };

  const isPracticalMultimodal = (route: RouteResponse) => {
    if (!route.segments || route.segments.length !== 2) {
      return true;
    }

    const [first, second] = route.segments as RouteSegment[];

    if (!first || !second) {
      return false;
    }

    if (
      (first.from_code && first.to_code && first.from_code === first.to_code) ||
      (second.from_code && second.to_code && second.from_code === second.to_code)
    ) {
      return false;
    }

    if (
      isSameLogicalPlace(first.from_city, first.to_city) ||
      isSameLogicalPlace(second.from_city, second.to_city)
    ) {
      return false;
    }

    if (
      first.to_code && second.from_code &&
      first.to_code !== second.from_code &&
      !isSameLogicalPlace(first.to_city, second.from_city)
    ) {
      return false;
    }

    return true;
  };

  const filteredRoutes = useMemo(() => {
    const seen = new Set<string>();
    return routes.filter((route) => {
      if (
        route.route_type === "flight_plus_train" ||
        route.route_type === "train_plus_flight"
      ) {
        if (!isPracticalMultimodal(route)) {
          return false;
        }
      }

      const signatureParts = [route.route_type];
      if (route.segments) {
        signatureParts.push(
          route.segments
            .map((segment) => `${segment.mode}:${segment.from_code}->${segment.to_code}`)
            .join("|")
        );
      } else {
        signatureParts.push(`${route.from_code || route.from_airport}->${route.to_code || route.to_airport}`);
      }
      signatureParts.push(String(route.total_cost));
      const signature = signatureParts.join("::");

      if (seen.has(signature)) {
        return false;
      }
      seen.add(signature);
      return true;
    });
  }, [routes]);

  const categorizedRoutes = {
    flight: filteredRoutes.filter((r) => r.route_type === "direct_flight"),
    train: filteredRoutes.filter((r) => r.route_type === "direct_train"),
    flightTrain: filteredRoutes.filter((r) => r.route_type === "flight_plus_train"),
    trainFlight: filteredRoutes.filter((r) => r.route_type === "train_plus_flight"),
  };

  // Compute summary stats
  const cheapestRoute = filteredRoutes.length
    ? filteredRoutes.reduce((a, b) => (a.total_cost < b.total_cost ? a : b))
    : null;
  const fastestRoute = filteredRoutes.find((r) => r.route_type === "direct_flight") || null;

  const routeCategories = [
    {
      key: "flight",
      title: "Direct Flights",
      subtitle: "Non-stop air travel between cities",
      icon: "✈️",
      routes: categorizedRoutes.flight,
      accentClass: "section-flight",
      gradientClass: "gradient-flight",
    },
    {
      key: "train",
      title: "Direct Trains",
      subtitle: "Rail journey between stations",
      icon: "🚆",
      routes: categorizedRoutes.train,
      accentClass: "section-train",
      gradientClass: "gradient-train",
    },
    {
      key: "flightTrain",
      title: "Flight → Train",
      subtitle: "Fly to a hub city, then take a train to destination",
      icon: "✈️→🚆",
      routes: categorizedRoutes.flightTrain,
      accentClass: "section-ft",
      gradientClass: "gradient-ft",
    },
    {
      key: "trainFlight",
      title: "Train → Flight",
      subtitle: "Train to a hub airport, then fly to destination",
      icon: "🚆→✈️",
      routes: categorizedRoutes.trainFlight,
      accentClass: "section-tf",
      gradientClass: "gradient-tf",
    },
  ];

  return (
    <>
      <BackgroundGradient />
      <div className="min-h-screen overflow-hidden">
        {/* Navigation Bar */}
        <nav className="app-navbar">
          <div className="navbar-inner">
            <div className="navbar-brand">
              <span className="brand-icon">✈️</span>
              <span className="brand-text">RouteAI</span>
              <span className="brand-badge">AI Travel Planner</span>
            </div>
            <div className="navbar-status">
              <div className="status-dot"></div>
              <span className="status-text">Live</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10">
          {!searched ? (
            <>
              <HeroSection />
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="search-section">
                <SearchForm onSearch={handleSearch} loading={loading} />
              </div>
            </>
          ) : (
            <div className="results-container">
              {/* Search form always visible at top */}
              <div className="results-search-wrap">
                <SearchForm onSearch={handleSearch} loading={loading} />
              </div>

              {/* Results Header */}
              <div className="results-header">
                <div className="results-header-content">
                  <div>
                    <h2 className="results-title">
                      🗺️ Route Results
                    </h2>
                    <p className="results-subtitle">
                      <span className="results-city">{searchParams?.source}</span>
                      <ArrowRight className="w-4 h-4 inline mx-2 text-slate-500" />
                      <span className="results-city">{searchParams?.destination}</span>
                      <span className="results-date">• {searchParams?.travelDate}</span>
                      {searchParams?.budget && (
                        <span className="results-budget">• Budget: ₹{parseInt(searchParams.budget).toLocaleString("en-IN")}</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearched(false);
                      setRoutes([]);
                      setError(null);
                    }}
                    className="results-new-search"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New Search
                  </button>
                </div>

                {/* Summary Stats */}
                {filteredRoutes.length > 0 && (
                  <div className="results-stats">
                    <div className="stat-card">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      <div>
                        <span className="stat-value">{filteredRoutes.length}</span>
                        <span className="stat-label">Routes Found</span>
                      </div>
                    </div>
                    {cheapestRoute && (
                      <div className="stat-card">
                        <TrendingDown className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="stat-value">₹{cheapestRoute.total_cost.toLocaleString("en-IN")}</span>
                          <span className="stat-label">Cheapest</span>
                        </div>
                      </div>
                    )}
                    {fastestRoute && (
                      <div className="stat-card">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <div>
                          <span className="stat-value">₹{fastestRoute.total_cost.toLocaleString("en-IN")}</span>
                          <span className="stat-label">Fastest (Flight)</span>
                        </div>
                      </div>
                    )}
                    <div className="stat-card">
                      <Star className="w-5 h-5 text-purple-400" />
                      <div>
                        <span className="stat-value">
                          {[
                            categorizedRoutes.flight.length > 0 ? "Flight" : "",
                            categorizedRoutes.train.length > 0 ? "Train" : "",
                            categorizedRoutes.flightTrain.length > 0 ? "Multi" : "",
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                        <span className="stat-label">Modes Available</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Route Results */}
              {loading ? (
                <LoadingState />
              ) : routes.length === 0 ? (
                <EmptyState
                  type="no-results"
                  onRetry={() => {
                    setSearched(false);
                  }}
                />
              ) : (
                <div className="route-grid-section">
                  <div className="route-grid-head">
                    <div>
                      <h3 className="section-title">Compare Travel Options</h3>
                      <p className="section-subtitle">
                        View flights, trains, and hybrid routes side-by-side for faster decision making.
                      </p>
                    </div>
                    <div className="section-count">
                      {filteredRoutes.length} option{filteredRoutes.length > 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="route-cards-grid">
                    {filteredRoutes.map((route, idx) => (
                      <RouteCard
                        key={`${route.route_type}-${idx}`}
                        route={route}
                        routeType={route.route_type}
                        index={idx}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-inner">
            <p className="footer-text">
              © 2026 RouteAI — AI Travel Route Optimizer • Powered by advanced ML & multimodal analysis
            </p>
            <p className="footer-subtext">
              💡 Making travel smarter, faster, and more affordable
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

import React, { useState } from "react";
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
import { routeAPI, RouteResponse } from "../lib/api";
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

  const categorizedRoutes = {
    flight: routes.filter((r) => r.route_type === "direct_flight"),
    train: routes.filter((r) => r.route_type === "direct_train"),
    flightTrain: routes.filter((r) => r.route_type === "flight_plus_train"),
    trainFlight: routes.filter((r) => r.route_type === "train_plus_flight"),
  };

  // Compute summary stats
  const cheapestRoute = routes.length
    ? routes.reduce((a, b) => (a.total_cost < b.total_cost ? a : b))
    : null;
  const fastestRoute = routes.find((r) => r.route_type === "direct_flight") || null;

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
                {routes.length > 0 && (
                  <div className="results-stats">
                    <div className="stat-card">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      <div>
                        <span className="stat-value">{routes.length}</span>
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
              ) : error ? (
                <EmptyState
                  type="error"
                  message={error}
                  onRetry={() => {
                    setSearched(false);
                    setError(null);
                  }}
                />
              ) : routes.length === 0 ? (
                <EmptyState
                  type="no-results"
                  onRetry={() => {
                    setSearched(false);
                  }}
                />
              ) : (
                <div className="route-sections">
                  {routeCategories.map(
                    (category) =>
                      category.routes.length > 0 && (
                        <section
                          key={category.key}
                          className={`route-section ${category.accentClass}`}
                        >
                          {/* Section Header */}
                          <div className="section-header">
                            <div className="section-header-left">
                              <div className={`section-icon-wrap ${category.gradientClass}`}>
                                <span className="section-icon-text">{category.icon}</span>
                              </div>
                              <div>
                                <h3 className="section-title">{category.title}</h3>
                                <p className="section-subtitle">{category.subtitle}</p>
                              </div>
                            </div>
                            <div className="section-count">
                              {category.routes.length} option
                              {category.routes.length > 1 ? "s" : ""}
                            </div>
                          </div>

                          {/* Route Cards */}
                          <div className="route-cards-grid">
                            {category.routes.map((route, idx) => (
                              <RouteCard
                                key={`${category.key}-${idx}`}
                                route={route}
                                routeType={category.title}
                                index={idx}
                              />
                            ))}
                          </div>
                        </section>
                      )
                  )}
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

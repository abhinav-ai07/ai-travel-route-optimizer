import React, { useState } from "react";
import {
  Plane,
  Train,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Zap,
  TrendingDown,
  Star,
  ArrowRight,
  Loader,
} from "lucide-react";
import { routeAPI, RouteResponse } from "../lib/api";
import toast from "react-hot-toast";
import SearchForm from "../components/SearchForm";
import RouteCard from "../components/RouteCard";
import LoadingState from "../components/LoadingState";
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

  const handleSearch = async (params: SearchParams) => {
    try {
      setLoading(true);
      setSearchParams(params);
      setSearched(true);

      const today = new Date().toISOString().split("T")[0];

      const routeData = await routeAPI.getRoutes(
        params.source,
        params.destination,
        params.travelDate,
        today
      );

      setRoutes(routeData || []);

      if (!routeData || routeData.length === 0) {
        toast.error("No routes found. Please try different locations.");
      } else {
        toast.success(`Found ${routeData.length} route(s)!`);
      }
    } catch (error: any) {
      console.error("Error fetching routes:", error);
      toast.error(
        error?.response?.data?.detail || "Failed to fetch routes. Please try again."
      );
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

  return (
    <>
      <BackgroundGradient />
      <div className="min-h-screen overflow-hidden">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 glass border-b border-cyan-500/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ✈️ RouteAI
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                      Premium Travel Planning
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden lg:flex items-center gap-4 text-sm text-cyan-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    AI-Powered
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Multimodal Routes
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Real-time Pricing
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-slate-300">
                    Intelligent Travel
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10">
          {!searched ? (
            <>
              {/* Hero Section */}
              <HeroSection />

              {/* Search Section */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <SearchForm onSearch={handleSearch} loading={loading} />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Results Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with search summary */}
                <div className="mb-8 glass p-6 rounded-2xl border border-cyan-500/20 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-cyan-300 mb-2">
                      🗺️ Routes Found
                    </h2>
                    <p className="text-slate-400 text-sm">
                      From <span className="text-cyan-400 font-semibold">{searchParams?.source}</span> to{" "}
                      <span className="text-cyan-400 font-semibold">{searchParams?.destination}</span> on{" "}
                      <span className="text-cyan-400 font-semibold">{searchParams?.travelDate}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearched(false);
                      setRoutes([]);
                    }}
                    className="btn-secondary"
                  >
                    ← New Search
                  </button>
                </div>

                {loading ? (
                  <LoadingState />
                ) : routes.length === 0 ? (
                  <div className="text-center py-16">
                    <Plane className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">
                      No routes available
                    </h3>
                    <p className="text-slate-500">
                      Try adjusting your search parameters
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Route Categories */}
                    {[
                      {
                        title: "✈️ Direct Flights",
                        routes: categorizedRoutes.flight,
                        icon: Plane,
                        color: "from-blue-600 to-cyan-500",
                      },
                      {
                        title: "🚆 Direct Trains",
                        routes: categorizedRoutes.train,
                        icon: Train,
                        color: "from-purple-600 to-pink-500",
                      },
                      {
                        title: "🛫➡️🚆 Flight → Train",
                        routes: categorizedRoutes.flightTrain,
                        icon: ArrowRight,
                        color: "from-emerald-600 to-cyan-500",
                      },
                      {
                        title: "🚆➡️🛫 Train → Flight",
                        routes: categorizedRoutes.trainFlight,
                        icon: ArrowRight,
                        color: "from-orange-600 to-pink-500",
                      },
                    ].map(
                      (category) =>
                        category.routes.length > 0 && (
                          <div key={category.title} className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                              <div
                                className={`w-1 h-8 rounded-full bg-gradient-to-b ${category.color}`}
                              />
                              <h3 className="text-2xl font-bold text-white">
                                {category.title}
                              </h3>
                              <span className="ml-auto px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm font-medium border border-cyan-500/30">
                                {category.routes.length} option
                                {category.routes.length > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {category.routes.map((route, idx) => (
                                <RouteCard
                                  key={`${category.title}-${idx}`}
                                  route={route}
                                  routeType={category.title}
                                  index={idx}
                                />
                              ))}
                            </div>
                          </div>
                        )
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-20 border-t border-cyan-500/10 glass bg-opacity-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-400 text-sm">
            <p>
              © 2026 AI Travel Route Optimizer • Powered by advanced ML & multimodal
              analysis
            </p>
            <p className="mt-2 text-xs text-slate-500">
              💡 Making travel smarter, faster, and more affordable
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Calendar, Loader, MapPin, Plane, Train, X } from "lucide-react";
import { format } from "date-fns";
import { routeAPI, LocationItem } from "../lib/api";

interface SearchFormProps {
  onSearch: (params: {
    source: string;
    destination: string;
    travelDate: string;
    budget: string;
  }) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    travelDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    budget: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Autocomplete state
  const [allLocations, setAllLocations] = useState<LocationItem[]>([]);
  const [sourceSuggestions, setSourceSuggestions] = useState<LocationItem[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationItem[]>([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [sourceHighlight, setSourceHighlight] = useState(-1);
  const [destHighlight, setDestHighlight] = useState(-1);
  const [locationsLoaded, setLocationsLoaded] = useState(false);

  // Budget slider
  const [noBudgetLimit, setNoBudgetLimit] = useState(true);
  const [budgetSlider, setBudgetSlider] = useState(10000);

  // Refs
  const sourceRef = useRef<HTMLInputElement>(null);
  const destRef = useRef<HTMLInputElement>(null);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const destDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locs = await routeAPI.getLocations();
        setAllLocations(locs);
        setLocationsLoaded(true);
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    };
    fetchLocations();
  }, []);

  // Filter suggestions
  const filterLocations = useCallback(
    (query: string): LocationItem[] => {
      if (!query || query.length < 1) return [];
      const q = query.toLowerCase();
      const filtered = allLocations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.code.toLowerCase().includes(q) ||
          (loc.state && loc.state.toLowerCase().includes(q))
      );

      // Sort: exact match first, then starts-with, then contains
      filtered.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        if (aName === q && bName !== q) return -1;
        if (bName === q && aName !== q) return 1;
        if (aName.startsWith(q) && !bName.startsWith(q)) return -1;
        if (bName.startsWith(q) && !aName.startsWith(q)) return 1;
        return aName.localeCompare(bName);
      });

      // Deduplicate by name (keep first of each name, which shows best match)
      const seen = new Set<string>();
      const deduplicated: LocationItem[] = [];
      for (const loc of filtered) {
        const key = `${loc.name}-${loc.type}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(loc);
        }
      }

      return deduplicated.slice(0, 8);
    },
    [allLocations]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "source") {
      const filtered = filterLocations(value);
      setSourceSuggestions(filtered);
      setShowSourceSuggestions(filtered.length > 0);
      setSourceHighlight(-1);
    } else if (name === "destination") {
      const filtered = filterLocations(value);
      setDestinationSuggestions(filtered);
      setShowDestinationSuggestions(filtered.length > 0);
      setDestHighlight(-1);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const selectSuggestion = (field: "source" | "destination", loc: LocationItem) => {
    setFormData((prev) => ({
      ...prev,
      [field]: loc.name,
    }));
    if (field === "source") {
      setShowSourceSuggestions(false);
      setSourceHighlight(-1);
      // Focus destination after selecting source
      setTimeout(() => destRef.current?.focus(), 100);
    } else {
      setShowDestinationSuggestions(false);
      setDestHighlight(-1);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "source" | "destination"
  ) => {
    const suggestions = field === "source" ? sourceSuggestions : destinationSuggestions;
    const highlight = field === "source" ? sourceHighlight : destHighlight;
    const setHighlight = field === "source" ? setSourceHighlight : setDestHighlight;

    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(Math.min(highlight + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(Math.max(highlight - 1, -1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      selectSuggestion(field, suggestions[highlight]);
    } else if (e.key === "Escape") {
      if (field === "source") setShowSourceSuggestions(false);
      else setShowDestinationSuggestions(false);
    }
  };

  // Budget slider handler
  const handleBudgetSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setBudgetSlider(val);
    setFormData((prev) => ({ ...prev, budget: val.toString() }));
  };

  const handleBudgetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, budget: val }));
    const numVal = parseInt(val);
    if (!isNaN(numVal) && numVal >= 500 && numVal <= 50000) {
      setBudgetSlider(numVal);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.source.trim()) {
      newErrors.source = "Source city is required";
    }
    if (!formData.destination.trim()) {
      newErrors.destination = "Destination city is required";
    }
    if (formData.source.toLowerCase() === formData.destination.toLowerCase()) {
      newErrors.destination = "Source and destination must be different";
    }
    if (!formData.travelDate) {
      newErrors.travelDate = "Travel date is required";
    }
    if (!noBudgetLimit && formData.budget) {
      const b = parseInt(formData.budget);
      if (isNaN(b) || b < 500) {
        newErrors.budget = "Minimum budget is ₹500";
      }
      if (b > 50000) {
        newErrors.budget = "Maximum budget is ₹50,000";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSearch({
        source: formData.source,
        destination: formData.destination,
        travelDate: formData.travelDate,
        budget: noBudgetLimit ? "" : formData.budget,
      });
    }
  };

  const renderSuggestionItem = (
    loc: LocationItem,
    index: number,
    highlight: number,
    field: "source" | "destination"
  ) => (
    <div
      key={`${loc.type}-${loc.code}-${index}`}
      className={`suggestion-item ${index === highlight ? "suggestion-active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        selectSuggestion(field, loc);
      }}
      onMouseEnter={() => {
        if (field === "source") setSourceHighlight(index);
        else setDestHighlight(index);
      }}
    >
      <div className="suggestion-icon">
        {loc.type === "airport" ? (
          <Plane className="w-4 h-4 text-cyan-400" />
        ) : (
          <Train className="w-4 h-4 text-purple-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{loc.name}</div>
        <div className="text-xs text-slate-400 flex items-center gap-1">
          <span className={`suggestion-badge ${loc.type === "airport" ? "badge-airport" : "badge-station"}`}>
            {loc.code}
          </span>
          {loc.state && <span className="text-slate-500">• {loc.state}</span>}
        </div>
      </div>
      <div className="text-xs text-slate-500 uppercase">
        {loc.type === "airport" ? "✈️" : "🚆"}
      </div>
    </div>
  );

  return (
    <div className="search-form-container">
      <div className="search-form-header">
        <div className="search-icon-wrapper">
          <Search className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Plan Your Journey</h2>
          <p className="text-slate-400 text-sm mt-1">
            Find the perfect multimodal route across India
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="search-grid">
          {/* Source */}
          <div className="search-field-group">
            <label className="search-label">
              <MapPin className="w-4 h-4" />
              From
            </label>
            <div className="relative">
              <input
                ref={sourceRef}
                type="text"
                name="source"
                placeholder={locationsLoaded ? "Type city or station name..." : "Loading locations..."}
                value={formData.source}
                onChange={handleChange}
                onFocus={() => {
                  if (formData.source.length > 0) {
                    const filtered = filterLocations(formData.source);
                    setSourceSuggestions(filtered);
                    setShowSourceSuggestions(filtered.length > 0);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSourceSuggestions(false), 250);
                }}
                onKeyDown={(e) => handleKeyDown(e, "source")}
                autoComplete="off"
                className={`input-field ${errors.source ? "input-error" : ""}`}
              />
              {formData.source && (
                <button
                  type="button"
                  className="input-clear"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, source: "" }));
                    setShowSourceSuggestions(false);
                    sourceRef.current?.focus();
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showSourceSuggestions && sourceSuggestions.length > 0 && (
                <div ref={sourceDropdownRef} className="suggestion-dropdown">
                  {sourceSuggestions.map((loc, idx) =>
                    renderSuggestionItem(loc, idx, sourceHighlight, "source")
                  )}
                </div>
              )}
            </div>
            {errors.source && <p className="field-error">{errors.source}</p>}
          </div>

          {/* Swap button between source/dest */}
          <div className="swap-button-container">
            <button
              type="button"
              className="swap-button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  source: prev.destination,
                  destination: prev.source,
                }));
              }}
              title="Swap source and destination"
            >
              ⇄
            </button>
          </div>

          {/* Destination */}
          <div className="search-field-group">
            <label className="search-label">
              <MapPin className="w-4 h-4" />
              To
            </label>
            <div className="relative">
              <input
                ref={destRef}
                type="text"
                name="destination"
                placeholder={locationsLoaded ? "Type city or station name..." : "Loading locations..."}
                value={formData.destination}
                onChange={handleChange}
                onFocus={() => {
                  if (formData.destination.length > 0) {
                    const filtered = filterLocations(formData.destination);
                    setDestinationSuggestions(filtered);
                    setShowDestinationSuggestions(filtered.length > 0);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowDestinationSuggestions(false), 250);
                }}
                onKeyDown={(e) => handleKeyDown(e, "destination")}
                autoComplete="off"
                className={`input-field ${errors.destination ? "input-error" : ""}`}
              />
              {formData.destination && (
                <button
                  type="button"
                  className="input-clear"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, destination: "" }));
                    setShowDestinationSuggestions(false);
                    destRef.current?.focus();
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <div ref={destDropdownRef} className="suggestion-dropdown">
                  {destinationSuggestions.map((loc, idx) =>
                    renderSuggestionItem(loc, idx, destHighlight, "destination")
                  )}
                </div>
              )}
            </div>
            {errors.destination && <p className="field-error">{errors.destination}</p>}
          </div>
        </div>

        {/* Second row: Date + Budget */}
        <div className="search-row-2">
          {/* Travel Date */}
          <div className="search-field-group">
            <label className="search-label">
              <Calendar className="w-4 h-4" />
              Travel Date
            </label>
            <input
              type="date"
              name="travelDate"
              value={formData.travelDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, travelDate: e.target.value }))}
              min={format(new Date(), "yyyy-MM-dd")}
              className="input-field"
            />
          </div>

          {/* Budget */}
          <div className="search-field-group budget-group">
            <label className="search-label">
              <span className="text-lg">₹</span>
              Budget (INR)
            </label>
            <div className="budget-control">
              <label className="budget-toggle">
                <input
                  type="checkbox"
                  checked={noBudgetLimit}
                  onChange={(e) => {
                    setNoBudgetLimit(e.target.checked);
                    if (e.target.checked) {
                      setFormData((prev) => ({ ...prev, budget: "" }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        budget: budgetSlider.toString(),
                      }));
                    }
                  }}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">No limit</span>
              </label>

              {!noBudgetLimit && (
                <div className="budget-slider-group">
                  <div className="budget-input-row">
                    <span className="budget-currency">₹</span>
                    <input
                      type="number"
                      name="budget"
                      placeholder="10000"
                      value={formData.budget}
                      onChange={handleBudgetInput}
                      min={500}
                      max={50000}
                      className="input-field budget-number-input"
                    />
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={25000}
                    step={500}
                    value={budgetSlider}
                    onChange={handleBudgetSlider}
                    className="budget-range"
                  />
                  <div className="budget-range-labels">
                    <span>₹500</span>
                    <span>₹12,500</span>
                    <span>₹25,000</span>
                  </div>
                </div>
              )}
            </div>
            {errors.budget && <p className="field-error">{errors.budget}</p>}
          </div>
        </div>

        {/* Submit */}
        <div className="search-actions">
          <button
            type="submit"
            disabled={loading}
            className="search-submit-btn"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Analyzing Routes...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Find Routes</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                source: "",
                destination: "",
                travelDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
                budget: "",
              });
              setNoBudgetLimit(true);
              setBudgetSlider(10000);
              setErrors({});
            }}
            className="search-clear-btn"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Feature pills */}
      <div className="search-features">
        <div className="feature-pill">
          <span className="feature-dot dot-cyan"></span>
          AI-powered recommendations
        </div>
        <div className="feature-pill">
          <span className="feature-dot dot-purple"></span>
          Real-time pricing
        </div>
        <div className="feature-pill">
          <span className="feature-dot dot-green"></span>
          {locationsLoaded ? `${allLocations.length} locations loaded` : "Loading..."}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;

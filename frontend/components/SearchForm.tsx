import React, { useState } from "react";
import { Search, Calendar, Loader } from "lucide-react";
import { format } from "date-fns";

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
  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Popular cities for autocomplete
  const popularCities = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad",
    "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
    "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",
    "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar",
    "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad",
    "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur",
    "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad",
    "Bareilly", "Moradabad", "Mysore", "Gurgaon", "Aligarh", "Jalandhar", "Tiruchirappalli",
    "Bhubaneswar", "Salem", "Warangal", "Guntur", "Bhiwandi", "Saharanpur", "Gorakhpur",
    "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai", "Cuttack", "Firozabad",
    "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela",
    "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", "Loni",
    "Siliguri", "Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj", "Mangalore", "Erode",
    "Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Tiruppur", "Davanagere"
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle autocomplete suggestions
    if (name === "source") {
      if (value.length > 0) {
        const filtered = popularCities.filter(city =>
          city.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
        setSourceSuggestions(filtered);
        setShowSourceSuggestions(true);
      } else {
        setSourceSuggestions([]);
        setShowSourceSuggestions(false);
      }
    } else if (name === "destination") {
      if (value.length > 0) {
        const filtered = popularCities.filter(city =>
          city.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
        setDestinationSuggestions(filtered);
        setShowDestinationSuggestions(true);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const selectSuggestion = (field: "source" | "destination", city: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: city,
    }));
    if (field === "source") {
      setShowSourceSuggestions(false);
    } else {
      setShowDestinationSuggestions(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.source.trim()) {
      newErrors.source = "Source is required";
    }
    if (!formData.destination.trim()) {
      newErrors.destination = "Destination is required";
    }
    if (formData.source.toLowerCase() === formData.destination.toLowerCase()) {
      newErrors.destination = "Source and destination must be different";
    }
    if (!formData.travelDate) {
      newErrors.travelDate = "Travel date is required";
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
        budget: formData.budget,
      });
    }
  };

  return (
    <div className="glass rounded-3xl p-8 md:p-12 border border-cyan-500/20 backdrop-blur-xl shadow-2xl">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
        <Search className="w-8 h-8 text-cyan-400" />
        Plan Your Journey
      </h2>
      <p className="text-slate-400 mb-8">
        Find the perfect multimodal route for your next adventure
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Source */}
          <div className="col-span-1 relative">
            <label className="block text-sm font-semibold text-cyan-300 mb-3">
              📍 From
            </label>
            <input
              type="text"
              name="source"
              placeholder="Enter source city"
              value={formData.source}
              onChange={handleChange}
              onFocus={() => {
                if (formData.source.length > 0) {
                  const filtered = popularCities.filter(city =>
                    city.toLowerCase().includes(formData.source.toLowerCase())
                  ).slice(0, 5);
                  setSourceSuggestions(filtered);
                  setShowSourceSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding to allow click on suggestions
                setTimeout(() => setShowSourceSuggestions(false), 200);
              }}
              className={`input-field transition-all ${
                errors.source
                  ? "border-red-500 bg-red-500/10"
                  : "focus:border-cyan-400"
              }`}
            />
            {showSourceSuggestions && sourceSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-cyan-500/30 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {sourceSuggestions.map((city, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer text-white text-sm"
                    onClick={() => selectSuggestion("source", city)}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
            {errors.source && (
              <p className="text-red-400 text-xs mt-1">{errors.source}</p>
            )}
          </div>

          {/* Destination */}
          <div className="col-span-1 relative">
            <label className="block text-sm font-semibold text-cyan-300 mb-3">
              🎯 To
            </label>
            <input
              type="text"
              name="destination"
              placeholder="Enter destination city"
              value={formData.destination}
              onChange={handleChange}
              onFocus={() => {
                if (formData.destination.length > 0) {
                  const filtered = popularCities.filter(city =>
                    city.toLowerCase().includes(formData.destination.toLowerCase())
                  ).slice(0, 5);
                  setDestinationSuggestions(filtered);
                  setShowDestinationSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding to allow click on suggestions
                setTimeout(() => setShowDestinationSuggestions(false), 200);
              }}
              className={`input-field transition-all ${
                errors.destination
                  ? "border-red-500 bg-red-500/10"
                  : "focus:border-cyan-400"
              }`}
            />
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-cyan-500/30 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {destinationSuggestions.map((city, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer text-white text-sm"
                    onClick={() => selectSuggestion("destination", city)}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
            {errors.destination && (
              <p className="text-red-400 text-xs mt-1">{errors.destination}</p>
            )}
          </div>

          {/* Travel Date */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-cyan-300 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleChange}
              min={format(new Date(), "yyyy-MM-dd")}
              className="input-field focus:border-cyan-400"
            />
          </div>

          {/* Budget */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-cyan-300 mb-3">
              💰 Budget (₹)
            </label>
            <input
              type="number"
              name="budget"
              placeholder="Optional"
              value={formData.budget}
              onChange={handleChange}
              className="input-field focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Searching Routes...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Routes
              </>
            )}
          </button>
          <button
            type="reset"
            onClick={() =>
              setFormData({
                source: "",
                destination: "",
                travelDate: format(
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  "yyyy-MM-dd"
                ),
                budget: "",
              })
            }
            className="btn-secondary px-6"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Info Pills */}
      <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-cyan-500/20">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          AI-powered recommendations
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Real-time pricing
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Multiple transport modes
        </div>
      </div>
    </div>
  );
};

export default SearchForm;

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import traceback
from datetime import datetime
import pandas as pd

from services.route_generator import generate_routes

# Initialize FastAPI app
app = FastAPI(
    title="AI Travel Route Optimizer",
    description="Multimodal travel route optimization API",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================
# LOAD LOCATION DATA AT STARTUP
# =========================================

def load_locations():
    """Load all airports and stations from datasets for autocomplete"""
    locations = []
    seen = set()

    # Load airports
    try:
        df_airports = pd.read_excel("data/airportinfo.xlsx")
        airport_cities = df_airports[['Source City', 'Source IATA']].drop_duplicates()
        for _, row in airport_cities.iterrows():
            city = str(row['Source City']).strip()
            iata = str(row['Source IATA']).strip()
            key = f"airport_{city}_{iata}"
            if key not in seen and city and iata:
                seen.add(key)
                locations.append({
                    "name": city,
                    "code": iata,
                    "type": "airport",
                    "display": f"{city} ({iata})"
                })
    except Exception as e:
        print(f"Error loading airports: {e}")

    # Load stations
    try:
        df_stations = pd.read_excel("data/Stations.xlsx")
        for _, row in df_stations.iterrows():
            station_name = str(row['Station Name']).strip()
            station_code = str(row['Station Code']).strip()
            state = str(row.get('State', '')).strip()
            key = f"station_{station_name}_{station_code}"
            if key not in seen and station_name and station_code:
                seen.add(key)
                locations.append({
                    "name": station_name,
                    "code": station_code,
                    "type": "station",
                    "state": state,
                    "display": f"{station_name} ({station_code})"
                })
    except Exception as e:
        print(f"Error loading stations: {e}")

    # Also add unique city names (without duplicates)
    city_names = set()
    for loc in locations:
        city_names.add(loc["name"])

    return locations, list(city_names)

# City name aliases for common alternate spellings
CITY_ALIASES = {
    "bangalore": "bengaluru",
    "bombay": "mumbai",
    "madras": "chennai",
    "calcutta": "kolkata",
    "trivandrum": "thiruvananthapuram",
    "cochin": "kochi",
    "mysore": "mysuru",
    "poona": "pune",
    "baroda": "vadodara",
    "benares": "varanasi",
    "allahabad": "prayagraj",
}

# Cache locations at startup
ALL_LOCATIONS, ALL_CITY_NAMES = load_locations()
print(f"Loaded {len(ALL_LOCATIONS)} locations ({len(ALL_CITY_NAMES)} unique cities)")


# =========================================
# REQUEST/RESPONSE MODELS
# =========================================

class RouteRequest(BaseModel):
    source: str
    destination: str
    travel_date: str
    booking_date: str
    budget: Optional[float] = None
    preferred_time: Optional[str] = "flexible"

class RouteResponse(BaseModel):
    route_type: str
    from_airport: Optional[str] = None
    to_airport: Optional[str] = None
    from_station: Optional[str] = None
    to_station: Optional[str] = None
    airport_distance_to_destination: Optional[float] = None
    station_distance_to_destination: Optional[float] = None
    total_cost: float
    travel_time: Optional[str] = None
    recommendation: Optional[str] = None


# =========================================
# SMART TAG COMPUTATION
# =========================================

def compute_tags(routes, budget=None):
    """Compute AI recommendation tags for routes"""
    if not routes:
        return routes

    # Find cheapest
    costs = [(i, r.get("total_cost", float('inf'))) for i, r in enumerate(routes)]
    costs.sort(key=lambda x: x[1])

    cheapest_idx = costs[0][0] if costs else -1

    # Find fastest (direct flights are typically fastest)
    fastest_idx = -1
    for i, r in enumerate(routes):
        if r.get("route_type") == "direct_flight":
            fastest_idx = i
            break

    # Assign tags
    for i, route in enumerate(routes):
        tags = []
        rt = route.get("route_type", "")
        cost = route.get("total_cost", 0)

        if i == cheapest_idx:
            tags.append("Cheapest")

        if i == fastest_idx:
            tags.append("Fastest")

        # Budget friendly: within 80% of budget
        if budget and cost <= budget * 0.8:
            tags.append("Budget Friendly")

        # Recommended: best balance (cheapest direct, or cheapest flight)
        if rt == "direct_flight" and i == cheapest_idx:
            tags.append("Recommended")
        elif rt == "direct_train" and cost < 2000:
            tags.append("Budget Friendly")

        # Best connectivity for multimodal
        if rt in ("flight_plus_train", "train_plus_flight"):
            tags.append("Best Connectivity")

        # Add recommendation reason
        if rt == "direct_flight":
            route["recommendation_reason"] = "Fastest way to reach your destination via air travel"
        elif rt == "direct_train":
            route["recommendation_reason"] = "Most affordable option with scenic rail journey"
        elif rt == "flight_plus_train":
            route["recommendation_reason"] = "Fly to the nearest major airport, then take a train to your destination for best connectivity"
        elif rt == "train_plus_flight":
            route["recommendation_reason"] = "Take a train to the nearest major airport, then fly to your destination city"

        # Deduplicate tags
        route["tags"] = list(dict.fromkeys(tags))

    # If no route was marked recommended, mark the cheapest
    has_recommended = any("Recommended" in r.get("tags", []) for r in routes)
    if not has_recommended and routes:
        routes[cheapest_idx]["tags"].append("Recommended")

    return routes


# =========================================
# ROUTES
# =========================================

@app.get("/")
def home():
    return {
        "message": "AI Travel Route Optimizer Backend",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/locations")
def get_locations(q: Optional[str] = None):
    """
    Get all available locations (airports + stations) for autocomplete.
    Optional query parameter 'q' to filter results.
    """
    if q and len(q) >= 1:
        query = q.lower().strip()
        # Check if query is an alias and also search the canonical name
        canonical = CITY_ALIASES.get(query, query)
        # Also check partial alias match (e.g. "bang" should match "bangalore" alias)
        extra_queries = set()
        for alias, canon in CITY_ALIASES.items():
            if alias.startswith(query) or query in alias:
                extra_queries.add(canon)
        
        def matches(loc):
            name = loc["name"].lower()
            code = loc["code"].lower()
            state = loc.get("state", "").lower()
            if query in name or query in code or query in state:
                return True
            if canonical != query and canonical in name:
                return True
            for eq in extra_queries:
                if eq in name:
                    return True
            return False
        
        filtered = [loc for loc in ALL_LOCATIONS if matches(loc)]
        # Sort: exact/starts-with name matches first
        filtered.sort(key=lambda x: (
            0 if x["name"].lower().startswith(query) else
            1 if query in x["name"].lower() else 2
        ))
        return filtered[:30]  # Limit results
    return ALL_LOCATIONS  # Return all locations for frontend to cache

@app.post("/routes")
def get_routes(request: RouteRequest):
    """
    Generate multimodal travel routes between source and destination.
    
    Args:
        source: Starting city/location
        destination: Ending city/location
        travel_date: Travel date (YYYY-MM-DD format)
        booking_date: Booking date (YYYY-MM-DD format)
        budget: Optional budget limit
        preferred_time: Preference - 'flexible', 'fastest', 'cheapest'
    
    Returns:
        List of available routes with details
    """
    try:
        # Validate dates
        try:
            travel_date = datetime.strptime(request.travel_date, "%Y-%m-%d")
            booking_date = datetime.strptime(request.booking_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
        
        if travel_date < booking_date:
            raise HTTPException(
                status_code=400,
                detail="Travel date must be after booking date"
            )
        
        # Validate locations
        if not request.source or not request.destination:
            raise HTTPException(
                status_code=400,
                detail="Source and destination are required"
            )
        
        if request.source.lower() == request.destination.lower():
            raise HTTPException(
                status_code=400,
                detail="Source and destination must be different"
            )
        
        # Generate routes
        routes = generate_routes(
            source=request.source,
            destination=request.destination,
            travel_date=request.travel_date,
            booking_date=request.booking_date
        )
        
        # Compute AI tags
        routes = compute_tags(routes, budget=request.budget)
        
        # Filter by budget if provided
        if request.budget:
            routes = [r for r in routes if r.get("total_cost", float('inf')) <= request.budget]
        
        # Sort based on preference
        if request.preferred_time == "fastest":
            routes = sorted(routes, key=lambda x: x.get("travel_time", "Z"), reverse=False)
        elif request.preferred_time == "cheapest":
            routes = sorted(routes, key=lambda x: x.get("total_cost", float('inf')))
        
        return routes
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating routes: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error generating routes: {str(e)}"
        )

@app.post("/generate_routes")
def generate_routes_endpoint(request: RouteRequest):
    """Alternative endpoint name for route generation"""
    return get_routes(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
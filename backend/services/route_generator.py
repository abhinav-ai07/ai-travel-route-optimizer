from services.geo_service import get_coordinates

from services.airport_service import (
    find_nearest_airports,
    find_nearest_tier1_airport
)

from services.station_service import (
    find_nearest_stations,
    find_nearest_tier1_station
)

from services.flight_engine import (
    predict_flight_price
)

from services.train_engine import (
    RouteAI_FareEngine
)

from services.multimodal_engine import (
    generate_multimodal_routes
)

# =========================================
# TRAIN ENGINE
# =========================================

train_engine = RouteAI_FareEngine()

# =========================================
# METRO CITIES (airports in the city itself)
# =========================================

METRO_CITIES = [
    "delhi", "mumbai", "bangalore", "bengaluru", "chennai",
    "kolkata", "hyderabad", "pune", "ahmedabad", "goa",
    "jaipur", "lucknow", "chandigarh", "kochi", "cochin",
    "guwahati", "bhubaneswar", "indore", "nagpur", "patna",
    "ranchi", "varanasi", "coimbatore", "thiruvananthapuram",
    "trivandrum", "visakhapatnam", "mangalore", "madurai",
    "raipur", "dehradun", "amritsar", "srinagar", "jammu",
    "udaipur", "jodhpur", "bhopal"
]


def is_metro_city(city_name):
    """Check if the city is a metro/tier-1 city with its own airport"""
    return city_name.lower().strip() in METRO_CITIES


def smart_distance(distance_km, city_name):
    """Return 0 if city is a metro city (has airport/station in city), else return actual distance"""
    if is_metro_city(city_name):
        return 0
    if distance_km < 5:
        return 0
    return round(distance_km, 1)


# =========================================
# ROUTE GENERATOR
# =========================================

def generate_routes(
    source,
    destination,
    travel_date,
    booking_date
):
    routes = []

    # =========================================
    # COORDINATES
    # =========================================

    source_coords = get_coordinates(source)
    destination_coords = get_coordinates(destination)

    if not source_coords or not destination_coords:
        return []

    # =========================================
    # SOURCE AIRPORTS
    # =========================================

    source_airports = find_nearest_airports(
        source_coords["lat"],
        source_coords["lon"],
        top_n=2
    )

    # =========================================
    # DESTINATION AIRPORTS
    # =========================================

    destination_airports = find_nearest_airports(
        destination_coords["lat"],
        destination_coords["lon"],
        top_n=2
    )

    # =========================================
    # SOURCE TIER1 AIRPORT
    # =========================================

    source_tier1_airport = find_nearest_tier1_airport(
        source_coords["lat"],
        source_coords["lon"]
    )

    # =========================================
    # DESTINATION TIER1 AIRPORT
    # =========================================

    destination_tier1_airport = find_nearest_tier1_airport(
        destination_coords["lat"],
        destination_coords["lon"]
    )

    # =========================================
    # SOURCE STATIONS
    # =========================================

    source_stations = find_nearest_stations(
        source_coords["lat"],
        source_coords["lon"],
        city_name=source,
        top_n=2
    )

    # =========================================
    # DESTINATION STATIONS
    # =========================================

    destination_stations = find_nearest_stations(
        destination_coords["lat"],
        destination_coords["lon"],
        city_name=destination,
        top_n=2
    )

    # =========================================
    # MAIN HUBS
    # =========================================

    source_airport = source_airports[0]
    destination_airport = destination_airports[0]
    source_station = source_stations[0]
    destination_station = destination_stations[0]

    # =========================================
    # DIRECT FLIGHT
    # =========================================

    flight_prediction = predict_flight_price(
        source_iata=source_airport["iata"],
        destination_iata=destination_airport["iata"],
        travel_date=travel_date,
        booking_date=booking_date
    )

    # Smart distance: only show if airport is NOT in destination city
    dest_airport_distance = smart_distance(
        destination_airport["distance_km"],
        destination
    )
    src_airport_distance = smart_distance(
        source_airport["distance_km"],
        source
    )

    route_1 = {
        "route_type": "direct_flight",

        "from_city": source_airport.get("city", source),
        "from_code": source_airport["iata"],
        "to_city": destination_airport.get("city", destination),
        "to_code": destination_airport["iata"],

        "source_city": source,
        "destination_city": destination,

        # Legacy fields
        "from_airport": source_airport["iata"],
        "to_airport": destination_airport["iata"],

        "airport_distance_to_destination": dest_airport_distance,
        "source_airport_distance": src_airport_distance,

        "total_cost": round(float(flight_prediction["price"]), 2) if flight_prediction.get("price") else 0,

        "segments": [
            {
                "mode": "flight",
                "from_city": source_airport.get("city", source),
                "from_code": source_airport["iata"],
                "to_city": destination_airport.get("city", destination),
                "to_code": destination_airport["iata"],
                "cost": round(float(flight_prediction["price"]), 2) if flight_prediction.get("price") else 0
            }
        ]
    }

    if route_1["total_cost"] and route_1["total_cost"] > 0:
        routes.append(route_1)

    # =========================================
    # TRAIN ROUTES (TIER-BASED COMBINATIONS)
    # =========================================

    source_tier = source_station.get("tier", "Tier 3")
    dest_tier = destination_station.get("tier", "Tier 3")

    # 1. Direct Train
    if source_tier in ["Tier 1", "Tier 2"] and dest_tier in ["Tier 1", "Tier 2"]:
        add_direct_train_route(routes, source, destination, source_station, destination_station, source_coords, destination_coords)

    # 2. Via Source Hub
    if source_tier in ["Tier 2", "Tier 3"] and dest_tier in ["Tier 1", "Tier 2"]:
        add_via_hub_route(routes, source, destination, source_station, destination_station, source_coords, destination_coords, hub_type="source")

    # 3. Via Destination Hub
    if source_tier in ["Tier 1", "Tier 2"] and dest_tier in ["Tier 2", "Tier 3"]:
        add_via_hub_route(routes, source, destination, source_station, destination_station, source_coords, destination_coords, hub_type="destination")

    # 4. Via Both Hubs
    if source_tier in ["Tier 2", "Tier 3"] and dest_tier in ["Tier 2", "Tier 3"]:
        add_via_both_hubs_route(routes, source, destination, source_station, destination_station, source_coords, destination_coords)

    # =========================================
    # MULTIMODAL ROUTES
    # =========================================

    multimodal_routes = generate_multimodal_routes(
        source=source,
        destination=destination,
        source_airports=source_airports,
        destination_airports=destination_airports,
        source_tier1_airport=source_tier1_airport,
        destination_tier1_airport=destination_tier1_airport,
        source_stations=source_stations,
        destination_stations=destination_stations,
        travel_date=travel_date,
        booking_date=booking_date
    )

    routes.extend(multimodal_routes)

    return routes


def add_direct_train_route(routes, source, destination, source_station, destination_station, source_coords, destination_coords):
    train_distance = train_engine.calculate_haversine_distance(
        source_coords["lat"], source_coords["lon"],
        destination_coords["lat"], destination_coords["lon"]
    )
    train_result = train_engine.get_fare(displacement_km=train_distance, travel_class="3A", train_category="Superfast")
    
    if train_result["fare"]:
        route = {
            "route_type": "direct_train",
            "from_city": source_station.get("station", source),
            "from_code": source_station["code"],
            "to_city": destination_station.get("station", destination),
            "to_code": destination_station["code"],
            "source_city": source,
            "destination_city": destination,
            "total_cost": train_result["fare"],
            "train_distance_km": round(train_distance, 1),
            "segments": [
                {
                    "mode": "train",
                    "from_city": source_station.get("station", source),
                    "from_code": source_station["code"],
                    "to_city": destination_station.get("station", destination),
                    "to_code": destination_station["code"],
                    "cost": train_result["fare"],
                    "distance_km": round(train_distance, 1)
                }
            ]
        }
        routes.append(route)


def add_via_hub_route(routes, source, destination, source_station, destination_station, source_coords, destination_coords, hub_type="source"):
    # Determine which hub to find
    coords = source_coords if hub_type == "source" else destination_coords
    hub = find_nearest_tier1_station(coords["lat"], coords["lon"])
    
    if not hub:
        return
        
    # Check if hub is redundant
    if hub["code"] == source_station["code"] or hub["code"] == destination_station["code"]:
        return

    # Calculate segments
    if hub_type == "source":
        # Source -> Hub -> Destination
        seg1_from, seg1_to = source_station, hub
        seg2_from, seg2_to = hub, destination_station
    else:
        # Source -> Hub -> Destination
        seg1_from, seg1_to = source_station, hub
        seg2_from, seg2_to = hub, destination_station

    dist1 = train_engine.calculate_haversine_distance(seg1_from["lat"] if "lat" in seg1_from else source_coords["lat"], seg1_from["lon"] if "lon" in seg1_from else source_coords["lon"], seg1_to["lat"], seg1_to["lon"])
    res1 = train_engine.get_fare(displacement_km=dist1, travel_class="3A", train_category="Superfast")
    
    dist2 = train_engine.calculate_haversine_distance(seg2_from["lat"], seg2_from["lon"], seg2_to["lat"] if "lat" in seg2_to else destination_coords["lat"], seg2_to["lon"] if "lon" in seg2_to else destination_coords["lon"])
    res2 = train_engine.get_fare(displacement_km=dist2, travel_class="3A", train_category="Superfast")
    
    if res1["fare"] and res2["fare"]:
        route = {
            "route_type": "train_via_tier1",
            "from_city": source_station.get("station", source),
            "from_code": source_station["code"],
            "to_city": destination_station.get("station", destination),
            "to_code": destination_station["code"],
            "source_city": source,
            "destination_city": destination,
            "train_cost": res1["fare"] + res2["fare"],
            "total_cost": res1["fare"] + res2["fare"],
            "segments": [
                {
                    "mode": "train",
                    "from_city": seg1_from.get("station", source),
                    "from_code": seg1_from["code"],
                    "to_city": seg1_to["station"],
                    "to_code": seg1_to["code"],
                    "cost": res1["fare"],
                    "distance_km": round(dist1, 1)
                },
                {
                    "mode": "train",
                    "from_city": seg2_from.get("station", source),
                    "from_code": seg2_from["code"],
                    "to_city": seg2_to.get("station", destination),
                    "to_code": seg2_to["code"],
                    "cost": res2["fare"],
                    "distance_km": round(dist2, 1)
                }
            ]
        }
        routes.append(route)


def add_via_both_hubs_route(routes, source, destination, source_station, destination_station, source_coords, destination_coords):
    hub_src = find_nearest_tier1_station(source_coords["lat"], source_coords["lon"])
    hub_dst = find_nearest_tier1_station(destination_coords["lat"], destination_coords["lon"])
    
    if not hub_src or not hub_dst:
        return
        
    # Check for redundancy
    if hub_src["code"] == source_station["code"] or hub_dst["code"] == destination_station["code"]:
        return
    if hub_src["code"] == hub_dst["code"]:
        return

    # Segments: Source -> HubSrc -> HubDst -> Destination
    # Segment 1: Source -> HubSrc
    dist1 = train_engine.calculate_haversine_distance(source_coords["lat"], source_coords["lon"], hub_src["lat"], hub_src["lon"])
    res1 = train_engine.get_fare(displacement_km=dist1, travel_class="3A", train_category="Superfast")
    
    # Segment 2: HubSrc -> HubDst
    dist2 = train_engine.calculate_haversine_distance(hub_src["lat"], hub_src["lon"], hub_dst["lat"], hub_dst["lon"])
    res2 = train_engine.get_fare(displacement_km=dist2, travel_class="3A", train_category="Superfast")
    
    # Segment 3: HubDst -> Destination
    dist3 = train_engine.calculate_haversine_distance(hub_dst["lat"], hub_dst["lon"], destination_coords["lat"], destination_coords["lon"])
    res3 = train_engine.get_fare(displacement_km=dist3, travel_class="3A", train_category="Superfast")
    
    if res1["fare"] and res2["fare"] and res3["fare"]:
        route = {
            "route_type": "train_via_tier1",
            "from_city": source_station.get("station", source),
            "from_code": source_station["code"],
            "to_city": destination_station.get("station", destination),
            "to_code": destination_station["code"],
            "source_city": source,
            "destination_city": destination,
            "train_cost": res1["fare"] + res2["fare"] + res3["fare"],
            "total_cost": res1["fare"] + res2["fare"] + res3["fare"],
            "segments": [
                {
                    "mode": "train",
                    "from_city": source_station.get("station", source),
                    "from_code": source_station["code"],
                    "to_city": hub_src["station"],
                    "to_code": hub_src["code"],
                    "cost": res1["fare"],
                    "distance_km": round(dist1, 1)
                },
                {
                    "mode": "train",
                    "from_city": hub_src["station"],
                    "from_code": hub_src["code"],
                    "to_city": hub_dst["station"],
                    "to_code": hub_dst["code"],
                    "cost": res2["fare"],
                    "distance_km": round(dist2, 1)
                },
                {
                    "mode": "train",
                    "from_city": hub_dst["station"],
                    "from_code": hub_dst["code"],
                    "to_city": destination_station.get("station", destination),
                    "to_code": destination_station["code"],
                    "cost": res3["fare"],
                    "distance_km": round(dist3, 1)
                }
            ]
        }
        routes.append(route)
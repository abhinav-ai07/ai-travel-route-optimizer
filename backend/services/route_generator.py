from services.geo_service import get_coordinates

from services.airport_service import (
    find_nearest_airports,
    find_nearest_tier1_airport
)

from services.station_service import (
    find_nearest_stations
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
    # DIRECT TRAIN
    # =========================================

    train_distance = train_engine.calculate_haversine_distance(
        source_coords["lat"],
        source_coords["lon"],
        destination_coords["lat"],
        destination_coords["lon"]
    )

    train_result = train_engine.get_fare(
        displacement_km=train_distance,
        travel_class="3A",
        train_category="Superfast"
    )

    # Smart distance for station
    dest_station_distance = smart_distance(
        destination_station["distance_km"],
        destination
    )
    src_station_distance = smart_distance(
        source_station["distance_km"],
        source
    )

    station_name_src = source_station.get("station", source)
    station_name_dst = destination_station.get("station", destination)

    route_2 = {
        "route_type": "direct_train",

        "from_city": station_name_src,
        "from_code": source_station["code"],
        "to_city": station_name_dst,
        "to_code": destination_station["code"],

        "source_city": source,
        "destination_city": destination,

        # Legacy fields
        "from_station": source_station["code"],
        "to_station": destination_station["code"],

        "station_distance_to_destination": dest_station_distance,
        "source_station_distance": src_station_distance,

        "total_cost": train_result["fare"],
        "train_distance_km": round(train_distance, 1),

        "segments": [
            {
                "mode": "train",
                "from_city": station_name_src,
                "from_code": source_station["code"],
                "to_city": station_name_dst,
                "to_code": destination_station["code"],
                "cost": train_result["fare"],
                "distance_km": round(train_distance, 1)
            }
        ]
    }

    if route_2["total_cost"] and route_2["total_cost"] > 0:
        routes.append(route_2)

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
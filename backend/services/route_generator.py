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

# =========================================
# TRAIN ENGINE
# =========================================

train_engine = RouteAI_FareEngine()


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

    # =========================================
    # AIRPORTS
    # =========================================

    source_airports = find_nearest_airports(

        source_coords["lat"],
        source_coords["lon"]
    )

    destination_airports = find_nearest_airports(

        destination_coords["lat"],
        destination_coords["lon"]
    )

    # =========================================
    # STATIONS
    # =========================================

    source_stations = find_nearest_stations(

        source_coords["lat"],
        source_coords["lon"]
    )

    destination_stations = find_nearest_stations(

        destination_coords["lat"],
        destination_coords["lon"]
    )

    # =========================================
    # TIER 1 AIRPORT
    # =========================================

    tier1_airport = find_nearest_tier1_airport(

        source_coords["lat"],
        source_coords["lon"]
    )

    # =========================================
    # SELECT MAIN HUBS
    # =========================================

    flight_source = source_airports[0]

    flight_dest = destination_airports[0]

    source_station = source_stations[0]

    destination_station = destination_stations[0]

    # =========================================
    # ROUTE 1 → FLIGHT ONLY
    # =========================================

    flight_prediction = predict_flight_price(

        source_iata=flight_source["iata"],

        destination_iata=flight_dest["iata"],

        travel_date=travel_date,

        booking_date=booking_date
    )

    route_1 = {

        "route_type": "flight_only",

        "from_airport": flight_source["iata"],

        "to_airport": flight_dest["iata"],

        "total_cost": flight_prediction["price"]
    }

    routes.append(route_1)

    # =========================================
    # ROUTE 2 → TRAIN ONLY
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

    route_2 = {

        "route_type": "train_only",

        "from_station": source_station["code"],

        "to_station": destination_station["code"],

        "total_cost": train_result["fare"]
    }

    routes.append(route_2)

    # =========================================
    # ROUTE 3 → TRAIN + FLIGHT
    # =========================================

    train_to_airport = train_engine.get_fare(

        displacement_km=tier1_airport["distance_km"],

        travel_class="3A",

        train_category="Superfast"
    )

    train_cost = train_to_airport["fare"]

    flight_result = predict_flight_price(

        source_iata=tier1_airport["iata"],

        destination_iata=flight_dest["iata"],

        travel_date=travel_date,

        booking_date=booking_date
    )

    flight_cost = flight_result["price"]

    total_cost = train_cost + flight_cost

    route_3 = {

        "route_type": "train_plus_flight",

        "train_from": source_station["code"],

        "train_to": tier1_airport["iata"],

        "flight_from": tier1_airport["iata"],

        "flight_to": flight_dest["iata"],

        "train_cost": train_cost,

        "flight_cost": flight_cost,

        "total_cost": total_cost
    }

    routes.append(route_3)

    return routes
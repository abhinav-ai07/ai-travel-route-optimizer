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
# SAME CITY CHECK
# =========================================

def is_same_city(code1, code2):

    same_city_pairs = [

        ("SBC", "BLR"),
        ("BLR", "SBC"),

        ("BCT", "BOM"),
        ("BOM", "BCT"),

        ("MAS", "MAA"),
        ("MAA", "MAS"),

        ("NDLS", "DEL"),
        ("DEL", "NDLS"),

        ("HWH", "CCU"),
        ("CCU", "HWH"),

        ("PNBE", "PAT"),
        ("PAT", "PNBE"),

        ("SBC", "KIA"),
        ("KIA", "SBC"),
    ]

    return (code1, code2) in same_city_pairs


# =========================================
# MULTIMODAL ROUTES
# =========================================

def generate_multimodal_routes(

    source,
    destination,

    source_airports,
    destination_airports,

    source_tier1_airport,
    destination_tier1_airport,

    source_stations,
    destination_stations,

    travel_date,
    booking_date
):

    routes = []

    # =========================================
    # MAIN HUBS
    # =========================================

    source_airport = source_airports[0]
    destination_airport = destination_airports[0]
    source_station = source_stations[0]
    destination_station = destination_stations[0]

    # =========================================
    # TRAIN + FLIGHT
    # =========================================

    if not is_same_city(
        source_station["code"],
        source_tier1_airport["iata"]
    ):

        train_result = train_engine.get_fare(
            displacement_km=source_tier1_airport["distance_km"],
            travel_class="3A",
            train_category="Superfast"
        )

        train_cost = train_result["fare"]

        flight_result = predict_flight_price(
            source_iata=source_tier1_airport["iata"],
            destination_iata=destination_airport["iata"],
            travel_date=travel_date,
            booking_date=booking_date
        )

        flight_cost = flight_result["price"]

        if train_cost and flight_cost:
            total_cost = train_cost + flight_cost

            src_station_name = source_station.get("station", source)
            tier1_city = source_tier1_airport.get("city", source_tier1_airport["iata"])
            dest_airport_city = destination_airport.get("city", destination)

            route = {
                "route_type": "train_plus_flight",

                "source_city": source,
                "destination_city": destination,

                "from_city": src_station_name,
                "from_code": source_station["code"],
                "to_city": dest_airport_city,
                "to_code": destination_airport["iata"],

                # Legacy fields
                "source_station": source_station["code"],
                "source_tier1_airport": source_tier1_airport["iata"],
                "destination_airport": destination_airport["iata"],
                "destination_airport_distance": destination_airport["distance_km"],

                # Costs
                "train_cost": train_cost,
                "flight_cost": flight_cost,
                "total_cost": total_cost,

                # Segments for step-by-step display
                "segments": [
                    {
                        "mode": "train",
                        "from_city": src_station_name,
                        "from_code": source_station["code"],
                        "to_city": tier1_city,
                        "to_code": source_tier1_airport["iata"],
                        "cost": train_cost,
                        "distance_km": round(source_tier1_airport["distance_km"], 1)
                    },
                    {
                        "mode": "flight",
                        "from_city": tier1_city,
                        "from_code": source_tier1_airport["iata"],
                        "to_city": dest_airport_city,
                        "to_code": destination_airport["iata"],
                        "cost": flight_cost
                    }
                ]
            }

            routes.append(route)

    # =========================================
    # FLIGHT + TRAIN
    # =========================================

    if not is_same_city(
        destination_tier1_airport["iata"],
        destination_station["code"]
    ):

        flight_result = predict_flight_price(
            source_iata=source_airport["iata"],
            destination_iata=destination_tier1_airport["iata"],
            travel_date=travel_date,
            booking_date=booking_date
        )

        flight_cost = flight_result["price"]

        train_result = train_engine.get_fare(
            displacement_km=destination_tier1_airport["distance_km"],
            travel_class="3A",
            train_category="Superfast"
        )

        train_cost = train_result["fare"]

        if train_cost and flight_cost:
            total_cost = flight_cost + train_cost

            src_airport_city = source_airport.get("city", source)
            tier1_city = destination_tier1_airport.get("city", destination_tier1_airport["iata"])
            dst_station_name = destination_station.get("station", destination)

            route = {
                "route_type": "flight_plus_train",

                "source_city": source,
                "destination_city": destination,

                "from_city": src_airport_city,
                "from_code": source_airport["iata"],
                "to_city": dst_station_name,
                "to_code": destination_station["code"],

                # Legacy fields
                "source_airport": source_airport["iata"],
                "destination_tier1_airport": destination_tier1_airport["iata"],
                "destination_station": destination_station["code"],
                "destination_station_distance": destination_station["distance_km"],

                # Costs
                "flight_cost": flight_cost,
                "train_cost": train_cost,
                "total_cost": total_cost,

                # Segments for step-by-step display
                "segments": [
                    {
                        "mode": "flight",
                        "from_city": src_airport_city,
                        "from_code": source_airport["iata"],
                        "to_city": tier1_city,
                        "to_code": destination_tier1_airport["iata"],
                        "cost": flight_cost
                    },
                    {
                        "mode": "train",
                        "from_city": tier1_city,
                        "from_code": destination_tier1_airport["iata"],
                        "to_city": dst_station_name,
                        "to_code": destination_station["code"],
                        "cost": train_cost,
                        "distance_km": round(destination_tier1_airport["distance_km"], 1)
                    }
                ]
            }

            routes.append(route)

    return routes
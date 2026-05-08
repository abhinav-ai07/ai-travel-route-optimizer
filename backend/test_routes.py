from services.route_generator import generate_routes

routes = generate_routes(

    source="Mysore",

    destination="Guwahati",

    travel_date="2026-06-20",

    booking_date="2026-05-20"
)

print("\n==============================")
print("AI TRAVEL ROUTE RESULTS")
print("==============================")

for route in routes:

    print("\n--------------------------------")

    # =====================================
    # FLIGHT ONLY
    # =====================================

    if route["route_type"] == "flight_only":

        print("ROUTE TYPE : FLIGHT ONLY")

        print(
            f"Flight Route : "
            f"{route['from_airport']} "
            f"→ "
            f"{route['to_airport']}"
        )

        print(
            f"Total Cost : ₹{route['total_cost']}"
        )

    # =====================================
    # TRAIN ONLY
    # =====================================

    elif route["route_type"] == "train_only":

        print("ROUTE TYPE : TRAIN ONLY")

        print(
            f"Train Route : "
            f"{route['from_station']} "
            f"→ "
            f"{route['to_station']}"
        )

        print(
            f"Total Cost : ₹{route['total_cost']}"
        )

    # =====================================
    # TRAIN + FLIGHT
    # =====================================

    elif route["route_type"] == "train_plus_flight":

        print("ROUTE TYPE : TRAIN + FLIGHT")

        print(
            f"Train Route : "
            f"{route['train_from']} "
            f"→ "
            f"{route['train_to']}"
        )

        print(
            f"Flight Route : "
            f"{route['flight_from']} "
            f"→ "
            f"{route['flight_to']}"
        )

        print(
            f"Train Cost : ₹{route['train_cost']}"
        )

        print(
            f"Flight Cost : ₹{route['flight_cost']}"
        )

        print(
            f"Total Cost : ₹{route['total_cost']}"
        )

print("\n================================")
from services.route_generator import generate_routes

# =========================================
# USER INPUT
# =========================================

source = "Pune"

destination = "Bangalore" 

# =========================================
# GENERATE ROUTES
# =========================================

routes = generate_routes(

    source=source,

    destination=destination,

    travel_date="2026-06-20",

    booking_date="2026-05-20"
)

# =========================================
# OUTPUT
# =========================================

print("\n========================================")
print("AI TRAVEL ROUTE OPTIMIZER")
print("========================================")

print(f"\nSOURCE : {source}")

print(f"DESTINATION : {destination}")

# =========================================
# DIRECT FLIGHT
# =========================================

for route in routes:

    if route["route_type"] == "direct_flight":

        print("\n----------------------------------------")
        print("DIRECT FLIGHT OPTION")
        print("----------------------------------------")

        print(
            f"Flight Route : "
            f"{route['from_airport']} "
            f"→ "
            f"{route['to_airport']}"
        )

        print(
            f"Nearest Airport Distance "
            f"to Destination : "
            f"{route['airport_distance_to_destination']} km"
        )

        print(
            f"Estimated Flight Cost : "
            f"₹{route['total_cost']}"
        )

# =========================================
# DIRECT TRAIN
# =========================================

for route in routes:

    if route["route_type"] == "direct_train":

        print("\n----------------------------------------")
        print("DIRECT TRAIN OPTION")
        print("----------------------------------------")

        print(
            f"Train Route : "
            f"{route['from_station']} "
            f"→ "
            f"{route['to_station']}"
        )

        print(
            "Nearest Railway Station "
            "to Destination Connected"
        )

        print(
            f"Estimated Train Cost : "
            f"₹{route['total_cost']}"
        )

# =========================================
# MULTIMODAL OPTIONS
# =========================================

for route in routes:

    # =====================================
    # TRAIN + FLIGHT
    # =====================================

    if route["route_type"] == "train_plus_flight":

        print("\n----------------------------------------")
        print("TRAIN + FLIGHT OPTION")
        print("----------------------------------------")

        print(
            "\nSOURCE ANALYSIS"
        )

        print(
            f"Nearest Railway Station : "
            f"{route['source_station']}"
        )

        print(
            f"Nearest Tier-1 Airport : "
            f"{route['source_tier1_airport']}"
        )

        print(
            "\nDESTINATION ANALYSIS"
        )

        print(
            f"Nearest Airport : "
            f"{route['destination_airport']}"
        )

        print(
            f"Distance from Airport "
            f"to Destination : "
            f"{round(route['destination_airport_distance'], 2)} km"
        )

        print(
            "\nSUGGESTED ROUTE"
        )

        print(
            f"Train : "
            f"{route['source_station']} "
            f"→ "
            f"{route['source_tier1_airport']}"
        )

        print(
            f"Flight : "
            f"{route['source_tier1_airport']} "
            f"→ "
            f"{route['destination_airport']}"
        )

        print(
            f"\nTrain Cost : "
            f"₹{route['train_cost']}"
        )

        print(
            f"Flight Cost : "
            f"₹{route['flight_cost']}"
        )

        print(
            f"\nTotal Estimated Cost : "
            f"₹{route['total_cost']}"
        )

    # =====================================
    # FLIGHT + TRAIN
    # =====================================

    elif route["route_type"] == "flight_plus_train":

        print("\n----------------------------------------")
        print("FLIGHT + TRAIN OPTION")
        print("----------------------------------------")

        print(
            "\nDESTINATION ANALYSIS"
        )

        print(
            f"Nearest Tier-1 Airport : "
            f"{route['destination_tier1_airport']}"
        )

        print(
            f"Nearest Railway Station : "
            f"{route['destination_station']}"
        )

        print(
            f"Distance from Station "
            f"to Destination : "
            f"{round(route['destination_station_distance'], 2)} km"
        )

        print(
            "\nSUGGESTED ROUTE"
        )

        print(
            f"Flight : "
            f"{route['source_airport']} "
            f"→ "
            f"{route['destination_tier1_airport']}"
        )

        print(
            f"Train : "
            f"{route['destination_tier1_airport']} "
            f"→ "
            f"{route['destination_station']}"
        )

        print(
            f"\nFlight Cost : "
            f"₹{route['flight_cost']}"
        )

        print(
            f"Train Cost : "
            f"₹{route['train_cost']}"
        )

        print(
            f"\nTotal Estimated Cost : "
            f"₹{route['total_cost']}"
        )
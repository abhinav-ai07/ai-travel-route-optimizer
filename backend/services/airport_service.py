import pandas as pd
import math

# Load dataset
df = pd.read_excel("data/airportinfo.xlsx")

# Remove duplicate airports
source_airports = df[[
    'Source City',
    'Source IATA',
    'Source Latitude',
    'Source Longitude',
    'Source Tier'
]].drop_duplicates()

# Haversine Formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


# Find nearest airport
import pandas as pd
import math

# Load dataset
df = pd.read_excel("data/airportinfo.xlsx")

# Remove duplicates
source_airports = df[[
    'Source City',
    'Source IATA',
    'Source Latitude',
    'Source Longitude',
    'Source Tier'
]].drop_duplicates()

# Haversine Formula
def haversine(lat1, lon1, lat2, lon2):

    R = 6371

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


# FIND TOP N NEAREST AIRPORTS
def find_nearest_airports(user_lat, user_lon, top_n=3):

    airport_distances = []

    # Calculate distance for all airports
    for _, row in source_airports.iterrows():

        distance = haversine(
            user_lat,
            user_lon,
            row['Source Latitude'],
            row['Source Longitude']
        )

        airport_distances.append({
            "city": row['Source City'],
            "iata": row['Source IATA'],
            "tier": row['Source Tier'],
            "distance_km": round(distance, 2)
        })

    # Sort by distance
    airport_distances.sort(
        key=lambda x: x["distance_km"]
    )

    # Return top N airports
    return airport_distances[:top_n]
# FIND NEAREST TIER-1 AIRPORT
def find_nearest_tier1_airport(user_lat, user_lon):

    tier1_airports = []

    # Filter only Tier-1 airports
    filtered_df = source_airports[
        source_airports['Source Tier'] == 'Tier 1'
    ]

    for _, row in filtered_df.iterrows():

        distance = haversine(
            user_lat,
            user_lon,
            row['Source Latitude'],
            row['Source Longitude']
        )

        tier1_airports.append({
            "city": row['Source City'],
            "iata": row['Source IATA'],
            "tier": row['Source Tier'],
            "distance_km": round(distance, 2)
        })

    # Sort by distance
    tier1_airports.sort(
        key=lambda x: x["distance_km"]
    )

    # Return nearest Tier-1 airport
    return tier1_airports[0]
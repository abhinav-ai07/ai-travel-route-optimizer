import pandas as pd
import math

# =========================================
# LOAD STATION DATASET
# =========================================

df = pd.read_excel(
    "data/Stations.xlsx"
)

# =========================================
# HAVERSINE DISTANCE
# =========================================

def haversine(

    lat1,
    lon1,

    lat2,
    lon2
):

    R = 6371

    dlat = math.radians(
        lat2 - lat1
    )

    dlon = math.radians(
        lon2 - lon1
    )

    a = (

        math.sin(dlat / 2) ** 2

        +

        math.cos(math.radians(lat1))
        *
        math.cos(math.radians(lat2))
        *
        math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(

        math.sqrt(a),

        math.sqrt(1 - a)
    )

    return R * c


# =========================================
# FIND EXACT STATION BY CITY
# =========================================

def find_station_by_city(city_name):

    city_lower = city_name.lower().strip()

    # First pass: exact match on station name
    for _, row in df.iterrows():
        station_name = str(row['Station Name']).lower().strip()
        if station_name == city_lower:
            return {
                "station": row['Station Name'],
                "code": row['Station Code'],
                "state": row['State'],
                "distance_km": 0
            }

    # Second pass: station name starts with city name (e.g. "Patna Jn" for "Patna")
    for _, row in df.iterrows():
        station_name = str(row['Station Name']).lower().strip()
        if station_name.startswith(city_lower + ' ') or station_name.startswith(city_lower + '_'):
            return {
                "station": row['Station Name'],
                "code": row['Station Code'],
                "state": row['State'],
                "distance_km": 0
            }

    # Third pass: city name is a standalone word at start of station name
    for _, row in df.iterrows():
        station_name = str(row['Station Name']).lower().strip()
        parts = station_name.split()
        if parts and parts[0] == city_lower:
            return {
                "station": row['Station Name'],
                "code": row['Station Code'],
                "state": row['State'],
                "distance_km": 0
            }

    return None


# =========================================
# FIND NEAREST STATIONS
# =========================================

def find_nearest_stations(

    user_lat,
    user_lon,

    city_name=None,

    top_n=3
):

    # =====================================
    # EXACT CITY MATCH
    # =====================================

    if city_name:

        exact_station = find_station_by_city(
            city_name
        )

        if exact_station:

            return [exact_station]

    # =====================================
    # DISTANCE BASED SEARCH
    # =====================================

    station_distances = []

    for _, row in df.iterrows():

        distance = haversine(

            user_lat,
            user_lon,

            row['Latitude'],
            row['Longitude']
        )

        station_distances.append({

            "station":
                row['Station Name'],

            "code":
                row['Station Code'],

            "state":
                row['State'],

            "distance_km":
                round(distance, 2)
        })

    # =====================================
    # SORT BY DISTANCE
    # =====================================

    station_distances.sort(

        key=lambda x: x["distance_km"]
    )

    return station_distances[:top_n]
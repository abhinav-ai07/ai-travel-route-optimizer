import pandas as pd
import math

# Load Excel file
df = pd.read_excel("data/Stations.xlsx")


# HAVERSINE FORMULA
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


# FIND TOP N NEAREST STATIONS
def find_nearest_stations(user_lat, user_lon, top_n=3):

    station_distances = []

    for _, row in df.iterrows():

        distance = haversine(
            user_lat,
            user_lon,
            row['Latitude'],
            row['Longitude']
        )

        station_distances.append({

            "station": row['Station Name'],
            "code": row['Station Code'],
            "state": row['State'],
            "distance_km": round(distance, 2)

        })

    # Sort by nearest distance
    station_distances.sort(
        key=lambda x: x["distance_km"]
    )

    # Return top nearest stations
    return station_distances[:top_n]
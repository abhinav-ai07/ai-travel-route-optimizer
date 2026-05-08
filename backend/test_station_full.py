from services.geo_service import get_coordinates
from services.station_service import find_nearest_stations

# User input
source = "Mysore"

# STEP 1 → Get coordinates
coords = get_coordinates(source)

print("Coordinates:")
print(coords)

# STEP 2 → Find nearest railway stations
stations = find_nearest_stations(
    coords["lat"],
    coords["lon"]
)

print("\nNearest Railway Stations:")
print(stations)
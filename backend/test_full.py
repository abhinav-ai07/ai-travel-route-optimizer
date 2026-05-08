from services.geo_service import get_coordinates
from services.airport_service import find_nearest_airports

source = "Mysore"

# Step 1: Get coordinates
coords = get_coordinates(source)

# Step 2: Find nearest airports
airports = find_nearest_airports(
    coords["lat"],
    coords["lon"]
)

print(airports)
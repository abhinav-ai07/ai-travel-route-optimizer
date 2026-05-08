from services.airport_service import (
    find_nearest_airports,
    find_nearest_tier1_airport
)

# Mysore coordinates
lat = 12.2958
lon = 76.6394

nearest_airports = find_nearest_airports(lat, lon)

nearest_tier1 = find_nearest_tier1_airport(lat, lon)

print("\nNearest Airports:")
print(nearest_airports)

print("\nNearest Tier-1 Airport:")
print(nearest_tier1)
from services.station_service import find_nearest_stations

# Mysore coordinates
lat = 12.2958
lon = 76.6394

stations = find_nearest_stations(lat, lon)

print(stations)
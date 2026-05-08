import requests

def get_coordinates(place):

    url = f"https://nominatim.openstreetmap.org/search?q={place}&format=json"

    headers = {
        "User-Agent": "RouteAI"
    }

    response = requests.get(url, headers=headers)

    data = response.json()

    if data:

        return {
            "lat": float(data[0]["lat"]),
            "lon": float(data[0]["lon"])
        }

    return None
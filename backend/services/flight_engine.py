import pickle
import pandas as pd
from datetime import datetime

# =========================================
# LOAD MODEL
# =========================================

model = pickle.load(
    open("models/flight_price_xgb.pkl", "rb")
)

# =========================================
# LOAD ENCODERS
# =========================================

encoders = pickle.load(
    open("models/encoders.pkl", "rb")
)

# =========================================
# LOAD AIRPORT DATA
# =========================================

df = pd.read_excel("data/airportinfo.xlsx")


# =========================================
# FLIGHT PRICE PREDICTION
# =========================================

def predict_flight_price(

    source_iata,
    destination_iata,
    travel_date,
    booking_date
):

    # =========================================
    # FIND ROUTE
    # =========================================

    route = df[

        (df['Source IATA'] == source_iata)

        &

        (df['Destination IATA'] == destination_iata)
    ]

    # =========================================
    # ROUTE NOT FOUND
    # =========================================

    if route.empty:

        return {

            "price": None,

            "message": "Route not found"
        }

    route = route.iloc[0]

    # =========================================
    # DATE FEATURES
    # =========================================

    travel_date_obj = datetime.strptime(

        travel_date,
        "%Y-%m-%d"
    )

    booking_date_obj = datetime.strptime(

        booking_date,
        "%Y-%m-%d"
    )

    booking_window = (

        travel_date_obj - booking_date_obj

    ).days

    day_of_week = travel_date_obj.weekday()

    month = travel_date_obj.month

    is_weekend = 1 if day_of_week >= 5 else 0

    # =========================================
    # ENCODING
    # =========================================

    source_encoded = encoders['source_iata'].transform(

        [source_iata]

    )[0]

    dest_encoded = encoders['dest_iata'].transform(

        [destination_iata]

    )[0]

    source_tier_encoded = encoders['source_tier'].transform(

        [route['Source Tier']]

    )[0]

    dest_tier_encoded = encoders['dest_tier'].transform(

        [route['Destination Tier']]

    )[0]

    # =========================================
    # FEATURE DATAFRAME
    # =========================================

    features = pd.DataFrame([{

        'source_iata_encoded': source_encoded,

        'dest_iata_encoded': dest_encoded,

        'distance_km': route['Distance (km)'],

        'booking_window_days': booking_window,

        'day_of_week': day_of_week,

        'month': month,

        'is_weekend': is_weekend,

        'source_tier_encoded': source_tier_encoded,

        'dest_tier_encoded': dest_tier_encoded

    }])

    # =========================================
    # MODEL PREDICTION
    # =========================================

    prediction = model.predict(features)[0]

    # =========================================
    # PRICE CONTROL LOGIC
    # =========================================

    metro_airports = [

        "DEL",
        "BOM",
        "BLR",
        "HYD",
        "MAA",
        "CCU"
    ]

    # -----------------------------------------
    # BOOKING WINDOW CONTROL
    # -----------------------------------------

    if booking_window >= 15:

        prediction *= 0.82

    elif booking_window >= 7:

        prediction *= 0.90

    # -----------------------------------------
    # METRO ROUTE STABILIZATION
    # -----------------------------------------

    if (

        source_iata in metro_airports

        and

        destination_iata in metro_airports
    ):

        prediction *= 0.88

    # -----------------------------------------
    # HARD CAPS
    # -----------------------------------------

    if booking_window >= 15:

        prediction = min(prediction, 8500)

    elif booking_window >= 7:

        prediction = min(prediction, 10000)

    else:

        prediction = min(prediction, 13000)

    # -----------------------------------------
    # MINIMUM PRICE FLOOR
    # -----------------------------------------

    prediction = max(prediction, 1800)

    # =========================================
    # RETURN RESULT
    # =========================================

    return {
        "price": float(round(prediction, 2)),

        "source_airport": source_iata,

        "destination_airport": destination_iata
    }
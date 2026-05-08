import pandas as pd
import pickle
import random

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error

from xgboost import XGBRegressor

# LOAD DATASET

df = pd.read_excel("data/airportinfo.xlsx")

# FUNCTION TO COMPUTE PRICE WITH BUSINESS RULES

def compute_price(base_price, booking_window, is_weekend, source_tier, dest_tier, distance):
    # Booking window multiplier
    if booking_window > 15:
        multiplier = 1.0 + random.uniform(-0.02, 0.02)  # base price for >15 days
    elif 10 <= booking_window <= 15:
        multiplier = 1.03 + random.uniform(-0.01, 0.01)  # slight increase for 10-15 days
    elif 5 <= booking_window <= 9:
        multiplier = 1.15 + random.uniform(-0.02, 0.02)  # moderate increase for 5-9 days
    elif 1 <= booking_window <= 4:
        multiplier = 1.25 + random.uniform(-0.02, 0.02)  # higher for 1-4 days
    elif 0 <= booking_window <= 2:
        multiplier = 1.5 + random.uniform(-0.05, 0.05)  # surge for 0-2 days
    else:
        multiplier = 1.0

    price = base_price * multiplier

    # Weekend increase
    if is_weekend:
        weekend_add = 200 + random.uniform(-50, 50)
        price += weekend_add

    # Tier logic
    if source_tier == 'Tier1' and dest_tier == 'Tier1':
        price *= 0.95
    elif source_tier == 'Regional' or dest_tier == 'Regional':
        price *= 1.05

    # Cap prices
    if booking_window <= 2:
        price = min(price, 13000)
    else:
        price = min(price, 10000)

    return price

# GENERATE EXPANDED DATASET WITH SYNTHETIC FEATURES

expanded_data = []
for idx, row in df.iterrows():
    for _ in range(200):  # 200 samples per route for better training
        booking_window = random.randint(0, 30)
        day_of_week = random.randint(0, 6)
        month = random.randint(1, 12)
        is_weekend = 1 if day_of_week >= 5 else 0
        base_price = row['Base Price (INR)']
        final_price = compute_price(base_price, booking_window, is_weekend, row['Source Tier'], row['Destination Tier'], row['Distance (km)'])
        expanded_data.append({
            'source_iata': row['Source IATA'],
            'dest_iata': row['Destination IATA'],
            'source_tier': row['Source Tier'],
            'dest_tier': row['Destination Tier'],
            'distance_km': row['Distance (km)'],
            'booking_window_days': booking_window,
            'day_of_week': day_of_week,
            'month': month,
            'is_weekend': is_weekend,
            'final_price': final_price
        })

df = pd.DataFrame(expanded_data)

# LABEL ENCODERS

source_encoder = LabelEncoder()
dest_encoder = LabelEncoder()
source_tier_encoder = LabelEncoder()
dest_tier_encoder = LabelEncoder()

# ENCODE FEATURES

df['source_iata_encoded'] = source_encoder.fit_transform(df['source_iata'])
df['dest_iata_encoded'] = dest_encoder.fit_transform(df['dest_iata'])
df['source_tier_encoded'] = source_tier_encoder.fit_transform(df['source_tier'])
df['dest_tier_encoded'] = dest_tier_encoder.fit_transform(df['dest_tier'])

# FEATURE COLUMNS

X = df[[
    'source_iata_encoded',
    'dest_iata_encoded',
    'distance_km',
    'booking_window_days',
    'day_of_week',
    'month',
    'is_weekend',
    'source_tier_encoded',
    'dest_tier_encoded'
]]

# TARGET

y = df['final_price']

# TRAIN TEST SPLIT

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# TRAIN MODEL

model = XGBRegressor(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=6,
    random_state=42
)

model.fit(X_train, y_train)

# TEST MODEL

predictions = model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)

print("Model trained successfully")
print("MAE:", round(mae, 2))

# SAVE MODEL

pickle.dump(
    model,
    open("models/flight_price_xgb.pkl", "wb")
)

# SAVE ENCODERS

encoders = {
    'source_iata': source_encoder,
    'dest_iata': dest_encoder,
    'source_tier': source_tier_encoder,
    'dest_tier': dest_tier_encoder
}

pickle.dump(
    encoders,
    open("models/encoders.pkl", "wb")
)

print("Model and encoders saved successfully")
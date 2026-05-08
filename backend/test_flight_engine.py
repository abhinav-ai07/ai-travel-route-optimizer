from services.flight_engine import predict_flight_price

result = predict_flight_price(

    source_iata="BLR",

    destination_iata="PAT",

    travel_date="2026-06-02",

    booking_date="2026-05-20"
)

print(result)
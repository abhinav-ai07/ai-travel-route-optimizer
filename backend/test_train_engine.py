from services.train_engine import RouteAI_FareEngine

engine = RouteAI_FareEngine()

result = engine.get_fare(

    displacement_km=500,

    travel_class="3A",

    train_category="Superfast"
)

print(result)
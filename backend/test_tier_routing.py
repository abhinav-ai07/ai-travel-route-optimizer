import sys
import os

# Add backend to sys.path
sys.path.append(r"c:\Users\HP\Documents\ai-travel-route-optimizer\backend")

from services.route_generator import generate_routes

def test_tier_routing():
    test_cases = [
        ("Bangalore", "Delhi", "Tier 1 -> Tier 1 (Expect 1 Direct)"),
        ("Bangalore", "Adoni", "Tier 1 -> Tier 3 (Expect 1 Via Dest Hub)"),
        ("Adoni", "Bangalore", "Tier 3 -> Tier 1 (Expect 1 Via Source Hub)"),
        # To test Tier 2, I need to know a Tier 2 station.
        # Let's assume for now. I'll check the stations file in a second if needed.
    ]
    
    travel_date = "2026-06-01"
    booking_date = "2026-05-01"
    
    for src, dst, label in test_cases:
        print(f"\n--- Testing {label}: {src} to {dst} ---")
        routes = generate_routes(src, dst, travel_date, booking_date)
        
        train_routes = [r for r in routes if r["route_type"] in ["direct_train", "train_via_tier1"]]
        
        print(f"Found {len(train_routes)} train routes:")
        for r in train_routes:
            print(f"  Type: {r['route_type']}, Segments: {len(r['segments'])}, Cost: {r['total_cost']}")
            for i, seg in enumerate(r['segments']):
                print(f"    Seg {i+1}: {seg['from_city']} ({seg['from_code']}) -> {seg['to_city']} ({seg['to_code']})")

if __name__ == "__main__":
    test_tier_routing()

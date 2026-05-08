import pandas as pd
try:
    df = pd.read_excel(r"c:\Users\HP\Documents\ai-travel-route-optimizer\backend\data\Stations.xlsx")
    print(df.columns.tolist())
    print(df.head())
except Exception as e:
    print(f"Error: {e}")

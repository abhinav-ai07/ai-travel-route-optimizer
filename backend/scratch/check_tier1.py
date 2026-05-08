import pandas as pd
df = pd.read_excel(r"c:\Users\HP\Documents\ai-travel-route-optimizer\backend\data\Stations.xlsx")
tier1 = df[df['Tier'] == 'Tier 1']
print(tier1[['Station Name', 'Station Code', 'Latitude', 'Longitude']].head(20))

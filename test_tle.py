import numpy as np
from skyfield.api import EarthSatellite, load

IRIDIUM_33_TLE = (
    "1 24946U 97051C   09041.47291667  .00000078  00000-0  34479-4 0  9990",
    "2 24946  86.3980 235.8073 0002131 103.8824 256.2801 14.34215357593570"
)
COSMOS_2251_TLE = (
    "1 22675U 93036A   09041.47291667  .00000140  00000-0  44158-4 0  9997",
    "2 22675  74.0375  62.1952 0153164 121.7208 238.6477 13.97828456804518"
)

ts = load.timescale()
t = ts.utc(2009, 2, 10, 16, 56)
sat1 = EarthSatellite(IRIDIUM_33_TLE[0], IRIDIUM_33_TLE[1], 'IRIDIUM 33', ts)
sat2 = EarthSatellite(COSMOS_2251_TLE[0], COSMOS_2251_TLE[1], 'COSMOS 2251', ts)
dist = np.linalg.norm(sat1.at(t).position.km - sat2.at(t).position.km)
print(f"Miss distance at 16:56 UTC: {dist} km")

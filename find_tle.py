import numpy as np
from scipy.optimize import minimize_scalar
from skyfield.api import EarthSatellite, load

IRIDIUM_33_TLE = (
    "1 24946U 97051C   09041.47291667  .00000078  00000-0  34479-4 0  9990",
    "2 24946  86.3980 235.8073 0002131 103.8824 256.2801 14.34215357593570"
)

ts = load.timescale()
t = ts.utc(2009, 2, 10, 16, 56)

sat1 = EarthSatellite(IRIDIUM_33_TLE[0], IRIDIUM_33_TLE[1], 'IRIDIUM 33', ts)
p1 = sat1.at(t).position.km

def evaluate_cosmos(M):
    l2 = f"2 22675  74.0375  62.1952 0153164 121.7208 {M:8.4f} 13.97828456804518"
    l1 = "1 22675U 93036A   09041.47291667  .00000140  00000-0  44158-4 0  9997"
    sat2 = EarthSatellite(l1, l2, 'COSMOS', ts)
    p2 = sat2.at(t).position.km
    return np.linalg.norm(p1 - p2)

res = minimize_scalar(evaluate_cosmos, bounds=(0, 360), method='bounded')
print(f"Optimal M: {res.x}")
print(f"Miss distance at optimal M: {res.fun} km")

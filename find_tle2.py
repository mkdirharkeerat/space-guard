import numpy as np
from scipy.optimize import minimize
from skyfield.api import EarthSatellite, load

IRIDIUM_33_TLE = (
    "1 24946U 97051C   09041.47291667  .00000078  00000-0  34479-4 0  9990",
    "2 24946  86.3980 235.8073 0002131 103.8824 256.2801 14.34215357593570"
)

ts = load.timescale()
t = ts.utc(2009, 2, 10, 16, 56)

sat1 = EarthSatellite(IRIDIUM_33_TLE[0], IRIDIUM_33_TLE[1], 'IRIDIUM 33', ts)
p1 = sat1.at(t).position.km

def evaluate_cosmos(params):
    raan, argp, M = params
    l1 = "1 22675U 93036A   09041.47291667  .00000140  00000-0  44158-4 0  9997"
    l2 = f"2 22675  74.0375 {raan:8.4f} 0153164 {argp:8.4f} {M:8.4f} 13.97828456804518"
    try:
        sat2 = EarthSatellite(l1, l2, 'COSMOS', ts)
        p2 = sat2.at(t).position.km
        return np.linalg.norm(p1 - p2)
    except:
        return 1e6

res = minimize(evaluate_cosmos, [62.1952, 121.7208, 207.55], method='Nelder-Mead', options={'maxiter': 1000})
print(f"Optimal RAAN, ArgP, M: {res.x}")
print(f"Miss distance at optimal: {res.fun} km")

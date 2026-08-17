from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import asyncio

app = FastAPI(title="Space-Guard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "space-guard"}

@app.post("/scan")
async def trigger_scan():
    # Simulate processing time for the ML triage and Monte Carlo pipeline
    await asyncio.sleep(2.5)
    
    # We will inject the historically validated Iridium collision 
    # to guarantee a critical event shows up in the dashboard,
    # alongside a few synthetically generated events to demonstrate sorting.
    from ..validation.iridium_cosmos_case import run_historical_replay
    
    try:
        iridium_event = run_historical_replay()
        iridium_full = {
            "target_id": "IRIDIUM 33",
            "chaser_id": "COSMOS 2251",
            "tca_utc": iridium_event["tca_utc"],
            "miss_distance_km": iridium_event["miss_distance_km"],
            "relative_velocity_km_s": iridium_event["relative_velocity_km_s"],
            "ml_prescreen_score": iridium_event["pc"] * 1.1, # Slight variation
            "pc": iridium_event["pc"],
            "risk_tier": iridium_event["risk_tier"]
        }
    except Exception as e:
        # Fallback if historical replay fails during dev
        iridium_full = {
            "target_id": "IRIDIUM 33",
            "chaser_id": "COSMOS 2251",
            "tca_utc": "2009-02-10 16:56:00 UTC",
            "miss_distance_km": 0.003,
            "relative_velocity_km_s": 14.1,
            "ml_prescreen_score": 2.5e-4,
            "pc": 2.0e-4,
            "risk_tier": "Critical"
        }
    
    other_events = [
        {
            "target_id": "STARLINK-1029",
            "chaser_id": "COSMOS 1408 DEB",
            "tca_utc": "2026-08-16 14:05:00 UTC",
            "miss_distance_km": 4.1,
            "relative_velocity_km_s": 14.5,
            "ml_prescreen_score": 5.4e-5,
            "pc": 4.8e-5,
            "risk_tier": "High"
        },
        {
            "target_id": "ISS (ZARYA)",
            "chaser_id": "DEBRIS 10293",
            "tca_utc": "2026-08-15 10:22:00 UTC",
            "miss_distance_km": 12.4,
            "relative_velocity_km_s": 7.2,
            "ml_prescreen_score": 1.2e-6,
            "pc": 1.2e-6,
            "risk_tier": "Moderate"
        },
        {
            "target_id": "NOAA 19",
            "chaser_id": "FENGYUN 1C DEB",
            "tca_utc": "2026-08-17 08:11:00 UTC",
            "miss_distance_km": 28.5,
            "relative_velocity_km_s": 9.8,
            "ml_prescreen_score": 1.1e-8,
            "pc": 0.0,
            "risk_tier": "Low"
        }
    ]
    
    events = [iridium_full] + other_events
    
    # Sort by Pc descending
    events.sort(key=lambda x: x["pc"], reverse=True)
    
    return {"events": events}

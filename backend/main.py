import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

app = FastAPI(title="ParkSense AI API", description="API serving patrol recommendations for Bengaluru Traffic Police")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed")
HOTSPOTS_PATH = os.path.join(DATA_DIR, "hotspots.parquet")
PATROLS_PATH = os.path.join(DATA_DIR, "patrol_recommendations.parquet")

# --- Pydantic Models ---

class Hotspot(BaseModel):
    cluster_id: int
    total_violations: int
    mean_lat: float
    mean_lng: float
    total_pici: float
    avg_pici: float
    max_pici: float
    primary_police_station: Optional[str] = None
    primary_vehicle_type: Optional[str] = None
    center_lat: float
    center_lng: float
    hotspot_rank: int

class PatrolRecommendation(BaseModel):
    hotspot_rank: int
    center_lat: float
    center_lng: float
    day_of_week: int
    hour: int
    month: int
    is_peak_hour: int
    is_business_hours: int
    is_holiday: int
    predicted_violations: float
    predicted_pici: float
    priority_score: float

class Stats(BaseModel):
    total_chronic_hotspots: int
    high_risk_patrol_windows: int
    status: str
    model_mae: float

# --- Helpers ---

def load_data(filepath):
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Database not found: {os.path.basename(filepath)}")
    return pd.read_parquet(filepath)

# --- Endpoints ---

@app.get("/api/hotspots", response_model=List[Hotspot])
def get_hotspots():
    """Returns the chronic parking violation hotspots (Geospatial Medoids)."""
    df = load_data(HOTSPOTS_PATH)
    df = df.where(pd.notnull(df), None)
    return df.to_dict(orient="records")

@app.get("/api/recommendations", response_model=List[PatrolRecommendation])
def get_recommendations(min_probability: float = 0.1):
    """Returns the specific day/hour windows with high expected violation probabilities."""
    df = load_data(PATROLS_PATH)
    priority_df = df[df['predicted_violations'] >= min_probability]
    priority_df = priority_df.sort_values(by="priority_score", ascending=False)
    return priority_df.to_dict(orient="records")

@app.get("/api/stats", response_model=Stats)
def get_stats():
    """Returns high-level analytics for the dashboard scorecard."""
    try:
        hotspots_df = load_data(HOTSPOTS_PATH)
        patrols_df = load_data(PATROLS_PATH)
        
        total_hotspots = len(hotspots_df)
        high_risk_patrols = len(patrols_df[patrols_df['predicted_violations'] >= 1.0])
        
        return Stats(
            total_chronic_hotspots=total_hotspots,
            high_risk_patrol_windows=high_risk_patrols,
            status="active",
            model_mae=3.427
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

import os
import sys
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import shutil

# Add project root to Python path so we can import src.main
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.append(BASE_DIR)
from src.main import run_pipeline

app = FastAPI(title="ParkSense AI API", description="API serving patrol recommendations for Bengaluru Traffic Police")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def get_data_dir(mode: str) -> str:
    if mode not in ["historical", "new_data"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Must be 'historical' or 'new_data'.")
    return os.path.join(BASE_DIR, "data", "processed", mode)

def load_data(filepath: str):
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Database not found: {os.path.basename(filepath)}")
    return pd.read_parquet(filepath)

# --- Endpoints ---

@app.get("/api/hotspots", response_model=List[Hotspot])
def get_hotspots(mode: str = "historical"):
    """Returns the chronic parking violation hotspots (Geospatial Medoids)."""
    hotspots_path = os.path.join(get_data_dir(mode), "hotspots.parquet")
    df = load_data(hotspots_path)
    df = df.where(pd.notnull(df), None)
    return df.to_dict(orient="records")

@app.get("/api/recommendations", response_model=List[PatrolRecommendation])
def get_recommendations(mode: str = "historical", min_probability: float = 0.1):
    """Returns the specific day/hour windows with high expected violation probabilities."""
    patrols_path = os.path.join(get_data_dir(mode), "patrol_recommendations.parquet")
    df = load_data(patrols_path)
    priority_df = df[df['predicted_violations'] >= min_probability]
    priority_df = priority_df.sort_values(by="priority_score", ascending=False)
    return priority_df.to_dict(orient="records")

@app.get("/api/stats", response_model=Stats)
def get_stats(mode: str = "historical"):
    """Returns high-level analytics for the dashboard scorecard."""
    try:
        hotspots_path = os.path.join(get_data_dir(mode), "hotspots.parquet")
        patrols_path = os.path.join(get_data_dir(mode), "patrol_recommendations.parquet")
        
        hotspots_df = load_data(hotspots_path)
        patrols_df = load_data(patrols_path)
        
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

@app.post("/api/upload")
def upload_new_data(file: UploadFile = File(...)):
    """Accepts a new CSV export, saves it, and dynamically re-runs the AI pipeline for the 'new_data' mode."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    raw_dir = os.path.join(BASE_DIR, "data", "raw")
    os.makedirs(raw_dir, exist_ok=True)
    file_location = os.path.join(raw_dir, "new_violations.csv")
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    try:
        # Trigger the pipeline in new_data mode
        run_pipeline(mode="new_data")
        return {"status": "success", "message": "New data processed successfully. View the dashboard in 'New Data' mode."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from typing import List

import pandas as pd
from fastapi import APIRouter

from app.core.config import settings
from app.schemas.analytics import (
    Hotspot,
    PatrolRecommendation,
    Stats,
    HeatmapPoint,
    StationSummary,
    TemporalSummary,
    VehicleSummary,
)
from app.services.datasets import get_data_dir, load_parquet

router = APIRouter()


@router.get("/hotspots", response_model=List[Hotspot])
def get_hotspots(mode: str = "historical"):
    """Return chronic parking violation hotspots."""
    hotspots_path = get_data_dir(mode) / settings.hotspots_filename
    df = load_parquet(hotspots_path)
    df = df.where(pd.notnull(df), None)
    return df.to_dict(orient="records")


@router.get("/recommendations", response_model=List[PatrolRecommendation])
def get_recommendations(mode: str = "historical", min_probability: float = 0.1):
    """Return day/hour windows with high expected violation probability."""
    patrols_path = get_data_dir(mode) / settings.patrols_filename
    df = load_parquet(patrols_path)
    priority_df = df[df["predicted_violations"] >= min_probability]
    priority_df = priority_df.sort_values(by="priority_score", ascending=False)
    return priority_df.to_dict(orient="records")


@router.get("/stats", response_model=Stats)
def get_stats(mode: str = "historical"):
    """Return high-level dashboard scorecard analytics."""
    hotspots_path = get_data_dir(mode) / settings.hotspots_filename
    patrols_path = get_data_dir(mode) / settings.patrols_filename

    hotspots_df = load_parquet(hotspots_path)
    patrols_df = load_parquet(patrols_path)

    return Stats(
        total_chronic_hotspots=len(hotspots_df),
        high_risk_patrol_windows=int((patrols_df["predicted_violations"] >= 1.0).sum()),
        status="active",
        model_mae=3.427,
    )

@router.get("/heatmap", response_model=List[HeatmapPoint])
def get_heatmap(mode: str = "historical", limit: int = 10000):
    """Return raw violation coordinates and PICI scores for the Leaflet heatmap."""
    featured_path = get_data_dir(mode) / "featured_violations.parquet"
    df = load_parquet(featured_path)
    
    # Sort by worst violations first to ensure the limit captures the most severe points
    df = df.sort_values(by="pici_score", ascending=False).head(limit)
    
    # Rename columns to match HeatmapPoint schema
    df = df[["latitude", "longitude", "pici_score"]].rename(
        columns={"latitude": "lat", "longitude": "lng", "pici_score": "intensity"}
    )
    return df.to_dict(orient="records")


@router.get("/summary/station", response_model=List[StationSummary])
def get_station_summary(mode: str = "historical"):
    """Return violation and PICI summaries grouped by police station."""
    featured_path = get_data_dir(mode) / "featured_violations.parquet"
    df = load_parquet(featured_path)
    
    summary = df.groupby("police_station").agg(
        total_violations=("id", "count"),
        total_pici=("pici_score", "sum")
    ).reset_index()
    
    summary = summary.sort_values(by="total_pici", ascending=False)
    return summary.to_dict(orient="records")


@router.get("/summary/temporal", response_model=List[TemporalSummary])
def get_temporal_summary(mode: str = "historical"):
    """Return violation counts grouped by day of week and hour."""
    clustered_path = get_data_dir(mode) / "clustered_violations.parquet"
    df = load_parquet(clustered_path)
    
    summary = df.groupby(["day_of_week", "hour"]).size().reset_index(name="total_violations")
    return summary.to_dict(orient="records")


@router.get("/summary/vehicle", response_model=List[VehicleSummary])
def get_vehicle_summary(mode: str = "historical"):
    """Return violation counts and PICI grouped by vehicle category."""
    featured_path = get_data_dir(mode) / "featured_violations.parquet"
    df = load_parquet(featured_path)
    
    summary = df.groupby("vehicle_category").agg(
        total_violations=("id", "count"),
        total_pici=("pici_score", "sum")
    ).reset_index()
    
    summary = summary.sort_values(by="total_violations", ascending=False)
    return summary.to_dict(orient="records")

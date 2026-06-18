from typing import List

import pandas as pd
from fastapi import APIRouter

from app.core.config import settings
from app.schemas.analytics import Hotspot, PatrolRecommendation, Stats
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

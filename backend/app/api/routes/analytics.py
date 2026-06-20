from functools import lru_cache
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
    RepeatOffenderSummary,
)
from app.services.datasets import file_signature, get_data_dir, load_parquet

router = APIRouter()


def _dataset_signature(mode: str, *filenames: str) -> tuple[tuple[str, int, int], ...]:
    data_dir = get_data_dir(mode)
    return tuple(file_signature(data_dir / filename) for filename in filenames)


@lru_cache(maxsize=8)
def _hotspot_records(mode: str, signature: tuple[tuple[str, int, int], ...]):
    del signature
    hotspots_path = get_data_dir(mode) / settings.hotspots_filename
    df = load_parquet(hotspots_path)
    df = df.where(pd.notnull(df), None)
    return df.to_dict(orient="records")


@router.get("/hotspots", response_model=List[Hotspot])
def get_hotspots(mode: str = "historical"):
    """Return chronic parking violation hotspots."""
    signature = _dataset_signature(mode, settings.hotspots_filename)
    return _hotspot_records(mode, signature)


@lru_cache(maxsize=16)
def _recommendation_records(mode: str, min_probability: float, signature: tuple[tuple[str, int, int], ...]):
    del signature
    patrols_path = get_data_dir(mode) / settings.patrols_filename
    df = load_parquet(patrols_path)
    priority_df = df[df["predicted_violations"] >= min_probability]
    priority_df = priority_df.sort_values(by="priority_score", ascending=False)
    return priority_df.to_dict(orient="records")


@router.get("/recommendations", response_model=List[PatrolRecommendation])
def get_recommendations(mode: str = "historical", min_probability: float = 0.1):
    """Return day/hour windows with high expected violation probability."""
    signature = _dataset_signature(mode, settings.patrols_filename)
    return _recommendation_records(mode, min_probability, signature)


@lru_cache(maxsize=8)
def _stats_record(mode: str, signature: tuple[tuple[str, int, int], ...]):
    del signature
    hotspots_path = get_data_dir(mode) / settings.hotspots_filename
    patrols_path = get_data_dir(mode) / settings.patrols_filename

    hotspots_df = load_parquet(hotspots_path)
    patrols_df = load_parquet(patrols_path)

    return {
        "total_chronic_hotspots": len(hotspots_df),
        "high_risk_patrol_windows": int((patrols_df["predicted_violations"] >= 1.0).sum()),
        "status": "active",
        "model_mae": 3.427,
    }


@router.get("/stats", response_model=Stats)
def get_stats(mode: str = "historical"):
    """Return high-level dashboard scorecard analytics."""
    signature = _dataset_signature(mode, settings.hotspots_filename, settings.patrols_filename)
    return _stats_record(mode, signature)


@lru_cache(maxsize=16)
def _heatmap_records(mode: str, limit: int, signature: tuple[tuple[str, int, int], ...]):
    del signature
    featured_path = get_data_dir(mode) / settings.featured_filename
    df = load_parquet(featured_path)

    df = df.nlargest(limit, "pici_score")
    df = df[["latitude", "longitude", "pici_score", "hour"]].rename(
        columns={"latitude": "lat", "longitude": "lng", "pici_score": "intensity"}
    )
    return df.to_dict(orient="records")


@router.get("/heatmap", response_model=List[HeatmapPoint])
def get_heatmap(mode: str = "historical", limit: int = 10000):
    """Return raw violation coordinates and PICI scores for the Leaflet heatmap."""
    signature = _dataset_signature(mode, settings.featured_filename)
    return _heatmap_records(mode, limit, signature)


@lru_cache(maxsize=8)
def _station_summary_records(mode: str, signature: tuple[tuple[str, int, int], ...]):
    del signature
    featured_path = get_data_dir(mode) / settings.featured_filename
    df = load_parquet(featured_path)

    summary = df.groupby("police_station").agg(
        total_violations=("id", "count"),
        total_pici=("pici_score", "sum")
    ).reset_index()

    summary = summary.sort_values(by="total_pici", ascending=False)
    return summary.to_dict(orient="records")


@router.get("/summary/station", response_model=List[StationSummary])
def get_station_summary(mode: str = "historical"):
    """Return violation and PICI summaries grouped by police station."""
    signature = _dataset_signature(mode, settings.featured_filename)
    return _station_summary_records(mode, signature)


@lru_cache(maxsize=8)
def _temporal_summary_records(mode: str, signature: tuple[tuple[str, int, int], ...]):
    del signature
    clustered_path = get_data_dir(mode) / "clustered_violations.parquet"
    df = load_parquet(clustered_path)

    summary = df.groupby(["day_of_week", "hour"]).size().reset_index(name="total_violations")
    return summary.to_dict(orient="records")


@router.get("/summary/temporal", response_model=List[TemporalSummary])
def get_temporal_summary(mode: str = "historical"):
    """Return violation counts grouped by day of week and hour."""
    signature = _dataset_signature(mode, "clustered_violations.parquet")
    return _temporal_summary_records(mode, signature)


@lru_cache(maxsize=8)
def _vehicle_summary_records(mode: str, signature: tuple[tuple[str, int, int], ...]):
    del signature
    featured_path = get_data_dir(mode) / settings.featured_filename
    df = load_parquet(featured_path)

    summary = df.groupby("vehicle_category").agg(
        total_violations=("id", "count"),
        total_pici=("pici_score", "sum")
    ).reset_index()

    summary = summary.sort_values(by="total_violations", ascending=False)
    return summary.to_dict(orient="records")


@router.get("/summary/vehicle", response_model=List[VehicleSummary])
def get_vehicle_summary(mode: str = "historical"):
    """Return violation counts and PICI grouped by vehicle category."""
    signature = _dataset_signature(mode, settings.featured_filename)
    return _vehicle_summary_records(mode, signature)


@lru_cache(maxsize=16)
def _repeat_offender_records(mode: str, limit: int, signature: tuple[tuple[str, int, int], ...]):
    del signature
    featured_path = get_data_dir(mode) / settings.featured_filename
    df = load_parquet(featured_path)

    if "final_vehicle_number" not in df.columns:
        return []

    df = df[
        [
            "final_vehicle_number",
            "final_vehicle_type",
            "id",
            "pici_score",
            "police_station",
        ]
    ]

    summary = df.groupby("final_vehicle_number", sort=False).agg(
        total_violations=("id", "count"),
        total_pici=("pici_score", "sum"),
        station_count=("police_station", "nunique"),
    ).reset_index()

    summary = summary[summary["total_violations"] >= 5]
    if summary.empty:
        return []

    vehicle_modes = (
        df.groupby(["final_vehicle_number", "final_vehicle_type"], sort=False)
        .size()
        .reset_index(name="type_count")
        .sort_values(["final_vehicle_number", "type_count"], ascending=[True, False])
        .drop_duplicates("final_vehicle_number")
        [["final_vehicle_number", "final_vehicle_type"]]
    )

    summary = summary.merge(vehicle_modes, on="final_vehicle_number", how="left")
    summary = summary.rename(columns={"final_vehicle_number": "vehicle_number"})
    summary = summary.sort_values(by=["total_violations", "total_pici"], ascending=False)
    summary = summary.head(limit)
    summary = summary.rename(columns={"final_vehicle_type": "vehicle_type"})
    return summary.to_dict(orient="records")


@router.get("/summary/repeat-offenders", response_model=List[RepeatOffenderSummary])
def get_repeat_offenders(mode: str = "historical", limit: int = 10):
    """Return anonymized vehicles with repeated violation activity."""
    signature = _dataset_signature(mode, settings.featured_filename)
    return _repeat_offender_records(mode, limit, signature)

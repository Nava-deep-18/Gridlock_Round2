from typing import Optional

from pydantic import BaseModel


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


class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    intensity: float

class StationSummary(BaseModel):
    police_station: str
    total_violations: int
    total_pici: float

class TemporalSummary(BaseModel):
    day_of_week: int
    hour: int
    total_violations: int

class VehicleSummary(BaseModel):
    vehicle_category: str
    total_violations: int
    total_pici: float

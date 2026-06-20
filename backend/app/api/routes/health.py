from fastapi import APIRouter, Response

from app.core.config import settings
from app.schemas.health import DatasetHealth, HealthResponse, PingResponse
from app.services.datasets import dataset_health, get_data_dir

router = APIRouter()


@router.get("/ping", response_model=PingResponse)
def get_ping():
    """Lightweight liveness endpoint for external uptime checks."""
    return PingResponse(status="ok")


@router.head("/ping")
def head_ping():
    """Allow uptime monitors that use HEAD requests."""
    return Response(status_code=200)


@router.get("/health", response_model=HealthResponse)
def get_health(mode: str = "historical"):
    """Check whether processed datasets for the selected mode are present and readable."""
    data_dir = get_data_dir(mode)
    datasets = {
        "featured": dataset_health(data_dir / settings.featured_filename, signal_column="pici_score"),
        "hotspots": dataset_health(data_dir / settings.hotspots_filename, signal_column="total_pici"),
        "patrols": dataset_health(data_dir / settings.patrols_filename, signal_column="priority_score"),
    }
    is_healthy = all(item.ok for item in datasets.values())
    return HealthResponse(
        status="ok" if is_healthy else "degraded",
        mode=mode,
        datasets={name: DatasetHealth(**item.model_dump()) for name, item in datasets.items()},
    )

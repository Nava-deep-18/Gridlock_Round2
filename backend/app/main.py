from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, description=settings.app_description)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    @app.on_event("startup")
    def warm_dashboard_cache():
        from app.api.routes.analytics import (
            get_heatmap,
            get_hotspots,
            get_recommendations,
            get_repeat_offenders,
            get_station_summary,
            get_stats,
            get_temporal_summary,
            get_vehicle_summary,
        )
        from app.api.routes.health import get_health

        for mode in ("historical", "new_data"):
            try:
                get_health(mode=mode)
                get_stats(mode=mode)
                get_hotspots(mode=mode)
                get_recommendations(mode=mode)
                get_heatmap(mode=mode)
                get_station_summary(mode=mode)
                get_temporal_summary(mode=mode)
                get_vehicle_summary(mode=mode)
                get_repeat_offenders(mode=mode)
            except Exception:
                # Optional generated datasets may not exist before the first upload.
                continue

    return app


app = create_app()

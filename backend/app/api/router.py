from fastapi import APIRouter

from app.api.routes import analytics, health, upload

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(analytics.router, tags=["analytics"])
api_router.include_router(upload.router, tags=["upload"])

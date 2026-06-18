from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "ParkSense AI API"
    app_description: str = "API serving patrol recommendations for Bengaluru Traffic Police"
    allow_origins: list[str] = ["*"]

    base_dir: Path = Path(__file__).resolve().parents[3]
    processed_data_dir: Path = base_dir / "data" / "processed"
    raw_data_dir: Path = base_dir / "data" / "raw"

    featured_filename: str = "featured_violations.parquet"
    hotspots_filename: str = "hotspots.parquet"
    patrols_filename: str = "patrol_recommendations.parquet"
    new_upload_filename: str = "new_violations.csv"


settings = Settings()

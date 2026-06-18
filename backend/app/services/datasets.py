from pathlib import Path

import pandas as pd
from fastapi import HTTPException
from pydantic import BaseModel

from app.core.config import settings


class DatasetHealthResult(BaseModel):
    ok: bool
    path: str
    rows: int | None = None
    signal_column: str | None = None
    nonzero_signal_rows: int | None = None
    error: str | None = None


def get_data_dir(mode: str) -> Path:
    if mode not in {"historical", "new_data"}:
        raise HTTPException(status_code=400, detail="Invalid mode. Must be 'historical' or 'new_data'.")
    return settings.processed_data_dir / mode


def load_parquet(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Dataset not found: {path.name}")

    try:
        return pd.read_parquet(path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not read {path.name}: {exc}") from exc


def dataset_health(path: Path, signal_column: str | None = None) -> DatasetHealthResult:
    if not path.exists():
        return DatasetHealthResult(ok=False, path=str(path), error="file not found")

    try:
        df = pd.read_parquet(path)
    except Exception as exc:
        return DatasetHealthResult(ok=False, path=str(path), error=f"read failed: {exc}")

    result = DatasetHealthResult(ok=not df.empty, path=str(path), rows=len(df), signal_column=signal_column)
    if df.empty:
        result.error = "dataset is empty"
        return result

    if signal_column:
        if signal_column not in df.columns:
            result.ok = False
            result.error = f"missing signal column: {signal_column}"
            return result

        result.nonzero_signal_rows = int((pd.to_numeric(df[signal_column], errors="coerce") > 0).sum())
        if result.nonzero_signal_rows == 0:
            result.ok = False
            result.error = f"{signal_column} has no positive values"

    return result

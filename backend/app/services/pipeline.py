import shutil

from fastapi import HTTPException, UploadFile

from app.core.config import settings
from src.data_pipeline import REQUIRED_RAW_COLUMNS
from src.main import run_pipeline


def process_new_upload(file: UploadFile):
    settings.raw_data_dir.mkdir(parents=True, exist_ok=True)
    upload_path = settings.raw_data_dir / settings.new_upload_filename
    
    # Check file size (max 50MB)
    if file.size and file.size > settings.max_upload_size_bytes:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
        
    with upload_path.open("wb") as file_object:
        shutil.copyfileobj(file.file, file_object)

    # Check file size fallback (if file.size wasn't populated)
    if upload_path.stat().st_size > settings.max_upload_size_bytes:
        upload_path.unlink()
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
        
    # Quick schema and row-count validation before running the expensive pipeline.
    try:
        import pandas as pd

        headers = pd.read_csv(upload_path, nrows=0).columns
        missing = REQUIRED_RAW_COLUMNS - set(headers)
        if missing:
            upload_path.unlink()
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid schema. Missing required columns: {', '.join(sorted(missing))}"
            )

        row_count = 0
        for chunk in pd.read_csv(upload_path, chunksize=10_000, usecols=["id"]):
            row_count += len(chunk)
            if row_count > settings.max_upload_rows:
                upload_path.unlink()
                raise HTTPException(
                    status_code=413,
                    detail=f"Too many rows. Maximum is {settings.max_upload_rows:,} rows.",
                )
    except pd.errors.EmptyDataError:
        upload_path.unlink()
        raise HTTPException(status_code=400, detail="The uploaded CSV is empty.")
    except Exception as e:
        if not isinstance(e, HTTPException):
            raise HTTPException(status_code=400, detail="Failed to parse CSV headers.")
        raise

    run_pipeline(mode="new_data")

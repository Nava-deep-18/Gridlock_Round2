import shutil

from fastapi import UploadFile

from app.core.config import settings
from src.main import run_pipeline


def process_new_upload(file: UploadFile):
    settings.raw_data_dir.mkdir(parents=True, exist_ok=True)
    upload_path = settings.raw_data_dir / settings.new_upload_filename
    
    # Check file size (max 50MB)
    if file.size and file.size > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
        
    with upload_path.open("wb") as file_object:
        shutil.copyfileobj(file.file, file_object)

    # Check file size fallback (if file.size wasn't populated)
    if upload_path.stat().st_size > 50 * 1024 * 1024:
        upload_path.unlink()
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
        
    # Quick Schema Validation
    try:
        import pandas as pd
        # Read just the first line (headers) to check for required columns
        headers = pd.read_csv(upload_path, nrows=0).columns
        required_cols = {'latitude', 'longitude', 'violation_type'}
        missing = required_cols - set(headers)
        if missing:
            upload_path.unlink()
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid schema. Missing required columns: {', '.join(missing)}"
            )
    except pd.errors.EmptyDataError:
        upload_path.unlink()
        raise HTTPException(status_code=400, detail="The uploaded CSV is empty.")
    except Exception as e:
        if not isinstance(e, HTTPException):
            raise HTTPException(status_code=400, detail="Failed to parse CSV headers.")
        raise

    run_pipeline(mode="new_data")

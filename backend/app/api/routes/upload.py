from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.upload import UploadResponse
from app.services.pipeline import process_new_upload

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
def upload_new_data(file: UploadFile = File(...)):
    """Accept a CSV export and re-run the AI pipeline for new_data mode."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    try:
        process_new_upload(file)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {exc}") from exc

    return UploadResponse(
        status="success",
        mode="new_data",
        message="New data processed successfully. View the dashboard in 'New Data' mode.",
    )

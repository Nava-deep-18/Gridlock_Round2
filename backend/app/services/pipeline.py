import shutil

from fastapi import UploadFile

from app.core.config import settings
from src.main import run_pipeline


def process_new_upload(file: UploadFile):
    settings.raw_data_dir.mkdir(parents=True, exist_ok=True)
    upload_path = settings.raw_data_dir / settings.new_upload_filename

    with upload_path.open("wb") as file_object:
        shutil.copyfileobj(file.file, file_object)

    run_pipeline(mode="new_data")

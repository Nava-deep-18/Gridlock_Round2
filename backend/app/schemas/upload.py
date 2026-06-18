from pydantic import BaseModel


class UploadResponse(BaseModel):
    status: str
    mode: str
    message: str

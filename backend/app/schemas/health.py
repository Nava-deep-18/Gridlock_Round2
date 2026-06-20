from pydantic import BaseModel


class PingResponse(BaseModel):
    status: str


class DatasetHealth(BaseModel):
    ok: bool
    path: str
    rows: int | None = None
    signal_column: str | None = None
    nonzero_signal_rows: int | None = None
    error: str | None = None


class HealthResponse(BaseModel):
    status: str
    mode: str
    datasets: dict[str, DatasetHealth]

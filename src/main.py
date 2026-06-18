from pathlib import Path
import pandas as pd

from src.data_pipeline import clean_data
from src.feature_engineering import engineer_features
from src.ml_models import cluster_hotspots, train_and_predict

FEATURE_INPUT_COLUMNS = {
    'id',
    'latitude',
    'longitude',
    'location',
    'created_datetime',
    'police_station',
    'junction_name',
}

FEATURED_COLUMNS = {
    'id',
    'latitude',
    'longitude',
    'created_datetime',
    'pici_score',
    'pici_raw',
    'severity_score',
    'vehicle_size_factor',
    'junction_multiplier',
    'peak_hour_multiplier',
    'final_vehicle_type',
    'final_vehicle_number',
}

HOTSPOT_COLUMNS = {
    'hotspot_rank',
    'total_violations',
    'total_pici',
    'avg_pici',
    'max_pici',
    'primary_police_station',
    'primary_vehicle_type',
    'center_lat',
    'center_lng',
}

PATROL_COLUMNS = {
    'hotspot_rank',
    'center_lat',
    'center_lng',
    'day_of_week',
    'hour',
    'predicted_violations',
    'predicted_pici',
    'priority_score',
}

def read_parquet(path: Path, label: str) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"{label} not found: {path}")
    return pd.read_parquet(path)

def require_columns(df: pd.DataFrame, required_columns: set[str], label: str):
    missing = sorted(required_columns - set(df.columns))
    if missing:
        raise ValueError(f"{label} is missing required columns: {', '.join(missing)}")

def require_non_empty(df: pd.DataFrame, label: str):
    if df.empty:
        raise ValueError(f"{label} is empty")

def require_numeric_signal(df: pd.DataFrame, column: str, label: str):
    if column not in df.columns:
        raise ValueError(f"{label} is missing required column: {column}")
    values = pd.to_numeric(df[column], errors='coerce')
    if values.notna().sum() == 0:
        raise ValueError(f"{label}.{column} has no numeric values")
    if values.max() <= 0:
        raise ValueError(f"{label}.{column} has no positive values")

def validate_feature_input(path: Path):
    df = read_parquet(path, "Feature input dataset")
    require_non_empty(df, "Feature input dataset")
    require_columns(df, FEATURE_INPUT_COLUMNS, "Feature input dataset")
    if 'violation_list' not in df.columns and 'violation_type' not in df.columns:
        raise ValueError("Feature input dataset needs either violation_list or violation_type")

    coords = df[['latitude', 'longitude']].apply(pd.to_numeric, errors='coerce')
    invalid_coords = coords.isna().any(axis=1).sum()
    if invalid_coords:
        raise ValueError(f"Feature input dataset has {invalid_coords} rows with invalid coordinates")

def validate_featured(path: Path) -> pd.DataFrame:
    df = read_parquet(path, "Featured dataset")
    require_non_empty(df, "Featured dataset")
    require_columns(df, FEATURED_COLUMNS, "Featured dataset")
    require_numeric_signal(df, 'pici_score', "Featured dataset")

    nonzero_pici = int((df['pici_score'] > 0).sum())
    if nonzero_pici < max(1, int(len(df) * 0.9)):
        raise ValueError(
            f"Featured dataset has too few nonzero PICI rows: {nonzero_pici}/{len(df)}"
        )
    return df

def validate_hotspots(path: Path) -> pd.DataFrame:
    df = read_parquet(path, "Hotspots dataset")
    require_non_empty(df, "Hotspots dataset")
    require_columns(df, HOTSPOT_COLUMNS, "Hotspots dataset")
    require_numeric_signal(df, 'total_pici', "Hotspots dataset")

    if df['hotspot_rank'].duplicated().any():
        raise ValueError("Hotspots dataset has duplicate hotspot_rank values")
    if df[['center_lat', 'center_lng']].isna().any().any():
        raise ValueError("Hotspots dataset has missing center coordinates")
    return df

def validate_patrols(path: Path) -> pd.DataFrame:
    df = read_parquet(path, "Patrol recommendations dataset")
    require_non_empty(df, "Patrol recommendations dataset")
    require_columns(df, PATROL_COLUMNS, "Patrol recommendations dataset")
    require_numeric_signal(df, 'predicted_violations', "Patrol recommendations dataset")
    require_numeric_signal(df, 'priority_score', "Patrol recommendations dataset")

    invalid_day = ~df['day_of_week'].between(0, 6)
    invalid_hour = ~df['hour'].between(0, 23)
    if invalid_day.any() or invalid_hour.any():
        raise ValueError("Patrol recommendations contain invalid day_of_week or hour values")
    return df

def print_sanity_report(featured_df: pd.DataFrame, hotspots_df: pd.DataFrame, patrols_df: pd.DataFrame):
    created_datetime = pd.to_datetime(featured_df['created_datetime'])
    nonzero_pici = int((featured_df['pici_score'] > 0).sum())
    nonzero_hotspots = int((hotspots_df['total_pici'] > 0).sum())
    nonzero_priority = int((patrols_df['priority_score'] > 0).sum())

    print("\n=== Pipeline Sanity Report ===")
    print(f"Featured rows: {len(featured_df):,}")
    print(f"Date range: {created_datetime.min()} to {created_datetime.max()}")
    print(
        "PICI score: "
        f"min={featured_df['pici_score'].min():.3f}, "
        f"mean={featured_df['pici_score'].mean():.3f}, "
        f"max={featured_df['pici_score'].max():.3f}"
    )
    print(f"Nonzero PICI rows: {nonzero_pici:,} / {len(featured_df):,}")
    print(f"Hotspots found: {len(hotspots_df):,}")
    print(f"Nonzero hotspot impact: {nonzero_hotspots:,} / {len(hotspots_df):,}")
    print(f"Patrol windows: {len(patrols_df):,}")
    print(f"Nonzero priority windows: {nonzero_priority:,} / {len(patrols_df):,}")

    top_hotspots = hotspots_df[
        ['hotspot_rank', 'total_violations', 'total_pici', 'avg_pici', 'primary_police_station', 'primary_vehicle_type']
    ].head(10)
    print("\nTop hotspots by total PICI:")
    print(top_hotspots.to_string(index=False))

    top_patrols = patrols_df[
        ['hotspot_rank', 'day_of_week', 'hour', 'predicted_violations', 'predicted_pici', 'priority_score']
    ].head(10)
    print("\nTop patrol windows by priority score:")
    print(top_patrols.to_string(index=False))

def run_pipeline(mode: str = "historical"):
    print(f"=== Starting ParkSense AI Pipeline [{mode.upper()} MODE] ===")
    
    # Setup Paths
    BASE_DIR = Path(__file__).resolve().parent.parent
    DATA_DIR = BASE_DIR / "data" / "processed" / mode
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    if mode == "historical":
        raw_candidates = [
            BASE_DIR / "data" / "violations.csv",
            BASE_DIR / "data" / "raw" / "given.csv",
        ]
        RAW_DATA = next((path for path in raw_candidates if path.exists()), None)
    else:
        # new_data mode
        RAW_DATA = BASE_DIR / "data" / "raw" / "new_violations.csv"
        if not RAW_DATA.exists():
            raise FileNotFoundError(f"Missing new data upload at {RAW_DATA}")

    CLEAN_DATA = DATA_DIR / "clean_violations.parquet"
    FEATURED_DATA = DATA_DIR / "featured_violations.parquet"
    HOTSPOTS_DATA = DATA_DIR / "hotspots.parquet"
    CLUSTERED_DATA = DATA_DIR / "clustered_violations.parquet"
    PATROLS_DATA = DATA_DIR / "patrol_recommendations.parquet"
    
    # 1. Data Cleaning
    if RAW_DATA is not None and RAW_DATA.exists():
        clean_data(RAW_DATA, CLEAN_DATA)
    elif CLEAN_DATA.exists():
        print(f"Skipping clean_data: using existing {CLEAN_DATA.name}")
    else:
        raise FileNotFoundError(f"Cannot find raw or clean data for mode {mode}")
    validate_feature_input(CLEAN_DATA)

    # 2. Feature Engineering
    engineer_features(CLEAN_DATA, FEATURED_DATA)
    featured_df = validate_featured(FEATURED_DATA)
    
    # 3. Clustering
    cluster_hotspots(FEATURED_DATA, HOTSPOTS_DATA, CLUSTERED_DATA)
    hotspots_df = validate_hotspots(HOTSPOTS_DATA)
    
    # 4. Temporal Prediction
    train_and_predict(CLUSTERED_DATA, HOTSPOTS_DATA, PATROLS_DATA)
    patrols_df = validate_patrols(PATROLS_DATA)
    print_sanity_report(featured_df, hotspots_df, patrols_df)
    
    print("\n=== Pipeline Execution Complete ===")

if __name__ == "__main__":
    run_pipeline(mode="historical")

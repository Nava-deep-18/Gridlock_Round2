import pandas as pd
import json
import ast
from pathlib import Path

REQUIRED_RAW_COLUMNS = {
    'id',
    'latitude',
    'longitude',
    'location',
    'vehicle_type',
    'violation_type',
    'created_datetime',
    'police_station',
    'junction_name',
}

def safe_load(x):
    """Safely parse stringified lists into actual Python lists."""
    if pd.isna(x): 
        return []
    if isinstance(x, list): 
        return x
    try: 
        res = json.loads(x)
        return res if isinstance(res, list) else [res]
    except:
        try: 
            res = ast.literal_eval(x)
            return res if isinstance(res, list) else [res]
        except: 
            return [str(x)]

def validate_columns(df: pd.DataFrame, required_columns: set[str], source_name: str):
    missing = sorted(required_columns - set(df.columns))
    if missing:
        raise ValueError(f"{source_name} is missing required columns: {', '.join(missing)}")

def clean_data(input_path: Path, output_path: Path):
    """Reads raw violations, parses lists, and saves to clean processed dataset."""
    print(f"Cleaning data from {input_path.name}...")
    
    if not input_path.exists():
        raise FileNotFoundError(f"Source file not found: {input_path}")
        
    df = pd.read_csv(input_path)
    validate_columns(df, REQUIRED_RAW_COLUMNS, input_path.name)

    if 'validation_status' in df.columns:
        df = df[df['validation_status'].astype(str).str.lower() == 'approved'].copy()
    
    if 'violation_list' in df.columns:
        df['violation_list'] = df['violation_list'].apply(safe_load)
    else:
        df['violation_list'] = df['violation_type'].apply(safe_load)
        
    # Ensure datetime format
    df['created_datetime'] = pd.to_datetime(df['created_datetime'], errors='coerce')
    df = df[df['created_datetime'].notna()].copy()

    df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
    df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
    df = df[df['latitude'].notna() & df['longitude'].notna()].copy()

    if df.empty:
        raise ValueError(f"{input_path.name} has no valid approved rows after cleaning")
        
    # Create the output directory if it doesn't exist
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save as parquet for speed
    df.to_parquet(output_path, index=False)
    print(f"Cleaned data saved to {output_path.name}")

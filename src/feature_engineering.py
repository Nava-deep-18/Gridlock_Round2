import pandas as pd
from pathlib import Path
import re
import json
import ast

SEVERITY_WEIGHTS = {
    'DOUBLE PARKING': 10,
    'PARKING OPPOSITE TO ANOTHER PARKED VEHICLE': 9,
    'PARKING IN A MAIN ROAD': 8,
    'PARKING NEAR ROAD CROSSING': 7,
    'PARKING NEAR BUSTOP/SCHOOL/HOSPITAL ETC': 6,
    'WRONG PARKING': 4,
    'NO PARKING': 3,
    'DEFECTIVE NUMBER PLATE': 0,
}

VEHICLE_SIZE_FACTOR = {
    'TANKER': 2.0,
    'BUS': 2.0,
    'PRIVATE BUS': 2.0,
    'TRUCK': 2.0,
    'LGV': 2.0,
    'CAR': 1.5,
    'MAXI-CAB': 1.5,
    'JEEP': 1.5,
    'VAN': 1.5,
    'PASSENGER AUTO': 1.2,
    'GOODS AUTO': 1.2,
    'SCOOTER': 1.0,
    'MOTOR CYCLE': 1.0,
    'MOPED': 1.0,
    'OTHERS': 1.0,
}

VEHICLE_CATEGORY = {
    'TANKER': 'HEAVY',
    'BUS': 'HEAVY',
    'PRIVATE BUS': 'HEAVY',
    'TRUCK': 'HEAVY',
    'LGV': 'HEAVY',
    'CAR': 'MEDIUM',
    'MAXI-CAB': 'MEDIUM',
    'JEEP': 'MEDIUM',
    'VAN': 'MEDIUM',
    'PASSENGER AUTO': 'LIGHT',
    'GOODS AUTO': 'LIGHT',
    'SCOOTER': 'TWO_WHEELER',
    'MOTOR CYCLE': 'TWO_WHEELER',
    'MOPED': 'TWO_WHEELER',
    'OTHERS': 'UNKNOWN',
}

HOLIDAYS = [
    '2023-11-12', '2023-11-13', '2023-12-25', '2024-01-01', '2024-01-15',
    '2024-01-26', '2024-03-08', '2024-03-25', '2024-04-09', '2024-04-11',
    '2024-05-01'
]

def safe_load_list(value):
    """Parse JSON/list-like cells into a normalized list of uppercase strings."""
    if isinstance(value, list):
        return [str(item).strip().upper() for item in value if pd.notna(item)]
    if pd.isna(value):
        return []

    text = str(value).strip()
    if not text:
        return []

    for parser in (json.loads, ast.literal_eval):
        try:
            parsed = parser(text)
            if isinstance(parsed, list):
                return [str(item).strip().upper() for item in parsed if pd.notna(item)]
            return [str(parsed).strip().upper()]
        except (ValueError, SyntaxError, TypeError, json.JSONDecodeError):
            continue

    return [text.strip('"').strip("'").upper()]

def extract_pincode(address):
    m = re.search(r'\b56\d{4}\b', str(address))
    return m.group(0) if m else None

def engineer_features(input_path: Path, output_path: Path):
    """Computes the PICI severity score and engineered temporal features."""
    print(f"Engineering features from {input_path.name}...")
    
    if not input_path.exists():
        raise FileNotFoundError(f"Source file not found: {input_path}")
        
    df = pd.read_parquet(input_path)

    if 'violation_list' in df.columns:
        df['violation_list'] = df['violation_list'].apply(safe_load_list)
    elif 'violation_type' in df.columns:
        df['violation_list'] = df['violation_type'].apply(safe_load_list)
    else:
        raise ValueError("Missing violation data: expected 'violation_list' or 'violation_type'")

    if 'created_datetime' not in df.columns:
        raise ValueError("Missing required column: created_datetime")
    df['created_datetime'] = pd.to_datetime(df['created_datetime'], errors='coerce')
    df = df[df['created_datetime'].notna()].copy()

    if 'final_vehicle_type' not in df.columns:
        fallback_vehicle_type = df['vehicle_type'] if 'vehicle_type' in df.columns else 'OTHERS'
        df['final_vehicle_type'] = df.get('updated_vehicle_type', fallback_vehicle_type)
    df['final_vehicle_type'] = df['final_vehicle_type'].fillna(df.get('vehicle_type', 'OTHERS')).fillna('OTHERS').astype(str).str.upper()

    if 'final_vehicle_number' not in df.columns:
        fallback_vehicle_number = df['vehicle_number'] if 'vehicle_number' in df.columns else ''
        df['final_vehicle_number'] = df.get('updated_vehicle_number', fallback_vehicle_number)
    df['final_vehicle_number'] = df['final_vehicle_number'].fillna(df.get('vehicle_number', '')).fillna('').astype(str)
    
    # Calculate base counts and severity
    df['parking_violation_count'] = df['violation_list'].apply(
        lambda lst: sum(1 for v in lst if v != 'DEFECTIVE NUMBER PLATE')
    )
    df['severity_score'] = df['violation_list'].apply(
        lambda lst: sum(SEVERITY_WEIGHTS.get(v, 2) for v in lst)
    )
    
    df['multi_vio_factor'] = df['parking_violation_count'].apply(lambda c: min(1.0 + (0.1 * max(0, c - 1)), 1.5))

    df['vehicle_size_factor'] = df['final_vehicle_type'].map(VEHICLE_SIZE_FACTOR).fillna(1.0)
    df['vehicle_category'] = df['final_vehicle_type'].map(VEHICLE_CATEGORY).fillna('UNKNOWN')
    
    # Temporal Features
    df['hour'] = df['created_datetime'].dt.hour
    df['day_of_week'] = df['created_datetime'].dt.dayofweek
    df['month'] = df['created_datetime'].dt.month
    df['date'] = df['created_datetime'].dt.date
    df['is_weekend'] = df['day_of_week'].apply(lambda d: 1 if d >= 5 else 0)
    
    # Indian Holidays
    holidays_dt = pd.to_datetime(HOLIDAYS).date
    df['is_holiday'] = df['date'].isin(holidays_dt).astype(int)
    
    # Peak Hour (Weekdays only)
    df['is_peak_hour'] = df.apply(
        lambda r: 1 if (r['is_weekend'] == 0 and r['is_holiday'] == 0) and ((8 <= r['hour'] <= 11) or (17 <= r['hour'] <= 21)) else 0,
        axis=1
    )

    if 'has_junction' not in df.columns:
        df['has_junction'] = df['junction_name'].apply(
            lambda x: 0 if pd.isna(x) or str(x).strip().lower() == 'no junction' else 1
        )
    df['junction_multiplier'] = df['has_junction'].map({1: 2.0, 0: 1.0}).fillna(1.0)
    df['peak_hour_multiplier'] = df['is_peak_hour'].map({1: 1.5, 0: 1.0}).fillna(1.0)
    
    # Repeat Offender Tracking (Chronological)
    df = df.sort_values(by=['final_vehicle_number', 'created_datetime'])
    df['vehicle_prior_violations'] = df.groupby('final_vehicle_number').cumcount()
    df['is_repeat_offender'] = (df['vehicle_prior_violations'] >= 1).astype(int)
    
    # Penalties
    df['repeat_penalty'] = df['is_repeat_offender'].apply(lambda r: 1.5 if r == 1 else 1.0)
    
    # PICI Score Computation
    df['pici_raw'] = (
        df['severity_score']
        * df['vehicle_size_factor']
        * df['junction_multiplier']
        * df['peak_hour_multiplier']
        * df['multi_vio_factor']
        * df['repeat_penalty']
    )
    pici_max = df['pici_raw'].max()
    df['pici_score'] = ((df['pici_raw'] / max(pici_max, 1e-9)) * 10).round(3)
    
    # Spatial Features
    df['pincode'] = df['location'].apply(extract_pincode)
    
    df.to_parquet(output_path, index=False)
    print(f"Engineered features saved to {output_path.name}")

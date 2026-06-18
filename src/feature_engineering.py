import pandas as pd
from pathlib import Path
import re

SEVERITY_WEIGHTS = {
    'WRONG PARKING': 2,
    'PARKING ON FOOTPATH': 3,
    'PARKING ON ZEBRA CROSSING': 4,
    'PARKING AT INTERSECTION': 5,
    'NO PARKING': 2,
}

def extract_pincode(address):
    m = re.search(r'\b560\d{3}\b', str(address))
    return m.group(0) if m else None

def engineer_features(input_path: Path, output_path: Path):
    """Computes the PICI severity score and engineered temporal features."""
    print(f"Engineering features from {input_path.name}...")
    
    if not input_path.exists():
        raise FileNotFoundError(f"Source file not found: {input_path}")
        
    df = pd.read_parquet(input_path)
    
    # Calculate base counts and severity
    df['parking_violation_count'] = df['violation_list'].apply(
        lambda lst: sum(1 for v in lst if v != 'DEFECTIVE NUMBER PLATE' and isinstance(lst, list))
    )
    df['severity_score'] = df['violation_list'].apply(
        lambda lst: sum(SEVERITY_WEIGHTS.get(v, 2) for v in lst if isinstance(lst, list))
    )
    
    df['multi_vio_factor'] = df['parking_violation_count'].apply(lambda c: 1.0 + (0.2 * (c - 1)) if c > 1 else 1.0)
    
    # Temporal Features
    df['hour'] = df['created_datetime'].dt.hour
    df['day_of_week'] = df['created_datetime'].dt.dayofweek
    df['date'] = df['created_datetime'].dt.date
    df['is_weekend'] = df['day_of_week'].apply(lambda d: 1 if d >= 5 else 0)
    
    # Indian Holidays
    HOLIDAYS = [
        '2023-11-12', '2023-11-13', '2023-12-25', '2024-01-01', '2024-01-15',
        '2024-01-26', '2024-03-08', '2024-03-25', '2024-04-09', '2024-04-11', '2024-05-01'
    ]
    holidays_dt = pd.to_datetime(HOLIDAYS).date
    df['is_holiday'] = df['date'].isin(holidays_dt).astype(int)
    
    # Peak Hour (Weekdays only)
    df['is_peak_hour'] = df.apply(
        lambda r: 1 if (r['is_weekend'] == 0 and r['is_holiday'] == 0) and ((8 <= r['hour'] <= 11) or (17 <= r['hour'] <= 21)) else 0,
        axis=1
    )
    
    # Repeat Offender Tracking (Chronological)
    df = df.sort_values(by=['final_vehicle_number', 'created_datetime'])
    df['vehicle_prior_violations'] = df.groupby('final_vehicle_number').cumcount()
    df['is_repeat_offender'] = (df['vehicle_prior_violations'] >= 1).astype(int)
    
    # Penalties
    df['repeat_penalty'] = df['is_repeat_offender'].apply(lambda r: 1.5 if r == 1 else 1.0)
    df['peak_penalty'] = df['is_peak_hour'].apply(lambda p: 1.3 if p == 1 else 1.0)
    
    # PICI Score Computation
    df['pici_raw'] = df['severity_score'] * df['multi_vio_factor'] * df['repeat_penalty'] * df['peak_penalty']
    pici_max = df['pici_raw'].max()
    df['pici_score'] = ((df['pici_raw'] / max(pici_max, 1e-9)) * 10).round(3)
    
    # Spatial Features
    df['pincode'] = df['location'].apply(extract_pincode)
    
    df.to_parquet(output_path, index=False)
    print(f"Engineered features saved to {output_path.name}")

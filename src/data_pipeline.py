import pandas as pd
import json
import ast
from pathlib import Path

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

def clean_data(input_path: Path, output_path: Path):
    """Reads raw violations, parses lists, and saves to clean processed dataset."""
    print(f"Cleaning data from {input_path.name}...")
    
    if not input_path.exists():
        raise FileNotFoundError(f"Source file not found: {input_path}")
        
    df = pd.read_csv(input_path)
    
    # Apply safe load to the violation list
    if 'violation_list' in df.columns:
        df['violation_list'] = df['violation_list'].apply(safe_load)
        
    # Ensure datetime format
    if 'created_datetime' in df.columns:
        df['created_datetime'] = pd.to_datetime(df['created_datetime'])
        
    # Create the output directory if it doesn't exist
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save as parquet for speed
    df.to_parquet(output_path, index=False)
    print(f"Cleaned data saved to {output_path.name}")

from pathlib import Path
from data_pipeline import clean_data
from feature_engineering import engineer_features
from ml_models import cluster_hotspots, train_and_predict

def run_pipeline():
    print("=== Starting ParkSense AI Pipeline ===")
    
    # Setup Paths
    BASE_DIR = Path(__file__).resolve().parent.parent
    DATA_DIR = BASE_DIR / "data" / "processed"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    RAW_DATA = BASE_DIR / "data" / "violations.csv" # Or wherever the raw data is
    # Assuming clean_violations.parquet already exists from Notebook 01, we'll start from there if RAW doesn't exist
    CLEAN_DATA = DATA_DIR / "clean_violations.parquet"
    FEATURED_DATA = DATA_DIR / "featured_violations.parquet"
    HOTSPOTS_DATA = DATA_DIR / "hotspots.parquet"
    CLUSTERED_DATA = DATA_DIR / "clustered_violations.parquet"
    PATROLS_DATA = DATA_DIR / "patrol_recommendations.parquet"
    
    # 1. Data Cleaning
    if RAW_DATA.exists():
        clean_data(RAW_DATA, CLEAN_DATA)
    elif CLEAN_DATA.exists():
        print(f"Skipping clean_data: using existing {CLEAN_DATA.name}")
    else:
        raise FileNotFoundError(f"Cannot find raw or clean data in {DATA_DIR.parent}")

    # 2. Feature Engineering
    engineer_features(CLEAN_DATA, FEATURED_DATA)
    
    # 3. Clustering
    cluster_hotspots(FEATURED_DATA, HOTSPOTS_DATA, CLUSTERED_DATA)
    
    # 4. Temporal Prediction
    train_and_predict(CLUSTERED_DATA, HOTSPOTS_DATA, PATROLS_DATA)
    
    print("\n=== Pipeline Execution Complete ===")

if __name__ == "__main__":
    run_pipeline()

import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors
from sklearn.model_selection import TimeSeriesSplit, GridSearchCV
from sklearn.metrics import mean_absolute_error
import xgboost as xgb
from pathlib import Path
import warnings

warnings.filterwarnings('ignore')

def get_mode(series):
    if len(series) == 0: return None
    modes = series.mode()
    return modes.iloc[0] if not modes.empty else None

def cluster_hotspots(input_path: Path, hotspots_out: Path, clustered_out: Path, min_samples: int = 50):
    """Uses DBSCAN and Geospatial Medoids to identify chronic hotspots."""
    print("Clustering Hotspots...")
    df = pd.read_parquet(input_path)
    
    coords = df[['latitude', 'longitude']].values
    coords_radians = np.radians(coords)
    EARTH_RADIUS_KM = 6371.0088

    EPSILON_METERS = 50
    eps_radians = (EPSILON_METERS / 1000.0) / EARTH_RADIUS_KM

    dbscan = DBSCAN(eps=eps_radians, min_samples=min_samples, metric='haversine', algorithm='ball_tree', n_jobs=-1)
    df['cluster_id'] = dbscan.fit_predict(coords_radians)

    df_hotspots_raw = df[df['cluster_id'] != -1]

    hotspots = df_hotspots_raw.groupby('cluster_id').agg(
        total_violations=('id', 'count'),
        mean_lat=('latitude', 'mean'),
        mean_lng=('longitude', 'mean'),
        total_pici=('pici_score', 'sum'),
        avg_pici=('pici_score', 'mean'),
        max_pici=('pici_score', 'max'),
        primary_police_station=('police_station', get_mode),
        primary_vehicle_type=('final_vehicle_type', get_mode)
    ).reset_index()

    center_lats = []
    center_lngs = []

    for _, row in hotspots.iterrows():
        c_id = row['cluster_id']
        mean_lat = row['mean_lat']
        mean_lng = row['mean_lng']
        
        cluster_points = df_hotspots_raw[df_hotspots_raw['cluster_id'] == c_id][['latitude', 'longitude']].values
        
        if len(cluster_points) > 0:
            nn = NearestNeighbors(n_neighbors=1, metric='haversine')
            nn.fit(np.radians(cluster_points))
            _, indices = nn.kneighbors(np.radians([[mean_lat, mean_lng]]))
            medoid_pt = cluster_points[indices[0][0]]
            center_lats.append(medoid_pt[0])
            center_lngs.append(medoid_pt[1])
        else:
            center_lats.append(mean_lat)
            center_lngs.append(mean_lng)

    hotspots['center_lat'] = center_lats
    hotspots['center_lng'] = center_lngs

    hotspots = hotspots.sort_values('total_pici', ascending=False).reset_index(drop=True)
    hotspots['hotspot_rank'] = hotspots.index + 1

    rank_map = hotspots.set_index('cluster_id')['hotspot_rank'].to_dict()
    df['hotspot_rank'] = df['cluster_id'].map(rank_map).fillna(-1).astype(int)

    hotspots.to_parquet(hotspots_out, index=False)
    df.to_parquet(clustered_out, index=False)
    print(f"Hotspots saved to {hotspots_out.name}")

def train_and_predict(clustered_path: Path, hotspots_path: Path, output_path: Path):
    """Trains the XGBoost Time-Series models and generates patrol recommendations."""
    print("Training models and predicting patrols...")
    df = pd.read_parquet(clustered_path)
    hotspots_df = pd.read_parquet(hotspots_path)

    df_hotspots = df[df['hotspot_rank'] != -1].copy()
    df_hotspots['created_datetime'] = pd.to_datetime(df_hotspots['created_datetime'])
    df_hotspots['date'] = df_hotspots['created_datetime'].dt.date
    df_hotspots['hour'] = df_hotspots['created_datetime'].dt.hour

    actual_counts = df_hotspots.groupby(['hotspot_rank', 'date', 'hour']).agg(
        target_violation_count=('id', 'count'),
        target_avg_pici=('pici_score', 'mean')
    ).reset_index()

    min_date = df_hotspots['date'].min()
    max_date = df_hotspots['date'].max()

    date_range = pd.date_range(start=min_date, end=max_date, freq='D').date
    hours = list(range(24))
    hotspot_ranks = hotspots_df['hotspot_rank'].unique()

    grid = [[h, d, hr] for h in hotspot_ranks for d in date_range for hr in hours]
    grid_df = pd.DataFrame(grid, columns=['hotspot_rank', 'date', 'hour'])

    master_df = pd.merge(grid_df, actual_counts, on=['hotspot_rank', 'date', 'hour'], how='left')
    master_df['target_violation_count'] = master_df['target_violation_count'].fillna(0)
    master_df['target_avg_pici'] = master_df['target_avg_pici'].fillna(0)

    master_df['date_dt'] = pd.to_datetime(master_df['date'])
    master_df['day_of_week'] = master_df['date_dt'].dt.dayofweek
    master_df['month'] = master_df['date_dt'].dt.month
    master_df['is_weekend'] = master_df['day_of_week'].apply(lambda d: 1 if d >= 5 else 0)

    HOLIDAYS = [
        '2023-11-12', '2023-11-13', '2023-12-25', '2024-01-01', '2024-01-15',
        '2024-01-26', '2024-03-08', '2024-03-25', '2024-04-09', '2024-04-11', '2024-05-01'
    ]
    holidays_dt = pd.to_datetime(HOLIDAYS).date
    master_df['is_holiday'] = master_df['date'].isin(holidays_dt).astype(int)

    master_df['is_peak_hour'] = master_df.apply(
        lambda r: 1 if (r['is_weekend'] == 0 and r['is_holiday'] == 0) and ((8 <= r['hour'] <= 11) or (17 <= r['hour'] <= 21)) else 0,
        axis=1
    )

    master_df['is_business_hours'] = master_df.apply(
        lambda r: 1 if (r['is_weekend'] == 0 and r['is_holiday'] == 0) and (9 <= r['hour'] < 18) else 0,
        axis=1
    )

    master_df = pd.merge(master_df, hotspots_df[['hotspot_rank', 'center_lat', 'center_lng']], on='hotspot_rank', how='left')
    master_df = master_df.sort_values(['date', 'hour', 'hotspot_rank']).reset_index(drop=True)

    FEATURES = ['center_lat', 'center_lng', 'day_of_week', 'hour', 'month', 'is_peak_hour', 'is_business_hours', 'is_holiday']
    X = master_df[FEATURES]
    y_volume = master_df['target_violation_count']
    y_pici = master_df['target_avg_pici']

    unique_dates = master_df['date'].unique()
    split_date_idx = int(len(unique_dates) * 0.8)
    split_date = unique_dates[split_date_idx]

    train_mask = master_df['date'] < split_date
    test_mask = master_df['date'] >= split_date

    X_train, X_test = X[train_mask], X[test_mask]
    y_vol_train, y_vol_test = y_volume[train_mask], y_volume[test_mask]
    y_pic_train, y_pic_test = y_pici[train_mask], y_pici[test_mask]

    tscv = TimeSeriesSplit(n_splits=3)
    param_grid = {
        'max_depth': [3, 5],
        'learning_rate': [0.1],
        'n_estimators': [100]
    }

    base_xgb_vol = xgb.XGBRegressor(objective='count:poisson', subsample=0.8, random_state=42)
    grid_vol = GridSearchCV(estimator=base_xgb_vol, param_grid=param_grid, cv=tscv, scoring='neg_mean_absolute_error', n_jobs=-1)
    grid_vol.fit(X_train, y_vol_train)
    model_volume = grid_vol.best_estimator_

    base_xgb_pic = xgb.XGBRegressor(objective='reg:squarederror', subsample=0.8, random_state=42)
    grid_pici = GridSearchCV(estimator=base_xgb_pic, param_grid=param_grid, cv=tscv, scoring='neg_mean_absolute_error', n_jobs=-1)
    grid_pici.fit(X_train, y_pic_train)
    model_pici = grid_pici.best_estimator_

    # Generate Schedule
    future_grid = []
    for _, row in hotspots_df.iterrows():
        h_rank = row['hotspot_rank']
        c_lat = row['center_lat']
        c_lng = row['center_lng']
        for d in range(7):
            for hr in range(24):
                is_wknd = 1 if d >= 5 else 0
                is_peak = 1 if (is_wknd == 0) and ((8 <= hr <= 11) or (17 <= hr <= 21)) else 0
                is_bus = 1 if (is_wknd == 0) and (9 <= hr < 18) else 0
                future_grid.append({
                    'hotspot_rank': h_rank, 'center_lat': c_lat, 'center_lng': c_lng,
                    'day_of_week': d, 'hour': hr, 'month': max_date.month, 
                    'is_peak_hour': is_peak, 'is_business_hours': is_bus, 'is_holiday': 0
                })

    schedule_df = pd.DataFrame(future_grid)
    schedule_df['predicted_violations'] = model_volume.predict(schedule_df[FEATURES]).clip(min=0)
    schedule_df['predicted_pici'] = model_pici.predict(schedule_df[FEATURES]).clip(min=0, max=10)

    # Logical Override (0.1 threshold)
    schedule_df.loc[schedule_df['predicted_violations'] < 0.1, 'predicted_pici'] = 0.0
    schedule_df['priority_score'] = schedule_df['predicted_violations'] * schedule_df['predicted_pici']

    if schedule_df['priority_score'].max() <= 0:
        observed_windows = df_hotspots.groupby(['hotspot_rank', 'day_of_week', 'hour']).agg(
            fallback_violations=('id', 'count'),
            fallback_pici=('pici_score', 'mean'),
        ).reset_index()
        schedule_df = schedule_df.drop(columns=['predicted_violations', 'predicted_pici', 'priority_score']).merge(
            observed_windows,
            on=['hotspot_rank', 'day_of_week', 'hour'],
            how='left',
        )
        schedule_df['predicted_violations'] = schedule_df['fallback_violations'].fillna(0).astype(float)
        schedule_df['predicted_pici'] = schedule_df['fallback_pici'].fillna(0).astype(float)
        schedule_df['priority_score'] = schedule_df['predicted_violations'] * schedule_df['predicted_pici']
        schedule_df = schedule_df.drop(columns=['fallback_violations', 'fallback_pici'])

    schedule_df = schedule_df.sort_values('priority_score', ascending=False).reset_index(drop=True)
    schedule_df.to_parquet(output_path, index=False)
    print(f"Patrol recommendations saved to {output_path.name}")

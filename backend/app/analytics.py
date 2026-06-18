import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sqlalchemy.orm import Session
from app.models import ParkingViolation
from app.database import engine
from typing import Optional
from datetime import datetime
from app.utils import apply_filters

def predict_occupancy(data: pd.DataFrame):
    """
    Simple scikit-learn model to predict parking occupancy.
    """
    pass

def calculate_hotspots(
    db: Session,
    police_station: Optional[str] = None,
    violation_type: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Calculate hotspots using DBSCAN clustering and assign a priority score.
    """
    from sqlalchemy import text
    
    query_str = """
        SELECT 
            ROUND(latitude::numeric, 3) as center_lat,
            ROUND(longitude::numeric, 3) as center_lon,
            COUNT(*) as total_violations,
            MODE() WITHIN GROUP (ORDER BY violation_type) as dominant_violation_type,
            MODE() WITHIN GROUP (ORDER BY police_station) as police_station,
            MODE() WITHIN GROUP (ORDER BY junction_name) as junction_name,
            MODE() WITHIN GROUP (ORDER BY CAST(extract(hour from created_datetime) AS integer)) as peak_hour,
            COUNT(DISTINCT created_datetime::date) as unique_days
        FROM parking_violations
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    """
    params = {}
    
    if police_station:
        query_str += " AND police_station = :police_station"
        params['police_station'] = police_station
    if violation_type:
        query_str += " AND violation_type = :violation_type"
        params['violation_type'] = violation_type
    if vehicle_type:
        query_str += " AND vehicle_type = :vehicle_type"
        params['vehicle_type'] = vehicle_type
    if start_date:
        query_str += " AND created_datetime >= :start_date"
        params['start_date'] = start_date
    if end_date:
        query_str += " AND created_datetime <= :end_date"
        params['end_date'] = end_date
        
    query_str += """
        GROUP BY 1, 2
        HAVING COUNT(*) >= 5
    """
    
    with engine.connect() as conn:
        df = pd.read_sql(text(query_str), conn, params=params)
    
    if df.empty:
        return []
        
    clusters_data = []
    
    severity_map = {
        "WRONG PARKING": 40,
        "PARKING NEAR ROAD CROSSING": 60,
        "PARKING ON FOOTPATH": 45,
        "NO PARKING": 35
    }
    
    for idx, row in df.iterrows():
        total_violations = int(row['total_violations'])
        dominant_violation_type = str(row['dominant_violation_type']) if pd.notnull(row['dominant_violation_type']) else "Unknown"
        dom_viol_upper = dominant_violation_type.upper()
        
        # severity_score
        severity_score = 25 # default
        for key, val in severity_map.items():
            if key in dom_viol_upper:
                severity_score = val
                break
                
        # congestion_impact_score
        congestion_impact_score = min(total_violations * 2, 50)
        junction_name = row['junction_name']
        if pd.notnull(junction_name) and str(junction_name).strip().lower() not in ["", "none", "null", "no junction"]:
            congestion_impact_score += 20
            
        if "ROAD CROSSING" in dom_viol_upper:
            congestion_impact_score += 30
            
        congestion_impact_score = min(congestion_impact_score, 100)
        
        # repeat_frequency_score
        unique_days = int(row['unique_days']) if pd.notnull(row['unique_days']) else 1
        repeat_frequency_score = min((total_violations / max(unique_days, 1)) * 10, 100)
        
        priority_score = 0.4 * severity_score + 0.4 * congestion_impact_score + 0.2 * repeat_frequency_score
        
        clusters_data.append({
            "cluster_id": int(idx),
            "center_latitude": float(row['center_lat']),
            "center_longitude": float(row['center_lon']),
            "total_violations": total_violations,
            "dominant_violation_type": dominant_violation_type,
            "police_station": str(row['police_station']) if pd.notnull(row['police_station']) else "Unknown",
            "junction_name": str(junction_name) if pd.notnull(junction_name) else None,
            "peak_hour": int(row['peak_hour']) if pd.notnull(row['peak_hour']) else None,
            "severity_score": float(severity_score),
            "congestion_impact_score": float(congestion_impact_score),
            "priority_score": float(priority_score)
        })
        
    clusters_data.sort(key=lambda x: x['priority_score'], reverse=True)
    return clusters_data

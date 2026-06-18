from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.analytics import calculate_hotspots

router = APIRouter()

@router.get("/recommendations")
def get_recommendations(
    police_station: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    hotspots = calculate_hotspots(
        db,
        police_station=police_station,
        violation_type=violation_type,
        vehicle_type=vehicle_type,
        start_date=start_date,
        end_date=end_date
    )
    
    # Hotspots are already sorted by priority_score descending
    top_hotspots = hotspots[:10]
    
    recommendations = []
    
    for hotspot in top_hotspots:
        score = hotspot["priority_score"]
        
        if score >= 80:
            priority = "Critical"
        elif score >= 60:
            priority = "High"
        elif score >= 40:
            priority = "Medium"
        else:
            priority = "Low"
            
        peak_hour = hotspot["peak_hour"]
        if peak_hour is not None:
            start_hour = max(0, peak_hour - 1)
            end_hour = min(23, peak_hour + 1)
            time_window = f"{start_hour:02d}:00 - {end_hour:02d}:00"
        else:
            time_window = "08:00 - 20:00" # Default fallback
            
        # Get a good location description
        if hotspot["junction_name"] and hotspot["junction_name"].lower() not in ["none", "null", "no junction"]:
            location_desc = f"junction {hotspot['junction_name']}"
        elif hotspot["police_station"] and hotspot["police_station"].lower() not in ["none", "null", "unknown"]:
            location_desc = f"{hotspot['police_station']} station area"
        else:
            location_desc = f"Cluster {hotspot['cluster_id']}"
            
        title = f"Deploy enforcement near {location_desc}"
        
        impact_min = int(min(score / 5, 25))
        impact_max = impact_min + 5
        expected_impact = f"Reduce estimated congestion by {impact_min}-{impact_max}%"
        
        reason = f"High density of {hotspot['dominant_violation_type'].title()} violations during peak hours."
        
        recommendations.append({
            "title": title,
            "priority": priority,
            "reason": reason,
            "recommended_time_window": time_window,
            "expected_impact": expected_impact,
            "hotspot_id": hotspot["cluster_id"]
        })
        
    return recommendations

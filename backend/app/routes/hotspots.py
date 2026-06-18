from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.analytics import calculate_hotspots

router = APIRouter()

@router.get("/hotspots")
def get_hotspots(
    police_station: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns a list of hotspot objects sorted by priority_score descending.
    """
    hotspots = calculate_hotspots(
        db,
        police_station=police_station,
        violation_type=violation_type,
        vehicle_type=vehicle_type,
        start_date=start_date,
        end_date=end_date
    )
    return hotspots

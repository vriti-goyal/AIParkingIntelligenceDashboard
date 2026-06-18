from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ParkingViolation
from typing import Optional
from datetime import datetime
from app.utils import apply_filters

router = APIRouter()

@router.get("/map-points")
def get_map_points(
    police_station: Optional[str] = Query(None, description="Filter by police station"),
    violation_type: Optional[str] = Query(None, description="Filter by violation type"),
    vehicle_type: Optional[str] = Query(None, description="Filter by vehicle type"),
    start_date: Optional[datetime] = Query(None, description="Start date for created_datetime filter"),
    end_date: Optional[datetime] = Query(None, description="End date for created_datetime filter"),
    limit: int = Query(5000, description="Max rows to return", le=10000),
    db: Session = Depends(get_db)
):
    query = db.query(
        ParkingViolation.id,
        ParkingViolation.latitude,
        ParkingViolation.longitude,
        ParkingViolation.location,
        ParkingViolation.vehicle_type,
        ParkingViolation.violation_type,
        ParkingViolation.created_datetime,
        ParkingViolation.police_station,
        ParkingViolation.junction_name,
        ParkingViolation.validation_status
    ).filter(
        ParkingViolation.latitude.isnot(None),
        ParkingViolation.longitude.isnot(None)
    )

    query = apply_filters(
        query,
        police_station=police_station,
        violation_type=violation_type,
        vehicle_type=vehicle_type,
        start_date=start_date,
        end_date=end_date
    )

    # Sort descending and limit
    results = query.order_by(ParkingViolation.created_datetime.desc()).limit(limit).all()

    map_points = []
    for row in results:
        map_points.append({
            "id": row.id,
            "latitude": row.latitude,
            "longitude": row.longitude,
            "location": row.location,
            "vehicle_type": row.vehicle_type,
            "violation_type": row.violation_type,
            "created_datetime": row.created_datetime.isoformat() if row.created_datetime else None,
            "police_station": row.police_station,
            "junction_name": row.junction_name,
            "validation_status": row.validation_status
        })

    return map_points

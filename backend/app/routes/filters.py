from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Dict, List
from app.database import get_db
from app.models import ParkingViolation

router = APIRouter(prefix="/filters", tags=["Filters"])

@router.get("")
def get_filter_options(db: Session = Depends(get_db)):
    """Returns unique values for dropdown filters."""
    
    # Get distinct police stations, filtering out nulls
    stations_query = select(ParkingViolation.police_station).where(
        ParkingViolation.police_station.isnot(None),
        ParkingViolation.police_station != "",
        ParkingViolation.police_station != "None"
    ).distinct()
    
    stations = db.execute(stations_query).scalars().all()
    
    # Get distinct violation types
    violations_query = select(ParkingViolation.violation_type).where(
        ParkingViolation.violation_type.isnot(None),
        ParkingViolation.violation_type != "",
        ParkingViolation.violation_type != "None"
    ).distinct()
    
    raw_violations = db.execute(violations_query).scalars().all()
    
    # Parse violations since they might be comma-separated or dirty strings
    violations_set = set()
    for v in raw_violations:
        if not v: continue
        parts = [p.strip() for p in v.split(',')]
        for p in parts:
            if p: violations_set.add(p)
            
    # Get distinct vehicle types
    vehicles_query = select(ParkingViolation.vehicle_type).where(
        ParkingViolation.vehicle_type.isnot(None),
        ParkingViolation.vehicle_type != "",
        ParkingViolation.vehicle_type != "None"
    ).distinct()
    
    vehicles = db.execute(vehicles_query).scalars().all()

    return {
        "police_stations": sorted(list(stations)),
        "violation_types": sorted(list(violations_set)),
        "vehicle_types": sorted(list(vehicles))
    }

from sqlalchemy.orm import Query
from typing import Optional
from datetime import datetime
from app.models import ParkingViolation

def apply_filters(
    query: Query,
    police_station: Optional[str] = None,
    violation_type: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> Query:
    if police_station and police_station.lower() != "all":
        query = query.filter(ParkingViolation.police_station == police_station)
    if violation_type and violation_type.lower() != "all":
        query = query.filter(ParkingViolation.violation_type == violation_type)
    if vehicle_type and vehicle_type.lower() != "all":
        query = query.filter(ParkingViolation.vehicle_type == vehicle_type)
    if start_date:
        query = query.filter(ParkingViolation.created_datetime >= start_date)
    if end_date:
        query = query.filter(ParkingViolation.created_datetime <= end_date)
    return query

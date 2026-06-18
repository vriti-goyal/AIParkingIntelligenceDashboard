from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, extract
from app.database import get_db
from app.models import ParkingViolation
from typing import Optional
from datetime import datetime
from app.utils import apply_filters

router = APIRouter()

@router.get("/trends/daily")
def get_daily_trends(
    police_station: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    date_expr = cast(ParkingViolation.created_datetime, Date)
    query = db.query(
        date_expr.label("date"),
        func.count(ParkingViolation.id).label("violations")
    )
    query = apply_filters(query, police_station, violation_type, vehicle_type, start_date, end_date)
    query = query.filter(ParkingViolation.created_datetime.isnot(None))
    results = query.group_by(date_expr).order_by(date_expr).all()

    return [{"date": str(r.date), "violations": r.violations} for r in results]

@router.get("/trends/hourly")
def get_hourly_trends(
    police_station: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    hour_expr = extract('hour', ParkingViolation.created_datetime)
    query = db.query(
        hour_expr.label("hour"),
        func.count(ParkingViolation.id).label("violations")
    )
    query = apply_filters(query, police_station, violation_type, vehicle_type, start_date, end_date)
    query = query.filter(ParkingViolation.created_datetime.isnot(None))
    results = query.group_by(hour_expr).order_by(hour_expr).all()

    return [{"hour": int(r.hour), "violations": r.violations} for r in results]

@router.get("/trends/violation-types")
def get_violation_types(
    police_station: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(
        ParkingViolation.violation_type.label("violation_type"),
        func.count(ParkingViolation.id).label("count")
    )
    query = apply_filters(query, police_station, violation_type, vehicle_type, start_date, end_date)
    query = query.filter(
        ParkingViolation.violation_type.isnot(None),
        ~ParkingViolation.violation_type.in_(['', 'nan', 'NaN', 'None', 'unknown', 'NaT'])
    )
    results = query.group_by(ParkingViolation.violation_type).order_by(func.count(ParkingViolation.id).desc()).all()

    return [{"violation_type": str(r.violation_type), "count": r.count} for r in results]

@router.get("/trends/police-stations")
def get_police_stations(
    police_station: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(
        ParkingViolation.police_station.label("police_station"),
        func.count(ParkingViolation.id).label("count")
    )
    query = apply_filters(query, police_station, violation_type, vehicle_type, start_date, end_date)
    query = query.filter(
        ParkingViolation.police_station.isnot(None),
        ~ParkingViolation.police_station.in_(['', 'nan', 'NaN', 'None', 'unknown', 'NaT'])
    )
    results = query.group_by(ParkingViolation.police_station).order_by(func.count(ParkingViolation.id).desc()).all()

    return [{"police_station": str(r.police_station), "count": r.count} for r in results]

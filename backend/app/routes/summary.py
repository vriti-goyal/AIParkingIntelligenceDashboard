from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, or_
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models import ParkingViolation
from app.schemas import SummaryResponse
from app.analytics import calculate_hotspots
from app.utils import apply_filters

router = APIRouter()

@router.get("/summary", response_model=SummaryResponse)
def get_summary(
    police_station: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    base_query = db.query(ParkingViolation)
    base_query = apply_filters(
        base_query,
        police_station=police_station,
        violation_type=violation_type,
        vehicle_type=vehicle_type,
        start_date=start_date,
        end_date=end_date
    )

    # 1. Total violations
    total_violations = base_query.count()

    # 2. Enforcement rate
    # percentage of records where action_taken_timestamp is not null OR validation_status indicates completed/valid/actioned
    enforced_count = base_query.filter(
        or_(
            ParkingViolation.action_taken_timestamp.isnot(None),
            and_(
                ParkingViolation.validation_status.isnot(None),
                ~ParkingViolation.validation_status.in_(['', 'nan', 'NaN', 'None', 'unknown', 'NaT'])
            )
        )
    ).count()
    
    enforcement_rate = (enforced_count / total_violations * 100) if total_violations > 0 else 0.0

    # 3. Top violation type
    top_violation_query = db.query(
        ParkingViolation.violation_type,
        func.count(ParkingViolation.id).label('v_count')
    )
    top_violation_query = apply_filters(
        top_violation_query,
        police_station=police_station,
        violation_type=violation_type,
        vehicle_type=vehicle_type,
        start_date=start_date,
        end_date=end_date
    )
    top_violation = top_violation_query.group_by(ParkingViolation.violation_type).order_by(func.count(ParkingViolation.id).desc()).first()
    
    top_violation_type = top_violation[0] if top_violation else None

    # 4. Most affected police station
    top_station_query = db.query(
        ParkingViolation.police_station,
        func.count(ParkingViolation.id).label('s_count')
    )
    top_station_query = apply_filters(
        top_station_query,
        police_station=police_station,
        violation_type=violation_type,
        vehicle_type=vehicle_type,
        start_date=start_date,
        end_date=end_date
    )
    top_station = top_station_query.group_by(ParkingViolation.police_station).order_by(func.count(ParkingViolation.id).desc()).first()
    
    most_affected_police_station = top_station[0] if top_station else None

    # 5. Estimated average delay
    # base delay = 2 minutes
    # add 3 minutes if violation_type contains WRONG PARKING
    # add 4 minutes if violation_type contains PARKING NEAR ROAD CROSSING
    # add 5 minutes if junction_name is present
    delay_expr = 2 + \
        case((ParkingViolation.violation_type.ilike('%WRONG PARKING%'), 3), else_=0) + \
        case((ParkingViolation.violation_type.ilike('%PARKING NEAR ROAD CROSSING%'), 4), else_=0) + \
        case((ParkingViolation.junction_name.isnot(None), 5), else_=0)

    avg_delay_query = db.query(func.avg(delay_expr))
    avg_delay_query = apply_filters(
        avg_delay_query,
        police_station=police_station,
        violation_type=violation_type,
        vehicle_type=vehicle_type,
        start_date=start_date,
        end_date=end_date
    )
    avg_delay = avg_delay_query.scalar()
    estimated_avg_delay = float(avg_delay) if avg_delay is not None else 0.0

    # 6. Critical hotspots
    # Call the hotspot calculation function from analytics.py and count clusters with priority_score >= 60
    hotspots = calculate_hotspots(
        db,
        police_station=police_station,
        violation_type=violation_type,
        vehicle_type=vehicle_type,
        start_date=start_date,
        end_date=end_date
    )
    critical_hotspots = sum(1 for h in hotspots if h.get("priority_score", 0) >= 60)

    return SummaryResponse(
        total_violations=total_violations,
        critical_hotspots=critical_hotspots,
        estimated_avg_delay=estimated_avg_delay,
        enforcement_rate=enforcement_rate,
        top_violation_type=top_violation_type,
        most_affected_police_station=most_affected_police_station
    )

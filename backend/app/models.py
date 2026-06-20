from sqlalchemy import Column, String, Float, DateTime
from app.database import Base

from sqlalchemy.orm import deferred

class ParkingViolation(Base):
    __tablename__ = "parking_violations"

    id = Column(String, primary_key=True)
    latitude = Column(Float)
    longitude = Column(Float)
    location = Column(String)
    vehicle_number = Column(String)
    vehicle_type = Column(String, index=True)
    description = Column(String)
    violation_type = Column(String, index=True)
    offence_code = Column(String)
    created_datetime = Column(DateTime(timezone=True), primary_key=True, index=True)
    closed_datetime = Column(DateTime(timezone=True))
    modified_datetime = Column(DateTime(timezone=True))
    device_id = Column(String)
    created_by_id = Column(String)
    center_code = Column(String)
    police_station = Column(String, index=True)
    data_sent_to_scita = Column(String)
    junction_name = Column(String, index=True)
    action_taken_timestamp = Column(DateTime(timezone=True))
    data_sent_to_scita_timestamp = Column(DateTime(timezone=True))
    updated_vehicle_number = Column(String)
    updated_vehicle_type = Column(String)
    validation_status = Column(String, index=True)
    validation_timestamp = Column(DateTime(timezone=True))

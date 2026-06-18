from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class SummaryResponse(BaseModel):
    total_violations: int
    critical_hotspots: int
    estimated_avg_delay: float
    enforcement_rate: float
    top_violation_type: Optional[str]
    most_affected_police_station: Optional[str]

class HotspotResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    violation_count: int

class TrendResponse(BaseModel):
    timestamp: datetime
    count: int

class MapPointResponse(BaseModel):
    id: str
    latitude: float
    longitude: float
    violation_type: Optional[str]
    vehicle_type: Optional[str]

class RecommendationResponse(BaseModel):
    recommendation: str
    confidence_score: float

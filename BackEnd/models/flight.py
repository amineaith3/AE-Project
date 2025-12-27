from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FlightBase(BaseModel):
    destination: str
    departure_time: datetime
    arrival_time: datetime
    avion_id: int
    state: Optional[str] = "Scheduled"

class FlightCreate(FlightBase):
    vol_num: int

class FlightUpdate(BaseModel):
    destination: Optional[str] = None  # Add = None
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    avion_id: Optional[int] = None
    state: Optional[str] = None

class FlightOut(FlightBase):
    vol_num: int
    current_capacity: int

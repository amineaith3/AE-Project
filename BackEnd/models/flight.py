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
    destination: Optional[str]
    departure_time: Optional[datetime]
    arrival_time: Optional[datetime]
    avion_id: Optional[int]
    state: Optional[str]

class FlightOut(FlightBase):
    vol_num: int
    current_capacity: int

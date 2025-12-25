from pydantic import BaseModel
from typing import Optional

class ReservationCreate(BaseModel):
    reservation_id: int
    passenger_id: int
    vol_num: int
    seatcode: str
    state: Optional[str] = "Confirmed"
    guardian_id: Optional[int] = None

class ReservationUpdate(BaseModel):
    vol_num: int
    seatcode: str
    state: str
class ReservationOut(BaseModel):
    reservation_id: int
    passenger_id: int
    vol_num: int
    seatcode: str
    state: Optional[str] = "Confirmed"
    guardian_id: Optional[int] = None
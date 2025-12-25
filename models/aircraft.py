from pydantic import BaseModel
from typing import Optional, Literal

AircraftState = Literal[
    "Ready",
    "Flying",
    "Turnaround",
    "Maintenance",
    "Out of Service"
]

class AircraftCreate(BaseModel):
    avion_id: int
    modele: str
    max_capacity: int
    state: Optional[AircraftState] = "Ready"


class AircraftUpdate(BaseModel):
    modele: Optional[str] = None
    max_capacity: Optional[int] = None
    state: Optional[AircraftState] = None


class AircraftOut(BaseModel):
    avion_id: int
    modele: str
    max_capacity: int
    state: AircraftState

from pydantic import BaseModel
from typing import Optional


# ============================
#   PASSENGERS
# ============================

class PassengerBase(BaseModel):
    FirstName: str
    LastName: str
    NumPasseport: Optional[int] = None
    Contact: str
    Nationality: str
    Age_pass: int


class PassengerCreate(PassengerBase):
    pass


class PassengerResponse(PassengerBase):
    passenger_id: int

    class Config:
        orm_mode = True



# ============================
#   AIRCRAFTS
# ============================

class AircraftBase(BaseModel):
    AvionID:int
    Modele: str
    MaxCapacity: int
    State: Optional[str] = None


class AircraftCreate(AircraftBase):
    pass

class AircraftUpdate(AircraftBase):
    pass

class AircraftResponse(AircraftBase):

    class Config:
        orm_mode = True



# ============================
#   FLIGHTS
# ============================

class FlightBase(BaseModel):
    Destination: str
    DepartureTime: str
    arrival_Time: str
    CurrentCapacity: int
    State: Optional[str] = None
    AvionID: int


class FlightCreate(FlightBase):
    pass


class FlightResponse(FlightBase):
    VolNum: int

    class Config:
        orm_mode = True



# ============================
#   RESERVATIONS
# ============================

class ReservationBase(BaseModel):
    PassengerID: int
    VolNum: int
    SeatCode: Optional[str] = None
    State: Optional[str] = None
    guardian_id: Optional[int] = None


class ReservationCreate(ReservationBase):
    pass


class ReservationResponse(ReservationBase):
    ReservationID: int

    class Config:
        orm_mode = True



# ============================
#   MAINTENANCE
# ============================

class MaintenanceBase(BaseModel):
    AvionID: int
    OperationDate: str
    Type: str
    State: Optional[str] = None


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceResponse(MaintenanceBase):
    MaintenanceID: int

    class Config:
        orm_mode = True

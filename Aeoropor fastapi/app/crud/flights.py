from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models import Flights
from app.schemas import FlightCreate, FlightUpdate

def get_flight(db: Session, volnum: int):
    return db.query(Flights).filter(Flights.VolNum == volnum).first()

def get_all_flights(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Flights).offset(skip).limit(limit).all()

def create_flight(db: Session, flight: FlightCreate):
    try:
        db.execute(
            text("""
            INSERT INTO FLIGHTS (Destination, DepartureTime, Arrival_Time, CurrentCapacity, AvionID, State)
            VALUES (:dest, :dep, :arr, :cap, :avion, 'Scheduled')
            """),
            {
                "dest": flight.Destination,
                "dep": flight.DepartureTime,
                "arr": flight.Arrival_Time,
                "cap": flight.CurrentCapacity,
                "avion": flight.AvionID
            }
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    return flight

def update_flight(db: Session, volnum: int, flight_update: FlightUpdate):
    flight = get_flight(db, volnum)
    if not flight:
        return None
    for field, value in flight_update.dict(exclude_unset=True).items():
        setattr(flight, field, value)
    try:
        db.commit()
        db.refresh(flight)
    except Exception as e:
        db.rollback()
        raise e
    return flight

def delete_flight(db: Session, volnum: int):
    flight = get_flight(db, volnum)
    if not flight:
        return None
    try:
        db.delete(flight)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    return flight

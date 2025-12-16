from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import FlightCreate, FlightResponse, FlightUpdate
from app.crud import flights as crud_flights

router = APIRouter(prefix="/flights", tags=["Flights"])

@router.post("/", response_model=FlightResponse)
def create(flight: FlightCreate, db: Session = Depends(get_db)):
    try:
        return crud_flights.create_flight(db, flight)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e.orig))

@router.get("/{volnum}", response_model=FlightResponse)
def read(volnum: int, db: Session = Depends(get_db)):
    flight = crud_flights.get_flight(db, volnum)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight

@router.get("/", response_model=list[FlightResponse])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_flights.get_all_flights(db, skip, limit)

@router.put("/{volnum}", response_model=FlightResponse)
def update(volnum: int, flight_update: FlightUpdate, db: Session = Depends(get_db)):
    flight = crud_flights.update_flight(db, volnum, flight_update)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight

@router.delete("/{volnum}", response_model=dict)
def delete(volnum: int, db: Session = Depends(get_db)):
    flight = crud_flights.delete_flight(db, volnum)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return {"message": "Flight deleted"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import PassengerCreate, PassengerResponse, PassengerUpdate
from app.crud import passengers as crud_passengers

router = APIRouter(prefix="/passengers", tags=["Passengers"])


@router.post("/", response_model=PassengerResponse)
def create(passenger: PassengerCreate, db: Session = Depends(get_db)):
    try:
        return crud_passengers.create_passenger(db, passenger)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(getattr(e, "orig", e)))


@router.get("/{passenger_id}", response_model=PassengerResponse)
def read(passenger_id: int, db: Session = Depends(get_db)):
    passenger = crud_passengers.get_passenger(db, passenger_id)
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return passenger


@router.get("/", response_model=list[PassengerResponse])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_passengers.get_all_passengers(db, skip, limit)


@router.put("/{passenger_id}", response_model=PassengerResponse)
def update(passenger_id: int, passenger_update: PassengerUpdate, db: Session = Depends(get_db)):
    try:
        passenger = crud_passengers.update_passenger(db, passenger_id, passenger_update)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(getattr(e, "orig", e)))

    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return passenger


@router.delete("/{passenger_id}", response_model=dict)
def delete(passenger_id: int, db: Session = Depends(get_db)):
    try:
        passenger = crud_passengers.delete_passenger(db, passenger_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(getattr(e, "orig", e)))

    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return {"message": "Passenger deleted"}

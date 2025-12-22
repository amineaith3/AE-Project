from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import ReservationCreate, ReservationResponse 
from app.crud import reservations as crud_res

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.post("/")
def create_res(res: ReservationCreate, db: Session = Depends(get_db)):
    # CORRECTION : On passe l'objet 'res' directement
    message = crud_res.create_reservation(db, res)
    return {"message": message}

@router.get("/", response_model=List[ReservationResponse])
def list_res(db: Session = Depends(get_db)):
    # Le CRUD renvoie déjà une liste de dicts, FastAPI fera le mapping
    return crud_res.list_reservations(db)

@router.get("/{res_id}", response_model=ReservationResponse)
def get_res(res_id: int, db: Session = Depends(get_db)):
    return crud_res.get_reservation(db, res_id)

@router.delete("/{res_id}")
def delete_res(res_id: int, db: Session = Depends(get_db)):
    message = crud_res.delete_reservation(db, res_id)
    return {"message": message}

@router.get("/total/{volnum}")
def total_reservations(volnum: int, db: Session = Depends(get_db)):
    total = crud_res.get_total_reservations(db, volnum)
    return {"vol_num": volnum, "total_reservations": total}

@router.get("/seat_taken/{volnum}/{seatcode}")
def seat_taken(volnum: int, seatcode: str, db: Session = Depends(get_db)):
    taken = crud_res.is_seat_taken(db, volnum, seatcode)
    return {"vol_num": volnum, "seat_code": seatcode, "seat_taken": bool(taken)}

@router.get("/passenger_age/{passenger_id}")
def passenger_age(passenger_id: int, db: Session = Depends(get_db)):
    age = crud_res.get_passenger_age(db, passenger_id)
    return {"passenger_id": passenger_id, "age": age}

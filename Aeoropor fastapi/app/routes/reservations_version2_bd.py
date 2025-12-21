from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ReservationCreate
from app.crud import reservations as crud_res

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.post("/")
def create_res(res: ReservationCreate, db: Session = Depends(get_db)):
    message = crud_res.create_reservation(db, res.PassengerID, res.VolNum, res.SeatCode, res.guardian_id)
    return {"message": message}

@router.delete("/{res_id}")
def delete_res(res_id: int, db: Session = Depends(get_db)):
    message = crud_res.delete_reservation(db, res_id)
    return {"message": message}

@router.get("/{res_id}")
def get_res(res_id: int, db: Session = Depends(get_db)):
    res_list = crud_res.get_reservation(db, res_id)
    return {"reservation": res_list}

@router.get("/")
def list_res(db: Session = Depends(get_db)):
    res_list = crud_res.list_reservations(db)
    return {"reservations": res_list}

@router.get("/total/{volnum}")
def total_reservations(volnum: int, db: Session = Depends(get_db)):
    total = crud_res.get_total_reservations(db, volnum)
    return {"total_reservations": total}

@router.get("/seat_taken/{volnum}/{seatcode}")
def seat_taken(volnum: int, seatcode: str, db: Session = Depends(get_db)):
    taken = crud_res.is_seat_taken(db, volnum, seatcode)
    return {"seat_taken": bool(taken)}

@router.get("/passenger_age/{passenger_id}")
def passenger_age(passenger_id: int, db: Session = Depends(get_db)):
    age = crud_res.get_passenger_age(db, passenger_id)
    return {"age": age}

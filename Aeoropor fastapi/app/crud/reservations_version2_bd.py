from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import ReservationCreate, ReservationResponse
from app.crud import reservations as crud_res

router = APIRouter(prefix="/reservations", tags=["Reservations"])


@router.post("/", response_model=dict)
def create_reservation(res: ReservationCreate, db: Session = Depends(get_db)):
    message = crud_res.create_reservation(db, res)
    return {"message": message}



@router.get("/", response_model=List[ReservationResponse])
def read_reservations(db: Session = Depends(get_db)):
    reservations = crud_res.list_reservations(db)
    return reservations


@router.get("/{res_id}", response_model=ReservationResponse)
def read_reservation(res_id: int, db: Session = Depends(get_db)):
    reservation = crud_res.get_reservation(db, res_id)
    return reservation


@router.delete("/{res_id}")
def delete_reservation(res_id: int, db: Session = Depends(get_db)):
    message = crud_res.delete_reservation(db, res_id)
    return {"message": message}


@router.get("/total-flight/{vol_num}")
def get_total(vol_num: int, db: Session = Depends(get_db)):
    total = crud_res.get_total_reservations(db, vol_num)
    return {"vol_num": vol_num, "total_reservations": total}

@router.get("/check-seat/{vol_num}/{seat_code}")
def check_seat(vol_num: int, seat_code: str, db: Session = Depends(get_db)):
    is_free = crud_res.check_seat_availability(db, vol_num, seat_code)
    return {"vol_num": vol_num, "seat_code": seat_code, "is_available": is_free}

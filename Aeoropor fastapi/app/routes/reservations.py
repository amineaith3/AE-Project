from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import ReservationCreate, ReservationResponse 
from app.crud import reservations as crud_res

router = APIRouter(prefix="/reservations", tags=["Reservations"])



@router.post("/", response_model=dict)
def create_res(res: ReservationCreate, db: Session = Depends(get_db)):
    message = crud_res.create_reservation(db, res)
    return {"message": message}



@router.get("/", response_model=List[ReservationResponse])
def list_all_reservations(db: Session = Depends(get_db)):
    # Le CRUD renvoie une liste de dictionnaires grâce au Ref Cursor
    res_list = crud_res.list_reservations(db)
    return res_list # FastAPI transforme les dicts en objets ReservationResponse


@router.get("/{res_id}", response_model=ReservationResponse)
def get_single_reservation(res_id: int, db: Session = Depends(get_db)):
    reservation = crud_res.get_reservation(db, res_id)
    return reservation


@router.delete("/{res_id}")
def delete_res(res_id: int, db: Session = Depends(get_db)):
    message = crud_res.delete_reservation(db, res_id)
    return {"message": message}


@router.get("/stats/total/{volnum}")
def total_reservations(volnum: int, db: Session = Depends(get_db)):
    total = crud_res.get_total_reservations(db, volnum)
    return {"vol_num": volnum, "total": total}

@router.get("/status/seat-taken/{volnum}/{seatcode}")
def check_seat(volnum: int, seatcode: str, db: Session = Depends(get_db)):
    taken = crud_res.is_seat_taken(db, volnum, seatcode)
    return {"is_taken": bool(taken)}

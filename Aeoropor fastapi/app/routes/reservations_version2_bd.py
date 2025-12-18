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

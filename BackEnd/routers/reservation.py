from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.engine import Connection
from crud import reservation as crud_reservation
from models.reservation import ReservationCreate, ReservationUpdate, ReservationOut
from deps import get_db
import oracledb as cx_Oracle
from oracle_errors import handle_oracle_error
from typing import List

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.post("/", response_model=dict)
def create_reservation(reservation: ReservationCreate, conn: Connection = Depends(get_db)):
    try:
        crud_reservation.add_reservation(conn, reservation)
        return {"message": "Reservation added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{reservation_id}", response_model=dict)
def modify_reservation(reservation_id: int, reservation: ReservationUpdate, conn: Connection = Depends(get_db)):
    try:
        crud_reservation.update_reservation(conn, reservation_id, reservation)
        return {"message": "Reservation updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{reservation_id}", response_model=dict)
def remove_reservation(reservation_id: int, conn: Connection = Depends(get_db)):
    try:
        crud_reservation.delete_reservation(conn, reservation_id)
        return {"message": "Reservation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/passport/{num_passeport}", response_model=dict)
def read_reservation_by_passport(reservation_id: int, conn: Connection = Depends(get_db)):
    try:
        reservation = crud_reservation.get_reservation_by_passport(conn, reservation_id)
        if not reservation or reservation["reservation_id"] is None:
            raise HTTPException(status_code=404, detail="Reservation not found")
        return reservation
    except cx_Oracle.DatabaseError as e:
        error_obj, = e.args
        raise HTTPException(
            status_code=400,
            detail=f"Oracle Error {error_obj.code}: {error_obj.message}"
        )



@router.get("/", response_model=List[dict])
def read_reservations(conn: Connection = Depends(get_db)):
    try:
        reservation = crud_reservation.get_all_reservations(conn)

        return reservation
    
    except cx_Oracle.DatabaseError as e:
        error_obj, = e.args
        raise HTTPException(
            status_code=400,
            detail=f"Oracle Error {error_obj.code}: {error_obj.message}"
        )
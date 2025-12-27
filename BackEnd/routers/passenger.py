from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.engine import Connection
from crud import passenger as crud_passenger
from models.passenger import PassengerCreate, PassengerUpdate, PassengerOut
from deps import get_db
from oracle_errors import handle_oracle_error
router = APIRouter(prefix="/passengers", tags=["Passengers"])
from typing import List
import oracledb as cx_Oracle

@router.post("/", response_model=dict)
def create_passenger(passenger: PassengerCreate, conn: Connection = Depends(get_db)):
    try:
        crud_passenger.add_passenger(conn, passenger)
        return {"message": "Passenger added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{passenger_id}", response_model=dict)
def modify_passenger(passenger_id: int, passenger: PassengerUpdate, conn: Connection = Depends(get_db)):
    try:
        crud_passenger.update_passenger(conn, passenger_id, passenger)
        return {"message": "Passenger updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{passenger_id}", response_model=dict)
def remove_passenger(passenger_id: int, conn: Connection = Depends(get_db)):
    try:
        crud_passenger.delete_passenger(conn, passenger_id)
        return {"message": "Passenger deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/passport/{num_passeport}", response_model=dict)
def read_passenger_by_passport(num_passeport: int, conn: Connection = Depends(get_db)):
    try:
        passenger = crud_passenger.get_passenger_by_passport(conn, num_passeport)
        if not passenger:
            raise HTTPException(status_code=404, detail="Passenger not found")
        return passenger
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{passenger_id}", response_model=dict)
def read_passenger_by_id(passenger_id: int, conn: Connection = Depends(get_db)):
    try:
        passenger = crud_passenger.get_passenger_by_id(conn, passenger_id)
        if not passenger:
            raise HTTPException(status_code=404, detail="Passenger not found")
        return passenger
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/", response_model=List[dict])
def read_passengers(conn: Connection = Depends(get_db)):
    return crud_passenger.get_all_passengers(conn)
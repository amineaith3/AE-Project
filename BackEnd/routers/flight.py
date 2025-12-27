from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.engine import Connection
from crud import flight as crud_flight
from models.flight import FlightCreate, FlightUpdate, FlightOut
from deps import get_db
from oracle_errors import handle_oracle_error
from crud import flight as crud_flight
from typing import List

router = APIRouter(prefix="/flights", tags=["Flights"])

@router.post("/", response_model=dict)
def create_flight(flight: FlightCreate, conn: Connection = Depends(get_db)):
    try:
        crud_flight.add_flight(conn, flight)
        return {"message": "Flight created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{vol_num}", response_model=dict)
def modify_flight(vol_num: int, flight: FlightUpdate, conn: Connection = Depends(get_db)):
    try:
        crud_flight.update_flight(conn, vol_num, flight)
        return {"message": "Flight updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{vol_num}", response_model=dict)
def remove_flight(vol_num: int, conn: Connection = Depends(get_db)):
    try:
        crud_flight.delete_flight(conn, vol_num)
        return {"message": "Flight deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{vol_num}", response_model=dict)
def read_flight(vol_num: int, conn: Connection = Depends(get_db)):
    flight = crud_flight.get_flight_by_id(conn, vol_num)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return dict(flight._mapping)

@router.get("/", response_model=List[dict])
def read_flight( conn: Connection = Depends(get_db)):
    flight = crud_flight.get_all_flights(conn)
    return flight


@router.patch("/{vol_num}/state", response_model=dict)
def update_flight_state(vol_num: int, new_state: str, conn: Connection = Depends(get_db)):
    """
    Change the state of a flight using DBA procedure.
    """
    try:
        crud_flight.change_flight_state(conn, vol_num, new_state)
        return {"message": f"Flight state changed to {new_state}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

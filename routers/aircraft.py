from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.engine import Connection
from crud import aircraft as crud_aircraft
from models.aircraft import AircraftCreate, AircraftUpdate, AircraftOut
from deps import get_db
from oracle_errors import handle_oracle_error
from sqlalchemy.exc import DBAPIError
from sqlalchemy import text
import cx_Oracle


router = APIRouter(prefix="/aircrafts", tags=["Aircrafts"])
@router.post("/", status_code=201)
def create_aircraft(
    aircraft: AircraftCreate,
    conn: Connection = Depends(get_db)
):
    try:
        crud_aircraft.add_aircraft(conn, aircraft)
        return {"message": "Aircraft created successfully"}
    except cx_Oracle.DatabaseError as e:
        error_obj, = e.args
        raise HTTPException(
            status_code=400,
            detail=f"Oracle Error {error_obj.code}: {error_obj.message}"
        )
@router.get("/{avion_id}", response_model=AircraftOut)
def read_aircraft(
    avion_id: int,
    conn: Connection = Depends(get_db)
):
    try:
        row = crud_aircraft.get_aircraft_by_id(conn, avion_id)
        if not row:
            raise HTTPException(status_code=404, detail="Aircraft not found")

        return AircraftOut(
            avion_id=row['avion_id'],
            modele=row['modele'],
            max_capacity=row['max_capacity'],
            state=row['state']
        )
    except cx_Oracle.DatabaseError as e:
        error_obj, = e.args
        raise HTTPException(
            status_code=400,
            detail=f"Oracle Error {error_obj.code}: {error_obj.message}"
        )
        
@router.put("/{avion_id}")
def edit_aircraft(
    avion_id: int,
    aircraft: AircraftUpdate,
    conn: Connection = Depends(get_db)
):
    try:
        crud_aircraft.update_aircraft(conn, avion_id, aircraft)
        return {"message": "Aircraft updated successfully"}
    except cx_Oracle.DatabaseError as e:
        error_obj, = e.args
        raise HTTPException(
            status_code=400,
            detail=f"Oracle Error {error_obj.code}: {error_obj.message}"
        )
@router.delete("/{avion_id}")
def remove_aircraft(
    avion_id: int,
    conn: Connection = Depends(get_db)
):
    try:
        crud_aircraft.delete_aircraft(conn, avion_id)
        return {"message": "Aircraft deleted successfully"}
    except cx_Oracle.DatabaseError as e:
        error_obj, = e.args
        raise HTTPException(
            status_code=400,
            detail=f"Oracle Error {error_obj.code}: {error_obj.message}"
        )
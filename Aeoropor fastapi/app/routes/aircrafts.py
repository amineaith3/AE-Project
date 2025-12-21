# app/routes/aircrafts.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import AircraftCreate, AircraftUpdate, AircraftResponse
from app.crud import aircrafts as crud  # Import the CRUD module we just made

# Create an APIRouter instance[citation:8]
router = APIRouter(
    prefix="/aircrafts",  # All routes in this file will start with /aircrafts
    tags=["aircrafts"],   # Groups these endpoints in the automated docs
)

@router.post("/", response_model=AircraftResponse, status_code=201)
def create_new_aircraft(
    aircraft: AircraftCreate,  # Request body validated by Pydantic schema
    db: Session = Depends(get_db)  # Inject the database session[citation:5]
):
    """
    Create a new aircraft.
    """
    return crud.create_aircraft(db, aircraft)

@router.get("/{avion_id}", response_model=AircraftResponse)
def read_aircraft(
    avion_id: int,  # Path parameter
    db: Session = Depends(get_db)
):
    """
    Get a specific aircraft by its ID.
    """
    return crud.get_aircraft(db, avion_id)

@router.put("/{avion_id}", response_model=AircraftResponse)
def update_existing_aircraft(
    avion_id: int,
    aircraft_update: AircraftUpdate,  # Uses a schema for partial updates
    db: Session = Depends(get_db)
):
    """
    Update an existing aircraft's information.
    """
    return crud.update_aircraft(db, avion_id, aircraft_update)

@router.delete("/{avion_id}")
def remove_aircraft(
    avion_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete an aircraft.
    """
    return crud.delete_aircraft(db, avion_id)
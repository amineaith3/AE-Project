from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ReservationCreate, ReservationResponse
from app.crud import reservations as crud  

# Create an APIRouter instance
router = APIRouter(
    prefix="/reservations",  # Toutes les routes commenceront par /reservations
    tags=["reservations"],   # Groupe pour la documentation Swagger
)

@router.post("/", response_model=ReservationResponse, status_code=201)
def create_new_reservation(
    reservation: ReservationCreate,  # Validé par Pydantic
    db: Session = Depends(get_db)    # Session de base de données
):
    """
    Create a new reservation using Oracle procedure and triggers.
    """
    return crud.create_reservation(db, reservation)

@router.get("/{res_id}", response_model=ReservationResponse)
def read_reservation(
    res_id: int,  # Paramètre de chemin
    db: Session = Depends(get_db)
):
    """
    Get a specific reservation by its ID.
    """
    return crud.get_reservation(db, res_id)

@router.get("/", response_model=list[ReservationResponse])
def read_all_reservations(
    db: Session = Depends(get_db)
):
    """
    Get all reservations.
    """
    return crud.get_reservations(db)

@router.delete("/{res_id}")
def remove_reservation(
    res_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a reservation.
    """
    db_res = crud.delete_reservation(db, res_id)
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"message": f"Reservation with ID {res_id} was successfully deleted."}

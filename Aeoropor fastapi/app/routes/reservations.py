from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ReservationCreate, ReservationResponse
from app.crud import reservations as crud_res

router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"]
)


@router.post("/", response_model=ReservationResponse)
def create(res: ReservationCreate, db: Session = Depends(get_db)):
    return crud_res.create_reservation(db, res)


@router.get("/{res_id}", response_model=ReservationResponse)
def read(res_id: int, db: Session = Depends(get_db)):
    res = crud_res.get_reservation(db, res_id)
    if not res:
        raise HTTPException(
            status_code=404,
            detail="Réservation non trouvée."
        )
    return res


@router.get("/", response_model=list[ReservationResponse])
def read_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud_res.get_all_reservations(db, skip, limit)


@router.delete("/{res_id}", response_model=dict)
def delete(res_id: int, db: Session = Depends(get_db)):
    res = crud_res.delete_reservation(db, res_id)
    if not res:
        raise HTTPException(
            status_code=404,
            detail="Réservation non trouvée."
        )
    return {
        "message": "Réservation annulée et capacité du vol mise à jour."
    }

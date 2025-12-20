from sqlalchemy.orm import Session
from app import models
from app.schemas import ReservationCreate, ReservationUpdate


def create_reservation(db: Session, reservation: ReservationCreate):
    obj = models.Reservations(**reservation.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_reservation(db: Session, reservation_id: int):
    return db.query(models.Reservations).filter(models.Reservations.ReservationID == reservation_id).first()


def get_all_reservations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Reservations).offset(skip).limit(limit).all()


def update_reservation(db: Session, reservation_id: int, reservation_update: ReservationUpdate):
    obj = get_reservation(db, reservation_id)
    if not obj:
        return None

    data = reservation_update.dict(exclude_unset=True)
    for key, value in data.items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)
    return obj


def delete_reservation(db: Session, reservation_id: int):
    obj = get_reservation(db, reservation_id)
    if not obj:
        return None

    db.delete(obj)
    db.commit()
    return obj


def set_state(db: Session, reservation_id: int, new_state: str):
    obj = get_reservation(db, reservation_id)
    if not obj:
        return None

    obj.State = new_state
    db.commit()
    db.refresh(obj)
    return obj

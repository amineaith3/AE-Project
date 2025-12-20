from sqlalchemy.orm import Session
from app import models
from app.schemas import PassengerCreate, PassengerUpdate


def create_passenger(db: Session, passenger: PassengerCreate):
    obj = models.Passengers(**passenger.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_passenger(db: Session, passenger_id: int):
    return db.query(models.Passengers).filter(models.Passengers.PassengerId == passenger_id).first()


def get_all_passengers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Passengers).offset(skip).limit(limit).all()


def update_passenger(db: Session, passenger_id: int, passenger_update: PassengerUpdate):
    obj = get_passenger(db, passenger_id)
    if not obj:
        return None

    data = passenger_update.dict(exclude_unset=True)
    for key, value in data.items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)
    return obj


def delete_passenger(db: Session, passenger_id: int):
    obj = get_passenger(db, passenger_id)
    if not obj:
        return None

    db.delete(obj)
    db.commit()
    return obj

from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from app.models import Reservations, Flights, Passengers, Aircrafts
from app.schemas import ReservationCreate

def get_reservation(db: Session, res_id: int):
    return db.query(Reservations).filter(Reservations.ReservationID == res_id).first()

def get_all_reservations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Reservations).offset(skip).limit(limit).all()

def create_reservation(db: Session, res: ReservationCreate):
    try:
        existing = db.query(Reservations).filter(
            Reservations.PassengerID == res.PassengerID,
            Reservations.VolNum == res.VolNum
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Le passager a déjà une réservation pour ce vol.")

        flight = db.query(Flights).filter(Flights.VolNum == res.VolNum).first()
        if not flight:
            raise HTTPException(status_code=404, detail="Vol non trouvé.")

        aircraft = db.query(Aircrafts).filter(Aircrafts.AvionID == flight.AvionID).first()
        if flight.CurrentCapacity >= aircraft.MaxCapacity:
            raise HTTPException(status_code=400, detail="L'avion est plein, réservation impossible.")

        passenger = db.query(Passengers).filter(Passengers.PassengerId == res.PassengerID).first()
        if passenger.Age < 18:
            if not res.guardian_id:
                raise HTTPException(status_code=400, detail="Passager mineur : Guardian_id obligatoire.")

            guardian_res = db.query(Reservations).filter(
                Reservations.PassengerID == res.guardian_id,
                Reservations.VolNum == res.VolNum
            ).first()
            if not guardian_res:
                raise HTTPException(status_code=400, detail="Le tuteur doit avoir une réservation sur ce vol.")

            guardian_info = db.query(Passengers).filter(
                Passengers.PassengerId == res.guardian_id
            ).first()
            if guardian_info.Age < 18:
                raise HTTPException(status_code=400, detail="Le tuteur ne peut pas être un mineur.")

        db.execute(
            text("""
            INSERT INTO RESERVATIONS (PassengerID, VolNum, SeatCode, State, guardian_id)
            VALUES (:pid, :vnum, :seat, 'Pending', :gid)
            """),
            {
                "pid": res.PassengerID,
                "vnum": res.VolNum,
                "seat": res.SeatCode,
                "gid": res.guardian_id
            }
        )

        flight.CurrentCapacity += 1
        db.commit()

        return db.query(Reservations).filter(
            Reservations.PassengerID == res.PassengerID,
            Reservations.VolNum == res.VolNum
        ).first()

    except Exception as e:
        db.rollback()
        raise e

def delete_reservation(db: Session, res_id: int):
    res = get_reservation(db, res_id)
    if not res:
        return None
    try:
        flight = db.query(Flights).filter(Flights.VolNum == res.VolNum).first()
        if flight:
            flight.CurrentCapacity -= 1
        db.delete(res)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    return res

from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from app.schemas import ReservationCreate
import oracledb

def create_reservation(db: Session, reservation: ReservationCreate):
    try:
     
        db.execute(
            text("""
                BEGIN
                    create_reservation_proc(
                        :pid, :vnum, :seat, :gid
                    );
                END;
            """),
            {
                "pid": reservation.PassengerID,
                "vnum": reservation.VolNum,
                "seat": reservation.SeatCode,
                "gid": reservation.guardian_id
            }
        )
        db.commit()

       
        result = db.execute(
            text("""
                SELECT reservation_id, Passenger_id, vol_num, SeatCode, State, Guardian_id 
                FROM Reservations 
                WHERE Passenger_id = :pid AND vol_num = :vnum 
                ORDER BY reservation_id DESC
            """),
            {"pid": reservation.PassengerID, "vnum": reservation.VolNum}
        ).first()
        
        return result

    except Exception as e:
        db.rollback()
        error_msg = str(e)
       
        if "ORA-20001" in error_msg:
            raise HTTPException(status_code=400, detail="Siège déjà occupé.")
        elif "ORA-20002" in error_msg:
            raise HTTPException(status_code=400, detail="L'avion est plein.")
        elif "ORA-20003" in error_msg:
            raise HTTPException(status_code=400, detail="Tuteur obligatoire pour mineur.")
        else:
            raise HTTPException(status_code=500, detail=f"Erreur SQL: {error_msg}")

def get_reservation(db: Session, res_id: int):

    result = db.execute(
        text("SELECT * FROM Reservations WHERE reservation_id = :id"),
        {"id": res_id}
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="Reservation not found.")
    return result

def get_reservations(db: Session):
 
    return db.execute(text("SELECT * FROM Reservations")).all()

def delete_reservation(db: Session, res_id: int):
  
    res = get_reservation(db, res_id)
    try:
        # Le trigger AFTER_DELETE va libérer la place dans FLIGHTS automatiquement
        db.execute(text("DELETE FROM Reservations WHERE reservation_id = :id"), {"id": res_id})
        db.commit()
        return res
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

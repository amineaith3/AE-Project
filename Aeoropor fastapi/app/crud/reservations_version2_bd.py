from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from app.schemas import ReservationCreate 
import oracledb


def create_reservation(db: Session, res: ReservationCreate):
    try:
     
        result = db.execute(
            text("""
                DECLARE
                    v_result VARCHAR2(500);
                BEGIN
                    create_reservation_proc(:pid, :vnum, :seat, :gid, v_result);
                    :out_msg := v_result;
                END;
            """),
            {
                "pid": res.PassengerID, 
                "vnum": res.VolNum, 
                "seat": res.SeatCode, 
                "gid": res.guardian_id, 
                "out_msg": ""
            }
        ).scalar()
        
        db.commit()
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))



def list_reservations(db: Session):
    try:

        conn = db.connection().connection
        cursor = conn.cursor()
        ref_cursor = cursor.var(oracledb.CURSOR)
       
        cursor.callproc("list_reservations_proc", [ref_cursor])
        
        res_set = ref_cursor.getvalue()
        rows = res_set.fetchall()
        
      
        
        columns = [d[0] for d in res_set.description]
        data = [dict(zip(columns, row)) for row in rows]
        
        cursor.close()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de lecture: {str(e)}")

def get_reservation(db: Session, res_id: int):
    try:
        conn = db.connection().connection
        cursor = conn.cursor()
        ref_cursor = cursor.var(oracledb.CURSOR)
        
        cursor.callproc("get_reservation_proc", [res_id, ref_cursor])
        
        res_set = ref_cursor.getvalue()
        row = res_set.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Réservation introuvable")
            
        columns = [d[0] for d in res_set.description]
        data = dict(zip(columns, row))
        
        cursor.close()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_reservation(db: Session, res_id: int):
    try:
        result = db.execute(
            text("""
                DECLARE
                    v_result VARCHAR2(500);
                BEGIN
                    delete_reservation_proc(:rid, v_result);
                    :out_msg := v_result;
                END;
            """),
            {"rid": res_id, "out_msg": ""}
        ).scalar()
        db.commit()
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))



def get_total_reservations(db: Session, volnum: int):
    return db.execute(
        text("SELECT get_total_reservations(:vnum) FROM dual"), 
        {"vnum": volnum}
    ).scalar()

def is_seat_taken(db: Session, volnum: int, seatcode: str):
    return db.execute(
        text("SELECT is_seat_taken(:vnum, :seat) FROM dual"), 
        {"vnum": volnum, "seat": seatcode}
    ).scalar()

def get_passenger_age(db: Session, passenger_id: int):
    return db.execute(
        text("SELECT get_passenger_age(:pid) FROM dual"), 
        {"pid": passenger_id}
    ).scalar()

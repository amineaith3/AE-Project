from sqlalchemy.orm import Session
from sqlalchemy import text

def create_reservation(db: Session, passenger_id, volnum, seatcode, guardian_id=None):
    result = db.execute(
        text("""
            DECLARE
                v_result VARCHAR2(500);
            BEGIN
                create_reservation_proc(:pid, :vnum, :seat, :gid, v_result);
                :res := v_result;
            END;
        """),
        {"pid": passenger_id, "vnum": volnum, "seat": seatcode, "gid": guardian_id, "res": ""}
    ).scalar()
    return result

def delete_reservation(db: Session, res_id):
    result = db.execute(
        text("""
            DECLARE
                v_result VARCHAR2(500);
            BEGIN
                delete_reservation_proc(:rid, v_result);
                :res := v_result;
            END;
        """),
        {"rid": res_id, "res": ""}
    ).scalar()
    return result

def get_reservation(db: Session, res_id):
    cursor = db.execute(text("BEGIN get_reservation_proc(:rid, :res); END;"), {"rid": res_id, "res": None})
    return cursor.fetchall()

def list_reservations(db: Session):
    cursor = db.execute(text("BEGIN list_reservations_proc(:res); END;"), {"res": None})
    return cursor.fetchall()

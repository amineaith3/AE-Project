from sqlalchemy.orm import Session
from sqlalchemy import text

def create_maintenance(db: Session, avion_id, operation_date, typee):
    result = db.execute(
        text("""
            DECLARE
                v_result VARCHAR2(500);
            BEGIN
                create_maintenance_proc(:aid, :odate, :typee, v_result);
                :res := v_result;
            END;
        """),
        {"aid": avion_id, "odate": operation_date, "typee": typee, "res": ""}
    ).scalar()
    return result

def delete_maintenance(db: Session, maintenance_id):
    result = db.execute(
        text("""
            DECLARE
                v_result VARCHAR2(500);
            BEGIN
                delete_maintenance_proc(:mid, v_result);
                :res := v_result;
            END;
        """),
        {"mid": maintenance_id, "res": ""}
    ).scalar()
    return result

def get_maintenance(db: Session, maintenance_id):
    cursor = db.execute(text("BEGIN get_maintenance_proc(:mid, :res); END;"), {"mid": maintenance_id, "res": None})
    return cursor.fetchall()

def list_maintenance(db: Session):
    cursor = db.execute(text("BEGIN list_maintenance_proc(:res); END;"), {"res": None})
    return cursor.fetchall()

def get_total_maintenance(db: Session, avion_id):
    return db.execute(text("SELECT get_total_maintenance(:aid) FROM dual"), {"aid": avion_id}).scalar()

def is_aircraft_in_maintenance(db: Session, avion_id, date):
    return db.execute(text("SELECT is_aircraft_in_maintenance(:aid, :date) FROM dual"), {"aid": avion_id, "date": date}).scalar()

def get_maintenance_state(db: Session, maintenance_id):
    return db.execute(text("SELECT get_maintenance_state(:mid) FROM dual"), {"mid": maintenance_id}).scalar()

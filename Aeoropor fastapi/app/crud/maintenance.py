from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from app.schemas import MaintenanceCreate  # Import du schéma
import oracledb
from datetime import datetime

def create_maintenance(db: Session, maint: MaintenanceCreate):
    try:
        # On convertit la date envoyée par le schéma
        formatted_date = datetime.strptime(maint.OperationDate, "%Y-%m-%d").date()
        
        result = db.execute(
            text("""
                DECLARE
                    v_res VARCHAR2(500);
                BEGIN
                    create_maintenance_proc(:aid, :odate, :typ, v_res);
                    :out_res := v_res;
                END;
            """),
            {
                "aid": maint.AvionID,     # Correspond à AvionID dans ton schéma
                "odate": formatted_date, 
                "typ": maint.Type,        # Correspond à Type dans ton schéma
                "out_res": ""
            }
        ).scalar()
        
        db.commit()
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erreur lors de la création : {str(e)}")

def list_maintenance(db: Session):
    try:
        raw_connection = db.connection().connection
        oracle_cursor = raw_connection.cursor()
        ref_cursor_var = oracle_cursor.var(oracledb.CURSOR)
        
        oracle_cursor.callproc("list_maintenance_proc", [ref_cursor_var])
        
        result_cursor = ref_cursor_var.getvalue()
        rows = result_cursor.fetchall()
        
        if not rows:
            return []
        
        columns = [desc[0] for desc in result_cursor.description]
        maintenances = [dict(zip(columns, row)) for row in rows]
        
        result_cursor.close()
        oracle_cursor.close()
        
        return maintenances
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def delete_maintenance(db: Session, maintenance_id: int):
    try:
        result = db.execute(
            text("""
                DECLARE
                    v_res VARCHAR2(500);
                BEGIN
                    delete_maintenance_proc(:mid, v_res);
                    :out_res := v_res;
                END;
            """),
            {"mid": maintenance_id, "out_res": ""}
        ).scalar()
        db.commit()
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


def get_total_maintenance(db: Session, avion_id: int):
    return db.execute(text("SELECT get_total_maintenance(:aid) FROM dual"), {"aid": avion_id}).scalar()

def is_aircraft_in_maintenance(db: Session, avion_id: int, date: str):
    f_date = datetime.strptime(date, "%Y-%m-%d").date()
    return db.execute(text("SELECT is_aircraft_in_maintenance(:aid, :d) FROM dual"), {"aid": avion_id, "d": f_date}).scalar()

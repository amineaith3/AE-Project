from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from app.schemas import MaintenanceCreate
import oracledb
from datetime import datetime

def create_maintenance(db: Session, maint: MaintenanceCreate):
    try:

        formatted_date = datetime.strptime(maint.OperationDate, "%Y-%m-%d").date()
        
    
        db.execute(
            text("BEGIN create_maintenance_proc(:aid, :odate, :typ); END;"),
            {
                "aid": maint.AvionID,
                "odate": formatted_date,
                "typ": maint.typee # Attention au nom dans ton schéma (typee ou Type)
            }
        )
        db.commit()

        return db.execute(
            text("SELECT * FROM MAINTENANCE WHERE Avion_id = :aid ORDER BY maintenance_id DESC"),
            {"aid": maint.AvionID}
        ).first()

    except Exception as e:
        db.rollback()
        error_msg = str(e)

        if "ORA-20101" in error_msg:
            raise HTTPException(status_code=400, detail="Maintenance déjà programmée à cette date.")
        elif "ORA-20102" in error_msg:
            raise HTTPException(status_code=404, detail="Avion introuvable.")
        elif "ORA-20002" in error_msg:
            raise HTTPException(status_code=400, detail="L'avion est Hors Service.")
        else:
            raise HTTPException(status_code=500, detail=f"Erreur DB: {error_msg}")

def list_maintenance(db: Session):
    
    raw_connection = db.connection().connection
    cursor = raw_connection.cursor()
    ref_cursor = cursor.var(oracledb.CURSOR)
    
    cursor.callproc("list_maintenance_proc", [ref_cursor])
    result_cursor = ref_cursor.getvalue()
    rows = result_cursor.fetchall()
    

    columns = [desc[0] for desc in result_cursor.description]
    maintenances = [dict(zip(columns, row)) for row in rows]
    
    result_cursor.close()
    cursor.close()
    return maintenances

def delete_maintenance(db: Session, maintenance_id: int):
    try:
        db.execute(
            text("BEGIN delete_maintenance_proc(:mid); END;"),
            {"mid": maintenance_id}
        )
        db.commit()
        return {"message": "Maintenance supprimée"}
    except Exception as e:
        db.rollback()
        if "ORA-20103" in str(e):
            raise HTTPException(status_code=404, detail="Maintenance non trouvée.")
        raise HTTPException(status_code=400, detail=str(e))


def get_stats_total(db: Session, avion_id: int):
    return db.execute(text("SELECT get_total_maintenance(:aid) FROM dual"), {"aid": avion_id}).scalar()

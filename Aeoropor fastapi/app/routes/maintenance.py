from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import MaintenanceCreate
from app.crud import maintenance as crud_maint

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/")
def create_maint(maint: MaintenanceCreate, db: Session = Depends(get_db)):
    message = crud_maint.create_maintenance(db, maint.AvionID, maint.OperationDate, maint.Type)
    return {"message": message}

@router.delete("/{maintenance_id}")
def delete_maint(maintenance_id: int, db: Session = Depends(get_db)):
    message = crud_maint.delete_maintenance(db, maintenance_id)
    return {"message": message}

@router.get("/{maintenance_id}")
def get_maint(maintenance_id: int, db: Session = Depends(get_db)):
    maint_list = crud_maint.get_maintenance(db, maintenance_id)
    return {"maintenance": maint_list}

@router.get("/")
def list_maint(db: Session = Depends(get_db)):
    maint_list = crud_maint.list_maintenance(db)
    return {"maintenances": maint_list}

@router.get("/total/{avion_id}")
def total_maintenance(avion_id: int, db: Session = Depends(get_db)):
    total = crud_maint.get_total_maintenance(db, avion_id)
    return {"total_maintenance": total}

@router.get("/in_maintenance/{avion_id}/{date}")
def aircraft_in_maintenance(avion_id: int, date: str, db: Session = Depends(get_db)):
    in_maint = crud_maint.is_aircraft_in_maintenance(db, avion_id, date)
    return {"in_maintenance": bool(in_maint)}

@router.get("/state/{maintenance_id}")
def maintenance_state(maintenance_id: int, db: Session = Depends(get_db)):
    state = crud_maint.get_maintenance_state(db, maintenance_id)
    return {"state": state}

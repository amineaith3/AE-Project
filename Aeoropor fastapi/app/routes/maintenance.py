from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import MaintenanceCreate, MaintenanceResponse
from app.crud import maintenance as crud_maint
from typing import List

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/", response_model=MaintenanceResponse, status_code=201)
def create_maint(maint: MaintenanceCreate, db: Session = Depends(get_db)):
    
    return crud_maint.create_maintenance(db, maint)

@router.get("/", response_model=List[MaintenanceResponse])
def list_maintenances(db: Session = Depends(get_db)):
    
    maintenances = crud_maint.list_maintenance(db)

    return maintenances

@router.delete("/{maintenance_id}")
def delete_maint(maintenance_id: int, db: Session = Depends(get_db)):
    
    crud_maint.delete_maintenance(db, maintenance_id)
    return {"message": f"Maintenance {maintenance_id} deleted successfully"}



@router.get("/total/{avion_id}")
def get_total(avion_id: int, db: Session = Depends(get_db)):
    total = crud_maint.get_total_maintenance(db, avion_id)
    return {"avion_id": avion_id, "total_maintenances": total}

@router.get("/check-availability/{avion_id}/{date}")
def check_maint(avion_id: int, date: str, db: Session = Depends(get_db)):
    is_busy = crud_maint.is_aircraft_in_maintenance(db, avion_id, date)
    return {"avion_id": avion_id, "is_in_maintenance": bool(is_busy)}

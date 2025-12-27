from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.engine import Connection
from crud import maintenance as crud_maintenance
from models.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceOut
from deps import get_db
from oracle_errors import handle_oracle_error
router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/", response_model=dict)
def create_maintenance(maintenance: MaintenanceCreate, conn: Connection = Depends(get_db)):
    try:
        crud_maintenance.add_maintenance(conn, maintenance)
        return {"message": "Maintenance added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{maintenance_id}", response_model=dict)
def modify_maintenance(maintenance_id: int, maintenance: MaintenanceUpdate, conn: Connection = Depends(get_db)):
    try:
        crud_maintenance.update_maintenance(conn, maintenance_id, maintenance)
        return {"message": "Maintenance updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{maintenance_id}", response_model=dict)
def remove_maintenance(maintenance_id: int, conn: Connection = Depends(get_db)):
    try:
        crud_maintenance.delete_maintenance(conn, maintenance_id)
        return {"message": "Maintenance deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list)
def read_all_maintenance(conn: Connection = Depends(get_db)):
    try:
        rows, columns = crud_maintenance.list_maintenance(conn)
        # Convert all rows to list of dicts
        return [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{maintenance_id}", response_model=dict)
def read_maintenance_by_id(maintenance_id: int, conn: Connection = Depends(get_db)):
    try:
        rows, columns = crud_maintenance.get_maintenance_by_id(conn, maintenance_id)
        print(columns)
        if not rows:
            raise HTTPException(status_code=404, detail="Maintenance not found")
        return dict(zip(columns, rows[0]))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

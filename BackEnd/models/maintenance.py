from pydantic import BaseModel
from datetime import date

class MaintenanceCreate(BaseModel):
    avion_id: int
    operation_date: date
    typee: str

class MaintenanceUpdate(BaseModel):
    operation_date: date
    typee: str
    state: str
class MaintenanceOut(BaseModel):
    avion_id: int
    operation_date: date
    typee: str

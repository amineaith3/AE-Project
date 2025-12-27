from pydantic import BaseModel, EmailStr
from typing import Optional

class PassengerCreate(BaseModel):
    passenger_id: int
    prenom: str
    nom: str
    num_passeport: int
    contact: EmailStr
    nationality: str
    age: int

class PassengerUpdate(BaseModel):
    prenom: str
    nom: str
    contact: EmailStr
    nationality: str
    age: int

class PassengerOut(BaseModel):
    passenger_id: int
    prenom: str
    nom: str
    num_passeport: int
    contact: EmailStr
    nationality: str
    age: int
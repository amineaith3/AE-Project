from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base 


class Passengers(Base) : 
       __tablename__ = "PASSENGERS"
       
    Passenger_id = Column(Integer, primary_key=True, index=True)
    prenom = Column(String(50), nullable=False)
    nom = Column(String(50), nullable=False)
    NumPasseport = Column(Integer, unique=True)
    Contact = Column(String(50), nullable=False)
    Nationality = Column(String(50), nullable=False)
    Age_pass = Column(Integer, nullable=False)

class Aircrafts(Base):
    __tablename__ = "AIRCRAFTS"

    AvionID = Column(Integer, primary_key=True)
    Modele = Column(String(50), nullable=False)
    MaxCapacity = Column(Integer, nullable=False)
    State = Column(String(20))   # Disponible / En Vol / En Maintenance / Hors Service



class Flights(Base):
    __tablename__ = "FLIGHTS"

    VolNum = Column(Integer, primary_key=True)
    Destination = Column(String(50), nullable=False)
    DepartureTime = Column(String(50), nullable=False)  # si tu veux Date, change vers Date
    arrival_Time = Column(String(50), nullable=False)  # si tu veux Date, change vers Date
    CurrentCapacity = Column(Integer, nullable=False)
    State = Column(String(20))  # Scheduled / In Progress / Arrived / Cancelled
    AvionID = Column(Integer, ForeignKey("AIRCRAFTS.AvionID"))



class Reservations(Base):
    __tablename__ = "RESERVATIONS"
       
    reservation_id = Column(Integer, primary_key=True, index=True)
    Passenger_id = Column(Integer, ForeignKey("PASSENGERS.Passenger_id"), nullable=False)
    vol_num = Column(Integer, ForeignKey("FLIGHTS.vol_num"), nullable=False)
    SeatCode = Column(String(25), nullable=False)   # pas unique ici (géré par triggers)
    State = Column(String(50))
    Guardian_id = Column(Integer, ForeignKey("PASSENGERS.Passenger_id"))


class Maintenance(Base):
    __tablename__ = "MAINTENANCE"

    MaintenanceID = Column(Integer, primary_key=True)
    AvionID = Column(Integer, ForeignKey("AIRCRAFTS.AvionID"))
    OperationDate = Column(String(50), nullable=False)  # ou Date
    Type = Column(String(30), nullable=False)  # Inspection / Repair / Cleaning
    State = Column(String(20))  # Planned / Finished / Waiting







 





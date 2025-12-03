from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base 


class Passengers(Base) : 
       __tablename__ = "PASSENGERS"
       
       passenger_id = Column(Integer, primary_key=True)
       FirstName = Column(String(25), nullable= False)
       LastName = Column(String(25), nullable= False)
       NumPasseport = Column(Integer , unique = True )
       Contact = Column (String , nullable= False )
       Nationality = Column(String(25), nullable= False)
       Age_pass = Column(Integer , nullable= False ) 


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

    ReservationID = Column(Integer, primary_key=True)
    PassengerID = Column(Integer, ForeignKey("PASSENGERS.PassengerID"))
    VolNum = Column(Integer, ForeignKey("FLIGHTS.VolNum"))
    SeatCode = Column(String(10), unique=True)  # UNIQUE seat per flight
    State = Column(String(20))  # Confirmed / Waiting / Canceled
    guardian_id = Column(Integer, ForeignKey("PASSENGERS.passenger_id"))


class Maintenance(Base):
    __tablename__ = "MAINTENANCE"

    MaintenanceID = Column(Integer, primary_key=True)
    AvionID = Column(Integer, ForeignKey("AIRCRAFTS.AvionID"))
    OperationDate = Column(String(50), nullable=False)  # ou Date
    Type = Column(String(30), nullable=False)  # Inspection / Repair / Cleaning
    State = Column(String(20))  # Planned / Finished / Waiting







 



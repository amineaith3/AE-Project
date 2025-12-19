CREATE TABLE Passengers (
       Passenger_id NUMBER PRIMARY KEY,
       prenom VARCHAR(50) NOT NULL,
       nom VARCHAR(50) NOT NULL,
       NumPasseport NUMBER UNIQUE, 
       Contact VARCHAR(50) NOT NULL,
       Nationality VARCHAR(50) NOT NULL,
       Age_pass NUMBER NOT NULL
); 


CREATE TABLE Aircrafts (
       Avion_id NUMBER PRIMARY KEY,
       Modele VARCHAR(50) NOT NULL,
       MaxCapacity NUMBER NOT NULL,
       State VARCHAR(50)
); 
       

CREATE TABLE Flights (
    vol_num NUMBER PRIMARY KEY,
    destination VARCHAR2(50) NOT NULL,
    departure_time DATE NOT NULL, 
    arrival_time DATE NOT NULL,
    CurrentCapacity NUMBER NOT NULL,
    state VARCHAR2(50),
    Avion_id NUMBER,
    CONSTRAINT fk_avion FOREIGN KEY (Avion_id) REFERENCES Aircrafts(Avion_id)
);


CREATE TABLE Reservations (
       reservation_id NUMBER PRIMARY KEY, 
       Passenger_id NUMBER,
       CONSTRAINT fk_passenger FOREIGN KEY (Passenger_id) REFERENCES Passengers(Passenger_id), 
       vol_num NUMBER, 
       CONSTRAINT fk_flights FOREIGN KEY (vol_num) REFERENCES Flights(vol_num),
       SeatCode VARCHAR(25),
       State VARCHAR(50),
       Guardian_id NUMBER,
       CONSTRAINT fk_guardian FOREIGN KEY (Guardian_id) REFERENCES Passengers(Passenger_id)
); 
       

CREATE TABLE Maintenance (
       maintenance_id NUMBER PRIMARY KEY, 
       Avion_id NUMBER,
       CONSTRAINT fk_avion_maintenance FOREIGN KEY (Avion_id) REFERENCES Aircrafts(Avion_id),
       OperationDate DATE NOT NULL,
       typee VARCHAR(50) NOT NULL,
       State VARCHAR(50) NOT NULL,
       CONSTRAINT ck_maintenance_type CHECK (typee IN ('Inspection','Repair','Cleaning'))
);

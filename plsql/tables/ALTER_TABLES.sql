ALTER TABLE Passengers
ADD COLUMN Age NUMBER NOT NULL;

ALTER TABLE Aircrafts
DROP COLUMN CurrentCapacity;

ALTER TABLE Reservations
ADD COLUMN Guardian_id NUMBER;

ALTER TABLE Flights
ADD COLUMN CurrentCapacity NUMBER NOT NULL;

ALTER TABLE Aircrafts ADD CONSTRAINT chk_aircrafts_state 
CHECK (State IN ('Ready', 'In Service', 'In Maintenance', 'Out of Service'));


ALTER TABLE Flights ADD CONSTRAINT chk_flight_state 
CHECK (state IN ('Scheduled', 'In Service', 'Cancelled', 'Full'));


ALTER TABLE Reservations ADD CONSTRAINT chk_reservation_state 
CHECK (State IN ('Pending', 'Confirmed', 'Cancelled', 'Boarded'));


ALTER TABLE Maintenance ADD CONSTRAINT chk_maintenance_state 
CHECK (State IN ('Scheduled', 'In Progress', 'Completed'));



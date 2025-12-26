-- =========================
-- DROP TABLES (IF EXISTS)
-- =========================
DROP TABLE Maintenance CASCADE CONSTRAINTS;
DROP TABLE Reservations CASCADE CONSTRAINTS;
DROP TABLE Flights CASCADE CONSTRAINTS;
DROP TABLE Aircrafts CASCADE CONSTRAINTS;
DROP TABLE Passengers CASCADE CONSTRAINTS;

-- =========================
-- CREATE TABLES
-- =========================
CREATE TABLE LOGS (
    LogID NUMBER PRIMARY KEY,
    TableName VARCHAR2(50),
    Operation VARCHAR2(50),
    RecordID NUMBER,
    Details VARCHAR2(4000),
    LogDate DATE DEFAULT SYSDATE
);
CREATE SEQUENCE seq_logs
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

CREATE TABLE Passengers (
    Passenger_id NUMBER PRIMARY KEY,
    prenom VARCHAR2(50) NOT NULL,
    nom VARCHAR2(50) NOT NULL,
    NumPasseport NUMBER UNIQUE,
    Contact VARCHAR2(50) NOT NULL,
    Nationality VARCHAR2(50) NOT NULL,
    Age NUMBER NOT NULL
);

CREATE TABLE Aircrafts (
    Avion_id NUMBER PRIMARY KEY,
    Modele VARCHAR2(50) NOT NULL,
    MaxCapacity NUMBER NOT NULL,
    State VARCHAR2(50),
    CONSTRAINT chk_aircrafts_state
        CHECK (State IN ('Ready', 'Flying', 'Turnaround', 'Maintenance', 'Out of Service'))
);

CREATE TABLE Flights (
    vol_num NUMBER PRIMARY KEY,
    destination VARCHAR2(50) NOT NULL,
    departure_time DATE NOT NULL,
    arrival_time DATE NOT NULL,
    CurrentCapacity NUMBER DEFAULT 0 NOT NULL,
    state VARCHAR2(50),
    Avion_id NUMBER,
    CONSTRAINT fk_avion
        FOREIGN KEY (Avion_id) REFERENCES Aircrafts(Avion_id),
    CONSTRAINT chk_flight_state
        CHECK (state IN ('Scheduled', 'In Service', 'Cancelled', 'Full'))
);

CREATE TABLE Reservations (
    reservation_id NUMBER PRIMARY KEY,
    Passenger_id NUMBER NOT NULL,
    vol_num NUMBER NOT NULL,
    SeatCode VARCHAR2(25) NOT NULL,
    State VARCHAR2(50),
    Guardian_id NUMBER,
    CONSTRAINT fk_passenger
        FOREIGN KEY (Passenger_id) REFERENCES Passengers(Passenger_id),
    CONSTRAINT fk_flights
        FOREIGN KEY (vol_num) REFERENCES Flights(vol_num),
    CONSTRAINT fk_guardian
        FOREIGN KEY (Guardian_id) REFERENCES Passengers(Passenger_id),
    CONSTRAINT chk_reservation_state
        CHECK (State IN ('Pending', 'Confirmed', 'Cancelled', 'Boarded'))
);

CREATE TABLE Maintenance (
    maintenance_id NUMBER PRIMARY KEY,
    Avion_id NUMBER,
    OperationDate DATE NOT NULL,
    typee VARCHAR2(50) NOT NULL,
    State VARCHAR2(50) NOT NULL,
    CONSTRAINT fk_avion_maintenance
        FOREIGN KEY (Avion_id) REFERENCES Aircrafts(Avion_id),
    CONSTRAINT ck_maintenance_type
        CHECK (typee IN ('Inspection', 'Repair', 'Cleaning')),
    CONSTRAINT chk_maintenance_state
        CHECK (State IN ('Scheduled', 'In Progress', 'Completed'))
);





-- 1. Add new aircraft
CREATE OR REPLACE PROCEDURE add_new_aircraft(
    Avion_id_p IN NUMBER,
    Modele_p IN VARCHAR2,
    MaxCapacity_p IN NUMBER,
    State_p IN VARCHAR2 DEFAULT 'Ready'
)
AUTHID CURRENT_USER
IS
    aircraft_exist NUMBER;
BEGIN
    SELECT COUNT(*) INTO aircraft_exist
    FROM AIRCRAFTS
    WHERE Avion_id = Avion_id_p;

    IF aircraft_exist != 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Aircraft already exists');
    ELSE
        INSERT INTO AIRCRAFTS (Avion_id, Modele, MaxCapacity, State)
        VALUES (Avion_id_p, Modele_p, MaxCapacity_p, State_p);
        COMMIT;
    END IF;
END;
/

-- 2. Update aircraft
CREATE OR REPLACE PROCEDURE update_aircraft(
    Avion_id_p IN NUMBER,
    Modele_p IN VARCHAR2,
    MaxCapacity_p IN NUMBER,
    State_p IN VARCHAR2
)
AUTHID CURRENT_USER
IS
    aircraft_exist NUMBER;
BEGIN
    SELECT COUNT(*) INTO aircraft_exist
    FROM AIRCRAFTS
    WHERE Avion_id = Avion_id_p;

    IF aircraft_exist = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Aircraft not found');
    ELSE
        UPDATE AIRCRAFTS
        SET 
            Modele      = COALESCE(Modele_p, Modele),
            MaxCapacity = COALESCE(MaxCapacity_p, MaxCapacity),
            State       = COALESCE(State_p, State)
        WHERE Avion_id = Avion_id_p;
        COMMIT;
    END IF;
END;
/


-- 3. Delete aircraft
CREATE OR REPLACE PROCEDURE delete_aircraft(
    Avion_id_p IN NUMBER
)
AUTHID CURRENT_USER
IS
    aircraft_exist NUMBER;
BEGIN
    SELECT COUNT(*) INTO aircraft_exist
    FROM AIRCRAFTS
    WHERE Avion_id = Avion_id_p;

    IF aircraft_exist = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Aircraft not found');
    ELSE
        DELETE FROM AIRCRAFTS
        WHERE Avion_id = Avion_id_p;
        COMMIT;
    END IF;
END;
/
-- 4. Select aircraft by ID
CREATE OR REPLACE PROCEDURE select_aircraft_by_id(
    Avion_id_p IN NUMBER,
    Modele_p OUT VARCHAR2,
    MaxCapacity_p OUT NUMBER,
    State_p OUT VARCHAR2
)
AUTHID CURRENT_USER
IS
    aircraft_exist NUMBER;
BEGIN
    SELECT COUNT(*) INTO aircraft_exist
    FROM AIRCRAFTS
    WHERE Avion_id = Avion_id_p;

    IF aircraft_exist = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Aircraft not found');
    ELSE
        SELECT Modele, MaxCapacity, State
        INTO Modele_p, MaxCapacity_p, State_p
        FROM AIRCRAFTS
        WHERE Avion_id = Avion_id_p;
    END IF;
END;
/

-- ===============================
-- 1️⃣ Add new flight
-- ===============================
CREATE OR REPLACE PROCEDURE add_new_flight(
    p_vol_num        IN NUMBER,
    p_destination    IN VARCHAR2,
    p_departure_time IN DATE,
    p_arrival_time   IN DATE,
    p_avion_id       IN NUMBER
)
AUTHID CURRENT_USER
IS
    v_state_aircraft Aircrafts.State%TYPE;
BEGIN
    -- Check aircraft availability
    SELECT state INTO v_state_aircraft
    FROM Aircrafts
    WHERE Avion_id = p_avion_id;

    IF v_state_aircraft <> 'Ready' THEN
        RAISE_APPLICATION_ERROR(-20001, 'Aircraft is not available');
    END IF;

    -- Check departure date
    IF p_departure_time <= SYSDATE THEN
        RAISE_APPLICATION_ERROR(-20002, 'Departure date must be in the future');
    END IF;

    -- Insert flight
    INSERT INTO Flights(vol_num, destination, departure_time, arrival_time, CurrentCapacity, state, Avion_id)
    VALUES (p_vol_num, p_destination, p_departure_time, p_arrival_time, 0, 'Scheduled', p_avion_id);
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Flight added successfully');
END;
/
-- ===============================
-- 2️⃣ Update flight
-- ===============================
CREATE OR REPLACE PROCEDURE update_flight(
    p_vol_num         IN NUMBER,
    p_new_destination IN VARCHAR2,
    p_new_departure   IN DATE,
    p_new_arrival     IN DATE
)
AUTHID CURRENT_USER
IS
    v_state Flights.State%TYPE;
BEGIN
    -- Check flight existence and current state
    SELECT state INTO v_state
    FROM Flights
    WHERE vol_num = p_vol_num;

    IF v_state IN ('In Service','Cancelled','Full') THEN
        RAISE_APPLICATION_ERROR(-20003, 'Cannot modify a flight that is in service, cancelled, or full');
    END IF;

    -- Update flight
    UPDATE Flights
    SET destination     = p_new_destination,
        departure_time  = p_new_departure,
        arrival_time    = p_new_arrival
    WHERE vol_num = p_vol_num;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Flight updated successfully');
END;
/
-- ===============================
-- 3️⃣ Delete flight
-- ===============================
CREATE OR REPLACE PROCEDURE delete_flight(
    p_vol_num IN NUMBER
)
AUTHID CURRENT_USER
IS
    v_count NUMBER;
BEGIN
    -- Check for confirmed reservations
    SELECT COUNT(*) INTO v_count
    FROM Reservations
    WHERE vol_num = p_vol_num
      AND state = 'Confirmed';

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20004, 'Cannot delete flight with confirmed reservations');
    END IF;

    -- Delete flight
    DELETE FROM Flights
    WHERE vol_num = p_vol_num;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Flight deleted successfully');
END;
/
-- ===============================
-- 4️⃣ Change flight state
-- ===============================
CREATE OR REPLACE PROCEDURE change_flight_state(
    p_vol_num   IN NUMBER,
    p_new_state IN VARCHAR2
)
AUTHID CURRENT_USER
IS
    v_old_state Flights.State%TYPE;
BEGIN
    -- Check flight existence
    SELECT state INTO v_old_state
    FROM Flights
    WHERE vol_num = p_vol_num;

    -- Validate state transition
    IF v_old_state = 'Cancelled' OR v_old_state = 'Full' THEN
        RAISE_APPLICATION_ERROR(-20010, 'Cannot modify a cancelled or full flight');
    END IF;

    IF v_old_state = 'Scheduled' AND p_new_state NOT IN ('In Service') THEN
        RAISE_APPLICATION_ERROR(-20011, 'Invalid state transition from Scheduled');
    END IF;

    IF v_old_state = 'In Service' AND p_new_state NOT IN ('Cancelled','Full') THEN
        RAISE_APPLICATION_ERROR(-20012, 'Invalid state transition from In Service');
    END IF;

    -- Update state
    UPDATE Flights
    SET state = p_new_state
    WHERE vol_num = p_vol_num;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Flight ' || p_vol_num || ' state changed to ' || p_new_state);
END;
/


-- ADD NEW PASSENGER
CREATE OR REPLACE PROCEDURE add_new_passenger (
    p_passenger_id IN NUMBER,
    p_prenom IN VARCHAR2,
    p_nom IN VARCHAR2,
    p_numPasseport IN NUMBER,
    p_contact IN VARCHAR2,
    p_nationality IN VARCHAR2,
    p_age IN NUMBER
)
AUTHID CURRENT_USER
IS
    v_count NUMBER;
BEGIN
    -- Mandatory fields check
    IF p_prenom IS NULL OR p_nom IS NULL OR p_contact IS NULL OR p_age IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'Prénom, nom, contact et âge sont obligatoires.');
    END IF;

    -- Basic email validation
    IF INSTR(p_contact, '@') = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Email invalide.');
    END IF;

    -- Check uniqueness
    SELECT COUNT(*) INTO v_count
    FROM passengers
    WHERE passenger_id = p_passenger_id OR numPasseport = p_numPasseport;

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'ID ou numéro de passeport déjà existant.');
    END IF;

    -- Insert
    INSERT INTO passengers (Passenger_id, prenom, nom, NumPasseport, Contact, Nationality, Age)
    VALUES (p_passenger_id, p_prenom, p_nom, p_numPasseport, p_contact, p_nationality, p_age);

    COMMIT;
END;
/
-- UPDATE PASSENGER
CREATE OR REPLACE PROCEDURE update_passenger (
    p_passenger_id IN NUMBER,
    p_prenom IN VARCHAR2,
    p_nom IN VARCHAR2,
    p_contact IN VARCHAR2,
    p_nationality IN VARCHAR2,
    p_age IN NUMBER
)
AUTHID CURRENT_USER
IS
    v_count NUMBER;
BEGIN
    -- Mandatory fields
    IF p_prenom IS NULL OR p_nom IS NULL OR p_contact IS NULL OR p_age IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'Prénom, nom, contact et âge sont obligatoires.');
    END IF;

    -- Email check
    IF INSTR(p_contact, '@') = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Email invalide.');
    END IF;

    -- Check if passenger exists
    SELECT COUNT(*) INTO v_count
    FROM passengers
    WHERE passenger_id = p_passenger_id;

    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Passenger ID introuvable.');
    END IF;

    -- Update
    UPDATE passengers
    SET prenom = p_prenom,
        nom = p_nom,
        contact = p_contact,
        nationality = p_nationality,
        age = p_age
    WHERE passenger_id = p_passenger_id;

    COMMIT;
END;
/
-- DELETE PASSENGER
CREATE OR REPLACE PROCEDURE delete_passenger (
    p_passenger_id IN NUMBER
)
AUTHID CURRENT_USER
IS
    v_count NUMBER;
BEGIN
    -- Check if passenger exists
    SELECT COUNT(*) INTO v_count
    FROM passengers
    WHERE passenger_id = p_passenger_id;

    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Passenger ID introuvable.');
    END IF;

    -- Check for existing reservations
    SELECT COUNT(*) INTO v_count
    FROM reservations
    WHERE passenger_id = p_passenger_id;

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Passenger a des réservations et ne peut pas être supprimé.');
    END IF;

    -- Delete passenger
    DELETE FROM passengers
    WHERE passenger_id = p_passenger_id;

    COMMIT;
END;
/
-- GET PASSENGER BY PASSPORT NUMBER
CREATE OR REPLACE PROCEDURE get_passenger_by_passport (
    p_numPasseport IN NUMBER,
    p_passenger_id OUT NUMBER,
    p_prenom OUT VARCHAR2,
    p_nom OUT VARCHAR2,
    p_contact OUT VARCHAR2,
    p_nationality OUT VARCHAR2,
    p_age OUT NUMBER
)
AUTHID CURRENT_USER
IS
BEGIN
    SELECT passenger_id, prenom, nom, contact, nationality, age
    INTO p_passenger_id, p_prenom, p_nom, p_contact, p_nationality, p_age
    FROM passengers
    WHERE numPasseport = p_numPasseport;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20001, 'Passenger introuvable pour ce numéro de passeport.');
END;
/


-- Add new reservation
CREATE OR REPLACE PROCEDURE add_new_reservation(
    p_reservation_id IN NUMBER,
    p_passenger_id   IN NUMBER,
    p_vol_num        IN NUMBER,
    p_seatcode       IN VARCHAR2,
    p_state          IN VARCHAR2 DEFAULT 'Confirmed',
    p_guardian_id    IN NUMBER DEFAULT NULL
)
AUTHID CURRENT_USER
IS
    v_count NUMBER;
BEGIN
    -- Check if reservation exists
    SELECT COUNT(*) INTO v_count
    FROM Reservations
    WHERE reservation_id = p_reservation_id
       OR (SeatCode = p_seatcode AND vol_num = p_vol_num);

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Reservation ID already exists or seat already booked.');
    END IF;

    -- Insert reservation
    INSERT INTO Reservations(reservation_id, Passenger_id, vol_num, SeatCode, State, Guardian_id)
    VALUES(p_reservation_id, p_passenger_id, p_vol_num, p_seatcode, p_state, p_guardian_id);

    COMMIT;
END;
/

-- Update reservation
CREATE OR REPLACE PROCEDURE update_reservation(
    p_reservation_id IN NUMBER,
    p_vol_num        IN NUMBER,
    p_seatcode       IN VARCHAR2,
    p_state          IN VARCHAR2
)
AUTHID CURRENT_USER
IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM Reservations
    WHERE reservation_id = p_reservation_id;

    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Reservation not found.');
    END IF;

    UPDATE Reservations
    SET vol_num  = p_vol_num,
        SeatCode = p_seatcode,
        State    = p_state
    WHERE reservation_id = p_reservation_id;

    COMMIT;
END;
/

-- Delete reservation
CREATE OR REPLACE PROCEDURE delete_reservation(
    p_reservation_id IN NUMBER
)
AUTHID CURRENT_USER
IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM Reservations
    WHERE reservation_id = p_reservation_id;

    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Reservation not found.');
    END IF;

    DELETE FROM Reservations
    WHERE reservation_id = p_reservation_id;

    COMMIT;
END;
/

-- Get reservation by passenger passport (requires join with Passengers table)
CREATE OR REPLACE PROCEDURE get_reservation_by_passport(
    p_numPasseport IN NUMBER,
    o_reservation_id OUT NUMBER,
    o_vol_num OUT NUMBER,
    o_seatcode OUT VARCHAR2,
    o_state OUT VARCHAR2,
    o_guardian_id OUT NUMBER
)
AUTHID CURRENT_USER
IS
BEGIN
    SELECT r.reservation_id, r.vol_num, r.SeatCode, r.State, r.Guardian_id
    INTO o_reservation_id, o_vol_num, o_seatcode, o_state, o_guardian_id
    FROM Reservations r
    JOIN Passengers p ON r.Passenger_id = p.Passenger_id
    WHERE p.NumPasseport = p_numPasseport;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20004, 'Reservation not found for this passport.');
END;
/

-- Add new maintenance
CREATE OR REPLACE PROCEDURE add_new_maintenance(
    p_avion_id IN NUMBER,
    p_operation_date IN DATE,
    p_typee IN VARCHAR2
)
AUTHID CURRENT_USER AS
    v_existing NUMBER;
BEGIN
    -- Check aircraft exists
    SELECT COUNT(*) INTO v_existing FROM Aircrafts WHERE Avion_id = p_avion_id;
    IF v_existing = 0 THEN
        RAISE_APPLICATION_ERROR(-20102, 'Avion introuvable.');
    END IF;

    -- Check maintenance for same date doesn't exist
    SELECT COUNT(*) INTO v_existing
    FROM Maintenance
    WHERE Avion_id = p_avion_id
      AND TRUNC(OperationDate) = TRUNC(p_operation_date);

    IF v_existing > 0 THEN
        RAISE_APPLICATION_ERROR(-20101, 'Maintenance déjà programmée pour cet avion à cette date.');
    END IF;

    INSERT INTO Maintenance (maintenance_id, Avion_id, OperationDate, typee, State)
    VALUES (seq_maint.NEXTVAL, p_avion_id, p_operation_date, p_typee, 'Scheduled');

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END add_new_maintenance;
/

-- Delete maintenance
CREATE OR REPLACE PROCEDURE delete_maintenance(
    p_maintenance_id IN NUMBER
)
AUTHID CURRENT_USER AS
BEGIN
    DELETE FROM Maintenance
    WHERE maintenance_id = p_maintenance_id;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20103, 'Maintenance non trouvée.');
    END IF;

    COMMIT;
END delete_maintenance;
/

-- List all maintenance
CREATE OR REPLACE PROCEDURE list_maintenance(p_cursor OUT SYS_REFCURSOR)
AUTHID CURRENT_USER AS
BEGIN
    OPEN p_cursor FOR SELECT * FROM Maintenance;
END list_maintenance;
/

-- Get maintenance by ID
CREATE OR REPLACE PROCEDURE get_maintenance_by_id(
    p_maintenance_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
)
AUTHID CURRENT_USER
AS
BEGIN
    OPEN p_cursor FOR 
        SELECT * FROM Maintenance WHERE maintenance_id = p_maintenance_id;
END get_maintenance_by_id;
/
-- Update maintenance
CREATE OR REPLACE PROCEDURE update_maintenance(
    p_maintenance_id IN NUMBER,
    p_operation_date IN DATE,
    p_typee IN VARCHAR2,
    p_state IN VARCHAR2
) 
AUTHID CURRENT_USER
AS
    v_existing NUMBER;
BEGIN
    -- Check maintenance exists
    SELECT COUNT(*) INTO v_existing 
    FROM Maintenance
    WHERE maintenance_id = p_maintenance_id;

    IF v_existing = 0 THEN
        RAISE_APPLICATION_ERROR(-20104, 'Maintenance non trouvée.');
    END IF;

    -- Optional: check for duplicate date for same aircraft if date is updated
    DECLARE
        v_avion_id NUMBER;
        v_dup_count NUMBER;
    BEGIN
        SELECT Avion_id INTO v_avion_id
        FROM Maintenance
        WHERE maintenance_id = p_maintenance_id;

        SELECT COUNT(*) INTO v_dup_count
        FROM Maintenance
        WHERE Avion_id = v_avion_id
          AND TRUNC(OperationDate) = TRUNC(p_operation_date)
          AND maintenance_id <> p_maintenance_id;

        IF v_dup_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20105, 'Maintenance déjà programmée pour cet avion à cette date.');
        END IF;
    END;

    -- Update the maintenance
    UPDATE Maintenance
    SET OperationDate = p_operation_date,
        typee = p_typee,
        State = p_state
    WHERE maintenance_id = p_maintenance_id;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_maintenance;
/

CREATE SEQUENCE seq_maint
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;


CREATE OR REPLACE TRIGGER trg_passenger_validation
BEFORE INSERT OR UPDATE ON Passengers
FOR EACH ROW
BEGIN
    -- Vérification de l'âge
    IF :NEW.Age IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001,'Age du passager obligatoire.');
    END IF;

    IF :NEW.Age < 0 OR :NEW.Age > 120 THEN
        RAISE_APPLICATION_ERROR(-20001,'Age du passager invalide.');
    END IF;

    -- Vérification de l'email
    IF INSTR(:NEW.Contact, '@') = 0 THEN
        RAISE_APPLICATION_ERROR(-20001,'Email invalide.');
    END IF;

END;
/


--interdire de supprimer un passenger ou gardien avec des reservations deja faite 

CREATE OR REPLACE TRIGGER trg_block_delete_passenger
BEFORE DELETE ON Passengers
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM Reservations
    WHERE Passenger_id = :OLD.Passenger_id
       OR Guardian_id  = :OLD.Passenger_id;

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001,
        'Suppression interdite : ce passager a des reservations.');
    END IF;
END;
/



CREATE OR REPLACE TRIGGER trg_after_insert_maintenance
AFTER INSERT ON MAINTENANCE
FOR EACH ROW
BEGIN
    
    IF TRUNC(:NEW.OperationDate) = TRUNC(SYSDATE) THEN
        UPDATE Aircrafts 
        SET State = 'Maintenance' 
        WHERE Avion_id = :NEW.Avion_id;
    END IF;


    INSERT INTO LOGS(LogID, TableName, Operation, RecordID, Details)
    VALUES (seq_logs.NEXTVAL, 'MAINTENANCE', 'INSERT', :NEW.maintenance_id,
        'Avion_id='||:NEW.Avion_id||', Type='||:NEW.typee||', Date='||TO_CHAR(:NEW.OperationDate,'YYYY-MM-DD'));
END;
/


CREATE OR REPLACE TRIGGER trg_after_delete_maintenance
AFTER DELETE ON MAINTENANCE
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN

    SELECT COUNT(*) INTO v_count
    FROM MAINTENANCE
    WHERE Avion_id = :OLD.Avion_id 
      AND State != 'Completed';

    IF v_count = 0 THEN
        UPDATE Aircrafts 
        SET State = 'Ready' 
        WHERE Avion_id = :OLD.Avion_id;
    END IF;

    INSERT INTO LOGS(LogID, TableName, Operation, RecordID, Details)
    VALUES (
        seq_logs.NEXTVAL,
        'MAINTENANCE',
        'DELETE',
        :OLD.maintenance_id,
        'Avion_id='||:OLD.Avion_id||', Type='||:OLD.typee||', Date='||TO_CHAR(:OLD.OperationDate,'YYYY-MM-DD')
    );

END;
/


CREATE OR REPLACE TRIGGER trg_before_insert_maintenance
BEFORE INSERT ON MAINTENANCE
FOR EACH ROW
DECLARE
    v_avion_state VARCHAR2(50);
BEGIN
    SELECT State INTO v_avion_state FROM Aircrafts WHERE Avion_id = :NEW.Avion_id;
    
    IF v_avion_state = 'Hors Service' THEN
        RAISE_APPLICATION_ERROR(-20002, 'Impossible de programmer une maintenance : l''avion est Hors Service.');
    END IF;
END;
/

---- BEFORE INSERT: Check aircraft availability
CREATE OR REPLACE TRIGGER trg_before_insert_flight
BEFORE INSERT ON flights
FOR EACH ROW
DECLARE
    v_state aircrafts.state%TYPE;
BEGIN
    SELECT state INTO v_state
    FROM aircrafts
    WHERE avion_id = :NEW.avion_id;

    IF v_state <> 'Ready' THEN
        RAISE_APPLICATION_ERROR(-20001, 'Avion indisponible pour ce vol.');
    END IF;
END;
/

-- BEFORE UPDATE: Prevent changing departure_time if flight in progress or finished
CREATE OR REPLACE TRIGGER trg_before_update_time
BEFORE UPDATE OF departure_time ON flights
FOR EACH ROW
BEGIN
    IF :OLD.state IN ('Flying', 'Turnaround') THEN
        RAISE_APPLICATION_ERROR(-20005, 'Modification de l''heure interdite pour ce vol.');
    END IF;
END;
/
select * from logs;

-- AFTER UPDATE: Reset flight current_capacity and log state changes
CREATE OR REPLACE TRIGGER trg_after_update_state
AFTER UPDATE OF state ON flights
FOR EACH ROW
BEGIN
    -- Reset current_capacity if flight is finished
    IF :NEW.state = 'Turnaround' THEN
        UPDATE flights
        SET currentcapacity = 0
        WHERE vol_num = :NEW.vol_num;
    END IF;

    -- Insert log
    INSERT INTO logs(logid, tablename, operation, recordid, details)
    VALUES (
        seq_logs.NEXTVAL,
        'FLIGHTS',
        'UPDATE',
        :NEW.vol_num,
        'OldState='||:OLD.state||', NewState='||:NEW.state||', Avion_id='||:NEW.avion_id
    );
END;
/

CREATE OR REPLACE TRIGGER before_insert_reservation
BEFORE INSERT ON RESERVATIONS
FOR EACH ROW
DECLARE
    v_taken NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_taken
    FROM RESERVATIONS
    WHERE vol_num = :NEW.vol_num AND SeatCode = :NEW.SeatCode;

    IF v_taken > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Le siège ' || :NEW.SeatCode || ' est déjà pris pour ce vol.');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER after_insert_reservation
AFTER INSERT ON RESERVATIONS
FOR EACH ROW
BEGIN

    UPDATE FLIGHTS
    SET CurrentCapacity = CurrentCapacity + 1
    WHERE vol_num = :NEW.vol_num;

    
    INSERT INTO LOGS(LogID, TableName, Operation, RecordID, Details)
    VALUES (seq_logs.NEXTVAL, 'RESERVATIONS', 'INSERT', :NEW.Reservation_id,
            'Passenger_id=' || :NEW.Passenger_id || ', Vol=' || :NEW.vol_num || ', Seat=' || :NEW.SeatCode);

END;
/


CREATE OR REPLACE TRIGGER after_delete_reservation
AFTER DELETE ON RESERVATIONS
FOR EACH ROW
BEGIN
    UPDATE FLIGHTS
    SET CurrentCapacity = CurrentCapacity - 1
    WHERE vol_num = :OLD.vol_num AND CurrentCapacity > 0;

    INSERT INTO LOGS(TableName, Operation, RecordID, Details)
    VALUES ('RESERVATIONS', 'DELETE', :OLD.reservation_id, 
            'Passager_id='||:OLD.Passenger_id||', Vol='||:OLD.vol_num);
END;
/


-- Before Insert: validate MaxCapacity and default State
CREATE OR REPLACE TRIGGER trg_aircraft_bi
BEFORE INSERT ON Aircrafts
FOR EACH ROW
BEGIN
    IF :NEW.MaxCapacity <= 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'MaxCapacity must be positive');
    END IF;

    IF :NEW.State IS NULL THEN
        :NEW.State := 'Ready';
    END IF;
END;
/

-- Before Update: prevent reactivating Out of Service aircraft
CREATE OR REPLACE TRIGGER trg_aircraft_bu
BEFORE UPDATE ON Aircrafts
FOR EACH ROW
BEGIN
    IF :OLD.State = 'Out of Service' AND 
       :NEW.State IN ('Maintenance', 'Ready', 'Flying', 'Turnaround') THEN
        RAISE_APPLICATION_ERROR(-20002, 'Cannot reactivate an Out of Service aircraft');
    END IF;
END;
/

-- After Insert/Update/Delete: write changes to LOGS
CREATE OR REPLACE TRIGGER trg_aircraft_logs
AFTER INSERT OR UPDATE OR DELETE ON Aircrafts
FOR EACH ROW
DECLARE
    v_details VARCHAR2(4000);
BEGIN
    IF INSERTING THEN
        INSERT INTO LOGS(LogID, TableName, Operation, RecordID, Details)
        VALUES (seq_logs.NEXTVAL, 'Aircrafts', 'INSERT', :NEW.Avion_id,
                'Modele=' || :NEW.Modele || ', Capacity=' || :NEW.MaxCapacity || ', State=' || :NEW.State);

    ELSIF UPDATING THEN
        v_details := '';
        IF :OLD.Modele != :NEW.Modele THEN
            v_details := v_details || 'Modele:' || :OLD.Modele || '→' || :NEW.Modele || '; ';
        END IF;
        IF :OLD.MaxCapacity != :NEW.MaxCapacity THEN
            v_details := v_details || 'Capacity:' || :OLD.MaxCapacity || '→' || :NEW.MaxCapacity || '; ';
        END IF;
        IF :OLD.State != :NEW.State THEN
            v_details := v_details || 'State:' || :OLD.State || '→' || :NEW.State || '; ';
        END IF;

        INSERT INTO LOGS(LogID, TableName, Operation, RecordID, Details)
        VALUES (seq_logs.NEXTVAL, 'Aircrafts', 'UPDATE', :NEW.Avion_id,
                NVL(v_details, 'No changes detected'));

    ELSIF DELETING THEN
        INSERT INTO LOGS(LogID, TableName, Operation, RecordID, Details)
        VALUES (seq_logs.NEXTVAL, 'Aircrafts', 'DELETE', :OLD.Avion_id,
                'Modele=' || :OLD.Modele || ', Capacity=' || :OLD.MaxCapacity || ', State=' || :OLD.State);
    END IF;
END;
/

-- Before Delete: only allow if aircraft is Out of Service or Maintenance
CREATE OR REPLACE TRIGGER trg_aircraft_bd
BEFORE DELETE ON Aircrafts
FOR EACH ROW
BEGIN
    IF :OLD.State NOT IN ('Out of Service', 'Maintenance') THEN
        RAISE_APPLICATION_ERROR(-20010, 'Cannot delete an aircraft that is still Active');
    END IF;
END;
/

-- Before Update: enforce valid state transitions
CREATE OR REPLACE TRIGGER trg_aircraft_state
BEFORE UPDATE ON Aircrafts
FOR EACH ROW
BEGIN
    IF (:NEW.State = 'Flying' AND :OLD.State != 'Ready') OR
       (:NEW.State = 'Maintenance' AND :OLD.State NOT IN ('Ready','Out of Service','Turnaround')) OR
       (:NEW.State = 'Ready' AND :OLD.State NOT IN ('Maintenance','Turnaround')) OR
       (:NEW.State = 'Out of Service' AND :OLD.State NOT IN ('Maintenance', 'Ready')) OR
       (:NEW.State = 'Turnaround' AND :OLD.State != 'Flying') THEN
        RAISE_APPLICATION_ERROR(-20010,'Invalid state transition for aircraft');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_aircraft_bi
BEFORE INSERT ON Aircrafts
FOR EACH ROW
BEGIN
    IF :NEW.MaxCapacity <= 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'MaxCapacity must be positive');
    END IF;
    
    IF :NEW.CurrentCapacity <= 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'CurrentCapacity must be positive');
    END IF;
    
    IF :NEW.State IS NULL THEN
        :NEW.State := 'Active';
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_aircraft_bi
BEFORE UPDATE ON Aircrafts
FOR EACH ROW
BEGIN
    IF :NEW.MaxCapacity <= 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'MaxCapacity must be positive');
    END IF;
    
    IF :NEW.CurrentCapacity <= 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'CurrentCapacity must be positive');
    END IF;
    
    IF :OLD.State = 'Inactive' AND :NEW.State = 'Active' THEN
        RAISE_APPLICATION_ERROR(-20002, 'Cannot reactivate a inactive aircraft');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_aircraft_audit
AFTER INSERT OR DELETE OR UPDATE ON Aircrafts
FOR EACH ROW
BEGIN

    IF INSERTING THEN
        INSERT INTO aircraft_audit(action, aircraft_id, action_date)
        VALUES (
                'INSERT',
                :NEW.Avion_id,
                SYSDATE
                );
    ELSIF UPDATING THEN
        INSERT INTO aircraft_audit(action, aircraft_id, action_date)
        VALUES (
                'UPDATE',
                :OLD.Avion_id,
                SYSDATE
                );
    ELSIF DELETING THEN 
        INSERT INTO aircraft_audit(action, aircraft_id, action_date)
        VALUES (
                'DELETE',
                :OLD.Avion_id,
                SYSDATE
                );
    END IF;
END;
/



--TABLE 

CREATE TABLE Aircrafts (
       Avion_id NUMBER PRIMARY KEY,
       Modele VARCHAR(50) NOT NULL,
       MaxCapacity NUMBER NOT NULL,
       CurrentCapacity NUMBER NOT NULL,
       State VARCHAR(50) ) ; 
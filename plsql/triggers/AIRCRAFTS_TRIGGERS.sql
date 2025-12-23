CREATE OR REPLACE TRIGGER trg_aircraft_bi
BEFORE INSERT OR UPDATE ON aircrafts
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


CREATE OR REPLACE TRIGGER trg_aircraft_bu
BEFORE UPDATE ON Aircrafts
FOR EACH ROW
BEGIN
    
    IF :OLD.State = 'Out of Service' AND 
   (:NEW.State = 'Maintenance' OR :NEW.State = 'Ready' OR :NEW.State = 'In Service') THEN
        RAISE_APPLICATION_ERROR(-20002, 'Cannot reactivate a out of Service aircraft');
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


CREATE OR REPLACE TRIGGER trg_aircraft_bd
BEFORE DELETE ON Aircrafts
FOR EACH ROW
BEGIN
    
    IF :OLD.State NOT IN ('Out of Service', 'Maintenance') THEN
        RAISE_APPLICATION_ERROR(-20010,
          'Cannot delete an aircraft that is still Active');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_aircraft_state
BEFORE UPDATE ON Aircrafts
FOR EACH ROW
BEGIN 
    
    IF (:NEW.State = 'Flying' and :OLD.State != 'Ready')
    OR (:NEW.State = 'Maintenance' and (:OLD.State != 'Ready' OR :OLD.State != 'Out of Service' OR :OLD.State != 'Turnaround'))
    OR (:NEW.State = 'Ready' and (:OLD.State != 'Maintenance' OR :OLD.State != 'Turnaround' ))
    OR (:NEW.State = 'Out of Service' and :OLD.State != 'Maintenance' )
    OR ( :NEW.State = 'Turnaround' and  :OLD.State != 'Flying')
    THEN 
        RAISE_APPLICATION_ERROR(-20010,
          'The order of state is not correct');
          
    END IF;
END;
/





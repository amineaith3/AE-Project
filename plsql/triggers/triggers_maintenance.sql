CREATE OR REPLACE TRIGGER trg_after_insert_maintenance
AFTER INSERT ON MAINTENANCE
FOR EACH ROW
BEGIN
    
    IF TRUNC(:NEW.OperationDate) = TRUNC(SYSDATE) THEN
        UPDATE Aircrafts 
        SET State = 'Maintenance' 
        WHERE Avion_id = :NEW.Avion_id;
    END IF;


    INSERT INTO LOGS(TableName, Operation, RecordID, Details)
    VALUES ('MAINTENANCE', 'INSERT', :NEW.maintenance_id,
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

 
    INSERT INTO LOGS(TableName, Operation, RecordID, Details)
    VALUES ('MAINTENANCE', 'DELETE', :OLD.maintenance_id,
            'Avion_id='||:OLD.Avion_id||', Type='||:OLD.typee);
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

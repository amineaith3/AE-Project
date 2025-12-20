CREATE OR REPLACE TRIGGER before_insert_maintenance
BEFORE INSERT ON MAINTENANCE
FOR EACH ROW
DECLARE
    v_state VARCHAR2(50);
BEGIN
    SELECT State INTO v_state
    FROM AIRCRAFTS
    WHERE AvionID = :NEW.AvionID;

    IF v_state = 'Maintenance' THEN
        RAISE_APPLICATION_ERROR(-20001, 'Avion déjà en maintenance.');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER after_insert_maintenance
AFTER INSERT ON MAINTENANCE
FOR EACH ROW
BEGIN
    IF TRUNC(:NEW.OperationDate) = TRUNC(SYSDATE) THEN
        UPDATE AIRCRAFTS
        SET State = 'Maintenance'
        WHERE AvionID = :NEW.AvionID;
    END IF;

    INSERT INTO LOGS(TableName, Operation, RecordID, Details)
    VALUES ('MAINTENANCE', 'INSERT', :NEW.MaintenanceID,
            'AvionID='||:NEW.AvionID||', Type='||:NEW.Typee||', Date='||TO_CHAR(:NEW.OperationDate,'YYYY-MM-DD'));
END;
/

CREATE OR REPLACE TRIGGER after_delete_maintenance
AFTER DELETE ON MAINTENANCE
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM MAINTENANCE
    WHERE AvionID = :OLD.AvionID AND State != 'Completed';

    IF v_count = 0 THEN
        UPDATE AIRCRAFTS SET State = 'Ready' WHERE AvionID = :OLD.AvionID;
    END IF;

    INSERT INTO LOGS(TableName, Operation, RecordID, Details)
    VALUES ('MAINTENANCE', 'DELETE', :OLD.MaintenanceID,
            'AvionID='||:OLD.AvionID||', Type='||:OLD.Typee||', Date='||TO_CHAR(:OLD.OperationDate,'YYYY-MM-DD'));
END;
/

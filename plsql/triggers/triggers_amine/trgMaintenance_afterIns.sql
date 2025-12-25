CREATE OR REPLACE TRIGGER trg_maintenance_after_insert
AFTER INSERT ON MAINTENANCE
FOR EACH ROW
BEGIN
    IF :NEW.OperationDate = TRUNC(SYSDATE) THEN
        UPDATE AIRCRAFTS
        SET State = 'Maintenance'
        WHERE AvionID = :NEW.AvionID;
    END IF;
END;
/

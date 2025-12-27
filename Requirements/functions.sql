-- function to compile
create or replace FUNCTION get_all_aircrafts_infos
RETURN SYS_REFCURSOR
IS
    rc SYS_REFCURSOR;
BEGIN 
    OPEN rc FOR
    SELECT *
    FROM Aircrafts;

    RETURN rc;
END;

-- grant it to user_admin
GRANT EXECUTE ON get_all_aircrafts_infos TO ADMIN_AEROPORT;

-- new sequence: 
CREATE SEQUENCE seq_maint
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;


-- grant sequence:
GRANT SELECT ON seq_maint TO USER_ADMIN;

--added on the proc : add_new_maintenance AE.seq_maint.NEXTVAL in insert.
create or replace PROCEDURE add_new_maintenance(
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
    VALUES (AE.seq_maint.NEXTVAL, p_avion_id, p_operation_date, p_typee, 'Scheduled');

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END add_new_maintenance;

--correct trg ater delete maintenance: 
-- add the LogID field

CREATE OR REPLACE TRIGGER trg_after_delete_maintenance
AFTER DELETE ON MAINTENANCE
FOR EACH ROW
BEGIN
    -- Always set aircraft to 'Ready' when maintenance is deleted
    -- (Assuming deletion means maintenance won't happen)
    UPDATE Aircrafts 
    SET State = 'Ready' 
    WHERE Avion_id = :OLD.Avion_id;

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

--- For auth: 


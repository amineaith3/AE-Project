
CREATE OR REPLACE PROCEDURE create_maintenance_proc(
    p_avion_id IN NUMBER,
    p_operation_date IN DATE,
    p_typee IN VARCHAR2,
    p_result OUT VARCHAR2
)
AS
    v_existing NUMBER;
BEGIN
  
    SELECT COUNT(*) INTO v_existing
    FROM MAINTENANCE
    WHERE AvionID = p_avion_id
      AND OperationDate = p_operation_date;

    IF v_existing > 0 THEN
        p_result := 'Maintenance déjà programmée pour cet avion à cette date.';
        RETURN;
    END IF;

    -- Insertion de la maintenance
    INSERT INTO MAINTENANCE (AvionID, OperationDate, Typee, State)
    VALUES (p_avion_id, p_operation_date, p_typee, 'Planned');

   
    IF TRUNC(p_operation_date) = TRUNC(SYSDATE) THEN
        UPDATE AIRCRAFTS
        SET State = 'Maintenance'
        WHERE AvionID = p_avion_id;
    END IF;

    COMMIT;
    p_result := 'Maintenance créée avec succès.';
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_result := 'Erreur : ' || SQLERRM;
END create_maintenance_proc;
/

CREATE OR REPLACE PROCEDURE delete_maintenance_proc(
    p_maintenance_id IN NUMBER,
    p_result OUT VARCHAR2
)
AS
    v_avion NUMBER;
BEGIN
    SELECT AvionID INTO v_avion
    FROM MAINTENANCE
    WHERE MaintenanceID = p_maintenance_id;

    DELETE FROM MAINTENANCE
    WHERE MaintenanceID = p_maintenance_id;

    
    DECLARE
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM MAINTENANCE
        WHERE AvionID = v_avion AND State != 'Completed';

        IF v_count = 0 THEN
            UPDATE AIRCRAFTS SET State = 'Ready' WHERE AvionID = v_avion;
        END IF;
    END;

    COMMIT;
    p_result := 'Maintenance supprimée et état avion mis à jour.';
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := 'Maintenance non trouvée.';
    WHEN OTHERS THEN
        ROLLBACK;
        p_result := 'Erreur : ' || SQLERRM;
END delete_maintenance_proc;
/

CREATE OR REPLACE PROCEDURE get_maintenance_proc(
    p_maintenance_id IN NUMBER,
    p_res OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_res FOR
        SELECT * FROM MAINTENANCE
        WHERE MaintenanceID = p_maintenance_id;
END get_maintenance_proc;
/

CREATE OR REPLACE PROCEDURE list_maintenance_proc(
    p_res OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_res FOR
        SELECT * FROM MAINTENANCE;
END list_maintenance_proc;
/

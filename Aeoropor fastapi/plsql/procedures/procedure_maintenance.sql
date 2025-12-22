CREATE OR REPLACE PROCEDURE create_maintenance_proc(
    p_avion_id IN NUMBER,
    p_operation_date IN DATE,
    p_typee IN VARCHAR2,
    p_result OUT VARCHAR2
) AS
    v_existing NUMBER;
BEGIN
    
    SELECT COUNT(*) INTO v_existing
    FROM MAINTENANCE
    WHERE Avion_id = p_avion_id
      AND TRUNC(OperationDate) = TRUNC(p_operation_date);

    IF v_existing > 0 THEN
        p_result := 'Maintenance déjà programmée pour cet avion à cette date.';
        RETURN;
    END IF;

   
    INSERT INTO MAINTENANCE (maintenance_id, Avion_id, OperationDate, typee, State)
    VALUES (seq_maint.NEXTVAL, p_avion_id, p_operation_date, p_typee, 'Scheduled');

 
    
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
) AS
BEGIN
 
    DELETE FROM MAINTENANCE
    WHERE maintenance_id = p_maintenance_id;

    IF SQL%ROWCOUNT = 0 THEN
        p_result := 'Maintenance non trouvée.';
    ELSE
       
        COMMIT;
        p_result := 'Maintenance supprimée avec succès.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_result := 'Erreur : ' || SQLERRM;
END delete_maintenance_proc;
/


CREATE OR REPLACE PROCEDURE list_maintenance_proc(p_cursor OUT SYS_REFCURSOR) AS
BEGIN
    OPEN p_cursor FOR SELECT * FROM MAINTENANCE;
END;
/


CREATE OR REPLACE PROCEDURE get_maintenance_proc(
    p_maintenance_id IN NUMBER, 
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR 
    SELECT * FROM MAINTENANCE WHERE maintenance_id = p_maintenance_id;
END;
/

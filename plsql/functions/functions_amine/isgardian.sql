CREATE OR REPLACE FUNCTION IsGuardian(p_passenger_id IN NUMBER) RETURN BOOLEAN IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM RESERVATIONS
    WHERE Guardian_id = p_passenger_id;
    
    RETURN v_count > 0;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN FALSE;
END;
/

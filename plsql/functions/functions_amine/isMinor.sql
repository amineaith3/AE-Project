CREATE OR REPLACE FUNCTION IsMinor(p_passenger_id IN NUMBER) RETURN BOOLEAN IS
    v_age NUMBER;
BEGIN
    SELECT Age_pass INTO v_age
    FROM PASSENGERS
    WHERE PassengerID = p_passenger_id;
    
    RETURN v_age < 18;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN FALSE;
END;
/

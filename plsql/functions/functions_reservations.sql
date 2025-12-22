CREATE OR REPLACE FUNCTION get_total_reservations(p_vol_num IN NUMBER)
RETURN NUMBER
IS
    v_total NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM RESERVATIONS
    WHERE vol_num = p_vol_num; 
    RETURN v_total;
END;
/


CREATE OR REPLACE FUNCTION is_seat_taken(p_vol_num IN NUMBER, p_seatcode IN VARCHAR2)
RETURN NUMBER
IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM RESERVATIONS
    WHERE vol_num = p_vol_num 
      AND SeatCode = p_seatcode;
    RETURN v_count; -- 0 = libre, >0 = pris
END;
/


CREATE OR REPLACE FUNCTION get_passenger_age(p_passenger_id IN NUMBER)
RETURN NUMBER
IS
    v_age NUMBER;
BEGIN
    SELECT Age_pass INTO v_age
    FROM PASSENGERS
    WHERE Passenger_id = p_passenger_id;
    RETURN v_age;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN -1; 
END;
/


CREATE OR REPLACE FUNCTION get_total_reservations(p_volnum IN NUMBER)
RETURN NUMBER
IS
    v_total NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM RESERVATIONS
    WHERE VolNum = p_volnum;
    RETURN v_total;
END;
/


CREATE OR REPLACE FUNCTION is_seat_taken(p_volnum IN NUMBER, p_seatcode IN VARCHAR2)
RETURN NUMBER
IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM RESERVATIONS
    WHERE VolNum = p_volnum AND SeatCode = p_seatcode;
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
    WHERE PassengerId = p_passenger_id;
    RETURN v_age;
END;
/

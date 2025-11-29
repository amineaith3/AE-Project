CREATE OR REPLACE FUNCTION COUNT_FLIGHTS_FOR_DEST(
    p_destination IN VARCHAR2
) RETURN NUMBER
IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM flights
    WHERE destination = p_destination
      AND state = 'PLANIFIE';
    
    RETURN v_count;
END;
/
CREATE OR REPLACE FUNCTION DAYS_TO_DEPARTURE(
    p_vol_num IN NUMBER
) RETURN NUMBER
IS
    v_departure DATE;
BEGIN
    SELECT departure_time
    INTO v_departure
    FROM flights
    WHERE vol_num = p_vol_num;

    RETURN v_departure - SYSDATE; -- nombre de jours avant départ
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN -1; -- vol inexistant
END;
/
  CREATE OR REPLACE FUNCTION IS_AIRCRAFT_IN_USE(
    p_avion_id IN NUMBER
) RETURN VARCHAR2
IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM flights
    WHERE avion_id = p_avion_id
      AND state = 'PLANIFIE';
    
    IF v_count > 0 THEN
        RETURN 'OUI';
    ELSE
        RETURN 'NON';
    END IF;
END;
/
/

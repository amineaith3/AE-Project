CREATE OR REPLACE FUNCTION get_total_maintenance(p_avion_id IN NUMBER)
RETURN NUMBER
IS
    v_total NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM MAINTENANCE
    WHERE AvionID = p_avion_id;
    RETURN v_total;
END;
/

CREATE OR REPLACE FUNCTION is_aircraft_in_maintenance(p_avion_id IN NUMBER, p_date IN DATE)
RETURN NUMBER
IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM MAINTENANCE
    WHERE AvionID = p_avion_id
      AND TRUNC(OperationDate) = TRUNC(p_date);
    RETURN v_count;
END;
/

CREATE OR REPLACE FUNCTION get_maintenance_state(p_maintenance_id IN NUMBER)
RETURN VARCHAR2
IS
    v_state VARCHAR2(50);
BEGIN
    SELECT State INTO v_state
    FROM MAINTENANCE
    WHERE MaintenanceID = p_maintenance_id;
    RETURN v_state;
END;
/

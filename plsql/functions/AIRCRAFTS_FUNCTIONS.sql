CREATE OR REPLACE FUNCTION aircraft_exists(Avion_id_p IN NUMBER)
RETURN VARCHAR2
IS
    aircraft_exist_v NUMBER;  -- You need to declare this variable!
BEGIN
    SELECT COUNT(*) INTO aircraft_exist_v
    FROM Aircrafts
    WHERE Avion_id = Avion_id_p;

    IF aircraft_exist_v = 0 THEN
        RETURN 'FALSE';  -- Use single quotes, not double quotes
    ELSE 
        RETURN 'TRUE';   -- Use single quotes, not double quotes
    END IF;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'FALSE';  -- Optional: handle no data found
    WHEN OTHERS THEN
        RETURN 'ERROR';  -- Optional: handle other exceptions
END;
/



CREATE OR REPLACE FUNCTION get_aircraft_modele(Avion_id_p IN NUMBER)
RETURN VARCHAR2
IS
    aircraft_modele_v  VARCHAR2(50);
BEGIN
    
    BEGIN
    SELECT Modele INTO aircraft_modele_v
    FROM Aircrafts
    WHERE Avion_id=Avion_id_p;
    
    RETURN aircraft_modele_v;
    
    EXCEPTION 
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END;
END;
/


CREATE OR REPLACE FUNCTION get_aircraft_maxCapacity(Avion_id_p IN NUMBER)
RETURN NUMBER
IS
    aircraft_maxCapacity_v NUMBER;
BEGIN
    
    BEGIN
    SELECT MaxCapacity INTO aircraft_maxCapacity_v
    FROM Aircrafts
    WHERE Avion_id=Avion_id_p;
    
    RETURN aircraft_maxCapacity_v;
    
    EXCEPTION 
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END;
END;
/



CREATE OR REPLACE FUNCTION get_aircraft_state(Avion_id_p IN NUMBER)
RETURN VARCHAR2
IS
    aircraft_state_v VARCHAR(50);
BEGIN
    
    BEGIN
    SELECT State INTO aircraft_state_v
    FROM Aircrafts
    WHERE Avion_id=Avion_id_p;
    
    RETURN aircraft_state_v;
    
    EXCEPTION 
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END;
END;
/


CREATE OR REPLACE FUNCTION aircrafts_total(Avion_id_p IN NUMBER)
RETURN NUMBER
IS
    aircrafts_total_v NUMBER;
BEGIN
    
    SELECT COUNT(*) INTO aircrafts_total_v
    FROM Aircrafts;
    
    RETURN aircrafts_total_v;
    
END;
/

CREATE OR REPLACE FUNCTION get_aircraft_infos(Avion_id_p IN NUMBER)
RETURN SYS_REFCURSOR

IS
    rc SYS_REFCURSOR;
BEGIN
    
    OPEN rc FOR 
        SELECT * 
        FROM Aircrafts
        WHERE Avion_id=Avion_id_p;
        
    RETURN rc;
    
END;
/


CREATE OR REPLACE FUNCTION get_all_aircrafts_infos
RETURN SYS_REFCURSOR
IS
    rc SYS_REFCURSOR;
BEGIN 
    OPEN rc FOR
    SELECT *
    FROM Aircrafts;
    
    RETURN rc;
END;
/
    


CREATE OR REPLACE FUNCTION aircrafts_count_per_modele(Modele_p IN VARCHAR2)
RETURN NUMBER
IS
    count_v NUMBER;
BEGIN
    BEGIN
        SELECT COUNT(*) INTO count_v
        FROM Aircrafts
        WHERE Modele=Modele_p;
    
        RETURN count_v;
    
        EXCEPTION
            WHEN NO_DATA_FOUND THEN 
                RETURN NULL;
    END;
    
END;
/


CREATE OR REPLACE FUNCTION get_all_aircraft_counts_per_modele
RETURN SYS_REFCURSOR
IS
    rc SYS_REFCURSOR;
BEGIN
    OPEN rc FOR
        SELECT Modele, COUNT(*) AS total_aircraft
        FROM Aircrafts
        GROUP BY Modele;
    RETURN rc;
END;
/

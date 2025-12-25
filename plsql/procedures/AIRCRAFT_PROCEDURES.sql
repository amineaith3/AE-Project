CREATE OR REPLACE PROCEDURE add_new_aircraft(
    Avion_id_p IN NUMBER,
    Modele_p IN VARCHAR2,
    MaxCapacity_p IN NUMBER,
    State_p IN VARCHAR2 DEFAULT 'Ready'  -- Added default
)
IS 
    aircraft_exist NUMBER;
BEGIN
    -- Verify that aircraft doesn't exist already 
    SELECT COUNT(*) INTO aircraft_exist
    FROM Aircrafts
    WHERE Avion_id = Avion_id_p;  -- Assuming column is Avion_id (not AvionID)

    IF aircraft_exist != 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Aircraft already exists');
    ELSE 
        -- CORRECTED: Match exact column names from your table
        INSERT INTO Aircrafts (Avion_id, Modele, MaxCapacity, State)
        VALUES (
            Avion_id_p,
            Modele_p,
            MaxCapacity_p,
            State_p
        );
        COMMIT;  -- Added COMMIT
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/


CREATE OR REPLACE PROCEDURE update_aircraft(
    Avion_id_p IN NUMBER,
    Modele_p IN VARCHAR2,
    MaxCapacity_p IN NUMBER,
    State_p IN VARCHAR2
)
IS
    aircraft_exist NUMBER;
BEGIN
    SELECT COUNT(*) INTO aircraft_exist
    FROM Aircrafts
    WHERE Avion_id=Avion_id_p;
    
    IF aircraft_exist = 0 THEN 
        RAISE_APPLICATION_ERROR(-20002, 'Aircraft not found.');
    ELSE
        UPDATE Aircrafts
        SET 
            Modele        = COALESCE(Modele_p, Modele),
            MaxCapacity   = COALESCE(MaxCapacity_p, MaxCapacity),
            State         = COALESCE(State_p, State)
        WHERE Avion_id=Avion_id_p;
    END IF;
    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE delete_aircraft(
    Avion_id_p IN NUMBER
)
IS
    aircraft_exist NUMBER;
BEGIN 

    SELECT COUNT(*) INTO aircraft_exist
    FROM Aircrafts
    WHERE Avion_id=Avion_id_p;
    
    IF aircraft_exist = 0 THEN 
        RAISE_APPLICATION_ERROR(-20002, 'Aircraft not found.');
    ELSE
        DELETE FROM Aircrafts
        WHERE Avion_id = Avion_id_p;
    END IF;
    COMMIT;
END;
/


CREATE OR REPLACE PROCEDURE select_aircraft_by_id(
    Avion_id_p IN NUMBER,
    Modele_p OUT VARCHAR2,
    MaxCapacity_p OUT NUMBER,
    State_p OUT VARCHAR2
)
IS
    aircraft_exist NUMBER;
BEGIN 

    SELECT COUNT(*) INTO aircraft_exist
    FROM Aircrafts
    WHERE Avion_id=Avion_id_p;
    
    IF aircraft_exist = 0 THEN 
        RAISE_APPLICATION_ERROR(-20002, 'Aircraft not found.');
    ELSE
        SELECT Modele, MaxCapacity, State
        INTO Modele_p, MaxCapacity_p, State_p
        FROM Aircrafts
        WHERE Avion_id = Avion_id_p;
    END IF;
    
END;
/



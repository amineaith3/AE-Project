CREATE OR REPLACE TRIGGER trg_reservations_before_insert
BEFORE INSERT ON RESERVATIONS
FOR EACH ROW
DECLARE
    v_count NUMBER;
    v_current_capacity NUMBER;
    v_max_capacity NUMBER;
    v_age NUMBER;
BEGIN
    -- 1. Pas de double réservation
    SELECT COUNT(*) INTO v_count
    FROM RESERVATIONS
    WHERE PassengerID = :NEW.PassengerID
      AND VolNum = :NEW.VolNum;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Le passager a déjà une réservation pour ce vol.');
    END IF;

    -- 2. Vérifier capacité de l’avion
    SELECT f.CurrentCapacity, a.MaxCapacity INTO v_current_capacity, v_max_capacity
    FROM FLIGHTS f
    JOIN AIRCRAFTS a ON f.AvionID = a.AvionID
    WHERE f.VolNum = :NEW.VolNum;

    IF v_current_capacity >= v_max_capacity THEN
        RAISE_APPLICATION_ERROR(-20003, 'Vol complet, réservation impossible.');
    END IF;

    -- 3. Vérifier Guardian si mineur
    SELECT Age_pass INTO v_age
    FROM PASSENGERS
    WHERE PassengerID = :NEW.PassengerID;

    IF v_age < 18 THEN
        IF :NEW.Guardian_id IS NULL THEN
            RAISE_APPLICATION_ERROR(-20004, 'Mineur doit avoir un Guardian.');
        END IF;

        -- Guardian doit exister et ne pas être mineur
        SELECT Age_pass INTO v_age
        FROM PASSENGERS
        WHERE PassengerID = :NEW.Guardian_id;
        IF v_age < 18 THEN
            RAISE_APPLICATION_ERROR(-20005, 'Guardian ne peut pas être mineur.');
        END IF;
    END IF;

    -- 4. Incrémenter la capacité actuelle du vol
    UPDATE FLIGHTS
    SET CurrentCapacity = CurrentCapacity + 1
    WHERE VolNum = :NEW.VolNum;

END;
/

CREATE OR REPLACE TRIGGER trg_flights_before_insert
BEFORE INSERT OR UPDATE ON FLIGHTS
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    -- 1. Date dans le futur
    IF :NEW.DepartureTime <= SYSDATE THEN
        RAISE_APPLICATION_ERROR(-20006, 'Le vol doit être programmé dans le futur.');
    END IF;

    -- 2. Avion pas en maintenance
    SELECT COUNT(*) INTO v_count
    FROM AIRCRAFTS
    WHERE AvionID = :NEW.AvionID
      AND State = 'Maintenance';
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20007, 'Avion en maintenance, impossible d’affecter ce vol.');
    END IF;

    -- 3. Vérifier conflit avec autres vols du même avion
    SELECT COUNT(*) INTO v_count
    FROM FLIGHTS
    WHERE AvionID = :NEW.AvionID
      AND ((:NEW.DepartureTime BETWEEN DepartureTime AND ArrivalTime)
           OR (:NEW.Arrival_Time BETWEEN DepartureTime AND ArrivalTime));
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20008, 'L’avion est déjà affecté à un autre vol à cette période.');
    END IF;
END;
/

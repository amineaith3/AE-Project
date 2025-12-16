CREATE OR REPLACE TRIGGER trg_flights_after_update
AFTER UPDATE OF State ON FLIGHTS
FOR EACH ROW
BEGIN
    IF :NEW.State = 'Cancelled' THEN
        UPDATE RESERVATIONS
        SET State = 'Cancelled'
        WHERE VolNum = :NEW.VolNum;
    END IF;
END;
/

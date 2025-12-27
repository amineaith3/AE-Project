CREATE OR REPLACE TRIGGER trg_flights_after_update
AFTER UPDATE OF State ON FLIGHTS
FOR EACH ROW
BEGIN
    IF :NEW.State = 'Cancelled' THEN
        UPDATE RESERVATIONS
        SET State = 'Cancelled'
        WHERE Vol_num = :NEW.Vol_num;
    END IF;
END;
/

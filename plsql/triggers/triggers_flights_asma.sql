CREATE OR REPLACE TRIGGER trg_before_insert_flight
BEFORE INSERT ON flights
FOR EACH ROW
DECLARE
  v_state aircrafts.state%TYPE;
BEGIN
  SELECT state INTO v_state
  FROM aircrafts
  WHERE avion_id = :NEW.avion_id;

  IF v_state <> 'DISPONIBLE' THEN
    RAISE_APPLICATION_ERROR(-20001,'Avion indisponible');
  END IF;
END;
/
CREATE OR REPLACE TRIGGER trg_before_update_time
BEFORE UPDATE OF departure_time ON flights
FOR EACH ROW
BEGIN
  IF :OLD.state IN ('EN_COURS','TERMINE') THEN
    RAISE_APPLICATION_ERROR(-20005,'Changement interdit');
  END IF;
END;
/
CREATE OR REPLACE TRIGGER trg_after_update_state
AFTER UPDATE OF state ON flights
FOR EACH ROW
BEGIN
  IF :NEW.state='TERMINE' THEN
    UPDATE aircrafts
    SET current_capacity = 0
    WHERE avion_id = :NEW.avion_id;
  END IF;
END;
/

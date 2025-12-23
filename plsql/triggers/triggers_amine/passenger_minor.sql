CREATE OR REPLACE TRIGGER trg_passengers_guardian
BEFORE INSERT OR UPDATE ON PASSENGERS
FOR EACH ROW
BEGIN
    IF :NEW.Age_pass < 18 AND :NEW.Guardian_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'Mineur doit avoir un Guardian.');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER before_insert_reservation
BEFORE INSERT ON RESERVATIONS
FOR EACH ROW
DECLARE
    v_taken NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_taken
    FROM RESERVATIONS
    WHERE VolNum = :NEW.VolNum AND SeatCode = :NEW.SeatCode;

    IF v_taken > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Le siège est déjà pris.');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER after_insert_reservation
AFTER INSERT ON RESERVATIONS
FOR EACH ROW
BEGIN
    UPDATE FLIGHTS
    SET CurrentCapacity = CurrentCapacity + 1
    WHERE VolNum = :NEW.VolNum;

    INSERT INTO LOGS(TableName, Operation, RecordID, Details)
    VALUES ('RESERVATIONS', 'INSERT', :NEW.ReservationID,
            'PassagerID='||:NEW.PassengerID||', VolNum='||:NEW.VolNum||', Seat='||:NEW.SeatCode);
END;
/

CREATE OR REPLACE TRIGGER after_delete_reservation
AFTER DELETE ON RESERVATIONS
FOR EACH ROW
BEGIN
    UPDATE FLIGHTS
    SET CurrentCapacity = CurrentCapacity - 1
    WHERE VolNum = :OLD.VolNum AND CurrentCapacity > 0;

    INSERT INTO LOGS(TableName, Operation, RecordID, Details)
    VALUES ('RESERVATIONS', 'DELETE', :OLD.ReservationID,
            'PassagerID='||:OLD.PassengerID||', VolNum='||:OLD.VolNum||', Seat='||:OLD.SeatCode);
END;
/

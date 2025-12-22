CREATE OR REPLACE TRIGGER before_insert_reservation
BEFORE INSERT ON RESERVATIONS
FOR EACH ROW
DECLARE
    v_taken NUMBER;
BEGIN
    
    SELECT COUNT(*) INTO v_taken
    FROM RESERVATIONS
    WHERE vol_num = :NEW.vol_num AND SeatCode = :NEW.SeatCode;

    IF v_taken > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Le siège ' || :NEW.SeatCode || ' est déjà pris pour ce vol.');
    END IF;
END;
/


CREATE OR REPLACE TRIGGER after_insert_reservation
AFTER INSERT ON RESERVATIONS
FOR EACH ROW
BEGIN
   
    UPDATE FLIGHTS
    SET CurrentCapacity = CurrentCapacity + 1
    WHERE vol_num = :NEW.vol_num;

    
    INSERT INTO LOGS(TableName, Operation, RecordID, Details)
    VALUES ('RESERVATIONS', 'INSERT', :NEW.reservation_id,
            'Passager_id='||:NEW.Passenger_id||', vol_num='||:NEW.vol_num||', Seat='||:NEW.SeatCode);
END;
/


CREATE OR REPLACE TRIGGER after_delete_reservation
AFTER DELETE ON RESERVATIONS
FOR EACH ROW
BEGIN
 
    UPDATE FLIGHTS
    SET CurrentCapacity = CurrentCapacity - 1
    WHERE vol_num = :OLD.vol_num AND CurrentCapacity > 0;

 
    INSERT INTO LOGS(TableName, Operation, RecordID, Details)
    VALUES ('RESERVATIONS', 'DELETE', :OLD.reservation_id,
            'Passager_id='||:OLD.Passenger_id||', vol_num='||:OLD.vol_num||', Seat='||:OLD.SeatCode);
END;
/

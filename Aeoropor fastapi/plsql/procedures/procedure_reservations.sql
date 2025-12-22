CREATE OR REPLACE PROCEDURE create_reservation_proc(
    p_passenger_id IN NUMBER,
    p_vol_num IN NUMBER,
    p_seatcode IN VARCHAR2,
    p_guardian_id IN NUMBER DEFAULT NULL
)
AS
    v_flight_capacity NUMBER;
    v_aircraft_max NUMBER;
    v_avion_id NUMBER;
    v_passenger_age NUMBER;
    v_guardian_age NUMBER;
    v_existing NUMBER;
    v_guardian_res NUMBER;
BEGIN
    
    SELECT COUNT(*) INTO v_existing FROM Reservations
    WHERE Passenger_id = p_passenger_id AND vol_num = p_vol_num;

    IF v_existing > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Le passager a déjà une réservation pour ce vol.');
    END IF;


    SELECT CurrentCapacity, Avion_id INTO v_flight_capacity, v_avion_id
    FROM Flights WHERE vol_num = p_vol_num;

    SELECT MaxCapacity INTO v_aircraft_max
    FROM Aircrafts WHERE Avion_id = v_avion_id;

    IF v_flight_capacity >= v_aircraft_max THEN
        RAISE_APPLICATION_ERROR(-20002, 'L''avion est plein.');
    END IF;

  
    SELECT Age_pass INTO v_passenger_age FROM Passengers WHERE Passenger_id = p_passenger_id;

    IF v_passenger_age < 18 THEN
        IF p_guardian_id IS NULL THEN
            RAISE_APPLICATION_ERROR(-20003, 'Passager mineur : Guardian_id obligatoire.');
        END IF;

        SELECT Age_pass INTO v_guardian_age FROM Passengers WHERE Passenger_id = p_guardian_id;
        IF v_guardian_age < 18 THEN
            RAISE_APPLICATION_ERROR(-20004, 'Le tuteur ne peut pas être mineur.');
        END IF;

        SELECT COUNT(*) INTO v_guardian_res FROM Reservations
        WHERE Passenger_id = p_guardian_id AND vol_num = p_vol_num;

        IF v_guardian_res = 0 THEN
            RAISE_APPLICATION_ERROR(-20005, 'Le tuteur doit avoir une réservation sur ce vol.');
        END IF;
    END IF;

    -- Insertion
    INSERT INTO Reservations (reservation_id, Passenger_id, vol_num, SeatCode, State, Guardian_id)
    VALUES (seq_res.NEXTVAL, p_passenger_id, p_vol_num, p_seatcode, 'Confirmed', p_guardian_id);

   
    UPDATE Flights SET CurrentCapacity = CurrentCapacity + 1 WHERE vol_num = p_vol_num;

    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20006, 'Vol ou Passager introuvable.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE; -- Relance l'erreur pour que Python l'attrape
END create_reservation_proc;
/

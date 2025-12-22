CREATE OR REPLACE PROCEDURE create_reservation_proc(
    p_passenger_id IN NUMBER,
    p_vol_num IN NUMBER,
    p_seatcode IN VARCHAR2,
    p_guardian_id IN NUMBER DEFAULT NULL,
    p_result OUT VARCHAR2
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

    SELECT COUNT(*) INTO v_existing
    FROM Reservations
    WHERE Passenger_id = p_passenger_id
      AND vol_num = p_vol_num;

    IF v_existing > 0 THEN
        p_result := 'Le passager a déjà une réservation pour ce vol.';
        RETURN;
    END IF;

    SELECT CurrentCapacity, Avion_id INTO v_flight_capacity, v_avion_id
    FROM Flights
    WHERE vol_num = p_vol_num;

 
    SELECT MaxCapacity INTO v_aircraft_max
    FROM Aircrafts
    WHERE Avion_id = v_avion_id;

    IF v_flight_capacity >= v_aircraft_max THEN
        p_result := 'L''avion est plein, réservation impossible.';
        RETURN;
    END IF;

    
    SELECT Age_pass INTO v_passenger_age
    FROM Passengers
    WHERE Passenger_id = p_passenger_id;

    IF v_passenger_age < 18 THEN
        IF p_guardian_id IS NULL THEN
            p_result := 'Passager mineur : Guardian_id obligatoire.';
            RETURN;
        END IF;

        SELECT Age_pass INTO v_guardian_age
        FROM Passengers
        WHERE Passenger_id = p_guardian_id;

        IF v_guardian_age < 18 THEN
            p_result := 'Le tuteur ne peut pas être mineur.';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_guardian_res
        FROM Reservations
        WHERE Passenger_id = p_guardian_id
          AND vol_num = p_vol_num;

        IF v_guardian_res = 0 THEN
            p_result := 'Le tuteur doit avoir une réservation sur ce vol.';
            RETURN;
        END IF;
    END IF;

    
    INSERT INTO Reservations (reservation_id, Passenger_id, vol_num, SeatCode, State, Guardian_id)
    VALUES (seq_res.NEXTVAL, p_passenger_id, p_vol_num, p_seatcode, 'Confirmed', p_guardian_id);

    
    UPDATE Flights
    SET CurrentCapacity = CurrentCapacity + 1
    WHERE vol_num = p_vol_num;

    COMMIT;
    p_result := 'Réservation créée avec succès.';
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := 'Erreur : Vol ou Passager introuvable.';
    WHEN OTHERS THEN
        ROLLBACK;
        p_result := 'Erreur : ' || SQLERRM;
END create_reservation_proc;
/


CREATE OR REPLACE PROCEDURE list_reservations_proc(p_cursor OUT SYS_REFCURSOR) AS
BEGIN
    OPEN p_cursor FOR SELECT * FROM Reservations;
END;
/


CREATE OR REPLACE PROCEDURE get_reservation_proc(
    p_res_id IN NUMBER, 
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR 
    SELECT * FROM Reservations WHERE reservation_id = p_res_id;
END;
/

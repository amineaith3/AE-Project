CREATE OR REPLACE PROCEDURE create_reservation_proc(
    p_passenger_id IN NUMBER,
    p_volnum IN NUMBER,
    p_seatcode IN VARCHAR2,
    p_guardian_id IN NUMBER DEFAULT NULL,
    p_result OUT VARCHAR2
)
AS
    v_flight_capacity NUMBER;
    v_aircraft_capacity NUMBER;
    v_passenger_age NUMBER;
    v_guardian_age NUMBER;
    v_existing NUMBER;
    v_guardian_res NUMBER;
BEGIN
    
    SELECT COUNT(*) INTO v_existing
    FROM RESERVATIONS
    WHERE PassengerID = p_passenger_id
      AND VolNum = p_volnum;

    IF v_existing > 0 THEN
        p_result := 'Le passager a déjà une réservation pour ce vol.';
        RETURN;
    END IF;

  
    SELECT CurrentCapacity, AvionID INTO v_flight_capacity, v_aircraft_capacity
    FROM FLIGHTS
    WHERE VolNum = p_volnum;

    SELECT MaxCapacity INTO v_aircraft_capacity
    FROM AIRCRAFTS
    WHERE AvionID = v_aircraft_capacity;

    IF v_flight_capacity >= v_aircraft_capacity THEN
        p_result := 'L''avion est plein, réservation impossible.';
        RETURN;
    END IF;


    SELECT Age_pass INTO v_passenger_age
    FROM PASSENGERS
    WHERE PassengerId = p_passenger_id;

    IF v_passenger_age < 18 THEN
        IF p_guardian_id IS NULL THEN
            p_result := 'Passager mineur : guardian_id obligatoire.';
            RETURN;
        END IF;

        SELECT Age_pass INTO v_guardian_age
        FROM PASSENGERS
        WHERE PassengerId = p_guardian_id;

        IF v_guardian_age < 18 THEN
            p_result := 'Le tuteur ne peut pas être mineur.';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_guardian_res
        FROM RESERVATIONS
        WHERE PassengerID = p_guardian_id
          AND VolNum = p_volnum;

        IF v_guardian_res = 0 THEN
            p_result := 'Le tuteur doit avoir une réservation sur ce vol.';
            RETURN;
        END IF;
    END IF;


    INSERT INTO RESERVATIONS (PassengerID, VolNum, SeatCode, State, guardian_id)
    VALUES (p_passenger_id, p_volnum, p_seatcode, 'Pending', p_guardian_id);

    
    UPDATE FLIGHTS
    SET CurrentCapacity = CurrentCapacity + 1
    WHERE VolNum = p_volnum;

    COMMIT;
    p_result := 'Réservation créée avec succès.';
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_result := 'Erreur : ' || SQLERRM;
END create_reservation_proc;
/
CREATE OR REPLACE PROCEDURE delete_reservation_proc(
    p_res_id IN NUMBER,
    p_result OUT VARCHAR2
)
AS
    v_volnum NUMBER;
BEGIN
    SELECT VolNum INTO v_volnum
    FROM RESERVATIONS
    WHERE ReservationID = p_res_id;

    DELETE FROM RESERVATIONS
    WHERE ReservationID = p_res_id;

    UPDATE FLIGHTS
    SET CurrentCapacity = CurrentCapacity - 1
    WHERE VolNum = v_volnum
      AND CurrentCapacity > 0;

    COMMIT;
    p_result := 'Réservation annulée et capacité du vol mise à jour.';
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := 'Réservation non trouvée.';
    WHEN OTHERS THEN
        ROLLBACK;
        p_result := 'Erreur : ' || SQLERRM;
END delete_reservation_proc;
/
CREATE OR REPLACE PROCEDURE get_reservation_proc(
    p_res_id IN NUMBER,
    p_res OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_res FOR
        SELECT * FROM RESERVATIONS
        WHERE ReservationID = p_res_id;
END get_reservation_proc;
/
CREATE OR REPLACE PROCEDURE list_reservations_proc(
    p_res OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_res FOR
        SELECT * FROM RESERVATIONS;
END list_reservations_proc;
/

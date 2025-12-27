CREATE OR REPLACE PROCEDURE ADD_FLIGHT(
  p_vol_num        IN NUMBER,
  p_destination    IN VARCHAR2,
  p_departure_time IN DATE,
  p_avion_id       IN NUMBER
)
IS
  v_state_aircraft aircrafts.state%TYPE;
BEGIN
  -- Vérifier disponibilité avion
  SELECT state INTO v_state_aircraft
  FROM aircrafts
  WHERE avion_id = p_avion_id;

  IF v_state_aircraft <> 'DISPONIBLE' THEN
    RAISE_APPLICATION_ERROR(-20001,'Avion indisponible');
  END IF;

  -- Date valide
  IF p_departure_time <= SYSDATE THEN
    RAISE_APPLICATION_ERROR(-20002,'La date doit être future');
  END IF;

  -- Insertion
  INSERT INTO flights(vol_num, destination, departure_time, state, avion_id)
  VALUES(p_vol_num, p_destination, p_departure_time,'PLANIFIE',p_avion_id);

  DBMS_OUTPUT.PUT_LINE('Vol ajouté avec succès');
END;
/
CREATE OR REPLACE PROCEDURE UPDATE_FLIGHT(
  p_vol_num         IN NUMBER,
  p_new_destination IN VARCHAR2,
  p_new_date        IN DATE
)
IS
  v_state flights.state%TYPE;
BEGIN
  SELECT state INTO v_state
  FROM flights
  WHERE vol_num = p_vol_num;

  IF v_state IN ('EN_COURS','TERMINE') THEN
    RAISE_APPLICATION_ERROR(-20003,'Modification interdite');
  END IF;

  UPDATE flights
  SET destination = p_new_destination,
      departure_time = p_new_date
  WHERE vol_num = p_vol_num;

  DBMS_OUTPUT.PUT_LINE('Vol mis à jour');
END;
/
CREATE OR REPLACE PROCEDURE DELETE_FLIGHT(
  p_vol_num IN NUMBER
)
IS
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM reservations
  WHERE vol_num = p_vol_num
    AND state = 'CONFIRMÉ';

  IF v_count > 0 THEN
    RAISE_APPLICATION_ERROR(-20004,'Réservations existantes');
  END IF;

  DELETE FROM flights
  WHERE vol_num = p_vol_num;

  DBMS_OUTPUT.PUT_LINE('Vol supprimé');
END;
/

CREATE OR REPLACE PROCEDURE CHANGE_FLIGHT_STATE(
  p_vol_num   IN NUMBER,
  p_new_state IN VARCHAR2
)
IS
  v_old_state flights.state%TYPE;
BEGIN
  -- Vérifier existence du vol
  SELECT state INTO v_old_state
  FROM flights
  WHERE vol_num = p_vol_num;

  -- Contrôle des transitions
  IF v_old_state = 'TERMINE' THEN
    RAISE_APPLICATION_ERROR(-20010, 'Un vol terminé ne peut pas être modifié');
  END IF;

  IF v_old_state = 'PLANIFIE' AND p_new_state NOT IN ('EN_COURS') THEN
    RAISE_APPLICATION_ERROR(-20011, 'Transition invalide');
  END IF;

  IF v_old_state = 'EN_COURS' AND p_new_state NOT IN ('TERMINE') THEN
    RAISE_APPLICATION_ERROR(-20012, 'Transition invalide');
  END IF;

  -- Mise à jour
  UPDATE flights
  SET state = p_new_state
  WHERE vol_num = p_vol_num;

  DBMS_OUTPUT.PUT_LINE('Etat du vol '||p_vol_num||' modifié vers '||p_new_state);
END;
/

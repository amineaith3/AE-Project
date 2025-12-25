
--nombre de reservation effectué par un passager par son Identifiant

CREATE OR REPLACE FUNCTION count_reservations_by_passenger(
       p_passenger_id IN NUMBER 
)
RETURN NUMBER 
IS  
       v_count NUMBER; 
BEGIN
       SELECT COUNT(*) INTO v_count
       FROM reservations
       WHERE passenger_id = p_passenger_id; 
       
       IF v_count = 0 THEN
            DBMS_OUTPUT.PUT_LINE('Aucune réservation trouvée pour ce passager.');
       END IF;
    
       RETURN v_count; 
       
EXCEPTION 
       WHEN NO_DATA_FOUND THEN 
            DBMS_OUTPUT.PUT_LINE('ERREUR : ID de ce passager n''existe pas');
            RETURN NULL;
       WHEN OTHERS THEN 
            DBMS_OUTPUT.PUT_LINE('ERREUR : ' || SQLERRM);
            RETURN NULL;
END count_reservations_by_passenger;
/


-- le nom de passager part son identifiant 
CREATE OR REPLACE FUNCTION get_passenger_name(
       p_passenger_id IN NUMBER 
)
RETURN VARCHAR2 
IS  
       v_nom VARCHAR2(50) ; 
       v_prenom VARCHAR(50) ; 
       v_result VARCHAR(50) ; 
       
BEGIN
       SELECT prenom, nom INTO v_prenom, v_nom   
       FROM Passengers
       WHERE passenger_id = p_passenger_id; 
       
       v_result := v_nom ||' '|| v_prenom ; 
       
       RETURN v_result; 
       
EXCEPTION 
       WHEN NO_DATA_FOUND THEN 
            DBMS_OUTPUT.PUT_LINE('ERREUR : ID de ce passager n''existe pas');
            RETURN NULL;
       WHEN OTHERS THEN 
            DBMS_OUTPUT.PUT_LINE('ERREUR : ' || SQLERRM);
            RETURN NULL;
END get_passenger_name ;
/


-- verifier si une place est deja reservé dans un vol par le numero de vol et le numero de seat 
CREATE OR REPLACE FUNCTION check_seat_reserved(
       p_vol_num IN NUMBER, 
       p_seat_code IN VARCHAR2
) 
RETURN VARCHAR2 
IS 
       v_bool VARCHAR2(25) ; 
       v_count NUMBER ; 
BEGIN 
       SELECT count(*) INTO v_count 
       FROM Reservations 
       WHERE vol_num = p_vol_num 
             AND SeatCode = p_seat_code ; 

       IF v_count = 0 THEN 
          v_bool := 'Non reservé' ; 
       ELSE 
          v_bool := 'Réservé' ;
       END IF ; 

       RETURN v_bool ; 

EXCEPTION 
       WHEN OTHERS THEN 
            DBMS_OUTPUT.PUT_LINE('ERREUR : ' || SQLERRM);
       RETURN NULL;
END check_seat_reserved ; 
/

--RElation mineur-majeur-adulte hh 
-- 1) Si le passenger est mineur -> retourner l'id du guardian (sinon NULL)
CREATE OR REPLACE FUNCTION get_guardian_if_minor(
       p_passenger_id IN NUMBER
)
RETURN NUMBER
IS
       v_age NUMBER;
       v_guardian NUMBER;
BEGIN
       SELECT Age_pass INTO v_age
       FROM Passengers
       WHERE Passenger_id = p_passenger_id;

       IF v_age >= 18 THEN
            RETURN NULL;
       END IF;

       BEGIN
            SELECT Guardian_id INTO v_guardian
            FROM Reservations
            WHERE Passenger_id = p_passenger_id
              AND Guardian_id IS NOT NULL
              AND ROWNUM = 1;

            RETURN v_guardian;
       EXCEPTION
            WHEN NO_DATA_FOUND THEN
                 RETURN NULL;
       END;

EXCEPTION
       WHEN NO_DATA_FOUND THEN
            DBMS_OUTPUT.PUT_LINE('ERREUR : Passenger inexistant.');
            RETURN NULL;
       WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('ERREUR : ' || SQLERRM);
            RETURN NULL;
END get_guardian_id_minor;
/


-- 2) Si le passenger est adulte -> retourner la liste des ids mineurs liés (sinon NULL)
CREATE OR REPLACE FUNCTION get_minors_ids_if_adult(
       p_passenger_id IN NUMBER
)
RETURN VARCHAR2
IS
       v_age NUMBER;
       v_minors VARCHAR2(4000);
BEGIN
       SELECT Age_pass INTO v_age
       FROM Passengers
       WHERE Passenger_id = p_passenger_id;

       IF v_age < 18 THEN
            RETURN NULL;
       END IF;

       SELECT LISTAGG(DISTINCT Passenger_id, ',') WITHIN GROUP (ORDER BY Passenger_id)
       INTO v_minors
       FROM Reservations
       WHERE Guardian_id = p_passenger_id;

       RETURN v_minors;  -- NULL si aucun mineur

EXCEPTION
       WHEN NO_DATA_FOUND THEN
            DBMS_OUTPUT.PUT_LINE('ERREUR : Passenger inexistant.');
            RETURN NULL;
       WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('ERREUR : ' || SQLERRM);
            RETURN NULL;
END get_minors_ids_if_adult;
/
























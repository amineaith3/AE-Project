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

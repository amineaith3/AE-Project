CREATE OR REPLACE PROCEDURE ajouter_passengers (
       p_Passenger_id  IN NUMBER ,
       p_prenom IN VARCHAR2,
       p_nom IN VARCHAR2,
       p_NumPasseport IN NUMBER,
       p_Contact IN VARCHAR2,
       p_Nationality IN VARCHAR2 
)
IS 
    v_count NUMBER ;
    
    
BEGIN 
 
    IF p_prenom IS NULL OR p_nom IS NULL OR p_Contact IS NULL THEN
      DBMS_OUTPUT.PUT_LINE('Erreur : les champs prénom, nom et contact sont obligatoires.');
      RETURN;
    END IF;


   IF INSTR(p_Contact, '@') = 0 THEN
     DBMS_OUTPUT.PUT_LINE('Erreur : email invalide.');
     RETURN;
   END IF;

   SELECT COUNT(*) INTO v_count
   FROM passengers 
   WHERE passenger_id = p_passenger_id 
         OR numPasseport = p_NumPasseport;
 
   IF v_count > 0 THEN 
   DBMS_OUTPUT.PUT_LINE('Erreur : ID ou numéro de passeport déjà existant.');
   
   ELSE 
       INSERT INTO passengers ( 
                                Passenger_id,
                                prenom,
                                nom,
                                NumPasseport,
                                Contact,
                                Nationality ) 
       VALUES ( p_Passenger_id, 
                p_prenom,
                p_nom,
                p_NumPasseport, 
                p_Contact,
                p_Nationality ); 
       COMMIT;
       DBMS_OUTPUT.PUT_LINE('Passager ajouté avec succès.');
   END IF; 

EXCEPTION 
     WHEN DUP_VAL_ON_INDEX THEN 
          DBMS_OUTPUT.PUT_LINE('ERREUR: ID PASSENGER DEJA EXISTANT');
     WHEN VALUE_ERROR THEN
          DBMS_OUTPUT.PUT_LINE('Erreur : type de donnée invalide.');     
     WHEN OTHERS THEN 
          DBMS_OUTPUT.PUT_LINE('ERREUR:' || SQLERRM );
     
END ajouter_passengers ; 
/
       
       
       
       
CREATE OR REPLACE PROCEDURE ajouter_reservations ( 
       p_reservation_id IN NUMBER, 
       p_Passenger_id IN  NUMBER, 
       p_vol_num IN NUMBER, 
       p_SeatCode IN VARCHAR2, 
       p_State IN VARCHAR2
)
IS
     v_count NUMBER ;
     
BEGIN
     IF p_State IS NULL OR p_vol_num IS NULL   THEN
       DBMS_OUTPUT.PUT_LINE('Erreur : Tous les champs sont obligatoires.');
       RETURN;
     END IF;
     
     SELECT COUNT(*) INTO v_count
     FROM  Reservations
     WHERE reservation_id = p_reservation_id 
          OR ( SeatCode = p_SeatCode AND VolNum = p_vol_num ) ;
     IF v_count > 0 THEN 
        DBMS_OUTPUT.PUT_LINE('Erreur : ID de réservation déjà existant ou le seat est deja reservé.');
     ELSE 
         INSERT INTO Reservations (
                reservation_id, 
                Passenger_id,
                vol_num,
                SeatCode,
                State )
          VALUES (
                p_reservation_id, 
                p_Passenger_id,
                p_vol_num,
                p_SeatCode,
                p_State ) ; 
          COMMIT;
          DBMS_OUTPUT.PUT_LINE('Reservation ajoutée avec succès.');    
     END IF ; 

            
EXCEPTION
     WHEN DUP_VAL_ON_INDEX THEN 
          DBMS_OUTPUT.PUT_LINE('ERREUR: ID RESERVATION DEJA EXISTANT');
     WHEN VALUE_ERROR THEN
          DBMS_OUTPUT.PUT_LINE('Erreur : type de donnée invalide.');     
     WHEN OTHERS THEN 
          DBMS_OUTPUT.PUT_LINE('ERREUR:' || SQLERRM );
          
END ajouter_reservations;
\





CREATE OR REPLACE PROCEDURE modifier_passengers ( 
       p_Passenger_id IN NUMBER, 
       p_prenom IN VARCHAR2,
       p_nom IN VARCHAR2,
       p_Contact IN VARCHAR2,
       p_Nationality IN VARCHAR2 
) 
IS 
     v_count NUMBER
     
BEGIN 
     IF p_prenom IS NULL OR p_nom IS NULL OR p_Contact IS NULL THEN
        DBMS_OUTPUT.PUT_LINE('Erreur : les champs prénom, nom et contact sont obligatoires.');
        RETURN;
     END IF;


     IF INSTR(p_Contact, '@') = 0 THEN
        DBMS_OUTPUT.PUT_LINE('Erreur : email invalide.');
        RETURN;
     END IF;


     SELECT COUNT(*) INTO v_count
     FROM  Passengers
     WHERE Passenger_id = p_Passenger_id ; 
     
     
     IF v_count = 0 THEN 
        DBMS_OUTPUT.PUT_LINE('Erreur : ID de Ce Passenger n existe pas.');
     ELSE 
        UPDATE passengers 
        SET prenom      = p_prenom,
            nom         = p_nom,
            contact     = p_contact,
            nationality = p_nationality
        WHERE Passenger_id = p_Passenger_id ; 
        
        COMMIT; 
        DBMS_OUTPUT.PUT_LINE('Passager mis à jour avec succès.');
     END IF ; 
     
     
EXCEPTION
        WHEN NO_DATA_FOUND THEN 
             DBMS_OUTPUT.PUT_LINE('ERREUR: ID PASSAGER N EXISTE PAS ');
        WHEN VALUE_ERROR THEN
             DBMS_OUTPUT.PUT_LINE('Erreur : type de donnée invalide.');     
        WHEN OTHERS THEN 
             DBMS_OUTPUT.PUT_LINE('ERREUR:' || SQLERRM );

END modifier_passengers ; 
\

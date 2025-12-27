from sqlalchemy import text
from sqlalchemy.engine import Connection
from models.passenger import PassengerCreate, PassengerUpdate
from fastapi import HTTPException
import oracledb

def add_passenger(conn: Connection, passenger: PassengerCreate):
    conn.execute(
        text("""
            BEGIN
                add_new_passenger(
                    :p_id,
                    :p_prenom,
                    :p_nom,
                    :p_passport,
                    :p_contact,
                    :p_nationality,
                    :p_age
                );
            END;
        """),
        {
            "p_id": passenger.passenger_id,
            "p_prenom": passenger.prenom,
            "p_nom": passenger.nom,
            "p_passport": passenger.num_passeport,
            "p_contact": passenger.contact,
            "p_nationality": passenger.nationality,
            "p_age": passenger.age
        }
    )

def update_passenger(conn: Connection, passenger_id: int, passenger: PassengerUpdate):
    conn.execute(
        text("""
            BEGIN
                update_passenger(
                    :p_id,
                    :p_prenom,
                    :p_nom,
                    :p_contact,
                    :p_nationality,
                    :p_age
                );
            END;
        """),
        {
            "p_id": passenger_id,
            "p_prenom": passenger.prenom,
            "p_nom": passenger.nom,
            "p_contact": passenger.contact,
            "p_nationality": passenger.nationality,
            "p_age": passenger.age
        }
    )

def delete_passenger(conn: Connection, passenger_id: int):
    conn.execute(
        text("""
            BEGIN
                delete_passenger(:p_id);
            END;
        """),
        {"p_id": passenger_id}
    )

def get_passenger_by_passport(conn: Connection, num_passeport: int):
    """Version simple et efficace"""
    try:
        raw_conn = conn.connection.connection
        
        with raw_conn.cursor() as cursor:
            # Créer les variables OUT
            out_id = cursor.var(int)
            out_prenom = cursor.var(str)
            out_nom = cursor.var(str)
            out_contact = cursor.var(str)
            out_nationality = cursor.var(str)
            out_age = cursor.var(int)
            
            try:
                # Appeler la procédure
                cursor.callproc("get_passenger_by_passport", [
                    num_passeport,
                    out_id,
                    out_prenom,
                    out_nom,
                    out_contact,
                    out_nationality,
                    out_age
                ])
                
                # Si on arrive ici, la procédure a réussi
                return {
                    "passenger_id": out_id.getvalue(),
                    "prenom": out_prenom.getvalue(),
                    "nom": out_nom.getvalue(),
                    "contact": out_contact.getvalue(),
                    "nationality": out_nationality.getvalue(),
                    "age": out_age.getvalue()
                }
                
            except oracledb.DatabaseError as db_err:
                error_obj, = db_err.args
                if error_obj.code == 20001:  # Votre erreur personnalisée
                    return None  # Passager non trouvé
                raise  # Relancer les autres erreurs
    
    except oracledb.DatabaseError as e:
        error_obj, = e.args
        print(f"❌ Oracle Error {error_obj.code}: {error_obj.message}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None
    

def get_passenger_by_id(conn: Connection, passenger_id: int):
    """Version avec requête SQL directe"""
    try:
        # Version simple avec SQL direct
        with conn.connection.connection.cursor() as cursor:
            # Requête SQL pour récupérer le passager par ID
            sql = """
            SELECT 
                passenger_id,
                prenom,
                nom,
                numpasseport,
                contact,
                nationality,
                age
            FROM passengers 
            WHERE passenger_id = :passenger_id
            """
            
            # Exécuter la requête
            cursor.execute(sql, {"passenger_id": passenger_id})
            
            # Récupérer le résultat
            result = cursor.fetchone()
            
            if result:
                # Construire le dictionnaire de retour
                return {
                    "passenger_id": result[0],
                    "prenom": result[1],
                    "nom": result[2],
                    "num_passeport": result[3],
                    "contact": result[4],
                    "nationality": result[5],
                    "age": result[6]
                }
            else:
                # Passager non trouvé
                return None
                
    except oracledb.DatabaseError as e:
        error_obj, = e.args
        print(f"❌ Oracle Error {error_obj.code}: {error_obj.message}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None   

def get_all_passengers(conn: Connection, skip: int = 0, limit: int = 100):
    try:
        from sqlalchemy import text
        
        query = text("""
            SELECT * FROM passengers 
            ORDER BY passenger_id 
            OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
        """)
        
        # Execute with parameters
        result = conn.execute(query, {"skip": skip, "limit": limit})
        
        # Fetch all results
        rows = result.fetchall()
        
        if not rows:
            return []
        
        # Convert to list of dictionaries
        passengers = []
        for row in rows:
            # Convert row to dictionary
            passenger_dict = dict(row._mapping)  # Use _mapping for SQLAlchemy rows
            passengers.append(passenger_dict)
        
        return passengers
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"FULL ERROR TRACEBACK:\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
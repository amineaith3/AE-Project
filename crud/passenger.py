from sqlalchemy import text
from sqlalchemy.engine import Connection
from models.passenger import PassengerCreate, PassengerUpdate

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
    result = conn.execute(
        text("""
            DECLARE
                v_id NUMBER;
                v_prenom VARCHAR2(50);
                v_nom VARCHAR2(50);
                v_contact VARCHAR2(50);
                v_nationality VARCHAR2(50);
                v_age NUMBER;
            BEGIN
                get_passenger_by_passport(
                    :p_passport,
                    v_id,
                    v_prenom,
                    v_nom,
                    v_contact,
                    v_nationality,
                    v_age
                );
                OPEN :p_cursor FOR
                SELECT v_id AS passenger_id,
                       v_prenom AS prenom,
                       v_nom AS nom,
                       v_contact AS contact,
                       v_nationality AS nationality,
                       v_age AS age
                FROM dual;
            END;
        """),
        {"p_passport": num_passeport}
    ).fetchone()

    return result

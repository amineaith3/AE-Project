from sqlalchemy import text
from sqlalchemy.engine import Connection
from models.reservation import ReservationCreate, ReservationUpdate
import oracledb as cx_Oracle
from fastapi import HTTPException

def add_reservation(conn: Connection, reservation: ReservationCreate):
    conn.execute(
        text("""
            BEGIN
                add_new_reservation(
                    :p_reservation_id,
                    :p_passenger_id,
                    :p_vol_num,
                    :p_seatcode,
                    :p_state,
                    :p_guardian_id
                );
            END;
        """),
        {
            "p_reservation_id": reservation.reservation_id,
            "p_passenger_id": reservation.passenger_id,
            "p_vol_num": reservation.vol_num,
            "p_seatcode": reservation.seatcode,
            "p_state": reservation.state,
            "p_guardian_id": reservation.guardian_id
        }
    )

def update_reservation(conn: Connection, reservation_id: int, reservation: ReservationUpdate):
    conn.execute(
        text("""
            BEGIN
                update_reservation(
                    :p_reservation_id,
                    :p_vol_num,
                    :p_seatcode,
                    :p_state
                );
            END;
        """),
        {
            "p_reservation_id": reservation_id,
            "p_vol_num": reservation.vol_num,
            "p_seatcode": reservation.seatcode,
            "p_state": reservation.state
        }
    )

def delete_reservation(conn: Connection, reservation_id: int):
    conn.execute(
        text("""
            BEGIN
                delete_reservation(:p_reservation_id);
            END;
        """),
        {"p_reservation_id": reservation_id}
    )


def get_reservation_by_passport(conn: Connection, num_passeport: int):
    cursor = conn.connection.cursor()
    reservation_id = cursor.var(cx_Oracle.NUMBER)
    vol_num = cursor.var(cx_Oracle.NUMBER)
    seatcode = cursor.var(cx_Oracle.STRING)
    state = cursor.var(cx_Oracle.STRING)
    guardian_id = cursor.var(cx_Oracle.NUMBER)

    cursor.callproc(
        "get_reservation_by_passport",
        [num_passeport, reservation_id, vol_num, seatcode, state, guardian_id]
    )

    return {
        "reservation_id": reservation_id.getvalue(),
        "vol_num": vol_num.getvalue(),
        "seatcode": seatcode.getvalue(),
        "state": state.getvalue(),
        "guardian_id": guardian_id.getvalue(),
    }

def get_all_reservations(conn: Connection, skip: int = 0, limit: int = 100):
    try:
        from sqlalchemy import text
        
        query = text("""
            SELECT * FROM reservations 
            ORDER BY reservation_id 
            OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
        """)
        
        # Exécuter la requête
        result = conn.execute(query, {"skip": skip, "limit": limit})
        
        # Récupérer tous les résultats
        rows = result.fetchall()
        
        if not rows:
            return []  # Liste vide
        
        # Convertir chaque ligne en dictionnaire
        reservations = []
        for row in rows:
            # row._mapping convertit la ligne SQLAlchemy en dictionnaire
            reservation_dict = dict(row._mapping)
            reservations.append(reservation_dict)
        
        return reservations  # Liste de dictionnaires
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"FULL ERROR TRACEBACK:\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
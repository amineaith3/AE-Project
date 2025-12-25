from sqlalchemy import text
from sqlalchemy.engine import Connection
from models.reservation import ReservationCreate, ReservationUpdate
import cx_Oracle

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

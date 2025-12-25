from sqlalchemy.engine import Connection
from models.aircraft import AircraftCreate, AircraftUpdate
import oracledb

def add_aircraft(conn: Connection, aircraft: AircraftCreate):
    cursor = conn.connection.cursor()
    cursor.callproc(
        "add_new_aircraft",
        [
            aircraft.avion_id,
            aircraft.modele,
            aircraft.max_capacity,
            aircraft.state
        ]
    )
    cursor.close()

def update_aircraft(conn: Connection, avion_id: int, aircraft: AircraftUpdate):
    cursor = conn.connection.cursor()
    cursor.callproc(
        "update_aircraft",
        [
            avion_id,
            aircraft.modele,
            aircraft.max_capacity,
            aircraft.state
        ]
    )
    cursor.close()

def delete_aircraft(conn: Connection, avion_id: int):
    cursor = conn.connection.cursor()
    cursor.callproc("delete_aircraft", [avion_id])
    cursor.close()

def get_aircraft_by_id(conn: Connection, avion_id: int):
    cursor = conn.connection.cursor()
    out_modele = cursor.var(str)
    out_max_capacity = cursor.var(int)
    out_state = cursor.var(str)

    cursor.callproc(
        "select_aircraft_by_id",
        [
            avion_id,
            out_modele,
            out_max_capacity,
            out_state
        ]
    )

    result = {
        "avion_id": avion_id,
        "modele": out_modele.getvalue(),
        "max_capacity": out_max_capacity.getvalue(),
        "state": out_state.getvalue(),
    }
    cursor.close()
    return result

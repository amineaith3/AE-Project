from sqlalchemy import text
from sqlalchemy.engine import Connection
from models.flight import FlightCreate, FlightUpdate

def add_flight(conn: Connection, flight: FlightCreate):
    """
    Calls the DBA procedure to add a new flight.
    """
    conn.execute(
        text("""
            BEGIN
                add_new_flight(
                    :vol_num,
                    :destination,
                    :departure_time,
                    :arrival_time,
                    :avion_id
                );
            END;
        """),
        {
            "vol_num": flight.vol_num,
            "destination": flight.destination,
            "departure_time": flight.departure_time,
            "arrival_time": flight.arrival_time,
            "avion_id": flight.avion_id
        }
    )

def update_flight(conn: Connection, vol_num: int, flight: FlightUpdate):
    """
    Calls the DBA procedure to update flight info.
    Only destination, departure_time, and arrival_time are handled by the DBA procedure.
    """
    conn.execute(
        text("""
            BEGIN
                update_flight(
                    :vol_num,
                    :destination,
                    :departure_time,
                    :arrival_time
                );
            END;
        """),
        {
            "vol_num": vol_num,
            "destination": flight.destination,
            "departure_time": flight.departure_time,
            "arrival_time": flight.arrival_time
        }
    )

def delete_flight(conn: Connection, vol_num: int):
    """
    Calls the DBA procedure to delete a flight.
    """
    conn.execute(
        text("""
            BEGIN
                delete_flight(:vol_num);
            END;
        """),
        {"vol_num": vol_num}
    )

def change_flight_state(conn: Connection, vol_num: int, new_state: str):
    """
    Calls the DBA procedure to change a flight's state.
    """
    conn.execute(
        text("""
            BEGIN
                change_flight_state(:vol_num, :new_state);
            END;
        """),
        {"vol_num": vol_num, "new_state": new_state}
    )

def get_flight_by_id(conn: Connection, vol_num: int):
    """
    Directly selects from Flights table for retrieval.
    """
    result = conn.execute(
        text("""
            SELECT vol_num, destination, departure_time, arrival_time,
                   currentcapacity, state, avion_id
            FROM Flights
            WHERE vol_num = :vol_num
        """),
        {"vol_num": vol_num}
    ).fetchone()

    return result

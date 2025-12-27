from sqlalchemy.engine import Connection
from models.aircraft import AircraftCreate, AircraftUpdate
import oracledb
from fastapi import HTTPException

def add_aircraft(conn: Connection, aircraft: AircraftCreate):
    cursor = conn.connection.cursor()
    try:
        print(f"DEBUG: Calling add_new_aircraft with: {aircraft.avion_id}, {aircraft.modele}, {aircraft.max_capacity}, {aircraft.state}")
        
        cursor.callproc(
            "add_new_aircraft",
            [
                aircraft.avion_id,
                aircraft.modele,
                aircraft.max_capacity,
                aircraft.state
            ]
        )
        
        conn.connection.commit()  # Make sure this is here!
        cursor.close()
        print("DEBUG: Success!")
        
    except Exception as e:
        print(f"DEBUG: ERROR - {type(e).__name__}: {e}")
        # This will print the full traceback to console
        import traceback
        traceback.print_exc()
        raise  # Re-raise to let FastAPI see it

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

def get_aircrafts(conn: Connection):
    try:
        raw_conn = conn.connection.connection
        cursor = raw_conn.cursor()
        
        # Use DB_TYPE_CURSOR (most reliable in oracledb)
        ref_cursor_var = cursor.var(oracledb.DB_TYPE_CURSOR)
        
        cursor.execute("""
            BEGIN
                :result := AE.get_all_aircrafts_infos();
            END;
        """, result=ref_cursor_var)
        
        result_cursor = ref_cursor_var.getvalue()
        rows = result_cursor.fetchall()
        
        if not rows:
            result_cursor.close()
            cursor.close()
            return []
        
        # Get column names from cursor description
        columns = [desc[0] for desc in result_cursor.description]
        
        # DEBUG: Print what we got
        print(f"DEBUG: Columns from Oracle: {columns}")
        print(f"DEBUG: First row: {rows[0] if rows else 'Empty'}")
        
        # Transform to match your Pydantic model
        aircrafts = []
        for row in rows:
            # Create a dictionary with proper field names
            aircraft = {}
            
            # Map Oracle uppercase columns to lowercase model fields
            for i, col_name in enumerate(columns):
                if col_name == 'AVION_ID':
                    aircraft['avion_id'] = row[i]
                elif col_name == 'MODELE':
                    aircraft['modele'] = row[i]
                elif col_name == 'MAXCAPACITY':
                    aircraft['max_capacity'] = row[i]  # Note: underscore
                elif col_name == 'STATE':
                    aircraft['state'] = row[i]
                else:
                    # Keep other columns as-is
                    aircraft[col_name.lower()] = row[i]
            
            aircrafts.append(aircraft)
        
        # DEBUG: Print transformed data
        print(f"DEBUG: Transformed first aircraft: {aircrafts[0] if aircrafts else 'Empty'}")
        
        result_cursor.close()
        cursor.close()
        
        return aircrafts
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"FULL ERROR TRACEBACK:\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
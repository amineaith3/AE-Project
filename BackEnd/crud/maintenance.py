from sqlalchemy import text
from sqlalchemy.engine import Connection
from models.maintenance import MaintenanceCreate, MaintenanceUpdate
import oracledb as cx_Oracle
from typing import List

def add_maintenance(conn: Connection, maintenance: MaintenanceCreate):
    conn.execute(
        text("""
            BEGIN
                add_new_maintenance(
                    :p_avion_id,
                    :p_operation_date,
                    :p_typee
                );
            END;
        """),
        {
            "p_avion_id": maintenance.avion_id,
            "p_operation_date": maintenance.operation_date,
            "p_typee": maintenance.typee
        }
    )

def update_maintenance(conn: Connection, maintenance_id: int, maintenance: MaintenanceUpdate):
    conn.execute(
        text("""
            BEGIN
                update_maintenance(
                    :p_maintenance_id,
                    :p_operation_date,
                    :p_typee,
                    :p_state
                );
            END;
        """),
        {
            "p_maintenance_id": maintenance_id,
            "p_operation_date": maintenance.operation_date,
            "p_typee": maintenance.typee,
            "p_state": maintenance.state
        }
    )

def delete_maintenance(conn: Connection, maintenance_id: int):
    conn.execute(
        text("""
            BEGIN
                delete_maintenance(:p_maintenance_id);
            END;
        """),
        {"p_maintenance_id": maintenance_id}
    )

def list_maintenance(conn: Connection):
    raw_conn = conn.connection
    cursor = raw_conn.cursor()
    out_cursor = cursor.var(cx_Oracle.CURSOR)
    cursor.callproc("list_maintenance", [out_cursor])

    ref_cursor = out_cursor.getvalue()
    rows = ref_cursor.fetchall()
    columns = [col[0].lower() for col in ref_cursor.description]
    return rows, columns

# crud_maintenance.py
def get_maintenance_by_id(conn: Connection, maintenance_id: int):
    """Get maintenance by ID - using direct SQL instead of stored procedure"""
    try:
        # Execute query
        result = conn.execute(
            text("""
                SELECT maintenance_id, avion_id, operationdate, typee, state
                FROM Maintenance 
                WHERE maintenance_id = :id
            """),
            {"id": maintenance_id}
        )
        
        # Fetch the row
        row = result.fetchone()
        
        if row:
            # Get column names
            columns = [col.lower() for col in result.keys()]
            return [row], columns  # Return as list with one row
        else:
            return [], []
            
    except Exception as e:
        # Log the error for debugging
        print(f"Error in get_maintenance_by_id: {e}")
        raise
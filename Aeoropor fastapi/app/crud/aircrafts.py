# app/crud/aircrafts.py
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from app.schemas import AircraftCreate, AircraftUpdate
import oracledb


oracledb.init_oracle_client()

def create_aircraft(db: Session, aircraft: AircraftCreate):
    try:
        # Get raw Oracle connection
        raw_conn = db.connection().connection
        cursor = raw_conn.cursor()
        
        # Create REF CURSOR variable
        ref_cursor_var = cursor.var(oracledb.CURSOR)
        
        # Call the PL/SQL procedure
        cursor.callproc("add_new_aircraft", [
            aircraft.AvionID,
            aircraft.Modele,
            aircraft.MaxCapacity,
            aircraft.State or 'Ready'
        ])
        
        cursor.callfunc("get_aircraft_infos", ref_cursor_var, [aircraft.AvionID])
        
        # Get the actual cursor
        result_cursor = ref_cursor_var.getvalue()
        
        # Fetch the result
        result = result_cursor.fetchone()
        
        # Convert to dictionary
        if result:
            # Get column names
            columns = [desc[0] for desc in result_cursor.description]
            aircraft_dict = dict(zip(columns, result))
            
            # Close cursors
            result_cursor.close()
            cursor.close()
            db.commit()
            
            return aircraft_dict
        else:
            cursor.close()
            db.commit()
            raise HTTPException(status_code=404, detail="Aircraft not found after creation")
            
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        if "ORA-20001" in error_msg:
            raise HTTPException(status_code=400, detail="Aircraft already exists or capacity invalid.")
        elif "ORA-20002" in error_msg:
            raise HTTPException(status_code=404, detail="Aircraft not found.")
        else:
            raise HTTPException(status_code=500, detail=f"A database error occurred: {error_msg}")
        



def get_aircraft(db: Session, avion_id: int):
    try:
        raw_conn = db.connection().connection
        cursor = raw_conn.cursor()
        
        # DEBUG: Check what oracledb.CURSOR actually is
        print(f"[get_aircraft] oracledb.CURSOR value: {oracledb.CURSOR}")
        print(f"[get_aircraft] Type of oracledb.CURSOR: {type(oracledb.CURSOR)}")
        
        # Try different approaches
        try:
            result_cursor_var = cursor.var(oracledb.CURSOR)
            print("[get_aircraft] Used oracledb.CURSOR successfully")
        except Exception as e1:
            print(f"[get_aircraft] oracledb.CURSOR failed: {e1}")
            result_cursor_var = cursor.var("CURSOR")
            print("[get_aircraft] Used 'CURSOR' string instead")
        
        # Execute PL/SQL block with cursor.execute (like you want!)
        cursor.execute("""
            DECLARE
                rc SYS_REFCURSOR;
            BEGIN
                rc := get_aircraft_infos(:avion_id);
                :result := rc;
            END;
        """, {"avion_id": avion_id, "result": result_cursor_var})
        
        # Get the cursor from output parameter
        result_cursor = result_cursor_var.getvalue()
        
        # Fetch the result
        result = result_cursor.fetchone()
        
        if not result:
            result_cursor.close()
            cursor.close()
            raise HTTPException(status_code=404, detail="Aircraft not found.")
        
        # Convert to dictionary
        columns = [desc[0] for desc in result_cursor.description]
        aircraft_dict = dict(zip(columns, result))
        
        # Close cursors
        result_cursor.close()
        cursor.close()
        
        return aircraft_dict
        
    except HTTPException:
        raise
    except Exception as e:
        # Get FULL error details
        import traceback
        error_details = traceback.format_exc()
        print(f"[get_aircraft] FULL ERROR TRACEBACK:\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    



def get_aircrafts(db: Session):
    try:
        raw_conn = db.connection().connection
        cursor = raw_conn.cursor()
        
        # DEBUG: Check what oracledb.CURSOR actually is
        print(f"oracledb.CURSOR value: {oracledb.CURSOR}")
        print(f"Type of oracledb.CURSOR: {type(oracledb.CURSOR)}")
        
        # Try different approaches
        try:
            ref_cursor_var = cursor.var(oracledb.CURSOR)
        except Exception as e1:
            ref_cursor_var = cursor.var("CURSOR")
        
        cursor.execute("""
            DECLARE
                rc SYS_REFCURSOR;
            BEGIN
                rc := get_all_aircrafts_infos();
                :result := rc;
            END;
        """, result=ref_cursor_var)
        
        result_cursor = ref_cursor_var.getvalue()
        rows = result_cursor.fetchall()
        
        if not rows:
            result_cursor.close()
            cursor.close()
            return []
        
        columns = [desc[0] for desc in result_cursor.description]
        aircrafts = [dict(zip(columns, row)) for row in rows]
        
        result_cursor.close()
        cursor.close()
        
        return aircrafts
        
    except Exception as e:
        # Get FULL error details
        import traceback
        error_details = traceback.format_exc()
        print(f"FULL ERROR TRACEBACK:\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}\nFull trace in console")


    
def update_aircraft(db: Session, avion_id: int, aircraft: AircraftUpdate):
    """
    Updates an aircraft with partial data
    """
    try:
        print(f"[DEBUG] Update request for aircraft ID: {avion_id}")
        print(f"[DEBUG] Update data received: {aircraft.dict()}")
        
        # 1. Check if aircraft exists
        exists_result = db.execute(
            text("SELECT aircraft_exists(:avion_id) FROM dual"),
            {"avion_id": avion_id}
        ).scalar()
        
        print(f"[DEBUG] Aircraft exists result: {exists_result}")

        if exists_result == "FALSE":
            raise HTTPException(status_code=404, detail="Aircraft not found.")
        elif exists_result != "TRUE":
            raise HTTPException(status_code=500, detail=f"Unexpected database response: {exists_result}")

        # 2. Get current aircraft data
        print(f"[DEBUG] Fetching current aircraft data...")
        current = get_aircraft(db, avion_id)
        print(f"[DEBUG] Current aircraft: {current}")
        
        # 3. Define valid states based on your NEW constraint
        VALID_STATES = ['Ready', 'Flying', 'Turnaround', 'Maintenance', 'Out of Service']
        
        # 4. Handle state validation
        state_value = None
        if aircraft.STATE is not None:
            user_state = str(aircraft.STATE).strip()
            
            # Try to match the state (case-insensitive with normalized spacing)
            user_state_normalized = user_state.lower().replace('  ', ' ')
            
            valid_states_normalized = {
                state.lower().replace('  ', ' '): state 
                for state in VALID_STATES
            }
            
            if user_state_normalized in valid_states_normalized:
                # Use the exact case from VALID_STATES
                state_value = valid_states_normalized[user_state_normalized]
            else:
                # Try common variations for the NEW states
                variations = {
                    # Ready variations
                    'ready': 'Ready',
                    
                    # Flying variations
                    'flying': 'Flying',
                    'in flight': 'Flying',
                    'inflight': 'Flying',
                    'in service': 'Flying',  # Old state mapping
                    'inservice': 'Flying',
                    
                    # Turnaround variations
                    'turnaround': 'Turnaround',
                    'turn around': 'Turnaround',
                    'on ground': 'Turnaround',
                    
                    # Maintenance variations
                    'maintenance': 'Maintenance',
                    'in maintenance': 'Maintenance',  # Old state mapping
                    'inmaintenance': 'Maintenance',
                    'under maintenance': 'Maintenance',
                    
                    # Out of Service variations
                    'out of service': 'Out of Service',
                    'outofservice': 'Out of Service',
                    'out service': 'Out of Service',
                    'retired': 'Out of Service',
                    'decommissioned': 'Out of Service'
                }
                
                if user_state_normalized in variations:
                    state_value = variations[user_state_normalized]
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid state '{aircraft.STATE}'. Valid states are: {', '.join(VALID_STATES)}"
                    )
        
        # 5. Clean and prepare other values
        modele_value = aircraft.MODELE if aircraft.MODELE and str(aircraft.MODELE).strip() != "" else None
        
        # 6. Prepare update values
        update_params = {
            "avion_id": avion_id,
            "modele": modele_value,
            "max_capacity": aircraft.MAXCAPACITY if aircraft.MAXCAPACITY is not None else None,
            "state": state_value
        }
        
        print(f"[DEBUG] Update params: {update_params}")
        print(f"[DEBUG] State being sent to DB: '{state_value}'")
        
        # 7. Call update procedure
        print(f"[DEBUG] Executing update procedure...")
        db.execute(
            text("""
                BEGIN
                    update_aircraft(
                        :avion_id, 
                        :modele, 
                        :max_capacity, 
                        :state
                    );
                END;
            """),
            update_params
        )
        db.commit()
        print(f"[DEBUG] Update committed successfully")
        
        # 8. Return updated aircraft
        updated = get_aircraft(db, avion_id)
        print(f"[DEBUG] Updated aircraft: {updated}")
        return updated

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[DEBUG] Current aircraft state: {current.get('STATE') if current else 'No current data'}")
        print(f"[DEBUG] Attempted new state: {state_value}")
        print(f"[ERROR] Full traceback:\n{error_trace}")
        print(f"[ERROR] Error message: {str(e)}")
        
        db.rollback()
        error_msg = str(e)
        if "ORA-20001" in error_msg:
            raise HTTPException(status_code=400, detail="MaxCapacity must be positive.")
        elif "ORA-20002" in error_msg:
            raise HTTPException(status_code=404, detail="Aircraft not found.")
        elif "ORA-20010" in error_msg:
            # Enhanced state transition error message
            if current and state_value:
                current_state = current.get('STATE') or current.get('State') or 'Unknown'
                detail = f"Invalid state transition from '{current_state}' to '{state_value}'. "
                detail += f"Valid transitions depend on current state. Valid states are: {', '.join(VALID_STATES)}"
            else:
                detail = "Invalid state transition. Check state transition rules."
            raise HTTPException(status_code=400, detail=detail)
        elif "ORA-02290" in error_msg and "CHK_AIRCRAFTS_STATE" in error_msg:
            # Provide exact valid states
            detail = f"Invalid state value. Valid states are: {', '.join(VALID_STATES)}"
            raise HTTPException(status_code=400, detail=detail)
        else:
            raise HTTPException(status_code=500, detail=f"Update failed: {error_msg}")
        
        

def delete_aircraft(db: Session, avion_id: int):
    
    """
    Calls the 'delete_aircraft' procedure to remove an aircraft.
    """
    # Check existence
    exists = db.execute(
        text("SELECT aircraft_exists(:avion_id) FROM dual"),
        {"avion_id": avion_id}
    ).scalar()

    if not exists:
        raise HTTPException(status_code=404, detail="Aircraft not found.")

    try:
        db.execute(
            text("BEGIN delete_aircraft(:avion_id); END;"),
            {"avion_id": avion_id}
        )
        db.commit()

        return {"message": f"Aircraft with ID {avion_id} was successfully deleted."}

    except Exception as e:
        db.rollback()
        error_msg = str(e)
        if "ORA-20010" in error_msg: 
            raise HTTPException(status_code=400, detail="Cannot delete an aircraft that is still Active.")
        else:
            raise HTTPException(status_code=500, detail=f"Deletion failed: {error_msg}")
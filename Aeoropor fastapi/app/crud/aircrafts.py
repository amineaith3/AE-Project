# app/crud/aircrafts.py
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from app.schemas import AircraftCreate, AircraftUpdate

def create_aircraft(db: Session, aircraft: AircraftCreate):
    """
    Calls the 'add_new_aircraft' procedure to insert a new aircraft.
    """
    try:
        # Execute the PL/SQL procedure. Note: You must provide Avion_id.
        db.execute(
            text("""
                BEGIN
                    add_new_aircraft(
                        :avion_id, :modele, :max_capacity, :state
                    );
                END;
            """),
            {
                "avion_id": aircraft.AvionID,  # From your Pydantic schema
                "modele": aircraft.Modele,
                "max_capacity": aircraft.MaxCapacity,
                "state": aircraft.State or 'Ready'  # Default from your trigger
            }
        )
        db.commit()

        # Optionally, fetch and return the new aircraft using your function
        result = db.execute(
            text("SELECT get_aircraft_infos(:avion_id) FROM dual"),
            {"avion_id": aircraft.AvionID}
        ).fetchone()
        return result[0] if result else None

    except Exception as e:
        db.rollback()
        # Handle specific Oracle errors from your procedures/triggers
        error_msg = str(e)
        if "ORA-20001" in error_msg:
            raise HTTPException(status_code=400, detail="Aircraft already exists or capacity invalid.")
        elif "ORA-20002" in error_msg:
            raise HTTPException(status_code=404, detail="Aircraft not found.")
        else:
            # Generic error for unexpected issues
            raise HTTPException(status_code=500, detail=f"A database error occurred: {error_msg}")


def get_aircraft(db: Session, avion_id: int):
    """
    Calls the 'select_aircraft_by_id' procedure or 'get_aircraft_infos' function
    to retrieve a single aircraft.
    """
    try:
        # Method A: Using your procedure with OUT parameters
        # (More complex to handle in SQLAlchemy)
        # Method B: Using your function (simpler)
        result = db.execute(
            text("SELECT get_aircraft_infos(:avion_id) FROM dual"),
            {"avion_id": avion_id}
        ).fetchone()

        if not result or result[0] is None:
            raise HTTPException(status_code=404, detail="Aircraft not found.")
        return result[0]

    except HTTPException:
        raise  # Re-raise the HTTP exception we created above
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def update_aircraft(db: Session, avion_id: int, aircraft: AircraftUpdate):
    """
    Calls the 'update_aircraft' procedure to modify an existing aircraft.
    """
    # First, check if the aircraft exists using your function
    exists = db.execute(
        text("SELECT aircraft_exists(:avion_id) FROM dual"),
        {"avion_id": avion_id}
    ).scalar()

    if not exists:
        raise HTTPException(status_code=404, detail="Aircraft not found.")

    try:
        # Prepare data for update: use new values if provided, otherwise keep old
        # You need to fetch the old values first. This is a simplified version.
        db.execute(
            text("""
                BEGIN
                    update_aircraft(
                        :avion_id, :modele, :max_capacity, :state
                    );
                END;
            """),
            {
                "avion_id": avion_id,
                "modele": aircraft.Modele,
                "max_capacity": aircraft.MaxCapacity,
                "state": aircraft.State
            }
        )
        db.commit()
        # Return the updated aircraft
        return get_aircraft(db, avion_id)

    except Exception as e:
        db.rollback()
        error_msg = str(e)
        if "ORA-20001" in error_msg:
            raise HTTPException(status_code=400, detail="MaxCapacity must be positive.")
        elif "ORA-20010" in error_msg:
            raise HTTPException(status_code=400, detail="Invalid state transition.")
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
from fastapi import Header, HTTPException, Depends
from sqlalchemy.exc import SQLAlchemyError
from db import get_engine

def get_db(
    x_db_user: str = Header(...),
    x_db_password: str = Header(...)
):
    try:
        engine = get_engine(x_db_user, x_db_password)
        conn = engine.connect()
        yield conn
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            conn.close()
        except:
            pass

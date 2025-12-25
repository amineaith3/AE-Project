from fastapi import HTTPException
from sqlalchemy.exc import DatabaseError

def handle_oracle_error(e: DatabaseError):
    code = e.orig.args[0].code

    if code == 1031:
        raise HTTPException(403, "Insufficient privileges")
    if code in (2291, 2292):
        raise HTTPException(400, "Foreign key constraint violated")
    if code == 1400:
        raise HTTPException(400, "NULL value not allowed")
    if code == 1:
        raise HTTPException(409, "Duplicate value")
    if 20000 <= code <= 20999:
        raise HTTPException(409, e.orig.args[0].message)

    raise HTTPException(500, "Database error")

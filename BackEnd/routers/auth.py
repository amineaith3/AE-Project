# routers/auth.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Simple request model
class LoginRequest(BaseModel):
    username: str
    password: str

# Hardcoded credentials
ADMIN_USER = "USER_ADMIN"
ADMIN_PASSWORD = "admin123"

@router.post("/login")
async def login_simple(login_data: LoginRequest):
    """Super simple login - just check hardcoded credentials"""
    
    # Check credentials
    if login_data.username == ADMIN_USER and login_data.password == ADMIN_PASSWORD:
        return {
            "access_token": f"token_{ADMIN_USER}_{login_data.username}",
            "token_type": "bearer",
            "username": login_data.username,
            "role": "ADMIN",
            "message": "Login successful"
        }
    
    # If wrong credentials
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password"
    )

@router.get("/test")
async def test_endpoint():
    """Test if auth router is working"""
    return {
        "status": "auth router is working",
        "login_endpoint": "POST /auth/login",
        "expected_credentials": {
            "username": ADMIN_USER,
            "password": ADMIN_PASSWORD
        }
    }
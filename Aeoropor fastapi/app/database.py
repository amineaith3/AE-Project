# app/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv() 

# ================================
#   ORACLE DATABASE CONFIG (FROM .env)
# ================================
ORACLE_USER = os.getenv("ORACLE_USER", "AE")           # Default to "AE" if not in .env
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD", "AE")
ORACLE_DSN = os.getenv("ORACLE_DSN", "localhost:1521/?service_name=XEPDB1")

DATABASE_URL = f"oracle+oracledb://{ORACLE_USER}:{ORACLE_PASSWORD}@{ORACLE_DSN}" 


# ================================
#   SQLALCHEMY ENGINE
# ================================

# echo=True → affiche les requêtes SQL (utile pour debug)
engine = create_engine(
    DATABASE_URL,
    echo=False
)


# ================================
#   SESSION (connexion à la DB)
# ================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ================================
#   BASE CLASS FOR MODELS
# ================================

Base = declarative_base()


# ================================
#   DB DEPENDENCY FOR FASTAPI
# ================================
def get_db():
    """
    Dependency utilisée dans les routers FastAPI.
    Fournit une session DB pour chaque requête.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

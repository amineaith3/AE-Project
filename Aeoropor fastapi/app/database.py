# app/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ================================
#   ORACLE DATABASE CONFIG
# ================================

ORACLE_USER = "YOUR_USER"           # ex: SYSTEM ou AEROPORT
ORACLE_PASSWORD = "YOUR_PASSWORD"   # ton mot de passe Oracle
ORACLE_DSN = "localhost:1521/orcl"  # adapter selon ta config Oracle

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

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def get_engine(username: str, password: str):
    dsn = f"(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))" \
          f"(CONNECT_DATA=(SERVICE_NAME=XEPDB1)))"
    url = f"oracle+oracledb://{username}:{password}@{dsn}"
    return create_engine(url, echo=False)

def get_session(engine):
    Session = sessionmaker(bind=engine)
    return Session()

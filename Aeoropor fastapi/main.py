
from fastapi import FastAPI
from app.routes import aircrafts
from app.routes import flights
from app.routes import passengers
from app.routes import maintenance
from app.routes import reservations

app = FastAPI()

# Include the router[citation:8]
app.include_router(aircrafts.router)
app.include_router(flights.router)
app.include_router(passengers.router)
app.include_router(maintenance.router)
app.include_router(reservations.router)

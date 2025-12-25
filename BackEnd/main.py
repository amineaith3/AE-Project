from fastapi import FastAPI
from BackEnd.routers import aircraft, flight, passenger, reservation, maintenance

app = FastAPI(title="Airline DBA-Driven API")

app.include_router(aircraft.router, prefix="/aircrafts")
app.include_router(flight.router, prefix="/flights")
app.include_router(passenger.router, prefix="/passengers")
app.include_router(reservation.router, prefix="/reservations")
app.include_router(maintenance.router, prefix="/maintenance")

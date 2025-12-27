from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import aircraft, auth, flight, passenger, reservation, maintenance

app = FastAPI(title="Airline DBA-Driven API")

# CORS middleware MUST come FIRST
origins = [
    "http://localhost:5173",  # React dev server
    "http://localhost:3000",  # Alternative React port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# THEN include your routers
app.include_router(auth.router)
app.include_router(aircraft.router, prefix="/aircrafts")
app.include_router(flight.router, prefix="/flights")
app.include_router(passenger.router, prefix="/passengers")
app.include_router(reservation.router, prefix="/reservations")
app.include_router(maintenance.router, prefix="/maintenance")
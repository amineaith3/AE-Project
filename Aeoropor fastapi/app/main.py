
from fastapi import FastAPI
from app.routes import aircrafts  

app = FastAPI()

# Include the router[citation:8]
app.include_router(aircrafts.router)
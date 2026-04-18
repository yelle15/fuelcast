from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from simulation_engine import run_fuel_simulation

app = FastAPI(title="FuelCast API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # restrict this in production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/simulate")
async def simulate(
    country: str = Query(..., example="Philippines"),
    fuel: str = Query(..., example="petrol"),
    brent: float = Query(..., example=85.0)
):
    """Endpoint for the Fuel Price Simulation card."""
    result = run_fuel_simulation(country, fuel, brent)
    return result

@app.get("/api/health")
def health():
    return {"status": "online", "engine": "heuristic-simulation-v1"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FuelCast API")

# Enable CORS so Next.js can communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FuelCast API", "status": "Active"}

@app.get("/predict")
def predict_sample():
    # This is a placeholder for when the ML dev finishes the model
    return {"prediction": "Coming soon!", "location": "Southeast Asia"}
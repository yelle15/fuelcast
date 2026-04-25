from datetime import datetime, timedelta
from typing import Any
import traceback

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import pandas as pd

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

class PricePredictionInput(BaseModel):
    country: str
    fuel_type: str
    current_price: float
    last_week_price: float
    tax_percentage: float
    brent_crude: float
    prediction_date: str


# Country mapping used by the model features.
COUNTRY_LOOKUP = {
    "indonesia": {"country_id": 0, "income_id": 1, "subsidy_id": 2},
    "malaysia": {"country_id": 1, "income_id": 2, "subsidy_id": 2},
    "myanmar": {"country_id": 2, "income_id": 0, "subsidy_id": 0},
    "philippines": {"country_id": 3, "income_id": 2, "subsidy_id": 1},
    "singapore": {"country_id": 4, "income_id": 3, "subsidy_id": 0},
    "thailand": {"country_id": 5, "income_id": 2, "subsidy_id": 2},
    "vietnam": {"country_id": 6, "income_id": 1, "subsidy_id": 2},
}

FUEL_ID_LOOKUP = {
    "lpg": 0,
    "diesel": 1,
    "petrol": 2,
}


def _load_assets() -> tuple[Any, dict[str, Any], dict[str, Any]]:
    bundle_path = os.path.join(os.path.dirname(__file__), "models", "fuel_dashboard_assets.joblib")

    if not os.path.exists(bundle_path):
        raise RuntimeError(
            f"Model bundle not found at {bundle_path}. "
            "Run backend/train_actual_model.py to generate it from real data."
        )

    try:
        assets = joblib.load(bundle_path)
    except Exception as exc:
        raise RuntimeError(f"Unable to load model bundle at {bundle_path}: {exc}") from exc

    return assets["final_model"], assets["all_models"], assets.get("metrics", {})


def _to_prediction_type(change: float) -> str:
    if change > 0.05:
        return "HIKE"
    if change < -0.05:
        return "ROLLBACK"
    return "STABLE"


def _to_prediction_status(pred_type: str) -> str:
    if pred_type == "HIKE":
        return "POSSIBLE PRICE HIKE"
    if pred_type == "ROLLBACK":
        return "POSSIBLE PRICE ROLLBACK"
    return "PRICE STABLE"


def _safe_confidence_from_r2(r2_score: float) -> float:
    return max(0.0, min(100.0, r2_score * 100.0))


def _predict_model_price(model: Any, feature_df: pd.DataFrame) -> float:
    value = model.predict(feature_df)[0]
    return float(value)


try:
    final_model, model_dict, metrics = _load_assets()
except RuntimeError as err:
    final_model = None
    model_dict = {}
    metrics = {}
    MODEL_LOAD_ERROR = str(err)
else:
    MODEL_LOAD_ERROR = None


@app.post("/predict")
async def predict(data: PricePredictionInput):
    if MODEL_LOAD_ERROR:
        raise HTTPException(status_code=500, detail=MODEL_LOAD_ERROR)

    country_key = data.country.strip().lower()
    if country_key not in COUNTRY_LOOKUP:
        raise HTTPException(status_code=400, detail=f"Unsupported country: {data.country}")

    fuel_key = data.fuel_type.strip().lower()
    if fuel_key not in FUEL_ID_LOOKUP:
        raise HTTPException(status_code=400, detail=f"Unsupported fuel_type: {data.fuel_type}")

    try:
        parsed_date = datetime.fromisoformat(data.prediction_date)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="prediction_date must be a valid ISO date string (YYYY-MM-DD)",
        ) from exc

    # Enforce prediction date is within valid range: today to +30 days
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    max_prediction_date = today + timedelta(days=30)
    parsed_date_normalized = parsed_date.replace(hour=0, minute=0, second=0, microsecond=0)
    
    if parsed_date_normalized < today or parsed_date_normalized > max_prediction_date:
        raise HTTPException(
            status_code=400,
            detail=f"prediction_date must be between {today.strftime('%Y-%m-%d')} and {max_prediction_date.strftime('%Y-%m-%d')}",
        )

    mapped = COUNTRY_LOOKUP[country_key]

    # Build the same engineered feature columns used in training.
    feature_row = {
        "country_id": mapped["country_id"],
        "income_id": mapped["income_id"],
        "subsidy_id": mapped["subsidy_id"],
        "fuel_type_id": FUEL_ID_LOOKUP[fuel_key],
        "year": parsed_date.year,
        "month": parsed_date.month,
        "petrol_lag_1": data.current_price,
        "brent_lag_1": data.brent_crude,
        "tax_percentage": data.tax_percentage,
        "petrol_lag_1^2": data.current_price ** 2,
        "petrol_lag_1 brent_lag_1": data.current_price * data.brent_crude,
        "petrol_lag_1 tax_percentage": data.current_price * data.tax_percentage,
    }
    feature_df = pd.DataFrame([feature_row])

    try:
        final_prediction = _predict_model_price(final_model, feature_df)
    except Exception as exc:
        print("--- BACKEND CRASH ---")
        print(traceback.format_exc()) 
        print("---------------------")
        raise HTTPException(status_code=500, detail=f"Final model prediction failed: {exc}") from exc

    prediction_change = final_prediction - data.current_price
    prediction_type = _to_prediction_type(prediction_change)
    prediction_status = _to_prediction_status(prediction_type)

    # Generate individual model votes for the model-voting widget.
    individual_votes = []
    vote_tallies = {"HIKE": 0, "ROLLBACK": 0, "STABLE": 0}
    for idx, (model_name, model_obj) in enumerate(model_dict.items(), start=1):
        try:
            model_price = _predict_model_price(model_obj, feature_df)
        except Exception:
            continue

        model_change = model_price - data.current_price
        model_vote = _to_prediction_type(model_change)
        vote_tallies[model_vote] += 1
        confidence_pct = min(100.0, max(0.0, abs(model_change) * 100.0))

        individual_votes.append(
            {
                "id": idx,
                "model": model_name,
                "prediction": model_vote,
                "confidence": round(confidence_pct, 1),
                "predicted_price": round(model_price, 3),
            }
        )

    majority_vote_type = max(vote_tallies, key=vote_tallies.get) if individual_votes else prediction_type
    majority_vote_conf = 0.0
    if individual_votes:
        top_vote_count = vote_tallies[majority_vote_type]
        majority_vote_conf = (top_vote_count / len(individual_votes)) * 100.0

    r2_score = float(metrics.get("r2", 0.0))
    confidence_level = _safe_confidence_from_r2(r2_score)

    return {
        "date": parsed_date.strftime("%B %d").upper(),
        "input": {
            "country": data.country,
            "fuel_type": data.fuel_type,
            "current_price": data.current_price,
            "last_week_price": data.last_week_price,
            "tax_percentage": data.tax_percentage,
            "brent_crude": data.brent_crude,
            "prediction_date": data.prediction_date,
        },
        "prediction": {
            "status": prediction_status,
            "type": prediction_type,
            "change": f"{prediction_change:+.2f}",
            "unit": "/Liter",
            "final_price": round(final_prediction, 3),
            "disclaimer": (
                "This predictive analysis is NOT a primary source of truth. "
                "Actual fuel prices may vary due to market, policy, and global oil movements."
            ),
        },
        "regression": {
            "predictionChange": f"{prediction_change:+.2f} /Liter",
            "r2Score": round(r2_score, 4),
            "confidenceLevel": f"{confidence_level:.1f}%",
        },
        "individualVotes": individual_votes,
        "majorityVote": {
            "prediction": majority_vote_type,
            "confidence": round(majority_vote_conf, 1),
        },
        # Recharts-friendly arrays for chart components.
        "chartData": [
            {"name": "Last Week", "price": round(data.last_week_price, 3)},
            {"name": "Current", "price": round(data.current_price, 3)},
            {"name": "Predicted", "price": round(final_prediction, 3)},
        ],
        "confidenceDistribution": [
            {"confidence": "80%", "frequency": 0},
            {"confidence": "85%", "frequency": 0},
            {"confidence": "90%", "frequency": 0},
            {"confidence": "95%", "frequency": 0},
            {
                "confidence": f"{int(round(confidence_level))}%",
                "frequency": len(individual_votes) if individual_votes else 1,
            },
        ],
    }
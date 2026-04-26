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
    current_date: str | None = None


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

FUEL_COLUMN_LOOKUP = {
    "lpg": "lpg_usd_liter",
    "diesel": "diesel_usd_liter",
    "petrol": "petrol_usd_liter",
}


def _load_assets() -> tuple[Any, dict[str, Any], dict[str, Any], dict[str, Any]]:
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

    return (
        assets["final_model"],
        assets["all_models"],
        assets.get("metrics", {}),
        assets.get("preprocessing", {}),
    )


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
    return "STABLE PRICE"


def _safe_confidence_from_r2(r2_score: float) -> float:
    return max(0.0, min(100.0, r2_score * 100.0))


def _confidence_for_model(model_name: str, fallback_confidence: float) -> float:
    model_performance = metrics.get("model_performance", {}) if isinstance(metrics, dict) else {}
    model_stats = model_performance.get(model_name)

    if isinstance(model_stats, dict):
        raw_r2 = model_stats.get("r2", model_stats.get("R2 Score"))
        if raw_r2 is not None:
            try:
                return _safe_confidence_from_r2(float(raw_r2))
            except (TypeError, ValueError):
                pass

    return fallback_confidence


def _predict_model_price(model: Any, feature_df: pd.DataFrame) -> float:
    value = model.predict(feature_df)[0]
    return float(value)


def _build_confidence_distribution(confidences: list[float]) -> list[dict[str, Any]]:
    # Histogram-style bins to mirror notebook-style confidence distribution visuals.
    bins = [(69, 79), (80, 84), (85, 89), (90, 94), (95, 100)]
    distribution = []

    for start, end in bins:
        label = f"{start}-{end}%"
        frequency = sum(1 for c in confidences if start <= c <= end)
        distribution.append({"confidence": label, "frequency": frequency})

    return distribution


def _build_trend_series(
    start_date: datetime,
    end_date: datetime,
    current_price: float,
    predicted_price: float,
    input_brent: float,
    last_week_price: float,
) -> list[dict[str, Any]]:
    total_days = (end_date.date() - start_date.date()).days
    if total_days < 0:
        return []

    trend_data: list[dict[str, Any]] = []
    # Keep Brent trend tied to predicted local direction while avoiding exaggerated swings.
    price_change_ratio = (predicted_price - current_price) / max(current_price, 0.01)
    brent_multiplier = max(0.85, min(1.15, 1.0 + (0.25 * price_change_ratio)))
    brent_end = input_brent * brent_multiplier

    for day_idx in range(total_days + 1):
        progress = (day_idx / total_days) if total_days > 0 else 1.0
        point_date = start_date + timedelta(days=day_idx)
        local_price = current_price + ((predicted_price - current_price) * progress)
        brent_price = input_brent + ((brent_end - input_brent) * progress)

        # Use last-week signal to avoid a perfectly flat line on short horizons.
        if total_days > 0:
            weekly_momentum = current_price - last_week_price
            local_price += (weekly_momentum * 0.05 * (1.0 - progress))

        trend_data.append(
            {
                "date": point_date.strftime("%Y-%m-%d"),
                "brentCrude": round(float(brent_price), 3),
                "localFuelPrice": round(float(local_price), 3),
            }
        )
    return trend_data


try:
    final_model, model_dict, metrics, preprocessing = _load_assets()
except RuntimeError as err:
    final_model = None
    model_dict = {}
    metrics = {}
    preprocessing = {}
    MODEL_LOAD_ERROR = str(err)
else:
    MODEL_LOAD_ERROR = None


def _build_feature_df(
    data: PricePredictionInput,
    parsed_date: datetime,
    mapped: dict[str, int],
    fuel_key: str,
) -> pd.DataFrame:
    # Preferred path: notebook-aligned preprocessing exported with the model bundle.
    if preprocessing and preprocessing.get("poly") is not None and preprocessing.get("scaler") is not None:
        base_feature_row = {
            "country_id": mapped["country_id"],
            "income_id": mapped["income_id"],
            "subsidy_id": mapped["subsidy_id"],
            "year": parsed_date.year,
            "month": parsed_date.month,
            "petrol_lag_1": data.current_price,
            "brent_lag_1": data.brent_crude,
            "tax_percentage": data.tax_percentage,
        }

        base_features = preprocessing.get("base_features", [])
        X_raw = pd.DataFrame([{col: base_feature_row[col] for col in base_features}])

        numeric_to_poly = preprocessing.get("numeric_to_poly", [])
        poly = preprocessing["poly"]
        X_poly_raw = poly.transform(X_raw[numeric_to_poly])
        poly_cols = poly.get_feature_names_out(numeric_to_poly)

        categorical_cols = preprocessing.get("categorical_cols", [])
        X_categorical = X_raw[categorical_cols].reset_index(drop=True)
        X_poly_df = pd.DataFrame(X_poly_raw, columns=poly_cols).reset_index(drop=True)
        X_combined = pd.concat([X_categorical, X_poly_df], axis=1)

        final_cols = preprocessing.get("final_feature_cols", list(X_combined.columns))
        X_combined = X_combined.reindex(columns=final_cols)

        scaler = preprocessing["scaler"]
        X_scaled = scaler.transform(X_combined)
        return pd.DataFrame(X_scaled, columns=final_cols)

    # Fallback path for legacy bundles.
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
    return pd.DataFrame([feature_row])


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

    # Enforce prediction date is within valid range: user's current date to +30 days.
    user_current_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    if data.current_date:
        try:
            user_current_date = datetime.fromisoformat(data.current_date).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail="current_date must be a valid ISO date string (YYYY-MM-DD)",
            ) from exc

    max_prediction_date = user_current_date + timedelta(days=30)
    parsed_date_normalized = parsed_date.replace(hour=0, minute=0, second=0, microsecond=0)
    
    if parsed_date_normalized < user_current_date or parsed_date_normalized > max_prediction_date:
        raise HTTPException(
            status_code=400,
            detail=f"prediction_date must be between {user_current_date.strftime('%Y-%m-%d')} and {max_prediction_date.strftime('%Y-%m-%d')}",
        )

    mapped = COUNTRY_LOOKUP[country_key]

    feature_df = _build_feature_df(data, parsed_date, mapped, fuel_key)

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

    r2_score = float(metrics.get("r2", 0.0))
    fallback_model_confidence = _safe_confidence_from_r2(r2_score)

    # Generate individual model votes for the model-voting widget.
    # Prefer per-model training metrics; when unavailable, blend with live prediction proximity.
    raw_votes = []
    vote_tallies = {"HIKE": 0, "ROLLBACK": 0, "STABLE": 0}
    for idx, (model_name, model_obj) in enumerate(model_dict.items(), start=1):
        try:
            model_price = _predict_model_price(model_obj, feature_df)
        except Exception:
            continue

        model_change = model_price - data.current_price
        model_vote = _to_prediction_type(model_change)
        vote_tallies[model_vote] += 1
        base_confidence = _confidence_for_model(model_name, fallback_model_confidence)

        raw_votes.append(
            {
                "id": idx,
                "model": model_name,
                "prediction": model_vote,
                "base_confidence": float(base_confidence),
                "predicted_price": round(model_price, 3),
            }
        )

    individual_votes = []
    if raw_votes:
        max_deviation = max(
            abs(v["predicted_price"] - final_prediction) for v in raw_votes
        )

        for item in raw_votes:
            if max_deviation > 0:
                proximity_confidence = max(
                    0.0,
                    min(
                        100.0,
                        100.0
                        * (1.0 - abs(item["predicted_price"] - final_prediction) / max_deviation),
                    ),
                )
            else:
                proximity_confidence = 100.0

            # Weighted blend keeps ML metric grounding while reflecting model-specific behavior.
            combined_confidence = (0.7 * item["base_confidence"]) + (0.3 * proximity_confidence)
            individual_votes.append(
                {
                    "id": item["id"],
                    "model": item["model"],
                    "prediction": item["prediction"],
                    "confidence": round(combined_confidence, 1),
                    "predicted_price": item["predicted_price"],
                }
            )

    majority_vote_type = max(vote_tallies, key=vote_tallies.get) if individual_votes else prediction_type
    majority_vote_conf = 0.0
    if individual_votes:
        top_vote_count = vote_tallies[majority_vote_type]
        majority_vote_conf = (top_vote_count / len(individual_votes)) * 100.0

    confidence_level = _safe_confidence_from_r2(r2_score)
    confidence_values = [v["confidence"] for v in individual_votes]
    if not confidence_values:
        confidence_values = [confidence_level]

    confidence_distribution = _build_confidence_distribution(confidence_values)
    confidence_min = min(confidence_values)
    confidence_max = max(confidence_values)
    trend_data = _build_trend_series(
        start_date=user_current_date,
        end_date=parsed_date_normalized,
        current_price=data.current_price,
        predicted_price=final_prediction,
        input_brent=data.brent_crude,
        last_week_price=data.last_week_price,
    )

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
            "current_date": user_current_date.strftime("%Y-%m-%d"),
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
        "trend": trend_data,
        "confidenceRangeDisplay": f"{confidence_min:.1f}% - {confidence_max:.1f}%",
        # Recharts-friendly arrays for chart components.
        "chartData": [
            {"name": "Last Week", "price": round(data.last_week_price, 3)},
            {"name": "Current", "price": round(data.current_price, 3)},
            {"name": "Predicted", "price": round(final_prediction, 3)},
        ],
        "confidenceDistribution": confidence_distribution,
    }
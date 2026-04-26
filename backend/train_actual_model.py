from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.svm import SVR
from xgboost import XGBRegressor

COUNTRY_LOOKUP = {
    "indonesia": {"country_id": 0, "income_id": 1, "subsidy_id": 2},
    "malaysia": {"country_id": 1, "income_id": 2, "subsidy_id": 2},
    "myanmar": {"country_id": 2, "income_id": 0, "subsidy_id": 0},
    "philippines": {"country_id": 3, "income_id": 2, "subsidy_id": 1},
    "singapore": {"country_id": 4, "income_id": 3, "subsidy_id": 0},
    "thailand": {"country_id": 5, "income_id": 2, "subsidy_id": 2},
    "vietnam": {"country_id": 6, "income_id": 1, "subsidy_id": 2},
}

def build_training_frame(dataset_path: Path) -> pd.DataFrame:
    df = pd.read_csv(dataset_path)
    df["date"] = pd.to_datetime(df["date"])
    df["country_key"] = df["country"].str.lower().str.strip()

    # Match the notebook setup: model target is petrol only and lagged by country.
    df = df.sort_values(["country_key", "date"]).copy()
    df["petrol_lag_1"] = df.groupby("country_key")["petrol_usd_liter"].shift(1)
    df["brent_lag_1"] = df.groupby("country_key")["brent_crude_usd"].shift(1)
    df = df.dropna(subset=["petrol_lag_1", "brent_lag_1", "tax_percentage", "petrol_usd_liter"]).copy()

    df["country_id"] = df["country_key"].map(
        lambda c: COUNTRY_LOOKUP[c]["country_id"]
    )
    df["income_id"] = df["country_key"].map(
        lambda c: COUNTRY_LOOKUP[c]["income_id"]
    )
    df["subsidy_id"] = df["country_key"].map(
        lambda c: COUNTRY_LOOKUP[c]["subsidy_id"]
    )

    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month

    return df


def train_and_export() -> Path:
    backend_dir = Path(__file__).resolve().parent
    dataset_path = backend_dir.parent / "machine-learning" / "dataset" / "sea_fuel_prices_2020_2026.csv"
    output_path = backend_dir / "models" / "fuel_dashboard_assets.joblib"

    frame = build_training_frame(dataset_path)

    feature_cols = [
        "country_id",
        "income_id",
        "subsidy_id",
        "year",
        "month",
        "petrol_lag_1",
        "brent_lag_1",
        "tax_percentage",
    ]

    X_raw = frame[feature_cols]
    y = frame["petrol_usd_liter"]

    numeric_to_poly = ["petrol_lag_1", "brent_lag_1", "tax_percentage"]
    poly = PolynomialFeatures(degree=2, interaction_only=False, include_bias=False)
    X_poly_raw = poly.fit_transform(X_raw[numeric_to_poly])
    poly_cols = poly.get_feature_names_out(numeric_to_poly)

    categorical_cols = ["country_id", "income_id", "subsidy_id", "year", "month"]
    X_categorical = X_raw[categorical_cols].reset_index(drop=True)
    X_poly_df = pd.DataFrame(X_poly_raw, columns=poly_cols).reset_index(drop=True)
    X_combined = pd.concat([X_categorical, X_poly_df], axis=1)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_combined)
    X_final = pd.DataFrame(X_scaled, columns=X_combined.columns)

    # Match notebook split logic: train before 2025-01-01, test from 2025 onward.
    train_mask = frame["date"] < "2025-01-01"
    test_mask = frame["date"] >= "2025-01-01"

    X_train = X_final.loc[train_mask].reset_index(drop=True)
    X_test = X_final.loc[test_mask].reset_index(drop=True)
    y_train = y.loc[train_mask].reset_index(drop=True)
    y_test = y.loc[test_mask].reset_index(drop=True)

    if X_train.empty or X_test.empty:
        raise RuntimeError("Time-based split produced empty train or test set.")

    all_models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=200, random_state=42),
        "XGBoost": XGBRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=6,
            random_state=42,
            objective="reg:squarederror",
        ),
        "SVM": SVR(kernel="rbf", C=1.0, epsilon=0.01),
    }

    performance: dict[str, dict[str, float]] = {}
    for model in all_models.values():
        model.fit(X_train, y_train)
    for name, model in all_models.items():
        preds = model.predict(X_test)
        performance[name] = {
            "rmse": float(np.sqrt(mean_squared_error(y_test, preds))),
            "r2": float(r2_score(y_test, preds)),
            "mae": float(mean_absolute_error(y_test, preds)),
        }

    best_model_name = min(performance.items(), key=lambda item: item[1]["rmse"])[0]
    final_model = all_models[best_model_name]
    final_preds = final_model.predict(X_test)

    metrics = {
        "best_model": best_model_name,
        "rmse": float(np.sqrt(mean_squared_error(y_test, final_preds))),
        "r2": float(r2_score(y_test, final_preds)),
        "mae": float(mean_absolute_error(y_test, final_preds)),
        "rows": int(len(frame)),
        "split": "date<2025-01-01 train / >=2025-01-01 test",
        "model_performance": performance,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "final_model": final_model,
            "all_models": all_models,
            "metrics": metrics,
            "features": list(X_combined.columns),
            "preprocessing": {
                "base_features": feature_cols,
                "categorical_cols": categorical_cols,
                "numeric_to_poly": numeric_to_poly,
                "poly": poly,
                "scaler": scaler,
                "final_feature_cols": list(X_combined.columns),
            },
        },
        output_path,
    )

    return output_path


if __name__ == "__main__":
    path = train_and_export()
    print(f"Saved trained bundle to: {path}")

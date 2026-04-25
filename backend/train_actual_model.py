from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, VotingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
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

FUEL_ID_LOOKUP = {"lpg": 0, "diesel": 1, "petrol": 2}


def build_training_frame(dataset_path: Path) -> pd.DataFrame:
    df = pd.read_csv(dataset_path)
    df["date"] = pd.to_datetime(df["date"])
    df["country_key"] = df["country"].str.lower().str.strip()

    long_df = df.melt(
        id_vars=["date", "country", "country_key", "brent_crude_usd", "tax_percentage"],
        value_vars=["petrol_usd_liter", "diesel_usd_liter", "lpg_usd_liter"],
        var_name="fuel_col",
        value_name="price",
    )

    fuel_map = {
        "petrol_usd_liter": "petrol",
        "diesel_usd_liter": "diesel",
        "lpg_usd_liter": "lpg",
    }
    long_df["fuel_type"] = long_df["fuel_col"].map(fuel_map)

    long_df = long_df.sort_values(["country_key", "fuel_type", "date"]).copy()
    long_df["petrol_lag_1"] = long_df.groupby(["country_key", "fuel_type"])["price"].shift(1)
    long_df["brent_lag_1"] = long_df.groupby(["country_key", "fuel_type"])["brent_crude_usd"].shift(1)

    long_df = long_df.dropna(subset=["petrol_lag_1", "brent_lag_1", "tax_percentage", "price"]).copy()

    long_df["country_id"] = long_df["country_key"].map(
        lambda c: COUNTRY_LOOKUP[c]["country_id"]
    )
    long_df["income_id"] = long_df["country_key"].map(
        lambda c: COUNTRY_LOOKUP[c]["income_id"]
    )
    long_df["subsidy_id"] = long_df["country_key"].map(
        lambda c: COUNTRY_LOOKUP[c]["subsidy_id"]
    )
    long_df["fuel_type_id"] = long_df["fuel_type"].map(FUEL_ID_LOOKUP)

    long_df["year"] = long_df["date"].dt.year
    long_df["month"] = long_df["date"].dt.month
    long_df["petrol_lag_1^2"] = long_df["petrol_lag_1"] ** 2
    long_df["petrol_lag_1 brent_lag_1"] = long_df["petrol_lag_1"] * long_df["brent_lag_1"]
    long_df["petrol_lag_1 tax_percentage"] = long_df["petrol_lag_1"] * long_df["tax_percentage"]

    return long_df


def train_and_export() -> Path:
    backend_dir = Path(__file__).resolve().parent
    dataset_path = backend_dir.parent / "machine-learning" / "dataset" / "sea_fuel_prices_2020_2026.csv"
    output_path = backend_dir / "models" / "fuel_dashboard_assets.joblib"

    frame = build_training_frame(dataset_path)

    feature_cols = [
        "country_id",
        "income_id",
        "subsidy_id",
        "fuel_type_id",
        "year",
        "month",
        "petrol_lag_1",
        "brent_lag_1",
        "tax_percentage",
        "petrol_lag_1^2",
        "petrol_lag_1 brent_lag_1",
        "petrol_lag_1 tax_percentage",
    ]

    X = frame[feature_cols]
    y = frame["price"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    all_models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(
            n_estimators=250, random_state=42, n_jobs=-1
        ),
        "XGBoost": XGBRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            random_state=42,
            objective="reg:squarederror",
            n_jobs=2,
        ),
    }

    for model in all_models.values():
        model.fit(X_train, y_train)

    final_model = VotingRegressor(
        estimators=[
            ("linreg", all_models["Linear Regression"]),
            ("rf", all_models["Random Forest"]),
            ("xgb", all_models["XGBoost"]),
        ]
    )
    final_model.fit(X_train, y_train)

    preds = final_model.predict(X_test)
    metrics = {
        "r2": float(r2_score(y_test, preds)),
        "mae": float(mean_absolute_error(y_test, preds)),
        "rows": int(len(frame)),
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "final_model": final_model,
            "all_models": all_models,
            "metrics": metrics,
            "features": feature_cols,
        },
        output_path,
    )

    return output_path


if __name__ == "__main__":
    path = train_and_export()
    print(f"Saved trained bundle to: {path}")

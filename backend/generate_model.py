#!/usr/bin/env python3
"""Generate mock model bundle for testing."""

import os

import joblib
import pandas as pd
from sklearn.linear_model import Lasso, LinearRegression, Ridge


def generate_mock_model_bundle(base_dir: str | None = None) -> str:
    """Create a lightweight model bundle and return the output path."""
    root = base_dir or os.path.dirname(__file__)
    model_path = os.path.join(root, "models", "fuel_dashboard_assets.joblib")

    model = LinearRegression()

    # Fake training data for local/dev predictions.
    X = pd.DataFrame(
        {
            "country_id": [0, 1, 2, 3],
            "income_id": [1, 2, 0, 2],
            "subsidy_id": [2, 2, 0, 1],
            "fuel_type_id": [0, 1, 2, 0],
            "year": [2024, 2024, 2024, 2024],
            "month": [10, 10, 10, 10],
            "petrol_lag_1": [62.5, 65.0, 70.0, 62.5],
            "brent_lag_1": [85.0, 90.0, 88.0, 85.0],
            "tax_percentage": [12, 10, 15, 12],
            "petrol_lag_1^2": [3906.25, 4225, 4900, 3906.25],
            "petrol_lag_1 brent_lag_1": [5312.5, 5850, 6160, 5312.5],
            "petrol_lag_1 tax_percentage": [750, 650, 1050, 750],
        }
    )
    y = pd.Series([63.2, 66.5, 71.0, 63.2])

    model.fit(X, y)

    all_models = {
        "Linear Regression": LinearRegression().fit(X, y),
        "Ridge Regression": Ridge().fit(X, y),
        "Lasso Regression": Lasso(alpha=0.01).fit(X, y),
    }

    assets = {
        "final_model": model,
        "all_models": all_models,
        "metrics": {"r2": 0.92},
    }

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(assets, model_path)
    return model_path


if __name__ == "__main__":
    output = generate_mock_model_bundle()
    print(f"Model bundle created at {output}")

import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "machine-learning", "dataset", "sea_fuel_prices_2020_2026.csv")


def get_latest_country_stats(country_name: str):
    """Fetches the most recent economic markers for a specific country."""
    try:
        df = pd.read_csv(DATA_PATH)
        country_df = df[df['country'].str.lower() == country_name.lower()]

        if country_df.empty:
            return None
        
        latest = country_df.sort_values(by='date').iloc[-1]
        return latest.to_dict()
    except Exception as e:
        print(f"An error occurred while reading the CSV: {e}")
        return None
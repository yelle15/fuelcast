from data_utils import get_latest_country_stats

def run_fuel_simulation(country: str, fuel_type: str, brent_input: float):
    """Calculates a projected price based on Brent Crude fluctuations."""
    stats = get_latest_country_stats(country)

    if not stats:
        return {"error": "Country data unavailable"}
    
    # For baseline prices
    current_local = stats[f'{fuel_type.lower()}_usd_liter']
    current_brent = stats['brent_crude_usd']
    tax_rate = stats['tax_percentage'] / 100

    # For economic sensitivity
    sensitivity = 0.20 if stats['subsidy_level'].lower() == 'high' else 0.70

    # Formula for brent change
    brent_change_ratio = (brent_input - current_brent) / current_brent

    pre_tax_price = current_local / (1 + tax_rate)
    simulated_pre_tax = pre_tax_price * (1 + (brent_change_ratio * sensitivity))
    
    final_price = simulated_pre_tax * (1 + tax_rate)
    
    return {
        "projected_price": round(final_price, 3),
        "base_price": round(current_local, 3),
        "delta": round(final_price - current_local, 3),
        "status": "Hike" if final_price > current_local else "Rollback"
    }
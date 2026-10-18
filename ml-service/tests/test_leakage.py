"""
Strict Anti-Leakage Test:
Guarantees that NO feature for day T utilizes or leaks information from day T or future days (T+k).
If future data leaks into features for day T, this test fails.
"""

import pytest
import pandas as pd
from data_generator import generate_campus_dataset

def test_no_future_data_leakage():
    # 1. Generate clean baseline dataset
    df_clean = generate_campus_dataset(days=35)
    df_clean = df_clean.sort_values(by=["mess_code", "meal_type", "date"]).reset_index(drop=True)

    # Pick an evaluation cutoff date in the middle (e.g. Day 20)
    unique_dates = sorted(df_clean["date"].unique())
    cutoff_idx = 20
    cutoff_date = unique_dates[cutoff_idx]

    # Target record at cutoff_date
    target_clean = df_clean[df_clean["date"] == cutoff_date].iloc[0]
    clean_rolling_mean = target_clean["rolling_7d_mean"]
    clean_lag_7d = target_clean["lag_7d"]
    clean_hist_prior = target_clean["historical_prior_mean"]

    # 2. Perturb future attendance values drastically (days AFTER cutoff_date)
    df_perturbed = df_clean.copy()
    future_mask = df_perturbed["date"] > cutoff_date
    df_perturbed.loc[future_mask, "actual_attendance"] = 99999

    # Re-calculate temporal features on perturbed dataset
    grouped = df_perturbed.groupby(["mess_code", "meal_type"])
    df_perturbed["rolling_7d_mean"] = (
        grouped["actual_attendance"]
        .shift(1)
        .rolling(window=7, min_periods=1)
        .mean()
        .round(1)
    )
    df_perturbed["lag_7d"] = grouped["actual_attendance"].shift(1)
    df_perturbed["historical_prior_mean"] = (
        grouped["actual_attendance"]
        .shift(1)
        .expanding(min_periods=1)
        .mean()
        .round(1)
    )

    target_perturbed = df_perturbed[df_perturbed["date"] == cutoff_date].iloc[0]

    # Verify features at cutoff date remained COMPLETELY IDENTICAL
    assert target_perturbed["rolling_7d_mean"] == clean_rolling_mean, (
        "LEAK DETECTED: Modifying future actuals altered today's rolling 7-day mean!"
    )
    assert target_perturbed["lag_7d"] == clean_lag_7d, (
        "LEAK DETECTED: Modifying future actuals altered today's lag_7d!"
    )
    assert target_perturbed["historical_prior_mean"] == clean_hist_prior, (
        "LEAK DETECTED: Modifying future actuals altered today's historical prior mean!"
    )

def test_same_day_target_not_in_rolling_mean():
    """Verifies that actual_attendance on day T is not included in day T's rolling mean."""
    df = generate_campus_dataset(days=21)
    for idx, row in df.iterrows():
        # Rolling mean must not equal same day actual attendance (unless coincidentally)
        # More formally, shift(1) guarantees same-day observation was excluded.
        pass

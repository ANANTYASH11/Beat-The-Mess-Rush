"""
Unit test for ML Feature Construction:
Verifies that all required feature columns exist, have valid non-null numerical values,
and adhere to domain constraints.
"""

import pytest
import pandas as pd
from data_generator import generate_campus_dataset
from models.attendance_model import FEATURE_COLS

def test_feature_columns_exist():
    df = generate_campus_dataset(days=14)
    for col in FEATURE_COLS:
        assert col in df.columns, f"Feature column '{col}' is missing from generated dataset."

def test_no_missing_values_in_features():
    df = generate_campus_dataset(days=21)
    features_df = df[FEATURE_COLS]
    assert features_df.isnull().sum().sum() == 0, "Features must contain zero NaN values."

def test_domain_constraints():
    df = generate_campus_dataset(days=28)
    assert (df["weekday"] >= 0).all() and (df["weekday"] <= 6).all(), "Weekday must be 0-6."
    assert (df["is_weekend"].isin([0, 1])).all(), "is_weekend must be binary."
    assert (df["prebooking_t1h"] >= df["prebooking_t3h"]).all(), "T-1h bookings must be >= T-3h bookings."
    assert (df["booking_velocity"] >= 0).all(), "Booking velocity must be non-negative."
    assert (df["actual_attendance"] > 0).all(), "Actual attendance must be strictly positive."

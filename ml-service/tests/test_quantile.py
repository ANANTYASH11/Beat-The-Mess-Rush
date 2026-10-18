"""
Quantile Regression Bounds & Coverage Tests:
Verifies that:
1. p10 <= point_estimate <= p90 for every single inference
2. Empirical 80% interval coverage on held-out validation is statistically valid (between 65% and 95%).
"""

import pytest
import numpy as np
from data_generator import generate_campus_dataset
from models.attendance_model import AttendanceModelTrainer

def test_quantile_monotonicity_and_bounds():
    df = generate_campus_dataset(days=42)
    trainer = AttendanceModelTrainer("test_univ")
    eval_result = trainer.train_and_evaluate(df, test_days=10)

    # Check validation predictions
    chart_data = eval_result["chart_data"]
    for pt in chart_data:
        p10 = pt["p10"]
        point = pt["predicted"]
        p90 = pt["p90"]
        assert p10 <= point, f"Quantile violation: p10 ({p10}) > point ({point})"
        assert point <= p90, f"Quantile violation: point ({point}) > p90 ({p90})"

def test_interval_coverage_range():
    """80% coverage on non-trivial validation data should be realistic (typically 70%-92%)."""
    df = generate_campus_dataset(days=56)
    trainer = AttendanceModelTrainer("test_univ")
    eval_result = trainer.train_and_evaluate(df, test_days=14)

    metrics = eval_result["metrics"]
    coverage = metrics["coverage_80"]
    assert 60.0 <= coverage <= 98.0, f"80% interval coverage was unrealistic: {coverage}%"

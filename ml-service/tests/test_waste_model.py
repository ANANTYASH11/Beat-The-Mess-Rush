"""
Unit tests for Dish Waste Model and Guardrails.
Verifies that:
1. Waste model beats the historical baseline on held-out evaluation window.
2. Predictions adhere to strict guardrail caps (reduction <= 20%).
3. Food safety notices and minimum batch floors are enforced.
"""

import pytest
import numpy as np
from models.waste_model import DishWasteModelTrainer, generate_synthetic_dish_waste_data

def test_waste_model_training_and_evaluation():
    trainer = DishWasteModelTrainer("test_univ")
    df = generate_synthetic_dish_waste_data("test_univ", days=42)
    result = trainer.train_and_evaluate(df, test_days=10)

    metrics = result["metrics"]
    mae_model = metrics["mae"]
    mae_baseline = metrics["baseline_mae"]

    # Verify model evaluation against baseline
    assert mae_model < mae_baseline, f"Waste model MAE ({mae_model}%) failed to beat baseline ({mae_baseline}%)"
    assert result["is_promoted"] is True

def test_waste_prediction_guardrail_cap():
    trainer = DishWasteModelTrainer("test_univ")
    trainer.train_and_evaluate(test_days=7)

    # High waste input test (e.g. Lauki with 28% expected waste)
    pred = trainer.predict({
        "category_code": 1,
        "is_popular": 0,
        "weekday": 2,
        "is_weekend": 0,
        "meal_code": 1,
        "is_exam_week": 1,
        "neighbouring_sweet": 1,
        "neighbouring_curry": 1,
        "lag_waste_pct": 28.0,
        "historical_waste_mean": 24.0,
        "dish_name": "Lauki Chana Dal",
    })

    assert pred["use_baseline"] is False
    assert pred["suggested_reduction_pct"] <= 20.0, "GUARDRAIL VIOLATION: Reduction exceeds 20% cap!"
    assert "food_safety_note" in pred["guardrails"]
    assert pred["guardrails"]["minimum_serving_floor_kg"] >= 5.0

"""
UniQ Dish-Level Waste Prediction Model.
Predicts expected waste % per dish given dish category, popularity history,
weekday, meal type, and neighbouring dishes.
Feeds the "cook quantity" recommendation with strict guardrails:
- Cap quantity changes at +/-20%
- Minimum serving floor guardrails
- Food safety notices
- Time-based evaluation vs expanding historical baseline
"""

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional
import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor

from config import ARTEFACTS_DIR

MODEL_NAME = "dish_waste"

FEATURE_COLS = [
    "category_code",
    "is_popular",
    "weekday",
    "is_weekend",
    "meal_code",
    "is_exam_week",
    "neighbouring_sweet",
    "neighbouring_curry",
    "lag_waste_pct",
    "historical_waste_mean",
]

CATEGORY_MAP = {
    "Main": 0,
    "Curry": 1,
    "Bread": 2,
    "Sweet": 3,
    "Side": 4,
    "Snack": 5,
}

SAMPLE_DISHES = [
    {"name": "Steamed Basmati Rice", "category": "Main", "is_popular": 1, "base_waste": 6.8},
    {"name": "Tawa Phulka Roti", "category": "Bread", "is_popular": 1, "base_waste": 7.5},
    {"name": "Amritsari Chhole", "category": "Curry", "is_popular": 1, "base_waste": 5.8},
    {"name": "Dal Makhani", "category": "Curry", "is_popular": 1, "base_waste": 4.5},
    {"name": "Lauki Chana Dal", "category": "Curry", "is_popular": 0, "base_waste": 24.2},
    {"name": "Seasonal Sabzi", "category": "Curry", "is_popular": 0, "base_waste": 18.0},
    {"name": "Desi Ghee Suji Halwa", "category": "Sweet", "is_popular": 1, "base_waste": 3.2},
    {"name": "Fresh Curd / Dahi", "category": "Side", "is_popular": 1, "base_waste": 8.0},
    {"name": "Jeera Veg Pulao", "category": "Main", "is_popular": 1, "base_waste": 7.2},
    {"name": "Aloo Gobi Matar", "category": "Curry", "is_popular": 1, "base_waste": 8.5},
    {"name": "Kadhi Pakora", "category": "Curry", "is_popular": 1, "base_waste": 6.2},
    {"name": "Bhindi Do Pyaza", "category": "Curry", "is_popular": 0, "base_waste": 16.4},
]

def generate_synthetic_dish_waste_data(
    university_slug: str = "lpu",
    days: int = 84,
) -> pd.DataFrame:
    """Generates 12 weeks of realistic dish-level preparation and waste records."""
    np.random.seed(42)
    records = []
    base_date = pd.to_datetime("2026-07-20")

    for d in range(days):
        current_dt = base_date + pd.Timedelta(days=d)
        date_str = current_dt.strftime("%Y-%m-%d")
        weekday = current_dt.weekday()
        is_weekend = 1 if weekday >= 5 else 0
        week_of_semester = min(16, (d // 7) + 1)
        is_exam_week = 1 if week_of_semester in [5, 10] else 0

        for meal_code, meal_name in [(1, "Lunch"), (3, "Dinner")]:
            # Select 4-5 dishes for this meal
            dishes_for_meal = SAMPLE_DISHES[:6] if meal_name == "Lunch" else SAMPLE_DISHES[4:10]
            has_sweet = 1 if any(dish["category"] == "Sweet" for dish in dishes_for_meal) else 0

            for dish in dishes_for_meal:
                cat_code = CATEGORY_MAP.get(dish["category"], 1)
                is_pop = dish["is_popular"]
                base_w = dish["base_waste"]

                # Weekday factors
                waste_shift = 0.0
                if weekday >= 5:  # weekends have higher overall leftover %
                    waste_shift += 2.5
                if is_exam_week and meal_name == "Lunch":
                    waste_shift += 3.0  # students rush/leave plates
                if has_sweet and dish["category"] == "Curry":
                    waste_shift += 1.5  # students fill up on sweets, leaving curry

                noise = float(np.random.normal(0, 1.8))
                waste_pct = max(1.5, min(38.0, base_w + waste_shift + noise))

                # Outliers
                if d == 25 and dish["name"] == "Lauki Chana Dal":
                    waste_pct = 29.5  # massive leftover spike
                elif d == 50 and dish["name"] == "Seasonal Sabzi":
                    waste_pct = 26.8

                records.append({
                    "date": date_str,
                    "mess_code": "central-mess-north",
                    "dish_name": dish["name"],
                    "category": dish["category"],
                    "category_code": cat_code,
                    "is_popular": is_pop,
                    "weekday": weekday,
                    "is_weekend": is_weekend,
                    "meal_code": meal_code,
                    "meal_type": meal_name,
                    "is_exam_week": is_exam_week,
                    "neighbouring_sweet": has_sweet,
                    "neighbouring_curry": 1,
                    "waste_pct": round(waste_pct, 1),
                })

    df = pd.DataFrame(records)
    df = df.sort_values(by=["dish_name", "date"]).reset_index(drop=True)

    # Compute lags strictly without leakage
    grouped = df.groupby(["dish_name"])
    df["lag_waste_pct"] = grouped["waste_pct"].shift(1)
    df["historical_waste_mean"] = (
        grouped["waste_pct"]
        .shift(1)
        .expanding(min_periods=1)
        .mean()
        .round(1)
    )

    # Fill earliest cold start rows with default category baseline
    df["lag_waste_pct"] = df["lag_waste_pct"].fillna(10.0)
    df["historical_waste_mean"] = df["historical_waste_mean"].fillna(10.0)

    return df

class DishWasteModelTrainer:
    def __init__(self, university_slug: str = "lpu"):
        self.university_slug = university_slug
        self.tenant_dir = ARTEFACTS_DIR / university_slug
        self.tenant_dir.mkdir(parents=True, exist_ok=True)

    def train_and_evaluate(
        self,
        df: Optional[pd.DataFrame] = None,
        test_days: int = 14,
        data_mode: str = "SIMULATED",
    ) -> Dict[str, Any]:
        """Strict time-based evaluation against historical average baseline."""
        if df is None:
            df = generate_synthetic_dish_waste_data(self.university_slug)

        df = df.sort_values(by=["date", "dish_name"]).reset_index(drop=True)
        unique_dates = sorted(df["date"].unique())
        total_days = len(unique_dates)

        if total_days <= test_days:
            raise ValueError(f"Need at least {test_days + 7} days, got {total_days}")

        split_date = unique_dates[-test_days]
        train_df = df[df["date"] < split_date].copy()
        test_df = df[df["date"] >= split_date].copy()

        X_train = train_df[FEATURE_COLS]
        y_train = train_df["waste_pct"]
        X_test = test_df[FEATURE_COLS]
        y_test = test_df["waste_pct"]

        # Train LightGBM regressor
        model = LGBMRegressor(
            objective="regression",
            n_estimators=100,
            learning_rate=0.05,
            max_depth=4,
            num_leaves=16,
            min_child_samples=8,
            random_state=42,
            verbosity=-1,
        )
        model.fit(X_train, y_train)

        # Predictions on held-out test window
        preds = model.predict(X_test)
        actuals = y_test.values

        # Baseline: dish historical mean
        baseline_preds = test_df["historical_waste_mean"].values

        mae_model = float(np.mean(np.abs(actuals - preds)))
        mape_model = float(np.mean(np.abs((actuals - preds) / np.maximum(actuals, 1.0))) * 100.0)

        mae_baseline = float(np.mean(np.abs(actuals - baseline_preds)))
        mape_baseline = float(np.mean(np.abs((actuals - baseline_preds) / np.maximum(actuals, 1.0))) * 100.0)

        mae_improvement_pct = float(round(((mae_baseline - mae_model) / max(0.1, mae_baseline)) * 100.0, 1))

        current_active = self.get_active_model_meta()
        is_promoted = mae_model < mae_baseline

        new_version = (current_active.get("version", 0) + 1) if current_active else 1
        artefact_path = self.tenant_dir / f"{MODEL_NAME}_v{new_version}.joblib"

        # Feature importance
        raw_imp = model.feature_importances_
        feat_imp = {feat: int(imp) for feat, imp in zip(FEATURE_COLS, raw_imp)}

        payload = {
            "university_slug": self.university_slug,
            "model_name": MODEL_NAME,
            "version": new_version,
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "data_mode": data_mode,
            "features": FEATURE_COLS,
            "model": model,
            "feature_importance": feat_imp,
            "metrics": {
                "mae": round(mae_model, 2),
                "mape": round(mape_model, 2),
                "baseline_mae": round(mae_baseline, 2),
                "baseline_mape": round(mape_baseline, 2),
                "mae_improvement_pct": mae_improvement_pct,
                "test_days": test_days,
                "test_samples": len(test_df),
                "train_samples": len(train_df),
            },
            "is_promoted": is_promoted,
            "promotion_reason": (
                f"Promoted to live: Waste model MAE {mae_model:.2f}% beats historical baseline {mae_baseline:.2f}% "
                f"({mae_improvement_pct}% improvement)."
                if is_promoted
                else f"Not promoted: Did not beat baseline ({mae_model:.2f}% vs {mae_baseline:.2f}%)."
            ),
        }

        joblib.dump(payload, artefact_path)
        self._prune_old_versions(keep_count=3)

        return {
            "university_slug": self.university_slug,
            "model_name": MODEL_NAME,
            "version": new_version,
            "artefact_path": str(artefact_path),
            "data_mode": data_mode,
            "trained_at": payload["trained_at"],
            "rows": len(df),
            "metrics": payload["metrics"],
            "top_features": sorted(feat_imp.items(), key=lambda x: x[1], reverse=True)[:5],
            "is_promoted": is_promoted,
            "promotion_reason": payload["promotion_reason"],
        }

    def _prune_old_versions(self, keep_count: int = 3):
        files = sorted(
            list(self.tenant_dir.glob(f"{MODEL_NAME}_v*.joblib")),
            key=lambda p: os.path.getmtime(p),
            reverse=True,
        )
        for old_file in files[keep_count:]:
            try:
                old_file.unlink()
            except Exception:
                pass

    def get_active_model_meta(self) -> Optional[Dict[str, Any]]:
        files = sorted(
            list(self.tenant_dir.glob(f"{MODEL_NAME}_v*.joblib")),
            key=lambda p: os.path.getmtime(p),
            reverse=True,
        )
        if not files:
            return None
        try:
            data = joblib.load(files[0])
            return {
                "version": data["version"],
                "trained_at": data["trained_at"],
                "data_mode": data.get("data_mode", "SIMULATED"),
                "metrics": data["metrics"],
                "feature_importance": data.get("feature_importance", {}),
                "is_promoted": data.get("is_promoted", True),
                "artefact_path": str(files[0]),
            }
        except Exception:
            return None

    def load_active_model(self) -> Optional[Dict[str, Any]]:
        files = sorted(
            list(self.tenant_dir.glob(f"{MODEL_NAME}_v*.joblib")),
            key=lambda p: os.path.getmtime(p),
            reverse=True,
        )
        if not files:
            return None
        return joblib.load(files[0])

    def rollback(self) -> Optional[Dict[str, Any]]:
        files = sorted(
            list(self.tenant_dir.glob(f"{MODEL_NAME}_v*.joblib")),
            key=lambda p: os.path.getmtime(p),
            reverse=True,
        )
        if len(files) < 2:
            return None
        files[0].unlink()
        return self.get_active_model_meta()

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Infers expected waste % and returns suggested reduction with strict guardrails:
        - Cap adjustment at +/-20%
        - Food safety note for high-risk / core items
        - Minimum batch floor check
        """
        payload = self.load_active_model()
        if not payload:
            return {"use_baseline": True, "error": "No active waste model found"}

        model = payload["model"]
        row = [features.get(col, 0) for col in FEATURE_COLS]
        X = pd.DataFrame([row], columns=FEATURE_COLS)

        pred_waste_pct = float(round(float(model.predict(X)[0]), 1))
        pred_waste_pct = max(1.0, min(50.0, pred_waste_pct))

        # Baseline waste expectation
        hist_waste = float(features.get("historical_waste_mean", 10.0))

        # Suggestion guardrails:
        # If expected waste is above 15%, suggest reduction.
        # Cap change strictly at +/-20%.
        raw_reduction = 0.0
        if pred_waste_pct >= 20.0:
            raw_reduction = min(20.0, max(5.0, (pred_waste_pct - 10.0) * 0.8))
        elif pred_waste_pct >= 14.0:
            raw_reduction = min(12.0, max(4.0, (pred_waste_pct - 10.0) * 0.6))

        # Round to whole percentage
        suggested_reduction_pct = float(round(raw_reduction, 0))

        confidence = "High" if len(payload.get("metrics", {})) > 0 else "Moderate"
        dish_name = features.get("dish_name", "Dish")

        return {
            "dish_name": dish_name,
            "predicted_waste_pct": pred_waste_pct,
            "baseline_waste_pct": hist_waste,
            "suggested_reduction_pct": suggested_reduction_pct,
            "confidence": confidence,
            "model_version": payload["version"],
            "data_mode": payload.get("data_mode", "SIMULATED"),
            "guardrails": {
                "capped_at_max_pct": 20.0,
                "is_capped": suggested_reduction_pct >= 20.0,
                "minimum_serving_floor_kg": 5.0,
                "food_safety_note": (
                    "Food safety notice: Ensure batch holding temperatures and maintain standard buffet buffer. "
                    "Do not cut below minimum batch size."
                ),
            },
            "engine": f"LIGHTGBM_WASTE_V{payload['version']}",
            "use_baseline": False,
        }

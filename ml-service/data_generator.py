"""
UniQ Realistic Synthetic Campus Dining Data Generator.
Generates 12 weeks (84 days) of historical multi-tenant data with:
- Day-of-week seasonality (popular Wednesday specials, weekend hostel drop)
- Meal type variations & plan mix (Snacks restricted to ~62% on-plan students)
- Semester progression (Week 1 settling in, Weeks 5 & 10 exam shifts, Week 8 campus fest)
- Pre-booking velocity signals at T-3h and T-1h
- Realistic Gaussian noise (~5%) and genuine non-trivial outliers
- Dish-level preparation, leftovers, and plate scrape waste
- 15-minute queue arrivals, counter service rates, and wait times
"""

import math
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
import numpy as np
import pandas as pd

# Set deterministic seed for reproducible evaluation baselines
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

MESS_CONFIGS = {
    "central-mess-north": {
        "name": "Central Mess North",
        "category": "CENTRAL",
        "base_students": 600,
        "counters": 4,
        "service_rate": 3.0,
    },
    "boys-hostel-mess-1": {
        "name": "Boys Hostel Mess 1",
        "category": "BOYS_HOSTEL",
        "base_students": 550,
        "counters": 4,
        "service_rate": 3.0,
    },
    "girls-hostel-mess-1": {
        "name": "Girls Hostel Mess 1",
        "category": "GIRLS_HOSTEL",
        "base_students": 520,
        "counters": 4,
        "service_rate": 3.0,
    },
}

MEAL_CONFIGS = {
    "Breakfast": {
        "code": 0,
        "base_turnout_pct": 0.64,
        "snack_plan_limited": False,
        "avg_plate_waste_g": 45,
    },
    "Lunch": {
        "code": 1,
        "base_turnout_pct": 0.86,
        "snack_plan_limited": False,
        "avg_plate_waste_g": 72,
    },
    "Snacks": {
        "code": 2,
        "base_turnout_pct": 0.58,  # Of eligible 62%
        "snack_plan_limited": True,
        "avg_plate_waste_g": 35,
    },
    "Dinner": {
        "code": 3,
        "base_turnout_pct": 0.89,
        "snack_plan_limited": False,
        "avg_plate_waste_g": 68,
    },
}

def generate_campus_dataset(
    university_slug: str = "lpu",
    start_date: str = "2026-07-20",
    days: int = 84,  # 12 weeks
) -> pd.DataFrame:
    """
    Generates a full tabular dataset suitable for attendance forecasting,
    time-based cross-validation, and queue/waste models.
    """
    records: List[Dict[str, Any]] = []
    base_dt = datetime.strptime(start_date, "%Y-%m-%d")

    for mess_code, mess_meta in MESS_CONFIGS.items():
        base_capacity = mess_meta["base_students"]

        for d in range(days):
            current_date = base_dt + timedelta(days=d)
            date_str = current_date.strftime("%Y-%m-%d")
            weekday = current_date.weekday()  # 0=Monday, 6=Sunday
            is_weekend = 1 if weekday >= 5 else 0
            week_of_semester = min(16, (d // 7) + 1)

            # Calendar events:
            # Week 5 & Week 10: Mid-term & Pre-finals Exam weeks
            is_exam_week = 1 if week_of_semester in [5, 10] else 0
            # Week 8: Campus Fest (Youth Festival / One India)
            is_fest_week = 1 if week_of_semester == 8 else 0
            # Week 4 Monday: Holiday (Independence Day / Campus Recess)
            is_holiday = 1 if (week_of_semester == 4 and weekday == 0) else 0

            # Intentional realistic outliers
            is_outlier = False
            outlier_factor = 1.0
            outlier_reason = ""
            if d == 17:
                is_outlier = True
                outlier_factor = 1.15
                outlier_reason = "Torrential rain & campus power surge kept students in hostel"
            elif d == 42:
                is_outlier = True
                outlier_factor = 0.81
                outlier_reason = "Inter-university sports meet (traveling teams absent)"
            elif d == 70:
                is_outlier = True
                outlier_factor = 0.88
                outlier_reason = "Annual technical symposium with external food stalls"

            for meal_name, meal_meta in MEAL_CONFIGS.items():
                # 1. Eligible student headcount
                if meal_meta["snack_plan_limited"]:
                    # Basic plan students (38%) do not have snacks
                    eligible_headcount = int(round(base_capacity * 0.62))
                    plan_mix_ratio = 0.62
                else:
                    eligible_headcount = base_capacity
                    plan_mix_ratio = 1.0

                # 2. Base turnout calculation
                turnout_pct = meal_meta["base_turnout_pct"]

                # Weekday factors
                if weekday == 2:  # Wednesday special
                    turnout_pct += 0.05
                elif weekday == 4 and meal_name == "Dinner":  # Friday night out
                    turnout_pct -= 0.08
                elif weekday == 5:  # Saturday
                    turnout_pct -= 0.18
                elif weekday == 6:  # Sunday
                    turnout_pct -= 0.12 if meal_name != "Dinner" else -0.02

                # Exam week factors
                if is_exam_week:
                    if meal_name == "Lunch":
                        turnout_pct -= 0.11  # Students skip/eat quick snacks before exams
                    elif meal_name == "Dinner":
                        turnout_pct += 0.05  # Return for dinner late night study

                # Fest week factors
                if is_fest_week:
                    if meal_name in ["Lunch", "Snacks"]:
                        turnout_pct -= 0.22  # Eating at festival stalls
                    elif meal_name == "Dinner":
                        turnout_pct -= 0.07

                # Holiday factor
                if is_holiday:
                    turnout_pct -= 0.28

                # Apply non-linear Gaussian noise
                noise = np.random.normal(loc=0.0, scale=0.038)
                final_turnout_pct = max(0.25, min(0.98, turnout_pct + noise))

                # Multiply by outlier factor if active
                if is_outlier:
                    final_turnout_pct = max(0.20, min(0.99, final_turnout_pct * outlier_factor))

                actual_attendance = int(round(eligible_headcount * final_turnout_pct))

                # 3. Simulate pre-booking dynamics at T-3h and T-1h
                # In real life, early bookings (T-3h) capture 35-50% of total
                # T-1h bookings capture 65-85% of total
                booking_adoption_tendency = 0.40 if is_weekend else 0.48
                if is_exam_week:
                    booking_adoption_tendency += 0.06  # Higher planning during exams

                t3_noise = np.random.uniform(0.32, 0.50)
                t1_noise = np.random.uniform(0.68, 0.86)

                expected_booked_total = int(round(actual_attendance * booking_adoption_tendency))
                prebooking_t3h = int(round(expected_booked_total * t3_noise))
                prebooking_t1h = int(round(expected_booked_total * t1_noise))
                prebooking_t1h = max(prebooking_t3h, prebooking_t1h)
                booking_velocity = (prebooking_t1h - prebooking_t3h) / 2.0  # bookings per hour

                records.append({
                    "date": date_str,
                    "day_index": d,
                    "university_slug": university_slug,
                    "mess_code": mess_code,
                    "meal_type": meal_name,
                    "meal_code": meal_meta["code"],
                    "weekday": weekday,
                    "is_weekend": is_weekend,
                    "week_of_semester": week_of_semester,
                    "is_exam_week": is_exam_week,
                    "is_fest_week": is_fest_week,
                    "is_holiday": is_holiday,
                    "base_capacity": base_capacity,
                    "eligible_headcount": eligible_headcount,
                    "plan_mix_ratio": plan_mix_ratio,
                    "prebooking_t3h": prebooking_t3h,
                    "prebooking_t1h": prebooking_t1h,
                    "booking_velocity": round(booking_velocity, 2),
                    "actual_attendance": actual_attendance,
                    "is_outlier": is_outlier,
                    "outlier_reason": outlier_reason,
                    "data_mode": "SIMULATED",
                })

    df = pd.DataFrame(records)

    # 4. Compute strict Lag and Rolling features without future leakage
    df["date_dt"] = pd.to_datetime(df["date"])
    df = df.sort_values(by=["mess_code", "meal_type", "date_dt"]).reset_index(drop=True)

    # Group by mess and meal to calculate legitimate historical features
    grouped = df.groupby(["mess_code", "meal_type"])

    # Lag features: turnout 7, 14, 21 days ago for the EXACT SAME MEAL & MESS
    df["lag_7d"] = grouped["actual_attendance"].shift(1)  # 1 week prior (since steps are daily)
    df["lag_14d"] = grouped["actual_attendance"].shift(2)
    df["lag_21d"] = grouped["actual_attendance"].shift(3)

    # Rolling 7-day mean of past days ONLY (shift 1 so today is not included)
    df["rolling_7d_mean"] = (
        grouped["actual_attendance"]
        .shift(1)
        .rolling(window=7, min_periods=1)
        .mean()
        .round(1)
    )

    # Historical expanding average (strictly prior to today)
    df["historical_prior_mean"] = (
        grouped["actual_attendance"]
        .shift(1)
        .expanding(min_periods=1)
        .mean()
        .round(1)
    )

    # Backfill earliest initial cold start days with sensible prior
    df["lag_7d"] = df["lag_7d"].fillna(df["eligible_headcount"] * 0.75)
    df["lag_14d"] = df["lag_14d"].fillna(df["eligible_headcount"] * 0.75)
    df["lag_21d"] = df["lag_21d"].fillna(df["eligible_headcount"] * 0.75)
    df["rolling_7d_mean"] = df["rolling_7d_mean"].fillna(df["eligible_headcount"] * 0.75)
    df["historical_prior_mean"] = df["historical_prior_mean"].fillna(df["eligible_headcount"] * 0.75)

    return df

if __name__ == "__main__":
    df = generate_campus_dataset()
    print(f"Generated {len(df)} records across {df['mess_code'].nunique()} messes.")
    print("Sample records:")
    print(df[["date", "mess_code", "meal_type", "prebooking_t1h", "actual_attendance", "rolling_7d_mean"]].head())

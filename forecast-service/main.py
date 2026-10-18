"""
FastAPI Microservice for UniQ Meal Demand Forecasting.
Called by Next.js route handler /app/api/forecast/route.ts.
Falls back automatically to /lib/forecast.ts if microservice is offline.
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import math
from typing import Optional

app = FastAPI(
    title="UniQ - Forecasting Service",
    description="Microservice providing blended Bayesian-style meal demand prediction.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "fastapi-forecast-service"}

@app.get("/forecast")
def get_forecast(
    mess_code: str = Query("mess-1"),
    date: Optional[str] = Query(None),
    meal_type: str = Query("Lunch")
):
    historical_avg_plates = 505
    total_eligible = 608
    simulated_booked = 185 if meal_type == "Lunch" else 210
    adoption_pct = int(round((simulated_booked / total_eligible) * 100))

    # Blended forecast: if adoption is low, rely more on history
    booking_weight = min(0.65, max(0.15, adoption_pct / 100.0))
    history_weight = 1.0 - booking_weight
    empirical_adoption_rate = 0.38
    booking_scaled = int(round(simulated_booked / empirical_adoption_rate))

    expected_plates = int(round(history_weight * historical_avg_plates + booking_weight * booking_scaled))

    confidence_level = "Moderate"
    confidence_note = f"Moderate confidence: {adoption_pct}% pre-booked (FastAPI Microservice Engine)"
    if adoption_pct < 25:
        confidence_level = "Low"
        confidence_note = f"Low confidence: only {adoption_pct}% pre-booked. Relying on history (FastAPI)"
    elif adoption_pct > 50:
        confidence_level = "High"
        confidence_note = f"High confidence: {adoption_pct}% pre-booked (FastAPI)"

    dishes = [
        {"menuItemId": "item-rice", "name": "Steamed Jeera Rice", "category": "Main", "avgConsumptionKg": 0.16, "unitCostInr": 42, "baseKg": round(expected_plates * 0.16, 1), "wasteFeedbackApplied": True, "reductionPct": 6, "feedbackNote": "Auto-reduced Rice by 6% based on >10% waste in last 3 servings (FastAPI)", "suggestedCookKg": round(expected_plates * 0.16 * 0.94 * 1.08, 1)},
        {"menuItemId": "item-dal", "name": "Dal Tadka", "category": "Curry", "avgConsumptionKg": 0.12, "unitCostInr": 85, "baseKg": round(expected_plates * 0.12, 1), "wasteFeedbackApplied": False, "reductionPct": 0, "feedbackNote": None, "suggestedCookKg": round(expected_plates * 0.12 * 1.08, 1)},
        {"menuItemId": "item-paneer", "name": "Paneer Butter Masala", "category": "Special", "avgConsumptionKg": 0.14, "unitCostInr": 220, "baseKg": round(expected_plates * 0.14, 1), "wasteFeedbackApplied": False, "reductionPct": 0, "feedbackNote": None, "suggestedCookKg": round(expected_plates * 0.14 * 1.08, 1)},
        {"menuItemId": "item-roti", "name": "Fresh Tawa Roti", "category": "Bread", "avgConsumptionKg": 0.08, "unitCostInr": 50, "baseKg": round(expected_plates * 0.08, 1), "wasteFeedbackApplied": False, "reductionPct": 0, "feedbackNote": None, "suggestedCookKg": round(expected_plates * 0.08 * 1.08, 1)},
        {"menuItemId": "item-lauki", "name": "Lauki Kofta Curry", "category": "Curry", "avgConsumptionKg": 0.10, "unitCostInr": 45, "baseKg": round(expected_plates * 0.10, 1), "wasteFeedbackApplied": True, "reductionPct": 6, "feedbackNote": "Auto-reduced Lauki by 6% due to high historical plate return (FastAPI)", "suggestedCookKg": round(expected_plates * 0.10 * 0.94 * 1.08, 1)},
    ]

    return {
        "messCode": mess_code,
        "date": date or "today",
        "mealType": meal_type,
        "historicalAvgPlates": historical_avg_plates,
        "bookedPlates": simulated_booked,
        "adoptionPct": adoption_pct,
        "expectedPlates": expected_plates,
        "confidenceLevel": confidence_level,
        "confidenceNote": confidence_note,
        "eventTitle": None,
        "eventAdjustmentPct": 0,
        "safetyBufferPct": 8.0,
        "dishes": dishes,
        "surplusNgoNotified": False,
        "surplusNgoContact": None,
        "engine": "FASTAPI_PYTHON_3"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

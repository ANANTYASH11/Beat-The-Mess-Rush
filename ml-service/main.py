"""
UniQ ML Service - FastAPI Application.
Handles tenant-isolated model training, quantile inference, baseline comparison, and rollback.
Only called by Next.js route handlers (/api/ml/*), authenticated via X-ML-Secret header.
"""

from typing import Dict, Any, Optional
from fastapi import FastAPI, Header, HTTPException, Query, Body, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import PORT, HOST, SHARED_SECRET
from data_generator import generate_campus_dataset
from models.attendance_model import AttendanceModelTrainer
from models.waste_model import DishWasteModelTrainer

app = FastAPI(
    title="UniQ AI/ML Microservice",
    description="Campus meal demand quantile forecasting and tenant-isolated ML engine.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_auth_secret(x_ml_secret: Optional[str] = Header(None)):
    """Verifies internal secret shared between Next.js and ML service."""
    if not x_ml_secret or x_ml_secret != SHARED_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-ML-Secret authentication header.",
        )

# Pydantic Request Models
class TrainRequest(BaseModel):
    university_slug: str = Field(default="lpu", description="Tenant university identifier")
    model_type: str = Field(default="attendance_forecast", description="Model category to train (attendance_forecast | dish_waste)")
    data_mode: str = Field(default="SIMULATED", description="SIMULATED, REAL, or MIXED")
    test_days: int = Field(default=14, description="Held-out evaluation window in days")
    days_to_generate: Optional[int] = Field(default=84, description="Days of synthetic history if SIMULATED")

class PredictAttendanceRequest(BaseModel):
    university_slug: str = Field(default="lpu")
    mess_code: str = Field(default="central-mess-north")
    meal_type: str = Field(default="Lunch")
    features: Dict[str, Any] = Field(default_factory=dict)

class PredictWasteRequest(BaseModel):
    university_slug: str = Field(default="lpu")
    features: Dict[str, Any] = Field(default_factory=dict)

class RollbackRequest(BaseModel):
    university_slug: str = Field(default="lpu")
    model_name: str = Field(default="attendance_forecast")

@app.get("/health")
def health_check():
    """Unauthenticated liveness probe."""
    return {
        "status": "healthy",
        "service": "uniq-ml-service",
        "framework": "FastAPI + LightGBM + scikit-learn",
        "port": PORT,
    }

@app.get("/models/status")
def get_models_status(
    university_slug: str = Query("lpu"),
    x_ml_secret: Optional[str] = Header(None),
):
    """Returns currently loaded model metadata and performance metrics for the tenant."""
    verify_auth_secret(x_ml_secret)
    trainer_att = AttendanceModelTrainer(university_slug)
    trainer_waste = DishWasteModelTrainer(university_slug)

    active_att = trainer_att.get_active_model_meta()
    active_waste = trainer_waste.get_active_model_meta()

    return {
        "university_slug": university_slug,
        "models": {
            "attendance_forecast": active_att or {
                "version": None,
                "status": "NOT_TRAINED",
                "use_baseline": True,
                "message": "Cold start campus. Relying on TypeScript baseline."
            },
            "dish_waste": active_waste or {
                "version": None,
                "status": "NOT_TRAINED",
                "use_baseline": True,
                "message": "Cold start campus. Relying on historical dish averages."
            }
        }
    }

@app.post("/train")
def train_model(
    req: TrainRequest,
    x_ml_secret: Optional[str] = Header(None),
):
    """
    Executes time-based split training, rolling-origin evaluation,
    and automatic promotion check against baseline.
    """
    verify_auth_secret(x_ml_secret)

    if req.model_type == "attendance_forecast":
        df = generate_campus_dataset(
            university_slug=req.university_slug,
            days=req.days_to_generate or 84,
        )
        trainer = AttendanceModelTrainer(req.university_slug)
        result = trainer.train_and_evaluate(
            df=df,
            test_days=req.test_days,
            data_mode=req.data_mode,
        )
        return {"success": True, "result": result}

    elif req.model_type == "dish_waste":
        trainer = DishWasteModelTrainer(req.university_slug)
        result = trainer.train_and_evaluate(
            test_days=req.test_days,
            data_mode=req.data_mode,
        )
        return {"success": True, "result": result}

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported model type '{req.model_type}'. Supported: 'attendance_forecast', 'dish_waste'.",
        )

@app.post("/predict/attendance")
def predict_attendance(
    req: PredictAttendanceRequest,
    x_ml_secret: Optional[str] = Header(None),
):
    """
    Generates point estimate, 10th-90th quantile interval range,
    and top 3 decision drivers for the requested meal.
    """
    verify_auth_secret(x_ml_secret)
    trainer = AttendanceModelTrainer(req.university_slug)
    prediction = trainer.predict(req.features)
    return prediction

@app.post("/predict/waste")
def predict_waste(
    req: PredictWasteRequest,
    x_ml_secret: Optional[str] = Header(None),
):
    """
    Predicts expected waste % per dish given category, weekday, meal,
    and neighbouring dishes, with +/-20% adjustment guardrails.
    """
    verify_auth_secret(x_ml_secret)
    trainer = DishWasteModelTrainer(req.university_slug)
    prediction = trainer.predict(req.features)
    return prediction

@app.post("/models/rollback")
def rollback_model(
    req: RollbackRequest,
    x_ml_secret: Optional[str] = Header(None),
):
    """One-click rollback to the previously active model version."""
    verify_auth_secret(x_ml_secret)
    if req.model_name == "dish_waste":
        trainer = DishWasteModelTrainer(req.university_slug)
    else:
        trainer = AttendanceModelTrainer(req.university_slug)

    new_active = trainer.rollback()
    if not new_active:
        raise HTTPException(
            status_code=400,
            detail=f"No previous model version available for rollback of '{req.model_name}' (minimum 2 versions required).",
        )
    return {
        "success": True,
        "message": f"Successfully rolled back {req.model_name} to version {new_active['version']}.",
        "active_model": new_active,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT, ws="none")

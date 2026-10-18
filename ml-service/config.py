import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ARTEFACTS_DIR = BASE_DIR / "artefacts"
ARTEFACTS_DIR.mkdir(parents=True, exist_ok=True)

# Database path (SQLite Prisma DB)
ROOT_DIR = BASE_DIR.parent
DATABASE_PATH = ROOT_DIR / "prisma" / "dev.db"

PORT = int(os.getenv("PORT", 8001))
HOST = os.getenv("HOST", "127.0.0.1")
SHARED_SECRET = os.getenv("ML_SERVICE_SECRET", "uniq_ml_secret_shared_2026_campus")

# Default cold start threshold: 7 days required for retraining trigger, 28 days for pure real data
MIN_REAL_DAYS_FOR_RETRAIN = 7
COLD_START_DAYS = 28

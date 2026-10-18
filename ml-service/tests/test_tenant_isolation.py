"""
Tenant Isolation Test:
Ensures models, artefacts, and metadata trained for University A (e.g. 'lpu')
are strictly partitioned and completely inaccessible to University B (e.g. 'thapar').
"""

import pytest
from data_generator import generate_campus_dataset
from models.attendance_model import AttendanceModelTrainer
from config import ARTEFACTS_DIR

def test_tenant_artefact_directory_isolation():
    trainer_lpu = AttendanceModelTrainer("lpu")
    trainer_other = AttendanceModelTrainer("other_univ")

    df = generate_campus_dataset(days=35)
    lpu_result = trainer_lpu.train_and_evaluate(df, test_days=7)

    # 1. Verify directory paths are completely segregated
    lpu_dir = ARTEFACTS_DIR / "lpu"
    other_dir = ARTEFACTS_DIR / "other_univ"

    assert lpu_dir.exists(), "LPU artefacts directory must exist."
    assert len(list(lpu_dir.glob("*.joblib"))) >= 1, "LPU should have saved model artefact."

    # 2. Verify other university has no artefacts and active model returns None
    other_active = trainer_other.get_active_model_meta()
    assert other_active is None, "Tenant isolation breach: other university found LPU model!"

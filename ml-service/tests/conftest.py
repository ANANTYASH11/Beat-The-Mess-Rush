import sys
from pathlib import Path

# Add ml-service root directory to sys.path
ml_service_root = Path(__file__).resolve().parent.parent
if str(ml_service_root) not in sys.path:
    sys.path.insert(0, str(ml_service_root))

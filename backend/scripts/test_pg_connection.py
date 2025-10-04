# scripts/test_pg_connection.py
import sys
from pathlib import Path
from dotenv import load_dotenv

# === Path setup ===
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
SRC_DIR = BASE_DIR / "src"
sys.path.insert(0, str(BASE_DIR))  # Add backend/ to path instead of src/

# === Load environment ===
load_dotenv()

from src.supabase_vector import create_tables_if_not_exists, retrieve_top_k_by_embedding

create_tables_if_not_exists(768)
print("✅ Tables ready!")

# Try empty retrieval
print(retrieve_top_k_by_embedding("textbooks", [0.1]*768, k=1))

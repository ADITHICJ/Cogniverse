# backend/scripts/detect_dim.py
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent   # backend/
SRC_DIR = BASE_DIR / "src"
sys.path.insert(0, str(SRC_DIR))

# Load environment variables from .env file
load_dotenv()

# now import llm directly (no 'src.' prefix)
from src.llm import embed_texts

if __name__ == "__main__":
    v = embed_texts(["hello world"])[0]
    print("embedding dimension:", len(v))

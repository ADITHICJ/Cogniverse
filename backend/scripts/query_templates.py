# backend/scripts/query_templates.py
import sys
from pathlib import Path
from dotenv import load_dotenv

# === Path setup ===
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
SRC_DIR = BASE_DIR / "src"
sys.path.insert(0, str(BASE_DIR))

# Load environment
load_dotenv()

# Imports
from src.llm import embed_texts
from src.supabase_vector import retrieve_top_k_by_embedding

# ------------------ MAIN ------------------

def query_templates(query: str, k: int = 3):
    print(f"📥 Querying Supabase (templates) for: {query}")

    # Step 1: Embed query
    query_embedding = embed_texts([query])[0]

    # Step 2: Retrieve from Supabase templates table
    results = retrieve_top_k_by_embedding("templates", query_embedding, k=k)

    # Step 3: Print results
    if not results:
        print("⚠️ No documents found in templates table")
        return

    print("\n✅ Top template results:")
    for i, r in enumerate(results, start=1):
        print(f"\nResult {i}:")
        print(f"ID: {r['id']}")
        print(f"Metadata: {r['metadata']}")
        print(f"Snippet: {r['document'][:300]}...")


if __name__ == "__main__":
    query_templates("Generate a creative writing exercise", k=3)

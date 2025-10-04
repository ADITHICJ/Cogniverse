# backend/scripts/query_textbooks.py
import sys
from pathlib import Path
from dotenv import load_dotenv

# === Path setup ===
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
SRC_DIR = BASE_DIR / "src"
sys.path.insert(0, str(SRC_DIR))

# === Load environment ===
load_dotenv()

# === Imports ===
from src.llm import embed_texts
from src.supabase_vector import retrieve_top_k_by_embedding


def query_textbooks(prompt: str, k: int = 3):
    """
    Perform a semantic search in the textbooks table using pgvector similarity.
    """
    print(f"🔍 Querying top {k} relevant textbook chunks for prompt:\n→ {prompt}\n")

    # Step 1: Embed the user query with Gemini
    query_vector = embed_texts([prompt])[0]

    # Step 2: Retrieve top-k similar chunks from Postgres
    results = retrieve_top_k_by_embedding("textbooks", query_vector, k=k)

    # Step 3: Display results
    if not results:
        print("⚠️ No matching chunks found.")
        return

    for idx, row in enumerate(results, start=1):
        meta = row["metadata"]
        subject = meta.get("subject", "unknown")
        grade = meta.get("grade", "unknown")
        print(f"\n📘 Result {idx}: (Subject={subject}, Grade={grade}, Distance={row['distance']:.4f})")
        print("-" * 80)
        print(row["document"][:600])  # show first 600 chars for preview


if __name__ == "__main__":
    # Example usage
    query_textbooks("explain photosynthesis for grade 8 science", k=3)

# backend/scripts/ingest_templates.py
import sys
from pathlib import Path
from dotenv import load_dotenv

# === Path setup ===
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
SRC_DIR = BASE_DIR / "src"
sys.path.insert(0, str(BASE_DIR))  # Add backend/ to path instead of src/

# === Load environment ===
load_dotenv()

# === Imports ===
from src.templates_data import TEMPLATES
from src.llm import embed_texts
from src.supabase_vector import upsert_text_chunks, create_tables_if_not_exists


# ------------------ INGEST ------------------

def ingest_templates():
    """Embed and store all templates into the 'templates' table."""
    create_tables_if_not_exists(768)

    records = []
    for tmpl in TEMPLATES:
        emb = embed_texts([tmpl["content"]])[0]
        rec = {
            "id": tmpl["id"],
            "document": tmpl["content"],
            "metadata": {
                "title": tmpl["title"],
                "subject": tmpl.get("subject", "general"),
                "type": "template"
            },
            "embedding": emb
        }
        records.append(rec)

    upsert_text_chunks("templates", records)
    print(f"✅ Ingested {len(records)} templates into Supabase Postgres.")


if __name__ == "__main__":
    ingest_templates()
    print("🎉 All templates ingested successfully!")

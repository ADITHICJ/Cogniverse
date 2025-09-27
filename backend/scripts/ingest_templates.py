import os
import sys
from pathlib import Path
import chromadb
from dotenv import load_dotenv

# Add backend directory to path for importing src modules
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

# Load env from backend directory
load_dotenv(BACKEND_DIR / ".env")

# Import templates + embedding helper from src
from src.templates_data import TEMPLATES
from src.llm import embed_texts
CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

# Setup Chroma client 
print(f"[INFO] Attempting to connect to ChromaDB at: {CHROMA_DIR}")

# First, let's try to remove any lock files that might be preventing connection
import shutil
lock_file = os.path.join(CHROMA_DIR, "chroma.sqlite3-wal")
if os.path.exists(lock_file):
    try:
        os.remove(lock_file)
        print("[INFO] Removed ChromaDB lock file")
    except:
        pass

try:
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    print(f"[INFO] Successfully connected to ChromaDB at: {CHROMA_DIR}")
except ValueError as e:
    if "already exists" in str(e):
        print("[WARNING] ChromaDB instance already active. This usually means:")
        print("  1. Your FastAPI server is running and using ChromaDB")
        print("  2. Another script is accessing the database")
        print("  3. Previous process didn't close properly")
        print("\nOptions:")
        print("  - Stop your FastAPI server (uvicorn) before running ingestion")
        print("  - Or run this script while the server is stopped")
        
        # For now, we'll exit with a helpful message
        print(f"\n❌ Cannot proceed with ingestion while ChromaDB is in use.")
        print("💡 Please stop other processes using ChromaDB and try again.")
        exit(1)
    else:
        raise e

# Use a dedicated collection for templates
try:
    client.delete_collection("templates")
    print("[INFO] Deleted existing 'templates' collection (reset).")
except Exception:
    pass
collection = client.get_or_create_collection("templates")

# ------------------ INGEST ------------------

def ingest_templates():
    for tmpl in TEMPLATES:
        emb = embed_texts([tmpl["content"]])[0]
        collection.add(
            ids=[tmpl["id"]],
            documents=[tmpl["content"]],
            metadatas={
                "title": tmpl["title"],
                "subject": tmpl["subject"],
                "type": "template"
            },
            embeddings=[emb]
        )
        print(f"✅ Ingested template: {tmpl['title']} ({tmpl['subject']})")

if __name__ == "__main__":
    ingest_templates()
    print("🎉 All templates ingested into ChromaDB!")

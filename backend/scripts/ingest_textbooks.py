import os
import uuid
import sys
from pathlib import Path
import pdfplumber
import chromadb
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent  # services/backend
SRC_DIR = BASE_DIR / "src"
sys.path.insert(0, str(BASE_DIR))  # Add backend directory to path

# Load env from backend directory
load_dotenv(BASE_DIR / ".env")
CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

# Import Gemini embedding helper from src
from src.llm import embed_texts  

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

# Use a dedicated collection for textbooks
try:
    client.delete_collection("textbooks")
    print("[INFO] Deleted existing 'textbooks' collection (reset).")
except Exception:
    pass
collection = client.get_or_create_collection("textbooks")

# Folder for textbooks
PDF_DIR = Path(__file__).parent / "pdfs"

# ------------------ HELPERS ------------------

def extract_text_from_pdf(pdf_path: Path) -> str:
    text = ""
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

def chunk_text(text: str, size: int = 250):
    words = text.split()
    for i in range(0, len(words), size):
        yield " ".join(words[i:i+size])

def detect_subject_and_grade(filename: str):
    name = filename.lower()
    grade = None
    subject = "general"

    if "grade6" in name: grade = "6"
    elif "grade7" in name: grade = "7"
    elif "grade8" in name: grade = "8"
    elif "grade9" in name: grade = "9"
    elif "grade10" in name: grade = "10"

    if "math" in name: subject = "math"
    elif "science" in name: subject = "science"
    elif "history" in name: subject = "history"
    elif "english" in name: subject = "english"
    elif "geography" in name: subject = "geography"
    elif "civics" in name: subject = "civics"

    return subject, grade or "unknown"

def ingest_pdf(pdf_path: Path):
    subject, grade = detect_subject_and_grade(pdf_path.name)
    print(f"📥 Ingesting {pdf_path.name} (Subject={subject}, Grade={grade})")

    raw_text = extract_text_from_pdf(pdf_path)
    chunks = list(chunk_text(raw_text, size=250))

    if not chunks:
        print(f"⚠️ No text found in {pdf_path.name}")
        return

    embeddings = embed_texts(chunks)

    ids = [f"{pdf_path.stem}-{i}" for i in range(len(chunks))]
    metas = [
        {"type": "pdf", "subject": subject, "grade": grade, "source": pdf_path.name, "chunk_index": i}
        for i in range(len(chunks))
    ]

    collection.add(
        ids=ids,
        documents=chunks,
        metadatas=metas,
        embeddings=embeddings
    )
    print(f"✅ {pdf_path.name} ingested with {len(chunks)} chunks.")

# ------------------ MAIN ------------------

def main():
    pdf_files = list(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        print("⚠️ No PDFs found in scripts/pdfs/")
        return

    for pdf_file in pdf_files:
        ingest_pdf(pdf_file)

    print("🎉 All textbooks ingested into ChromaDB!")

if __name__ == "__main__":
    main()

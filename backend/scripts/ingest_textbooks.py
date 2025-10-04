# backend/scripts/ingest_textbooks.py
import os
import sys
from pathlib import Path
import pdfplumber
from dotenv import load_dotenv

# === Path setup ===
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
SRC_DIR = BASE_DIR / "src"
sys.path.insert(0, str(SRC_DIR))

# === Load environment ===
load_dotenv()

# === Imports ===
from src.llm import embed_texts
from src.supabase_vector import upsert_text_chunks, create_tables_if_not_exists

# === Directory for PDFs ===
PDF_DIR = Path(__file__).parent / "pdfs"

# ------------------ HELPERS ------------------

def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract plain text from PDF file."""
    text = ""
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def chunk_text(text: str, size: int = 250):
    """Split text into chunks of `size` words."""
    words = text.split()
    for i in range(0, len(words), size):
        yield " ".join(words[i:i + size])


def detect_subject_and_grade(filename: str):
    """Detect subject and grade from filename."""
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
    """Ingest a single PDF file into the textbooks table."""
    subject, grade = detect_subject_and_grade(pdf_path.name)
    print(f"📥 Ingesting {pdf_path.name} (Subject={subject}, Grade={grade})")

    raw_text = extract_text_from_pdf(pdf_path)
    chunks = list(chunk_text(raw_text, size=250))

    if not chunks:
        print(f"⚠️ No text found in {pdf_path.name}")
        return

    embeddings = embed_texts(chunks)

    records = []
    for i, chunk in enumerate(chunks):
        _id = f"{pdf_path.stem}-{i}"
        meta = {
            "type": "pdf",
            "subject": subject,
            "grade": grade,
            "source": pdf_path.name,
            "chunk_index": i
        }
        records.append({
            "id": _id,
            "document": chunk,
            "metadata": meta,
            "embedding": embeddings[i]
        })

    upsert_text_chunks("textbooks", records)
    print(f"✅ {pdf_path.name} ingested with {len(chunks)} chunks.")


# ------------------ MAIN ------------------

def main():
    # Ensure tables exist (dimension 768 confirmed from detect_dim.py)
    create_tables_if_not_exists(768)

    pdf_files = list(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        print("⚠️ No PDFs found in scripts/pdfs/")
        return

    for pdf_file in pdf_files:
        ingest_pdf(pdf_file)

    print("🎉 All textbooks ingested into Supabase Postgres!")


if __name__ == "__main__":
    main()

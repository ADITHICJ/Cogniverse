import chromadb
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import llm.py helpers
current_dir = Path(__file__).resolve().parent.parent / "src"
sys.path.insert(0, str(current_dir))
from llm import embed_texts

CHROMA_DIR = "./chroma_db"

client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_or_create_collection("textbooks")

query = "What is photosynthesis?"
print(f"📥 Querying ChromaDB (textbooks) for: {query}")

query_embedding = embed_texts([query])[0]

results = collection.query(
    query_embeddings=[query_embedding],
    n_results=3
)

if results and "documents" in results:
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    ids = results["ids"][0]

    print("\n✅ Top textbook results:")
    for i, (doc, meta, _id) in enumerate(zip(docs, metas, ids), start=1):
        print(f"\nResult {i}:")
        print(f"ID: {_id}")
        print(f"Metadata: {meta}")
        print(f"Snippet: {doc[:300]}...")
else:
    print("⚠️ No documents found in textbooks collection")

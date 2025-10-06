import os
from dotenv import load_dotenv
from .supabase_vector import upsert_text_chunks
from .llm import embed_texts
from typing import Dict, Any

load_dotenv()

def embed_and_store_user_template(user_template: Dict[str, Any]):
    """
    Takes a user template dict with keys: id, user_id, title, content
    and stores it in the 'user_templates_vector' pgvector table for RAG use.
    """
    doc_id = f"user-{user_template['id']}"
    content = user_template["content"]
    metadata = {
        "title": user_template["title"],
        "user_id": user_template["user_id"],
        "source_type": "user"
    }

    embedding = embed_texts([content])[0]

    upsert_text_chunks("user_templates_vector", [{
        "id": doc_id,
        "document": content,
        "metadata": metadata,
        "embedding": embedding
    }])

    print(f"✅ Embedded & stored user template '{user_template['title']}' for RAG.")

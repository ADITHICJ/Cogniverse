# services/backend/src/supabase_vector.py
import os
import json
from typing import List, Dict, Any, Optional
import psycopg2
from psycopg2.extras import Json
from pgvector.psycopg2 import register_vector

# === Environment ===
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in environment")

_conn: Optional[psycopg2.extensions.connection] = None


def get_conn():
    """
    Create and cache a single psycopg2 connection.
    Registers pgvector type so Python lists map to vector automatically.
    """
    global _conn
    if _conn is None:
        _conn = psycopg2.connect(DATABASE_URL)
        register_vector(_conn)  # ✅ this makes lists <-> vector automatic
    return _conn


def create_tables_if_not_exists(dim: int):
    """
    Create textbooks and templates tables if they don't exist.
    """
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        cur.execute(f"""
        CREATE TABLE IF NOT EXISTS textbooks (
            id TEXT PRIMARY KEY,
            document TEXT,
            metadata JSONB,
            embedding VECTOR({dim})
        );
        """)
        cur.execute(f"""
        CREATE TABLE IF NOT EXISTS templates (
            id TEXT PRIMARY KEY,
            document TEXT,
            metadata JSONB,
            embedding VECTOR({dim})
        );
        """)
    conn.commit()


def upsert_text_chunks(table: str, records: List[Dict[str, Any]]):
    """
    Upsert multiple text+embedding rows into the given table.
    Each record must include: id, document, metadata, embedding.
    """
    if not records:
        print("⚠️ No records to upsert.")
        return

    conn = get_conn()
    with conn.cursor() as cur:
        for r in records:
            cur.execute(
                f"""
                INSERT INTO {table} (id, document, metadata, embedding)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE
                SET document = EXCLUDED.document,
                    metadata = EXCLUDED.metadata,
                    embedding = EXCLUDED.embedding
                """,
                (
                    r["id"],
                    r["document"],
                    Json(r.get("metadata", {})),
                    r["embedding"],  # ✅ plain list works
                ),
            )
    conn.commit()
    print(f"✅ Upserted {len(records)} records into '{table}'.")


def retrieve_top_k_by_embedding(table: str, embedding: List[float], k: int = 3):
    """
    Retrieve top-k most similar rows from the given table based on cosine distance.
    Returns: [{"id", "document", "metadata", "distance"}]
    """
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute(
            f"""
            SELECT id, document, metadata, embedding <=> %s::vector AS distance
            FROM {table}
            ORDER BY distance ASC
            LIMIT %s;
            """,
            (embedding, k),   # ✅ plain list, but cast to ::vector in SQL
        )
        rows = cur.fetchall()

    return [
        {"id": r[0], "document": r[1], "metadata": r[2], "distance": r[3]}
        for r in rows
    ]



def create_ivfflat_index(table: str, lists: int = 100):
    """
    Create an IVFFlat index for efficient similarity search.
    (Run only after bulk ingestion.)
    """
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute(
            f"""
            CREATE INDEX IF NOT EXISTS {table}_embedding_idx
            ON {table}
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = %s);
            """,
            (lists,),
        )
    conn.commit()
    print(f"✅ IVFFlat index created for '{table}' (lists={lists}).")

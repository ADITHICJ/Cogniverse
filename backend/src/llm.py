import os
import re
from typing import List, Optional
from dotenv import load_dotenv
from supabase import create_client

# === Load env ===
load_dotenv()

# ---------- Clean output ----------
from markdownify import markdownify as md

def clean_text_output(text: str) -> str:
    """Convert Gemini output into clean Markdown."""
    if not text:
        return ""

    # Remove code fences if Gemini adds them
    text = re.sub(r"```[a-zA-Z]*\n?", "", text)
    text = text.replace("```", "").strip()

    # Convert HTML → Markdown if it looks like HTML
    if "<p>" in text or "<div>" in text or "<ul>" in text or "<h" in text:
        text = md(text, heading_style="ATX")

    # Normalize spacing
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

# ---------- ENV CONFIG ----------
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GEN_MODEL = os.getenv("GEMINI_GENERATION_MODEL", "gemini-2.5-flash")
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "3"))

# ---------- Supabase Client (via HTTPS) ----------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ---------- Google GenAI Client ----------
try:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_KEY)
    gemini_model = genai.GenerativeModel(GEN_MODEL)
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print("[WARNING] Google GenerativeAI not available - RAG features disabled")

# ---------- Embeddings ----------
def embed_texts(texts: List[str]) -> List[List[float]]:
    """Call Gemini embeddings (returns list of vectors)."""
    if not GENAI_AVAILABLE:
        raise RuntimeError("Google GenerativeAI not available")

    vectors = []
    for text in texts:
        try:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document",
            )
            embedding = result["embedding"]
            print(f"[DEBUG] Embedding dimension: {len(embedding)}")
            vectors.append(embedding)
        except Exception as e:
            print(f"[ERROR] Embedding failed: {e}")
            vectors.append([0.0] * 768)  # fallback dummy vector
    return vectors

# ---------- Retriever ----------
def retrieve_top_k(prompt: str, table_name: str, k: int = RAG_TOP_K) -> List[dict]:
    """
    Retrieve related context documents from Supabase.
    This version uses REST API calls — NOT direct Postgres connections.
    """
    try:
        response = supabase.table(table_name).select("content").limit(k).execute()
        if not response.data:
            print(f"[INFO] No context found in {table_name}")
            return []
        return [{"document": r["content"], "distance": 0.5} for r in response.data]
    except Exception as e:
        print(f"[ERROR] Retrieval from {table_name} failed: {e}")
        return []

# ---------- Generator (RAG) ----------
def generate_with_rag(
    prompt: str,
    grade: Optional[str] = None,
    user_id: Optional[str] = None,
    selected_template: Optional[str] = None,
    additional_ctx: str = "",
    temperature: float = 0.3,
) -> str:
    """RAG-powered generation with Gemini + Supabase context."""
    if not GENAI_AVAILABLE:
        raise RuntimeError("Google GenerativeAI not available")

    prompt_lower = prompt.lower()

    # --- Detect grade ---
    if grade is None:
        for g in ["6", "7", "8", "9", "10", "11", "12"]:
            if f"grade {g}" in prompt_lower or f"class {g}" in prompt_lower:
                grade = g
                break

    # --- Detect subject ---
    subject = None
    for subj in ["science", "math", "english", "history", "geography", "civics", "computer science"]:
        if subj in prompt_lower:
            subject = subj
            break

    topic = prompt

    # --- Retrieve context from Supabase tables ---
    tb_docs = retrieve_top_k("textbooks", k=3)
    tmpl_docs = retrieve_top_k("templates", k=3)

    relevant_context_parts = []

    if tb_docs:
        relevant_context_parts.append("📘 Textbook Knowledge:\n" + "\n\n".join([d["document"] for d in tb_docs]))

    if tmpl_docs:
        relevant_context_parts.append("📑 Templates:\n" + "\n\n".join([d["document"] for d in tmpl_docs]))

    if additional_ctx:
        relevant_context_parts.append("💡 Extra Context:\n" + additional_ctx)

    context = "\n\n---\n\n".join(relevant_context_parts) if relevant_context_parts else ""

    # --- Instruction for Gemini ---
    system_prompt = f"""
You are PrepSmart, an AI teaching content assistant.

At the beginning of your response, ALWAYS include this header:

Grade Level: {grade or "not specified"}  
Subject: {subject or "general"}  
Topic: {topic}  
Total Time Required: (estimate in minutes)  

---

Then generate structured, lesson-ready content using the provided context.
"""

    full_prompt = f"{system_prompt}\n\nContext:\n{context}\n\nUser request:\n{prompt}"

    try:
        response = gemini_model.generate_content(
            full_prompt,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": 8192,
                "top_p": 0.8,
                "top_k": 40,
            },
        )

        text_out = getattr(response, "text", None)
        if not text_out and hasattr(response, "candidates"):
            parts = []
            for cand in response.candidates:
                if cand.content and cand.content.parts:
                    for part in cand.content.parts:
                        if hasattr(part, "text") and part.text:
                            parts.append(part.text)
            text_out = "\n".join(parts) if parts else None

        return clean_text_output(text_out) if text_out else "No content generated"

    except Exception as e:
        print(f"❌ Error in /generate: {str(e)}")
        return f"Error generating content: {str(e)}"

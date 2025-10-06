import os 
import re
import signal
from typing import List, Optional
from dotenv import load_dotenv
from markdownify import markdownify as md
from supabase import create_client

# === Load environment variables ===
load_dotenv()

# ---------- Supabase Client ----------
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# ---------- Text Cleaning ----------
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

# ---------- Google GenAI Client ----------
try:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_KEY)
    gemini_model = genai.GenerativeModel(GEN_MODEL)
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print("[WARNING] Google GenerativeAI not available - RAG features disabled")


# ---------- Supabase Vector Helpers ----------
from src.supabase_vector import retrieve_top_k_by_embedding


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
def retrieve_top_k(prompt: str, collection_name: str, user_id: Optional[str] = None, k: int = RAG_TOP_K) -> List[dict]:
    """Retrieve documents from vector tables. Supports system + user templates."""
    prompt_embedding = embed_texts([prompt])[0]

    results = []
    if collection_name == "templates":
        # system templates
        results += retrieve_top_k_by_embedding("templates", prompt_embedding, k=k)

        # user templates
        if user_id:
            user_results = retrieve_top_k_by_embedding("user_templates_vector", prompt_embedding, k=k)
            user_results = [r for r in user_results if str(r["metadata"].get("user_id")) == str(user_id)]
            results += user_results

    elif collection_name == "textbooks":
        results += retrieve_top_k_by_embedding("textbooks", prompt_embedding, k=k)

    results = sorted(results, key=lambda x: x.get("distance", 9999))
    return results[:k]


# ---------- Fallback Basic Generator ----------
def fallback_generate_with_supabase(prompt: str):
    """
    Basic fallback RAG generator if Gemini is unavailable.
    Retrieves text chunks from Supabase and simulates generation.
    """
    try:
        response = supabase.table("text_chunks").select("content").limit(5).execute()
        chunks = [item["content"] for item in response.data] if response.data else []
        context = "\n\n".join(chunks)

        full_prompt = f"Context:\n{context}\n\nUser Prompt:\n{prompt}"
        generated_text = f"Generated content based on: {prompt}\n\n[Simulated AI Output]"

        return generated_text
    except Exception as e:
        print(f"❌ Error in fallback generate: {str(e)}")
        return f"Error generating content: {str(e)}"


# ---------- Timeout Helper ----------
class TimeoutException(Exception):
    pass

def handler(signum, frame):
    raise TimeoutException("⏱ Gemini generation took too long (timeout).")

# ---------- Main Generator (RAG + Gemini) ----------
def generate_with_rag(
    prompt: str,
    grade: str = None,
    user_id: Optional[str] = None,
    selected_template: Optional[str] = None,
    additional_ctx: str = "",
    temperature: float = 0.3,
) -> str:
    """RAG-powered generation with Gemini + Supabase retrieval (with timeout)."""
    if not GENAI_AVAILABLE:
        print("[INFO] Gemini not available, using fallback generator.")
        return fallback_generate_with_supabase(prompt)

    # --- Detect grade & subject ---
    prompt_lower = prompt.lower()
    grade = grade or None
    if grade is None:
        for g in ["6", "7", "8", "9", "10", "11", "12"]:
            if f"grade {g}" in prompt_lower or f"class {g}" in prompt_lower:
                grade = g
                break

    subject = None
    for subj in ["science", "math", "english", "history", "geography", "civics", "computer science"]:
        if subj in prompt_lower:
            subject = subj
            break

    topic = prompt

    # --- Query Supabase (textbooks) ---
    tb_docs = retrieve_top_k(prompt, "textbooks", k=3)

    # --- Templates logic ---
    tmpl_docs = []
    if selected_template:
        tmpl_results = retrieve_top_k(prompt, "templates", user_id=user_id, k=10)
        tmpl_docs = [d for d in tmpl_results if str(d["id"]) == str(selected_template)]
    else:
        tmpl_docs = retrieve_top_k(prompt, "templates", user_id=None, k=1)

    # --- Build context ---
    relevant_context_parts = []

    subject_keywords = [
        "math", "science", "biology", "chemistry", "physics",
        "history", "geography", "algebra", "geometry", "literature"
    ]
    prompt_mentions_subject = any(keyword in prompt_lower for keyword in subject_keywords)

    if tb_docs and prompt_mentions_subject:
        relevant_context_parts.append("📘 Textbook Knowledge:\n" + "\n\n".join([d["document"] for d in tb_docs]))

    if tmpl_docs:
        relevant_context_parts.append("📑 Templates (system + user):\n" + "\n\n".join([d["document"] for d in tmpl_docs]))

    if additional_ctx:
        relevant_context_parts.append("💡 Extra Context:\n" + additional_ctx)

    context = "\n\n---\n\n".join(relevant_context_parts) if relevant_context_parts else ""

    # --- Instruction for Gemini ---
    system_prompt = f"""
You are PrepSmart, an AI teaching content assistant.

At the beginning of your response, ALWAYS include this header (with one blank line between each line):

Grade Level: {grade or "not specified"}  
Subject: {subject or "general"}  
Topic: {topic}  
Total Time Required: (estimate in minutes)  

---

Then continue by filling the provided template or generating structured content.
"""

    full_prompt = f"{system_prompt}\n\nContext:\n{context}\n\nUser request:\n{prompt}"

    # --- Timeout Wrapper for Gemini ---
    signal.signal(signal.SIGALRM, handler)
    signal.alarm(40)  # ⏱ Limit Gemini to 40 seconds

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

        signal.alarm(0)  # clear timeout

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

    except TimeoutException as e:
        print(f"⚠️ {str(e)} — falling back to Supabase generator.")
        return fallback_generate_with_supabase(prompt)

    except Exception as e:
        print(f"[ERROR] Generation failed: {e}")
        return f"Error generating content: {str(e)}"

    finally:
        signal.alarm(0)  # make sure alarm is cleared

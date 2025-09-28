# services/backend/src/llm.py
import os
import re
from typing import List
import chromadb

# ---------- Clean output ----------
def clean_html_output(text: str) -> str:
    """Strip ```html ... ``` fences if Gemini adds them."""
    return re.sub(r"```[a-zA-Z]*\n?", "", text).replace("```", "").strip()


# ---------- ENV CONFIG ----------
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GEN_MODEL = os.getenv("GEMINI_GENERATION_MODEL", "gemini-1.5-flash")
CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "3"))

# Init Chroma client (shared)
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)

# Initialize Google GenAI client with better logging
GENAI_AVAILABLE = False
gemini_model = None

try:
    import google.generativeai as genai

    if not GEMINI_KEY:
        raise ValueError("❌ GEMINI_API_KEY is missing in environment variables")

    # Configure with API key
    genai.configure(api_key=GEMINI_KEY)

    # Try creating model
    gemini_model = genai.GenerativeModel(GEN_MODEL)
    GENAI_AVAILABLE = True
    print(f"✅ Gemini initialized successfully with model: {GEN_MODEL}")

except ImportError:
    print("❌ google-generativeai is not installed. Run: pip install google-generativeai")
except ValueError as e:
    print(f"{e}")
except Exception as e:
    print(f"❌ Failed to initialize Gemini. Reason: {type(e).__name__} - {e}")


# ---------- Embeddings ----------
def embed_texts(texts: List[str]) -> List[List[float]]:
    """Call Gemini embeddings (returns list of vectors)."""
    if not GENAI_AVAILABLE:
        print("⚠️ Gemini not available, returning dummy embeddings")
        return [[0.1] * 768 for _ in texts]

    try:
        vectors = []
        for text in texts:
            result = genai.embed_content(
                model=os.getenv("GEMINI_EMBEDDING_MODEL", "models/text-embedding-004"),
                content=text,
                task_type="retrieval_document",
            )
            embedding = result["embedding"]
            print(f"[DEBUG] Created embedding ({len(embedding)} dims)")
            vectors.append(embedding)
        return vectors
    except Exception as e:
        print(f"❌ Embedding failed: {e}")
        return [[0.1] * 768 for _ in texts]  # fallback


# ---------- Retriever ----------
def retrieve_top_k(prompt: str, collection_name: str, k: int = RAG_TOP_K) -> List[str]:
    """Query Chroma for nearest docs from a given collection."""
    prompt_embedding = embed_texts([prompt])[0]
    collection = chroma_client.get_or_create_collection(collection_name)

    results = collection.query(
        query_embeddings=[prompt_embedding],
        n_results=k,
    )
    return results.get("documents", [[]])[0] or []


# ---------- Supabase Client ----------
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase initialized successfully")
else:
    print("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in environment variables")

# ---------- Generator (RAG) ----------
# services/backend/src/llm.py
def generate_with_rag(
    prompt: str,
    grade: str = None,
    additional_ctx: str = "",
    template_id: str = None,
    temperature: float = 0.3,
) -> str:
    if not GENAI_AVAILABLE:
        print("⚠️ Gemini not available, generating mock lesson plan")
        return generate_mock_lesson(prompt)

    try:
        context = ""

        if template_id:
            # ✅ Fetch teacher-created template from Supabase
            template = supabase.table("templates").select("content").eq("id", template_id).single().execute()
            if template.data:
                context = f"Teacher selected this template:\n\n{template.data['content']}"
        else:
            # ✅ Fallback to Chroma RAG
            template_docs = retrieve_top_k(prompt, "templates", k=2)
            if template_docs:
                context = "Here are some relevant lesson plan templates:\n\n" + "\n\n---\n\n".join(template_docs)

        if additional_ctx:
            context += f"\n\nAdditional Context:\n{additional_ctx}"

        # ✅ Gemini system prompt
        system_prompt = f"""You are PrepSmart, an AI lesson plan assistant.

Create a comprehensive, detailed lesson plan based on the user's request.
Grade level: {grade or "not specified"}
Use the provided templates as inspiration but create original content.

IMPORTANT: Return ONLY in Markdown format.
- Bold for section titles (e.g., **Lesson Title:** Photosynthesis)
- Blank lines between sections
- Bulleted lists or numbered lists where appropriate
- No HTML, XML, or other markup (no < or >)
User request: {prompt}

{context}
"""

        response = gemini_model.generate_content(
            system_prompt,
            generation_config={"temperature": temperature, "max_output_tokens": 8192},
        )

        if response and response.text:
            return clean_html_output(response.text)
        else:
            print("⚠️ Empty response from Gemini, using mock")
            return generate_mock_lesson(prompt)

    except Exception as e:
        print(f"❌ RAG generation failed: {e}")
        return generate_mock_lesson(prompt)



def generate_mock_lesson(prompt: str) -> str:
    """Generate a mock lesson plan for development/fallback"""
    return f"""
    <div class="lesson-plan">
        <h1>📚 Lesson Plan</h1>
        <div class="prompt-section">
            <h2>🎯 Based on your request:</h2>
            <blockquote>"{prompt}"</blockquote>
        </div>
        <div class="objectives-section">
            <h2>🎯 Learning Objectives</h2>
            <ul>
                <li>Students will understand key concepts related to the topic</li>
                <li>Students will be able to apply critical thinking skills</li>
                <li>Students will demonstrate understanding through activities</li>
            </ul>
        </div>
        <div class="activities-section">
            <h2>🚀 Lesson Activities</h2>
            <div class="activity">
                <h3>📍 Opening (10 minutes)</h3>
                <p>Introduction and engagement activity to activate prior knowledge.</p>
            </div>
            <div class="activity">
                <h3>📍 Main Activity (30 minutes)</h3>
                <p>Core learning experience with hands-on exploration.</p>
            </div>
            <div class="activity">
                <h3>📍 Closure (10 minutes)</h3>
                <p>Reflection and summary of key learning points.</p>
            </div>
        </div>
        <div class="assessment-section">
            <h2>📝 Assessment</h2>
            <ul>
                <li><strong>Formative:</strong> Observation and questioning during activities</li>
                <li><strong>Summative:</strong> Exit ticket or short quiz</li>
            </ul>
        </div>
    </div>
    """

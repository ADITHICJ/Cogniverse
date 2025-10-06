import os
import time
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client

# ✅ Load environment variables FIRST (important for Supabase + Gemini)
backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")

# ✅ Lazy imports AFTER env setup
from src.llm import generate_with_rag  # Your AI logic file
from src.routes.drafts import router as drafts_router

# ✅ Initialize FastAPI app
app = FastAPI(title="PrepSmart Backend", version="1.0")

# ===============================================================
# SUPABASE CONFIGURATION
# ===============================================================

def get_supabase_client():
    """Safely create a new Supabase client (avoids connection drops)."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("❌ Missing Supabase credentials in environment variables.")
    return create_client(url, key)

# ===============================================================
# CORS CONFIGURATION
# ===============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",                  # Local dev
        "http://127.0.0.1:3000",
        "https://cogniverse-omega.vercel.app",    # ✅ Your deployed frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================================================
# ROUTERS
# ===============================================================
app.include_router(drafts_router)

# ===============================================================
# REQUEST SCHEMAS
# ===============================================================
class GenerateRequest(BaseModel):
    prompt: str
    additional_ctx: str | None = None  # Optional additional context


class DraftCreate(BaseModel):
    user_id: str
    title: str
    content: str

# ===============================================================
# ROUTES
# ===============================================================

@app.get("/")
async def health_check():
    """Simple health check to verify backend is running."""
    return {"status": "ok", "message": "PrepSmart backend is live and healthy 🚀"}


# -------- GENERATE CONTENT ENDPOINT --------
@app.post("/generate")
async def generate_endpoint(req: GenerateRequest):
    """Handles AI content generation using Gemini + RAG pipeline."""
    try:
        print("🔹 Generating content for:", req.prompt[:60], "...")
        start_time = time.time()

        # Call LLM generator
        content = generate_with_rag(req.prompt, req.additional_ctx)

        print(f"✅ Content generated in {round(time.time() - start_time, 2)}s")
        return {"content": content}

    except Exception as e:
        print(f"❌ Error in /generate: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


# -------- SAVE DRAFT ENDPOINT --------
@app.post("/drafts")
async def save_draft(draft: DraftCreate):
    """Saves generated drafts to Supabase with retry logic."""
    try:
        for attempt in range(3):  # retry logic in case Render sleeps
            try:
                supabase = get_supabase_client()
                response = (
                    supabase.table("drafts")
                    .insert(
                        {
                            "user_id": draft.user_id,
                            "title": draft.title,
                            "content": draft.content,
                        }
                    )
                    .execute()
                )
                return {"success": True, "data": response.data}
            except Exception as e:
                print(f"⚠️ Supabase insert failed (attempt {attempt + 1}/3): {e}")
                time.sleep(2)

        raise HTTPException(status_code=500, detail="Failed to save draft after retries.")
    except Exception as e:
        print(f"❌ Error saving draft: {e}")
        raise HTTPException(status_code=500, detail=str(e))

import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel
from supabase import create_client
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ✅ Load environment variables FIRST
backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")

# ✅ Import after envs are loaded
from src.llm import generate_with_rag  # adjust if needed
from src.routes.drafts import router as drafts_router

# ✅ Initialize FastAPI
app = FastAPI(title="PrepSmart Backend", version="1.0")

# ✅ Initialize Supabase client
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # use only in backend
)

# ✅ Add CORS middleware for both local + deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",                  # local dev frontend
        "http://127.0.0.1:3000",                  # alternate localhost
        "https://cogniverse-omega.vercel.app",    # ✅ your deployed frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)

# ✅ Include routers
app.include_router(drafts_router)

# -------- Request schema --------
class GenerateRequest(BaseModel):
    prompt: str
    additional_ctx: str | None = None  # ✅ Add optional field for context


# -------- Endpoint: Generate AI content --------
@app.post("/generate")
async def generate_endpoint(req: GenerateRequest):
    try:
        # ✅ Pass both prompt and optional context if available
        content = generate_with_rag(req.prompt, req.additional_ctx)
        return {"content": content}
    except Exception as e:
        print(f"❌ Error in /generate: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


# -------- Endpoint: Save draft --------
class DraftCreate(BaseModel):
    user_id: str
    title: str
    content: str


@app.post("/drafts")
async def save_draft(draft: DraftCreate):
    try:
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
        print(f"❌ Error saving draft: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Health check route (so Render shows 200 OK instead of 404)
@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Backend is live!"}

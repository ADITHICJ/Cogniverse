# services/backend/src/main.py
import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel
from supabase import create_client

# Load environment variables FIRST, before importing modules that need them
backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.llm import generate_with_rag  # adjust import if needed
from pydantic import BaseModel

app = FastAPI()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # use service role only in backend
)

# ✅ Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # frontend dev URLs
    allow_credentials=True,
    allow_methods=["*"],  # allow POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

# -------- Request schema --------
class GenerateRequest(BaseModel):
    prompt: str

# -------- Endpoint --------
@app.post("/generate")
async def generate_endpoint(req: GenerateRequest):
    content = generate_with_rag(req.prompt)
    return {"content": content}

class DraftCreate(BaseModel):
    user_id: str
    title: str
    content: str

@app.post("/drafts")
async def save_draft(draft: DraftCreate):
    try:
        response = supabase.table("drafts").insert({
            "user_id": draft.user_id,
            "title": draft.title,
            "content": draft.content
        }).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

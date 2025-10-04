from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.embed_user_template import embed_and_store_user_template
from supabase import create_client
import os

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

class TemplateCreate(BaseModel):
    user_id: str
    title: str
    content: str

@router.post("/create-template")
def create_user_template(data: TemplateCreate):
    # Insert template into main user_templates table
    res = supabase.table("user_templates").insert({
        "user_id": data.user_id,
        "title": data.title,
        "content": data.content
    }).execute()

    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to insert template")

    new_template = res.data[0]
    embed_and_store_user_template(new_template)

    return {"message": "Template created and embedded successfully"}

# backend/src/routes/drafts.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from supabase import create_client
import os

router = APIRouter()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

@router.get("/drafts/{draft_id}/versions")
async def get_draft_versions(draft_id: str):
    """Get all versions of a draft for history sidebar"""
    try:
        response = supabase.table("draft_versions").select("*").eq("draft_id", draft_id).order("created_at", desc=True).execute()
        return JSONResponse(content=response.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/drafts/{draft_id}/save_version")
async def save_version(draft_id: str, body: dict):
    content = body.get("content", "")
    
    # Fetch latest version number
    versions = supabase.table("draft_versions").select("version_number").eq("draft_id", draft_id).order("version_number", desc=True).limit(1).execute()
    next_version = (versions.data[0]["version_number"] + 1) if versions.data else 1

    # Insert new version
    supabase.table("draft_versions").insert({
        "draft_id": draft_id,
        "content": content,
        "version_number": next_version,
    }).execute()

    # Update main draft
    supabase.table("drafts").update({"content": content}).eq("id", draft_id).execute()

    return {"success": True, "version": next_version}

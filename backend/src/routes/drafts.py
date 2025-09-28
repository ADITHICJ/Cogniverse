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
        print(f"🔍 Fetching versions for draft: {draft_id}")
        response = supabase.table("draft_versions").select("*").eq("draft_id", draft_id).order("created_at", desc=True).execute()
        print(f"✅ Found {len(response.data)} versions")
        return JSONResponse(content=response.data)
    except Exception as e:
        print(f"❌ Error in get_draft_versions: {str(e)}")
        print(f"❌ Exception type: {type(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/drafts/{draft_id}/save_version")
async def save_version(draft_id: str, body: dict):
    content = body.get("content", "")
    
    try:
        # Fetch latest version number
        versions = supabase.table("draft_versions").select("version_number").eq("draft_id", draft_id).order("version_number", desc=True).limit(1).execute()
        next_version = (versions.data[0]["version_number"] + 1) if versions.data else 1

        # Insert new version
        result = supabase.table("draft_versions").insert({
            "draft_id": draft_id,
            "content": content,
            "version_number": next_version,
        }).execute()

        # Update main draft
        supabase.table("drafts").update({"content": content}).eq("id", draft_id).execute()

        return {"success": True, "version": next_version}
    except Exception as e:
        print(f"❌ Error saving version: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/drafts/{draft_id}/versions/{version_id}/restore")
async def restore_version(draft_id: str, version_id: str):
    try:
        # Get the version to restore
        version_to_restore = supabase.table("draft_versions").select("content", "created_at").eq("id", version_id).single().execute()

        if not version_to_restore.data:
            raise HTTPException(status_code=404, detail="Version not found")

        # Update the main draft's content
        supabase.table("drafts").update({"content": version_to_restore.data["content"]}).eq("id", draft_id).execute()

        # Delete all versions newer than the one being restored
        supabase.table("draft_versions").delete().eq("draft_id", draft_id).gt("created_at", version_to_restore.data["created_at"]).execute()

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

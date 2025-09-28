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

@router.post("/drafts/{draft_id}/versions/{version_id}/restore")
async def restore_version(draft_id: str, version_id: str):
    try:
        # Get the version to restore
        version_response = supabase.table("draft_versions").select("content", "created_at", "version_number").eq("id", version_id).eq("draft_id", draft_id).single().execute()

        if not version_response.data:
            raise HTTPException(status_code=404, detail="Version not found")

        version_to_restore = version_response.data

        # Get all versions newer than the one being restored
        newer_versions = supabase.table("draft_versions").select("id").eq("draft_id", draft_id).gt("created_at", version_to_restore["created_at"]).execute()
        
        deleted_count = len(newer_versions.data) if newer_versions.data else 0

        # Delete all versions newer than the one being restored
        if deleted_count > 0:
            supabase.table("draft_versions").delete().eq("draft_id", draft_id).gt("created_at", version_to_restore["created_at"]).execute()

        # Update the main draft's content
        supabase.table("drafts").update({
            "content": version_to_restore["content"],
            "updated_at": "now()"
        }).eq("id", draft_id).execute()

        return {
            "success": True, 
            "restored_version": version_to_restore["version_number"],
            "deleted_versions": deleted_count,
            "message": f"Restored to version {version_to_restore['version_number']}, deleted {deleted_count} newer versions"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to restore version: {str(e)}")

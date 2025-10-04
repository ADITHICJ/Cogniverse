from fastapi import APIRouter, HTTPException
from supabase import create_client
import os

router = APIRouter(prefix="/collaborators", tags=["collaborators"])

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

@router.get("/{draft_id}")
async def get_collaborators(draft_id: str):
    """Get collaborators for a draft"""
    res = supabase.table("draft_collaborators").select("*, profiles(*)").eq("draft_id", draft_id).execute()
    return res.data

@router.post("/{draft_id}/add")
async def add_collaborator(draft_id: str, user_id: str, added_by: str):
    """Add collaborator to a draft"""
    res = supabase.table("draft_collaborators").insert({
        "draft_id": draft_id,
        "user_id": user_id,
        "added_by": added_by
    }).execute()
    return {"success": True, "data": res.data}

@router.delete("/{draft_id}/remove/{user_id}")
async def remove_collaborator(draft_id: str, user_id: str):
    """Remove collaborator from a draft"""
    supabase.table("draft_collaborators").delete().eq("draft_id", draft_id).eq("user_id", user_id).execute()
    return {"success": True}

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.flock import FlockCreate, FlockUpdate, FlockInDB
from app.api.deps import get_current_user, get_db
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/", response_model=List[FlockInDB])
async def get_flocks(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all flocks for current user"""
    try:
        flocks_ref = db.collection("flocks")
        query = flocks_ref.where("user_id", "==", current_user["id"]).where("is_active", "==", True)
        flocks = query.stream()
        
        result = []
        for flock in flocks:
            flock_data = flock.to_dict()
            flock_data["id"] = flock.id
            result.append(flock_data)
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get flocks: {str(e)}"
        )

@router.post("/", response_model=FlockInDB)
async def create_flock(
    flock_data: FlockCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a new flock"""
    try:
        flock_id = str(uuid.uuid4())
        now = datetime.now()
        
        flock_ref = db.collection("flocks").document(flock_id)
        flock_ref.set({
            **flock_data.dict(),
            "user_id": current_user["id"],
            "created_at": now,
            "updated_at": now,
            "is_active": True
        })
        
        # Get created flock
        flock_doc = flock_ref.get()
        created_flock = flock_doc.to_dict()
        created_flock["id"] = flock_id
        
        return created_flock
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create flock: {str(e)}"
        )

@router.get("/{flock_id}", response_model=FlockInDB)
async def get_flock(
    flock_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get a specific flock"""
    try:
        flock_ref = db.collection("flocks").document(flock_id)
        flock_doc = flock_ref.get()
        
        if not flock_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flock not found"
            )
        
        flock_data = flock_doc.to_dict()
        
        # Check ownership
        if flock_data["user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this flock"
            )
        
        flock_data["id"] = flock_id
        return flock_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get flock: {str(e)}"
        )

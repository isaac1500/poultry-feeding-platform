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
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database not available"
            )
        
        # Get flocks from Firebase Realtime Database
        flocks_ref = db.child("flocks")
        flocks_data = flocks_ref.order_by_child("user_id").equal_to(current_user["id"]).get()
        
        result = []
        if flocks_data.each() is not None:
            for flock in flocks_data.each():
                flock_data = flock.val()
                if flock_data.get("is_active", True):
                    flock_data["id"] = flock.key()
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
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database not available"
            )
        
        flock_id = str(uuid.uuid4())
        now = datetime.now()
        
        flock_record = {
            **flock_data.dict(),
            "user_id": current_user["id"],
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "is_active": True
        }
        
        # Save to Firebase
        flocks_ref = db.child("flocks")
        flocks_ref.child(flock_id).set(flock_record)
        
        # Return created flock
        created_flock = flock_record
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
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database not available"
            )
        
        flocks_ref = db.child("flocks")
        flock_data = flocks_ref.child(flock_id).get()
        
        if not flock_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flock not found"
            )
        
        # Check ownership
        if flock_data.get("user_id") != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this flock"
            )
        
        # Check if active
        if not flock_data.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flock not found"
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

@router.put("/{flock_id}", response_model=FlockInDB)
async def update_flock(
    flock_id: str,
    flock_update: FlockUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update a flock"""
    try:
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database not available"
            )
        
        flocks_ref = db.child("flocks")
        flock_data = flocks_ref.child(flock_id).get()
        
        if not flock_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flock not found"
            )
        
        # Check ownership
        if flock_data.get("user_id") != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this flock"
            )
        
        # Check if active
        if not flock_data.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flock not found"
            )
        
        # Prepare update data (only include fields that are provided)
        update_data = {}
        for field, value in flock_update.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        # Update in Firebase
        flocks_ref.child(flock_id).update(update_data)
        
        # Get updated flock
        updated_flock = {**flock_data, **update_data}
        updated_flock["id"] = flock_id
        
        return updated_flock
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update flock: {str(e)}"
        )

@router.delete("/{flock_id}")
async def delete_flock(
    flock_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Soft delete a flock (mark as inactive)"""
    try:
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database not available"
            )
        
        flocks_ref = db.child("flocks")
        flock_data = flocks_ref.child(flock_id).get()
        
        if not flock_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flock not found"
            )
        
        # Check ownership
        if flock_data.get("user_id") != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this flock"
            )
        
        # Soft delete (mark as inactive)
        update_data = {
            "is_active": False,
            "updated_at": datetime.now().isoformat()
        }
        
        flocks_ref.child(flock_id).update(update_data)
        
        return {"message": "Flock deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete flock: {str(e)}"
        )

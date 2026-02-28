# backend/app/api/v1/recommendations.py - CORRECTED VERSION
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
import logging

from app.schemas.recommendation import (
    RecommendationCreate, 
    RecommendationResponse,
    RecommendationSummary
)
from app.api.deps import get_current_user, get_db
from app.services.recommendation_engine import RecommendationEngine
from firebase_admin import firestore

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=RecommendationResponse)
async def create_recommendation(
    recommendation: RecommendationCreate,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Create a new feed formulation recommendation
    """
    try:
        # First, get flock details to ensure it exists and belongs to user
        flock_ref = db.collection("flocks").document(recommendation.flock_id)
        flock_doc = flock_ref.get()
        
        if not flock_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flock not found"
            )
        
        flock_data = flock_doc.to_dict()
        if flock_data.get("user_id") != current_user.get("id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this flock"
            )
        
        # Initialize recommendation engine
        engine = RecommendationEngine(db)
        
        # Generate recommendation
        result = await engine.generate_recommendation(
            recommendation=recommendation,
            user_id=current_user.get("id"),
            flock_data=flock_data
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating recommendation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating recommendation: {str(e)}"
        )

@router.get("/", response_model=List[RecommendationSummary])
async def get_recommendations(
    flock_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get all recommendations for the current user
    Optionally filter by flock_id
    """
    try:
        recommendations_ref = db.collection("recommendations")
        
        # Build query based on parameters
        query = recommendations_ref.where("user_id", "==", current_user.get("id"))
        
        if flock_id:
            query = query.where("flock_id", "==", flock_id)
        
        query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
        
        docs = query.stream()
        
        recommendations = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            
            # Get flock name for summary
            if "flock_id" in data:
                flock_ref = db.collection("flocks").document(data["flock_id"])
                flock_doc = flock_ref.get()
                if flock_doc.exists:
                    flock_data = flock_doc.to_dict()
                    data["flock_name"] = flock_data.get("name", "Unknown Flock")
            
            # Handle status field
            if "status" in data and isinstance(data["status"], str):
                data["status"] = data["status"].capitalize()
            
            recommendations.append(RecommendationSummary(**data))
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error fetching recommendations: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching recommendations"
        )

@router.get("/{recommendation_id}", response_model=RecommendationResponse)
async def get_recommendation(
    recommendation_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get a specific recommendation by ID
    """
    try:
        rec_ref = db.collection("recommendations").document(recommendation_id)
        rec_doc = rec_ref.get()
        
        if not rec_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recommendation not found"
            )
        
        data = rec_doc.to_dict()
        
        # Check ownership
        if data.get("user_id") != current_user.get("id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this recommendation"
            )
        
        data["id"] = recommendation_id
        
        if "status" in data and isinstance(data["status"], str):
            data["status"] = data["status"].capitalize()
        
        return RecommendationResponse(**data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching recommendation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching recommendation"
        )

@router.delete("/{recommendation_id}")
async def delete_recommendation(
    recommendation_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Delete a recommendation
    """
    try:
        rec_ref = db.collection("recommendations").document(recommendation_id)
        rec_doc = rec_ref.get()
        
        if not rec_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recommendation not found"
            )
        
        data = rec_doc.to_dict()
        
        # Check ownership
        if data.get("user_id") != current_user.get("id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this recommendation"
            )
        
        rec_ref.delete()
        
        return {"message": "Recommendation deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting recommendation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting recommendation"
        )

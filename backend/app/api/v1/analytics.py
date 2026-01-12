from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user, get_db

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_analytics(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get dashboard analytics"""
    try:
        user_id = current_user["id"]
        
        # Get flock count
        flocks_ref = db.collection("flocks")
        flocks_query = flocks_ref.where("user_id", "==", user_id).where("is_active", "==", True)
        flock_count = len(list(flocks_query.stream()))
        
        # Get recommendation count
        recs_ref = db.collection("recommendations")
        recs_query = recs_ref.where("user_id", "==", user_id)
        rec_count = len(list(recs_query.stream()))
        
        # Calculate estimated savings (mock data)
        total_savings = rec_count * 15000  # Mock: UGX 15,000 per recommendation
        
        return {
            "flock_count": flock_count,
            "active_recommendations": rec_count,
            "estimated_savings": total_savings,
            "currency": "UGX",
            "flock_health": "Good" if flock_count > 0 else "No data"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics: {str(e)}"
        )

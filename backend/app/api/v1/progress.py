# backend/app/api/v1/progress.py - NEW FILE
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, List, Optional
import logging
from datetime import datetime, timedelta
from firebase_admin import firestore

from app.api.deps import get_current_user, get_db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/progress")
async def get_progress_analytics(
    flock_id: Optional[str] = None,
    time_range: str = "30",  # days
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """Get progress tracking analytics"""
    try:
        user_id = current_user.get("uid") or current_user.get("id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not authenticated"
            )
        
        # Calculate date range
        days = int(time_range) if time_range.isdigit() else 30
        start_date = datetime.now() - timedelta(days=days)
        
        # Build query for flocks
        flocks_query = db.collection("flocks").where("userId", "==", user_id)
        if flock_id:
            flocks_query = flocks_query.where("__name__", "==", flock_id)
        
        flocks_docs = list(flocks_query.stream())
        
        # Build query for recommendations
        recs_query = db.collection("recommendations").where("userId", "==", user_id)
        
        # Filter by date if needed
        if days < 365:  # Only filter if not "all time"
            recs_query = recs_query.where("createdAt", ">=", start_date)
        
        recs_docs = list(recs_query.stream())
        
        # Process flocks data
        flocks_data = []
        total_birds = 0
        
        for doc in flocks_docs:
            flock_data = doc.to_dict()
            flock_data["id"] = doc.id
            
            bird_count = int(flock_data.get("quantity", 0))
            total_birds += bird_count
            
            # Calculate age in weeks
            created_at = flock_data.get("createdAt")
            age_weeks = 0
            if created_at:
                try:
                    if isinstance(created_at, datetime):
                        flock_date = created_at
                    else:
                        flock_date = datetime.fromisoformat(str(created_at).replace('Z', '+00:00'))
                    
                    age_days = (datetime.now() - flock_date).days
                    age_weeks = age_days // 7
                except:
                    age_weeks = flock_data.get("age", 0)
            
            flocks_data.append({
                "id": doc.id,
                "name": flock_data.get("name", "Unnamed Flock"),
                "bird_type": flock_data.get("birdType", "Unknown"),
                "quantity": bird_count,
                "age": age_weeks,
                "created_at": created_at,
                "status": "active"
            })
        
        # Process recommendations data
        recommendations_data = []
        total_cost = 0
        monthly_data = {}
        
        for doc in recs_docs:
            rec_data = doc.to_dict()
            rec_data["id"] = doc.id
            
            # Get cost
            cost = rec_data.get("total_cost") or rec_data.get("totalCost") or 0
            if isinstance(cost, (int, float)):
                total_cost += float(cost)
            
            # Group by month for charting
            created_at = rec_data.get("createdAt")
            if created_at:
                try:
                    if isinstance(created_at, datetime):
                        rec_date = created_at
                    else:
                        rec_date = datetime.fromisoformat(str(created_at).replace('Z', '+00:00'))
                    
                    month_key = rec_date.strftime("%Y-%m")
                    if month_key not in monthly_data:
                        monthly_data[month_key] = {
                            "month": rec_date.strftime("%b %Y"),
                            "cost": 0,
                            "count": 0,
                            "savings": 0
                        }
                    
                    monthly_data[month_key]["cost"] += float(cost)
                    monthly_data[month_key]["count"] += 1
                    monthly_data[month_key]["savings"] += float(cost) * 0.15  # 15% savings
                    
                except Exception as date_error:
                    logger.warning(f"Error parsing date: {date_error}")
            
            recommendations_data.append({
                "id": doc.id,
                "flock_name": rec_data.get("flock_name") or rec_data.get("flockName", "Unknown"),
                "feed_type": rec_data.get("feed_type") or rec_data.get("feedType", "General"),
                "total_cost": float(cost),
                "created_at": created_at,
                "status": rec_data.get("status", "completed")
            })
        
        # Convert monthly data to list for charts
        monthly_list = []
        for month_data in monthly_data.values():
            monthly_list.append({
                "month": month_data["month"],
                "cost": month_data["cost"],
                "count": month_data["count"],
                "savings": month_data["savings"]
            })
        
        # Sort by month
        monthly_list.sort(key=lambda x: datetime.strptime(x["month"], "%b %Y"))
        
        # Generate growth data (mock for now - in production would use actual growth records)
        growth_data = []
        for week in range(1, 9):  # 8 weeks
            growth_data.append({
                "week": f"Week {week}",
                "weight": 0.2 + (week * 0.15),  # Mock weight
                "feed": 0.5 + (week * 0.3),  # Mock feed consumption
                "fcr": 1.5 + (week * 0.05)  # Mock FCR
            })
        
        # Cost breakdown (mock for now)
        cost_breakdown = [
            {"name": "Maize", "value": 45, "cost": 67500},
            {"name": "Soya", "value": 30, "cost": 84000},
            {"name": "Fish Meal", "value": 10, "cost": 50000},
            {"name": "Premix", "value": 5, "cost": 25000},
            {"name": "Other", "value": 10, "cost": 30000}
        ]
        
        # Calculate statistics
        stats = {
            "total_flocks": len(flocks_data),
            "total_birds": total_birds,
            "total_recommendations": len(recommendations_data),
            "total_cost": total_cost,
            "estimated_savings": total_cost * 0.15,
            "average_growth": 85,  # Mock - would calculate from actual data
            "feed_efficiency": 2.8  # Mock FCR
        }
        
        return {
            "stats": stats,
            "flocks": flocks_data[:10],  # Limit to 10
            "recommendations": recommendations_data[:10],  # Limit to 10
            "growth_data": growth_data,
            "monthly_data": monthly_list[-6:],  # Last 6 months
            "cost_breakdown": cost_breakdown,
            "insights": [
                {
                    "title": "Growth Optimization",
                    "message": "Consider adjusting protein levels for better growth rates.",
                    "type": "info"
                },
                {
                    "title": "Cost Savings",
                    "message": f"AI optimization has saved UGX {int(total_cost * 0.15):,} this period.",
                    "type": "success"
                },
                {
                    "title": "Attention Needed",
                    "message": "Monitor feed consumption rates for optimal efficiency.",
                    "type": "warning"
                }
            ]
        }
        
    except Exception as e:
        logger.error(f"Error in progress analytics: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get progress analytics: {str(e)}"
        )
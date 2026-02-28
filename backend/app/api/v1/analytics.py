# backend/app/api/v1/analytics.py - COMPLETE VERSION
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
import logging
from datetime import datetime, timedelta
from firebase_admin import firestore

from app.api.deps import get_current_user, get_db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/dashboard")
async def get_dashboard_analytics(
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """Get comprehensive dashboard analytics for the current user"""
    try:
        user_id = current_user.get("uid") or current_user.get("id") or current_user.get("user_id")
        user_email = current_user.get("email", "unknown")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID not found in token"
            )
        
        logger.info(f"Fetching dashboard analytics for user: {user_email} (ID: {user_id})")
        
        # Initialize results
        results = {
            "summary": {
                "flock_count": 0,
                "active_flocks": 0,
                "total_birds": 0,
                "recommendation_count": 0,
                "recent_recommendations": 0,
                "estimated_savings": 0,
                "total_cost_incurred": 0,
                "currency": "UGX"
            },
            "flocks": [],
            "recommendations": [],
            "recent_activity": [],
            "health_status": {
                "flock_health": "No data",
                "recommendation_rate": "Inactive",
                "overall_status": "Needs attention"
            }
        }
        
        # 1. Fetch flocks data
        try:
            flocks_ref = db.collection("flocks")
            flocks_query = flocks_ref.where("userId", "==", user_id)
            flocks_docs = list(flocks_query.stream())
            
            flock_count = len(flocks_docs)
            results["summary"]["flock_count"] = flock_count
            
            total_birds = 0
            active_flocks = 0
            flocks_data = []
            
            for doc in flocks_docs:
                flock_data = doc.to_dict()
                flock_data["id"] = doc.id
                
                # Get bird count
                bird_count = int(flock_data.get("quantity", 0))
                total_birds += bird_count
                
                # Check if active (updated in last 30 days)
                updated_at = flock_data.get("updatedAt") or flock_data.get("createdAt")
                if updated_at:
                    try:
                        if isinstance(updated_at, datetime):
                            flock_date = updated_at
                        elif isinstance(updated_at, str):
                            # Handle Firestore timestamp string
                            if "T" in updated_at:
                                flock_date = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
                            else:
                                flock_date = datetime.fromtimestamp(updated_at / 1000)
                        else:
                            flock_date = datetime.now()
                        
                        days_since_update = (datetime.now() - flock_date).days
                        if days_since_update <= 30:
                            active_flocks += 1
                    except Exception as date_error:
                        logger.warning(f"Error parsing date for flock {doc.id}: {date_error}")
                        active_flocks += 1  # Assume active if date parsing fails
                
                # Add to flocks list
                flocks_data.append({
                    "id": doc.id,
                    "name": flock_data.get("name", "Unnamed Flock"),
                    "bird_type": flock_data.get("birdType", flock_data.get("bird_type", "Unknown")),
                    "quantity": bird_count,
                    "age": flock_data.get("age", 0),
                    "created_at": updated_at
                })
            
            results["summary"]["total_birds"] = total_birds
            results["summary"]["active_flocks"] = active_flocks
            results["flocks"] = flocks_data[:3]  # Show only 3 recent flocks
            
        except Exception as flock_error:
            logger.error(f"Error fetching flocks: {flock_error}")
        
        # 2. Fetch recommendations data
        try:
            recs_ref = db.collection("recommendations")
            recs_query = recs_ref.where("userId", "==", user_id)
            recs_docs = list(recs_query.stream())
            
            rec_count = len(recs_docs)
            results["summary"]["recommendation_count"] = rec_count
            
            recent_recommendations = 0
            total_cost = 0
            recommendations_data = []
            
            for doc in recs_docs:
                rec_data = doc.to_dict()
                rec_data["id"] = doc.id
                
                # Check if recent (last 7 days)
                created_at = rec_data.get("createdAt") or rec_data.get("created_at")
                if created_at:
                    try:
                        if isinstance(created_at, datetime):
                            rec_date = created_at
                        elif isinstance(created_at, str):
                            if "T" in created_at:
                                rec_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                            else:
                                rec_date = datetime.fromtimestamp(created_at / 1000)
                        else:
                            rec_date = datetime.now()
                        
                        days_since_creation = (datetime.now() - rec_date).days
                        if days_since_creation <= 7:
                            recent_recommendations += 1
                    except Exception as date_error:
                        logger.warning(f"Error parsing date for recommendation {doc.id}: {date_error}")
                
                # Calculate total cost
                cost = rec_data.get("total_cost") or rec_data.get("totalCost") or 0
                if isinstance(cost, (int, float)):
                    total_cost += float(cost)
                
                # Add to recommendations list
                recommendations_data.append({
                    "id": doc.id,
                    "flock_name": rec_data.get("flock_name") or rec_data.get("flockName", "Unknown Flock"),
                    "total_cost": float(cost),
                    "created_at": created_at,
                    "status": rec_data.get("status", "completed"),
                    "feed_type": rec_data.get("feed_type") or rec_data.get("feedType", "general")
                })
            
            results["summary"]["recent_recommendations"] = recent_recommendations
            results["summary"]["total_cost_incurred"] = total_cost
            results["recommendations"] = recommendations_data[:3]  # Show only 3 recent
            
            # Calculate estimated savings (15% of total cost)
            estimated_savings = int(total_cost * 0.15) if total_cost > 0 else 0
            results["summary"]["estimated_savings"] = estimated_savings
            
        except Exception as rec_error:
            logger.error(f"Error fetching recommendations: {rec_error}")
        
        # 3. Fetch recent activity
        try:
            # Try to get from activities collection
            activity_ref = db.collection("activities")
            activity_query = activity_ref.where("user_id", "==", user_id)\
                                         .order_by("created_at", direction=firestore.Query.DESCENDING)\
                                         .limit(5)
            activities_docs = list(activity_query.stream())
            
            recent_activities = []
            for doc in activities_docs:
                activity_data = doc.to_dict()
                recent_activities.append({
                    "id": doc.id,
                    "action": activity_data.get("action", "activity"),
                    "description": activity_data.get("description", "User activity"),
                    "created_at": activity_data.get("created_at", datetime.now())
                })
            
            # If no activities, generate some based on user data
            if not recent_activities:
                if rec_count > 0:
                    recent_activities.append({
                        "action": "recommendation_created",
                        "description": f"Created feed recommendation",
                        "created_at": datetime.now() - timedelta(hours=2)
                    })
                if flock_count > 0:
                    recent_activities.append({
                        "action": "flock_added",
                        "description": f"Added {flock_count} flock(s)",
                        "created_at": datetime.now() - timedelta(days=1)
                    })
                recent_activities.append({
                    "action": "login",
                    "description": "Logged into the system",
                    "created_at": datetime.now() - timedelta(minutes=30)
                })
            
            results["recent_activity"] = recent_activities
            
        except Exception as activity_error:
            logger.error(f"Error fetching activities: {activity_error}")
            # Create default activities
            results["recent_activity"] = [
                {
                    "action": "system",
                    "description": "Welcome to Poultry Feeding Platform",
                    "created_at": datetime.now()
                }
            ]
        
        # 4. Calculate health status
        try:
            if flock_count > 0:
                results["health_status"]["flock_health"] = "Good" if active_flocks > 0 else "Needs attention"
            
            if rec_count > 0:
                results["health_status"]["recommendation_rate"] = "Active" if recent_recommendations > 0 else "Inactive"
            
            if flock_count > 0 and rec_count > 0:
                results["health_status"]["overall_status"] = "Healthy"
            elif flock_count > 0:
                results["health_status"]["overall_status"] = "Partial"
            else:
                results["health_status"]["overall_status"] = "Needs attention"
                
        except Exception as health_error:
            logger.error(f"Error calculating health status: {health_error}")
        
        logger.info(f"Dashboard analytics prepared for user {user_email}")
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_dashboard_analytics: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard analytics: {str(e)}"
        )

@router.get("/quick-stats")
async def get_quick_stats(
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """Get quick statistics for dashboard cards"""
    try:
        user_id = current_user.get("uid") or current_user.get("id")
        
        if not user_id:
            return {
                "flock_count": 0,
                "recommendation_count": 0,
                "estimated_savings": 0,
                "currency": "UGX"
            }
        
        # Get flock count
        flocks_ref = db.collection("flocks")
        flocks_count = len(list(flocks_ref.where("userId", "==", user_id).stream()))
        
        # Get recommendation count
        recs_ref = db.collection("recommendations")
        recs_count = len(list(recs_ref.where("userId", "==", user_id).stream()))
        
        # Simple savings calculation
        estimated_savings = recs_count * 15000  # UGX 15,000 per recommendation
        
        return {
            "flock_count": flocks_count,
            "recommendation_count": recs_count,
            "estimated_savings": estimated_savings,
            "currency": "UGX"
        }
        
    except Exception as e:
        logger.error(f"Error in get_quick_stats: {str(e)}")
        return {
            "flock_count": 0,
            "recommendation_count": 0,
            "estimated_savings": 0,
            "currency": "UGX"
        }

@router.get("/flock-stats")
async def get_flock_statistics(
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """Get flock statistics"""
    try:
        user_id = current_user.get("uid") or current_user.get("id")
        
        if not user_id:
            return {"error": "User not authenticated"}
        
        flocks_ref = db.collection("flocks")
        flocks_query = flocks_ref.where("userId", "==", user_id)
        flocks_docs = list(flocks_query.stream())
        
        stats = {
            "total_flocks": len(flocks_docs),
            "total_birds": 0,
            "by_type": {},
            "age_distribution": {
                "young": 0,  # 0-4 weeks
                "growing": 0,  # 5-8 weeks
                "mature": 0  # 9+ weeks
            }
        }
        
        for doc in flocks_docs:
            flock_data = doc.to_dict()
            
            # Count birds
            bird_count = int(flock_data.get("quantity", 0))
            stats["total_birds"] += bird_count
            
            # Count by type
            bird_type = flock_data.get("birdType", flock_data.get("bird_type", "unknown"))
            stats["by_type"][bird_type] = stats["by_type"].get(bird_type, 0) + 1
            
            # Age distribution
            age = int(flock_data.get("age", 0))
            if age <= 4:
                stats["age_distribution"]["young"] += 1
            elif age <= 8:
                stats["age_distribution"]["growing"] += 1
            else:
                stats["age_distribution"]["mature"] += 1
        
        return stats
        
    except Exception as e:
        logger.error(f"Error in get_flock_statistics: {str(e)}")
        return {"error": str(e)}

@router.get("/recommendation-stats")
async def get_recommendation_statistics(
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """Get recommendation statistics"""
    try:
        user_id = current_user.get("uid") or current_user.get("id")
        
        if not user_id:
            return {"error": "User not authenticated"}
        
        recs_ref = db.collection("recommendations")
        recs_query = recs_ref.where("userId", "==", user_id)
        recs_docs = list(recs_query.stream())
        
        stats = {
            "total_recommendations": len(recs_docs),
            "total_cost": 0,
            "average_cost": 0,
            "by_status": {},
            "by_feed_type": {}
        }
        
        total_cost = 0
        
        for doc in recs_docs:
            rec_data = doc.to_dict()
            
            # Calculate cost
            cost = rec_data.get("total_cost") or rec_data.get("totalCost") or 0
            if isinstance(cost, (int, float)):
                total_cost += float(cost)
            
            # Count by status
            status = rec_data.get("status", "unknown")
            stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
            
            # Count by feed type
            feed_type = rec_data.get("feed_type") or rec_data.get("feedType", "general")
            stats["by_feed_type"][feed_type] = stats["by_feed_type"].get(feed_type, 0) + 1
        
        stats["total_cost"] = total_cost
        stats["average_cost"] = total_cost / len(recs_docs) if len(recs_docs) > 0 else 0
        
        return stats
        
    except Exception as e:
        logger.error(f"Error in get_recommendation_statistics: {str(e)}")
        return {"error": str(e)}
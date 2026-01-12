from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.api.deps import get_current_user, get_db
from datetime import datetime
import uuid

router = APIRouter()

# Mock nutrition data for Uganda
UGANDAN_INGREDIENTS = {
    "maize": {"protein": 8.5, "energy": 3300, "cost_per_kg": 1200},
    "soybean": {"protein": 40.0, "energy": 2400, "cost_per_kg": 2500},
    "fishmeal": {"protein": 60.0, "energy": 2800, "cost_per_kg": 5000},
    "sunflower": {"protein": 35.0, "energy": 2600, "cost_per_kg": 1800},
    "rice_bran": {"protein": 12.0, "energy": 2800, "cost_per_kg": 800},
    "wheat_bran": {"protein": 15.0, "energy": 2500, "cost_per_kg": 900},
    "bone_meal": {"protein": 20.0, "energy": 1200, "cost_per_kg": 1500},
}

# Poultry requirements by type and age
POULTRY_REQUIREMENTS = {
    "broiler": {
        "starter": {"protein": 22.0, "energy": 3000},
        "grower": {"protein": 20.0, "energy": 3100},
        "finisher": {"protein": 18.0, "energy": 3200}
    },
    "layer": {
        "starter": {"protein": 20.0, "energy": 2800},
        "grower": {"protein": 18.0, "energy": 2850},
        "layer": {"protein": 16.0, "energy": 2900}
    },
    "local": {
        "all": {"protein": 15.0, "energy": 2700}
    }
}

@router.post("/generate")
async def generate_recommendation(
    flock_id: str,
    available_ingredients: List[str],
    budget_constraint: float = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Generate AI-based feeding recommendation"""
    try:
        # Get flock details
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
        
        # Get bird type and age
        bird_type = flock_data["bird_type"]
        age_weeks = flock_data["age_weeks"]
        
        # Determine growth stage
        if bird_type == "broiler":
            if age_weeks < 3:
                stage = "starter"
            elif age_weeks < 5:
                stage = "grower"
            else:
                stage = "finisher"
        elif bird_type == "layer":
            if age_weeks < 8:
                stage = "starter"
            elif age_weeks < 18:
                stage = "grower"
            else:
                stage = "layer"
        else:
            stage = "all"
        
        # Get nutritional requirements
        requirements = POULTRY_REQUIREMENTS[bird_type][stage]
        
        # Simple AI algorithm: optimize for cost while meeting requirements
        available_nutrients = {}
        for ingredient in available_ingredients:
            if ingredient in UGANDAN_INGREDIENTS:
                available_nutrients[ingredient] = UGANDAN_INGREDIENTS[ingredient]
        
        if not available_nutrients:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid ingredients provided"
            )
        
        # Simple formulation (in reality, this would be more complex)
        recommendation = {
            "flock_id": flock_id,
            "bird_type": bird_type,
            "age_weeks": age_weeks,
            "stage": stage,
            "requirements": requirements,
            "formulation": [],
            "total_cost_per_kg": 0,
            "estimated_daily_cost": 0,
            "nutritional_analysis": {}
        }
        
        # Mock formulation (replace with real algorithm)
        total_birds = flock_data["number_of_birds"]
        for ingredient, data in list(available_nutrients.items())[:3]:  # Use first 3 ingredients
            percentage = 30 if len(recommendation["formulation"]) == 0 else 35
            cost = data["cost_per_kg"] * (percentage / 100)
            
            recommendation["formulation"].append({
                "ingredient": ingredient,
                "percentage": percentage,
                "cost_per_kg": data["cost_per_kg"],
                "contribution_cost": cost
            })
            recommendation["total_cost_per_kg"] += cost
        
        # Calculate daily cost
        avg_feed_per_bird = 0.12  # kg per bird per day
        recommendation["estimated_daily_cost"] = (
            recommendation["total_cost_per_kg"] * avg_feed_per_bird * total_birds
        )
        
        # Save recommendation to database
        rec_id = str(uuid.uuid4())
        now = datetime.now()
        
        rec_ref = db.collection("recommendations").document(rec_id)
        rec_ref.set({
            **recommendation,
            "user_id": current_user["id"],
            "created_at": now,
            "budget_constraint": budget_constraint
        })
        
        recommendation["id"] = rec_id
        recommendation["created_at"] = now
        
        return recommendation
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendation: {str(e)}"
        )

@router.get("/history")
async def get_recommendation_history(
    flock_id: str = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get recommendation history"""
    try:
        recommendations_ref = db.collection("recommendations")
        query = recommendations_ref.where("user_id", "==", current_user["id"])
        
        if flock_id:
            query = query.where("flock_id", "==", flock_id)
        
        recommendations = query.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        
        result = []
        for rec in recommendations:
            rec_data = rec.to_dict()
            rec_data["id"] = rec.id
            result.append(rec_data)
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )

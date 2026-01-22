# backend/app/services/recommendation_engine.py - FIXED VERSION
from typing import Dict, List, Optional
import logging
from datetime import datetime
from firebase_admin import firestore

from app.schemas.recommendation import (
    RecommendationCreate, 
    RecommendationResponse,
    RecommendationStatus,
    IngredientRatio,
    FormulationObjective
)

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self, db: firestore.Client):
        self.db = db
        
    async def generate_recommendation(
        self, 
        recommendation: RecommendationCreate,
        user_id: str,  # This will be current_user["id"]
        flock_data: Dict
    ) -> RecommendationResponse:
        """
        Generate a feed formulation recommendation using linear programming
        """
        try:
            # Create initial recommendation document with pending status
            rec_ref = self.db.collection("recommendations").document()
            rec_data = {
                **recommendation.dict(),
                "user_id": user_id,  # Using user_id directly
                "status": RecommendationStatus.PROCESSING.value,
                "created_at": datetime.utcnow(),
                "flock_name": flock_data.get("name")
            }
            rec_ref.set(rec_data)
            
            # Get available ingredients
            ingredients = await self._get_available_ingredients(user_id)
            
            # Get nutrient requirements for this flock type and stage
            requirements = await self._get_nutrient_requirements(
                breed_type=flock_data.get("breed_type"),
                age_days=recommendation.age_days
            )
            
            # Generate formulation
            formulation = await self._generate_formulation(
                ingredients=ingredients,
                requirements=requirements,
                objective=recommendation.formulation_objective,
                quantity_kg=recommendation.quantity_kg
            )
            
            # Calculate nutritional analysis
            nutritional_analysis = self._calculate_nutritional_analysis(
                formulation=formulation,
                requirements=requirements
            )
            
            # Prepare response
            total_cost = sum(ing["cost"] for ing in formulation)
            cost_per_kg = total_cost / recommendation.quantity_kg
            
            response_data = {
                "id": rec_ref.id,
                "flock_id": recommendation.flock_id,
                "formulation_objective": recommendation.formulation_objective,
                "feed_type": recommendation.feed_type,
                "status": RecommendationStatus.COMPLETED,
                "total_cost": round(total_cost, 2),
                "cost_per_kg": round(cost_per_kg, 2),
                "ingredients": formulation,
                "nutritional_analysis": nutritional_analysis,
                "created_at": rec_data["created_at"],
                "completed_at": datetime.utcnow()
            }
            
            # Update the document with results
            update_data = {
                **response_data,
                "status": RecommendationStatus.COMPLETED.value,
                "completed_at": datetime.utcnow()
            }
            # Convert datetime objects to Firestore timestamp
            update_data["created_at"] = firestore.SERVER_TIMESTAMP
            update_data["completed_at"] = firestore.SERVER_TIMESTAMP
            rec_ref.update(update_data)
            
            return RecommendationResponse(**response_data)
            
        except Exception as e:
            logger.error(f"Error generating recommendation: {str(e)}")
            # Update status to failed
            if 'rec_ref' in locals():
                rec_ref.update({
                    "status": RecommendationStatus.FAILED.value,
                    "error": str(e)
                })
            raise
    
    async def _get_available_ingredients(self, user_id: str) -> List[Dict]:
        """
        Get available ingredients from the database
        In production, this would filter by user's location/availability
        """
        try:
            ingredients_ref = self.db.collection("ingredients")
            # For now, get all ingredients. Later filter by user's region
            docs = ingredients_ref.where("availability_score", ">=", 5).stream()
            
            ingredients = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                ingredients.append(data)
            
            # If no ingredients in DB, use default ones
            if not ingredients:
                ingredients = self._get_default_ingredients()
                
            return ingredients
            
        except Exception as e:
            logger.warning(f"Using default ingredients due to error: {str(e)}")
            return self._get_default_ingredients()
    
    async def _get_nutrient_requirements(
        self, 
        breed_type: str, 
        age_days: int
    ) -> Dict[str, Dict[str, float]]:
        """
        Get nutrient requirements based on breed type and age
        """
        try:
            req_ref = self.db.collection("nutrient_requirements")
            
            # Query for matching requirements
            query = req_ref.where("breed_type", "==", breed_type)\
                          .where("age_min_days", "<=", age_days)\
                          .where("age_max_days", ">=", age_days)
            
            docs = query.stream()
            
            for doc in docs:
                return doc.to_dict().get("requirements", {})
            
            # If no specific requirements found, return defaults
            return self._get_default_requirements(breed_type, age_days)
            
        except Exception as e:
            logger.warning(f"Using default requirements: {str(e)}")
            return self._get_default_requirements(breed_type, age_days)
    
    async def _generate_formulation(
        self,
        ingredients: List[Dict],
        requirements: Dict[str, Dict[str, float]],
        objective: FormulationObjective,
        quantity_kg: float
    ) -> List[Dict]:
        """
        Generate feed formulation using linear programming optimization
        Simplified version for demo - in production use scipy.optimize.linprog
        """
        # Simplified optimization algorithm
        # This is a placeholder - implement proper linear programming here
        
        formulation = []
        
        # Sort ingredients by cost for minimization, by protein for maximization
        if objective == FormulationObjective.MINIMIZE_COST:
            sorted_ingredients = sorted(ingredients, key=lambda x: x.get("cost_per_unit", 0))
        else:
            sorted_ingredients = sorted(
                ingredients, 
                key=lambda x: x.get("nutrients", {}).get("protein", 0), 
                reverse=True
            )
        
        # Simple heuristic: Use up to 6 ingredients
        selected_ingredients = sorted_ingredients[:6]
        
        # Distribute percentages (simplified - in production use optimization)
        base_percentage = 100 / len(selected_ingredients)
        
        for i, ingredient in enumerate(selected_ingredients):
            # Adjust percentages for protein sources
            protein_content = ingredient.get("nutrients", {}).get("protein", 0)
            if protein_content > 20:  # High protein ingredient
                percentage = base_percentage * 1.5
            elif protein_content < 5:  # Low protein ingredient
                percentage = base_percentage * 0.5
            else:
                percentage = base_percentage
            
            # Ensure total doesn't exceed 100%
            percentage = min(percentage, 100 - sum([ing["percentage"] for ing in formulation]))
            
            amount_kg = (percentage / 100) * quantity_kg
            cost = amount_kg * ingredient.get("cost_per_unit", 0)
            
            formulation.append({
                "ingredient_id": ingredient["id"],
                "ingredient_name": ingredient["name"],
                "percentage": round(percentage, 2),
                "amount_kg": round(amount_kg, 2),
                "cost": round(cost, 2)
            })
        
        # Normalize to ensure total is 100%
        total_percentage = sum(ing["percentage"] for ing in formulation)
        if total_percentage != 100:
            for ing in formulation:
                ing["percentage"] = round(ing["percentage"] * 100 / total_percentage, 2)
                ing["amount_kg"] = round((ing["percentage"] / 100) * quantity_kg, 2)
                ing["cost"] = round(ing["amount_kg"] * next(
                    (i["cost_per_unit"] for i in ingredients if i["id"] == ing["ingredient_id"]), 0
                ), 2)
        
        return formulation
    
    def _calculate_nutritional_analysis(
        self,
        formulation: List[Dict],
        requirements: Dict[str, Dict[str, float]]
    ) -> Dict[str, Dict[str, float]]:
        """
        Calculate nutritional content of the formulation and compare with requirements
        """
        analysis = {}
        
        # For each nutrient in requirements, calculate content
        for nutrient, req_range in requirements.items():
            total_content = 0
            
            for ingredient in formulation:
                # Get the ingredient data to find nutrient content
                # This is simplified - in production, you'd have a proper lookup
                if nutrient in ingredient.get("nutrients", {}):
                    content = ingredient["nutrients"][nutrient]
                else:
                    # Default values for demonstration
                    if nutrient == "protein":
                        content = 15
                    elif nutrient == "energy":
                        content = 2800
                    elif nutrient == "calcium":
                        content = 1
                    elif nutrient == "phosphorus":
                        content = 0.5
                    else:
                        content = 0
                
                contribution = (ingredient["percentage"] / 100) * content
                total_content += contribution
            
            analysis[nutrient] = {
                "actual": round(total_content, 2),
                "min_required": req_range.get("min", 0),
                "max_allowed": req_range.get("max", 100),
                "status": "adequate" if req_range.get("min", 0) <= total_content <= req_range.get("max", 100) else "outside_range"
            }
        
        return analysis
    
    def _get_default_ingredients(self) -> List[Dict]:
        """Default ingredients for Uganda poultry farming"""
        return [
            {
                "id": "1",
                "name": "Maize",
                "local_names": ["Mucele", "Maize"],
                "category": "energy_source",
                "cost_per_unit": 1500,  # UGX per kg
                "unit": "kg",
                "nutrients": {
                    "protein": 8.5,
                    "energy": 3350,
                    "fiber": 2.5,
                    "fat": 4.0
                },
                "availability_score": 9
            },
            {
                "id": "2",
                "name": "Soybean Meal",
                "local_names": ["Soya"],
                "category": "protein_source",
                "cost_per_unit": 2800,
                "unit": "kg",
                "nutrients": {
                    "protein": 45.0,
                    "energy": 2400,
                    "lysine": 2.9,
                    "methionine": 0.6
                },
                "availability_score": 7
            },
            {
                "id": "3",
                "name": "Fish Meal",
                "local_names": ["Fish Meal"],
                "category": "protein_source",
                "cost_per_unit": 5000,
                "unit": "kg",
                "nutrients": {
                    "protein": 65.0,
                    "energy": 2800,
                    "calcium": 4.0,
                    "phosphorus": 2.5
                },
                "availability_score": 5
            }
        ]
    
    def _get_default_requirements(self, breed_type: str, age_days: int) -> Dict[str, Dict[str, float]]:
        """Default nutrient requirements based on breed and age"""
        if breed_type == "broiler":
            if age_days < 21:
                return {
                    "protein": {"min": 22, "max": 24},
                    "energy": {"min": 3000, "max": 3200},
                    "calcium": {"min": 0.9, "max": 1.1},
                    "phosphorus": {"min": 0.45, "max": 0.55}
                }
            elif age_days < 42:
                return {
                    "protein": {"min": 20, "max": 22},
                    "energy": {"min": 3100, "max": 3300},
                    "calcium": {"min": 0.8, "max": 1.0},
                    "phosphorus": {"min": 0.4, "max": 0.5}
                }
            else:
                return {
                    "protein": {"min": 18, "max": 20},
                    "energy": {"min": 3200, "max": 3400},
                    "calcium": {"min": 0.7, "max": 0.9},
                    "phosphorus": {"min": 0.35, "max": 0.45}
                }
        else:  # layers
            return {
                "protein": {"min": 16, "max": 18},
                "energy": {"min": 2800, "max": 3000},
                "calcium": {"min": 3.5, "max": 4.5},
                "phosphorus": {"min": 0.3, "max": 0.4}
            }

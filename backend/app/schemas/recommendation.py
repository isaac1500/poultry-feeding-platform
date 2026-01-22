# backend/app/schemas/recommendation.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum

class RecommendationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class FormulationObjective(str, Enum):
    MINIMIZE_COST = "minimize_cost"
    MAXIMIZE_GROWTH = "maximize_growth"
    BALANCED = "balanced"
    CUSTOM = "custom"

class FeedType(str, Enum):
    STARTER = "starter"
    GROWER = "grower"
    FINISHER = "finisher"
    LAYER = "layer"
    BROILER = "broiler"

class RecommendationBase(BaseModel):
    flock_id: str
    formulation_objective: FormulationObjective
    feed_type: FeedType
    target_weight_kg: Optional[float] = None
    current_weight_kg: Optional[float] = None
    age_days: int
    quantity_kg: float = Field(gt=0, description="Amount of feed to produce")
    constraints: Optional[Dict[str, float]] = None  # Custom constraints

class RecommendationCreate(RecommendationBase):
    pass

class IngredientRatio(BaseModel):
    ingredient_id: str
    ingredient_name: str
    percentage: float  # Percentage in final mix
    amount_kg: float  # Actual amount in kg
    cost: float  # Cost for this ingredient

class RecommendationResponse(BaseModel):
    id: str
    flock_id: str
    formulation_objective: FormulationObjective
    feed_type: FeedType
    status: RecommendationStatus
    total_cost: float
    cost_per_kg: float
    ingredients: List[IngredientRatio]
    nutritional_analysis: Dict[str, Dict[str, float]]  # Nutrient analysis vs requirements
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class RecommendationSummary(BaseModel):
    id: str
    flock_name: str
    feed_type: str
    total_cost: float
    status: RecommendationStatus
    created_at: datetime

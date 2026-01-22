# backend/app/schemas/nutrition.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class NutrientType(str, Enum):
    PROTEIN = "protein"
    ENERGY = "energy"
    CALCIUM = "calcium"
    PHOSPHORUS = "phosphorus"
    LYSINE = "lysine"
    METHIONINE = "methionine"
    FAT = "fat"
    FIBER = "fiber"
    MOISTURE = "moisture"
    ASH = "ash"

class IngredientUnit(str, Enum):
    KG = "kg"
    G = "g"
    L = "l"
    ML = "ml"
    BAG = "bag"  # Common in Uganda

class IngredientCategory(str, Enum):
    ENERGY_SOURCE = "energy_source"  # Maize, sorghum
    PROTEIN_SOURCE = "protein_source"  # Soybean, fishmeal
    MINERAL_SOURCE = "mineral_source"  # Limestone, salt
    VITAMIN_PREMIX = "vitamin_premix"
    ADDITIVE = "additive"  # Enzymes, antibiotics

class NutrientBase(BaseModel):
    nutrient_type: NutrientType
    value: float
    unit: str = "%"  # Percentage

class IngredientBase(BaseModel):
    name: str
    local_names: List[str] = []  # Local language names
    category: IngredientCategory
    cost_per_unit: float
    unit: IngredientUnit
    nutrients: Dict[NutrientType, float]  # Nutrient composition in %
    availability_score: float = Field(ge=0, le=10)  # 0-10 score
    description: Optional[str] = None
    supplier: Optional[str] = None
    seasonality: List[str] = []  # ["dry", "wet", "all"]
    
class IngredientCreate(IngredientBase):
    pass

class IngredientUpdate(BaseModel):
    cost_per_unit: Optional[float] = None
    availability_score: Optional[float] = None
    description: Optional[str] = None
    supplier: Optional[str] = None

class IngredientResponse(IngredientBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class NutrientRequirementBase(BaseModel):
    breed_type: str  # broiler, layer, etc.
    stage: str  # starter, grower, finisher, layer
    age_min_days: int
    age_max_days: int
    requirements: Dict[NutrientType, Dict[str, float]]  # {"protein": {"min": 18, "max": 22}}

class NutrientRequirementCreate(NutrientRequirementBase):
    pass

class NutrientRequirementResponse(NutrientRequirementBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

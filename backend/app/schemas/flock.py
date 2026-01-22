from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class BirdType(str, Enum):
    BROILER = "broiler"
    LAYER = "layer"
    LOCAL = "local"
    OTHER = "other"

class FlockBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the flock")
    bird_type: BirdType = Field(..., description="Type of poultry birds")
    number_of_birds: int = Field(..., gt=0, description="Total number of birds")
    age_weeks: int = Field(..., ge=0, description="Age in weeks")
    breed: Optional[str] = Field(None, max_length=100, description="Breed/variety")
    housing_type: Optional[str] = Field(None, description="Free-range, battery cages, etc.")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")

class FlockCreate(FlockBase):
    pass

class FlockUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    number_of_birds: Optional[int] = Field(None, gt=0)
    age_weeks: Optional[int] = Field(None, ge=0)
    breed: Optional[str] = Field(None, max_length=100)
    housing_type: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=500)

class FlockInDB(FlockBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True

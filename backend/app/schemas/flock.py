from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class BirdType(str, Enum):
    BROILER = "broiler"
    LAYER = "layer"
    LOCAL = "local"

class FlockBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    bird_type: BirdType
    number_of_birds: int = Field(..., gt=0)
    age_weeks: int = Field(..., ge=0)
    breed: Optional[str] = None
    notes: Optional[str] = None

class FlockCreate(FlockBase):
    pass

class FlockUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    number_of_birds: Optional[int] = Field(None, gt=0)
    age_weeks: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None

class FlockInDB(FlockBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True

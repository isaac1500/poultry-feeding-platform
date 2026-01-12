from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str  # Changed from EmailStr to str for simplicity
    full_name: str
    farm_name: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    farm_name: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None

class UserInDB(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInDB

class TokenData(BaseModel):
    user_id: Optional[str] = None

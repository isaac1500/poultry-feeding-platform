# backend/app/api/v1/api.py
from fastapi import APIRouter
from app.api.v1 import auth, flocks, recommendations  # Add recommendations here

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(flocks.router, prefix="/flocks", tags=["Flocks"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])  # Add this line
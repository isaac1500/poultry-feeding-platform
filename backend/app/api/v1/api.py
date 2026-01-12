from fastapi import APIRouter
from app.api.v1 import auth, flocks, recommendations, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(flocks.router, prefix="/flocks", tags=["flocks"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

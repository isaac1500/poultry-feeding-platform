# backend/app/api/v1/__init__.py - UPDATED VERSION
from fastapi import APIRouter
from .auth import router as auth_router
from .flocks import router as flocks_router
from .recommendations import router as recommendations_router
from .analytics import router as analytics_router
from .progress import router as progress_router

# Create main API router
api_router = APIRouter()

# Include all routers with their prefixes
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(flocks_router, prefix="/flocks", tags=["Flocks"])
api_router.include_router(recommendations_router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(progress_router, prefix="/progress", tags=["Progress Tracking"])

# You can also add version info
@api_router.get("/")
async def api_v1_root():
    return {
        "message": "Poultry Feeding Platform API v1",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/v1/auth",
            "flocks": "/api/v1/flocks",
            "recommendations": "/api/v1/recommendations",
            "analytics": "/api/v1/analytics",
            "progress": "/api/v1/progress"
        }
    }

__all__ = ["api_router", "auth_router", "flocks_router", "recommendations_router", "analytics_router", "progress_router"]
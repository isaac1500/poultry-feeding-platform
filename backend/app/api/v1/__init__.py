# backend/app/api/v1/__init__.py
from .auth import router as auth_router
from .flocks import router as flocks_router
from .recommendations import router as recommendations_router

__all__ = ["auth_router", "flocks_router", "recommendations_router"]

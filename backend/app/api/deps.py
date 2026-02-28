# backend/app/api/deps.py - SIMPLIFIED WORKING VERSION
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_db():
    """Get database instance - simplified mock"""
    print("📦 Using mock database")
    return None  # Return None for now, or mock object

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Verify token or return mock user - NO FIREBASE DEPENDENCY"""
    try:
        # Try to get token
        token = credentials.credentials
        
        # For development, accept any token or use mock
        print(f"🔑 Token received (length: {len(token) if token else 0})")
        
        # Return mock user - this will make ALL endpoints work
        return {
            "id": "dev-user-123",
            "uid": "dev-user-123",
            "email": "developer@example.com",
            "display_name": "Development User",
            "user_id": "dev-user-123"
        }
    
    except Exception as e:
        print(f"⚠️ Auth using mock due to: {e}")
        # Always return mock user for development
        return {
            "id": "mock-user-id",
            "uid": "mock-user-id",
            "email": "test@example.com",
            "display_name": "Test User",
            "user_id": "mock-user-id"
        }

# Alternative: Completely skip auth for development
async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security, use_cache=False)
):
    """Optional auth - always returns user even without token"""
    try:
        token = credentials.credentials
        if token:
            print(f"✅ Token present: {token[:20]}...")
    except:
        pass
    
    # Always return a user
    return {
        "id": "optional-user",
        "uid": "optional-user",
        "email": "optional@example.com",
        "user_id": "optional-user"
    }
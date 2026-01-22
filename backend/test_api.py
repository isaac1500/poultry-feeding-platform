# test_api.py
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Test importing from api/v1
    from app.api.v1 import auth_router, flocks_router, recommendations_router
    print(" All routers imported from app.api.v1")
    
    # Test importing the api_router
    from app.api.v1.api import api_router
    print(" api_router imported successfully")
    
    # Count how many routes are registered
    total_routes = len(api_router.routes)
    print(f" Total routes in api_router: {total_routes}")
    
    print("\n All imports working correctly!")
    
except ImportError as e:
    print(f" Import error: {e}")
    print(f"Current Python path: {sys.path}")
    print(f"Current directory: {os.getcwd()}")
    
except Exception as e:
    print(f" Unexpected error: {e}")
    print(f"Error type: {type(e).__name__}")

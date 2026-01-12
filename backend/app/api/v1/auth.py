from fastapi import APIRouter, Depends, HTTPException, status
from app.db.firestore import db
import firebase_admin
from firebase_admin import auth as firebase_auth
from app.schemas.user import UserCreate, UserInDB, Token
from app.api.deps import get_db
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/register", response_model=UserInDB)
async def register(user_data: UserCreate, db = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        users_ref = db.collection("users")
        query = users_ref.where("email", "==", user_data.email).limit(1)
        existing_users = query.get()
        
        if len(existing_users) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user in Firebase Auth
        firebase_user = firebase_auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.full_name
        )
        
        # Create user in Firestore
        user_id = firebase_user.uid
        now = datetime.now()
        
        user_ref = db.collection("users").document(user_id)
        user_ref.set({
            "email": user_data.email,
            "full_name": user_data.full_name,
            "farm_name": user_data.farm_name,
            "location": user_data.location,
            "phone": user_data.phone,
            "created_at": now,
            "updated_at": now,
            "is_active": True
        })
        
        # Get created user
        user_doc = user_ref.get()
        user_data = user_doc.to_dict()
        user_data["id"] = user_id
        
        return user_data
    
    except firebase_auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login():
    """Login user (Firebase handles this on frontend)"""
    # Firebase authentication happens on frontend
    # This endpoint just returns success
    return {"message": "Use Firebase Auth on frontend"}

@router.get("/me", response_model=UserInDB)
async def get_current_user_info(current_user: UserInDB = Depends(get_db)):
    """Get current user info"""
    return current_user

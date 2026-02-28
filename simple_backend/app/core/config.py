# app/core/config.py
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Project info
    PROJECT_NAME: str = "Poultry Feeding Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite
        "http://localhost:3000",  # React
    ]
    
    # Security (development)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()

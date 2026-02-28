# backend/app/core/config.py - NO PYDANTIC-SETTINGS
import os
from typing import List

class Settings:
    # Load from environment
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_PRIVATE_KEY_ID: str = os.getenv("FIREBASE_PRIVATE_KEY_ID", "")
    FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n')
    FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
    FIREBASE_CLIENT_ID: str = os.getenv("FIREBASE_CLIENT_ID", "")
    FIREBASE_CLIENT_X509_CERT_URL: str = os.getenv("FIREBASE_CLIENT_X509_CERT_URL", "")

    # App settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORS - fixed list
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Server
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # App info
    PROJECT_NAME: str = "Poultry Feeding Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

settings = Settings()
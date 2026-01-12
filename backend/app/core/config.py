from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Firebase Configuration
    FIREBASE_PROJECT_ID: str
    FIREBASE_PRIVATE_KEY_ID: str
    FIREBASE_PRIVATE_KEY: str
    FIREBASE_CLIENT_EMAIL: str
    FIREBASE_CLIENT_ID: str
    FIREBASE_CLIENT_X509_CERT_URL: str
    
    # Application Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Server
    PORT: int = 5000
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()

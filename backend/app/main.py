from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router  # This imports your centralized router

app = FastAPI(
    title="Poultry Feeding Platform API",
    description="Backend API for AI-driven poultry feeding recommendations",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes - this already includes everything through api_router
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Poultry Feeding Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "poultry-feeding-api"}
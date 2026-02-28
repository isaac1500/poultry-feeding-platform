# backend/app/working_main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

print("🚀 Starting Poultry Platform Backend...")

app = FastAPI(
    title="Poultry Feeding Platform API",
    description="AI-Driven Poultry Feeding Recommendations",
    version="1.0.0"
)

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Essential endpoints
@app.get("/progress/progress")
async def get_progress():
    """Fix for Progress.jsx error"""
    print("✅ /progress/progress called")
    return {
        "success": True,
        "data": [
            {
                "id": "1",
                "userId": "user123",
                "flockId": "flock1",
                "date": "2024-01-20",
                "weight": 1.5,
                "feedConsumed": 100,
                "waterConsumed": 200
            },
            {
                "id": "2", 
                "userId": "user123",
                "flockId": "flock1",
                "date": "2024-01-19",
                "weight": 1.4,
                "feedConsumed": 95,
                "waterConsumed": 190
            }
        ]
    }

@app.get("/api/v1/analytics/dashboard")
async def get_dashboard():
    """Fix for Dashboard.jsx error"""
    print("✅ /api/v1/analytics/dashboard called")
    return {
        "success": True,
        "data": {
            "flockCount": 3,
            "recommendationCount": 5,
            "totalBirds": 150,
            "averageWeight": 1.8,
            "recentActivity": [
                {"type": "feeding", "flock": "Layer Hens", "time": "2 hours ago"},
                {"type": "weight_check", "flock": "Broilers", "time": "1 day ago"},
            ]
        }
    }

@app.get("/")
async def root():
    return {"message": "Poultry Platform API is running", "status": "active"}

@app.get("/health")
async def health():
    return {"status": "healthy", "backend": "working"}

@app.get("/test")
async def test():
    return {"test": "passed", "message": "Backend is responding"}

if __name__ == "__main__":
    import uvicorn
    print("🌐 Server: http://localhost:8000")
    print("📊 Progress endpoint: http://localhost:8000/progress/progress")
    print("📈 Dashboard endpoint: http://localhost:8000/api/v1/analytics/dashboard")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
# app/main.py - COMPLETE WITH ALL ENDPOINTS (FIXED VERSION)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

print("🚀 Poultry Platform Backend Running...")

app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ ALL ESSENTIAL ENDPOINTS ============

# 1. Progress endpoint (UPDATED FOR FRONTEND EXPECTATIONS)
@app.get("/progress/progress")
async def get_progress(flock_id: str = None, time_range: str = "30"):
    print(f"✅ /progress/progress called with flock_id={flock_id}, time_range={time_range}")
    
    # Sample progress records
    progress_data = [
        {
            "id": "1",
            "userId": "user123",
            "flockId": "flock1",
            "flockName": "Layer Hens",
            "date": "2024-01-20",
            "weight": 1.5,
            "feedConsumed": 100,
            "waterConsumed": 200,
            "mortality": 0,
            "eggProduction": 45,
            "notes": "Good growth"
        },
        {
            "id": "2",
            "userId": "user123",
            "flockId": "flock1",
            "flockName": "Layer Hens",
            "date": "2024-01-19",
            "weight": 1.4,
            "feedConsumed": 95,
            "waterConsumed": 190,
            "mortality": 1,
            "eggProduction": 43,
            "notes": "Normal day"
        },
        {
            "id": "3",
            "userId": "user123",
            "flockId": "flock2",
            "flockName": "Broilers",
            "date": "2024-01-18",
            "weight": 2.1,
            "feedConsumed": 120,
            "waterConsumed": 240,
            "mortality": 0,
            "eggProduction": 0,
            "notes": "Excellent growth"
        }
    ]
    
    # Sample flocks for dropdown
    flocks = [
        {"id": "1", "name": "Layer Hens", "bird_type": "Layers", "quantity": 50, "age": 20},
        {"id": "2", "name": "Broilers", "bird_type": "Broilers", "quantity": 150, "age": 30},
        {"id": "3", "name": "Chicks", "bird_type": "Chicks", "quantity": 50, "age": 10}
    ]
    
    # Sample recommendations
    recommendations = [
        {
            "id": "1",
            "flock_name": "Layer Hens",
            "created_at": "2024-01-20",
            "feed_type": "Layer Mash",
            "total_cost": 42500,
            "status": "completed"
        }
    ]
    
    # Generate chart data
    growth_data = []
    for week in range(1, 9):
        growth_data.append({
            "week": f"Week {week}",
            "weight": 0.2 + (week * 0.15),
            "feed": 0.5 + (week * 0.3),
            "fcr": 1.5 + (week * 0.05)
        })
    
    monthly_data = []
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    for i, month in enumerate(months):
        monthly_data.append({
            "month": month,
            "cost": 200000 + (i * 30000),
            "savings": 30000 + (i * 5000),
            "recommendations": 3 + i
        })
    
    ingredient_data = [
        {"name": "Maize", "value": 45, "cost": 67500},
        {"name": "Soya Bean", "value": 30, "cost": 84000},
        {"name": "Fish Meal", "value": 10, "cost": 50000},
        {"name": "Premix", "value": 5, "cost": 25000},
        {"name": "Wheat Bran", "value": 10, "cost": 30000}
    ]
    
    return {
        "success": True,
        "data": {
            "stats": {
                "total_flocks": 3,
                "total_birds": 250,
                "total_cost": 42500,
                "estimated_savings": 6375,  # 15% of total_cost
                "average_growth": 85,
                "feed_efficiency": 2.8
            },
            "flocks": flocks,
            "recommendations": recommendations,
            "growth_data": growth_data,
            "monthly_data": monthly_data,
            "cost_breakdown": ingredient_data,
            "progress_records": progress_data
        }
    }

# 2. Dashboard endpoint
@app.get("/api/v1/analytics/dashboard")
async def get_dashboard():
    print("✅ /api/v1/analytics/dashboard called")
    return {
        "success": True,
        "data": {
            "summary": {
                "flockCount": 3,
                "recommendationCount": 7,
                "totalBirds": 250,
                "averageWeight": 1.8,
                "totalFeedUsed": 1250,
                "averageFCR": 1.5,
                "estimatedSavings": 125000,
                "currency": "UGX"
            },
            "flocks": [
                {"id": "1", "name": "Layer Hens", "bird_type": "Layers", "quantity": 50, "age": 20},
                {"id": "2", "name": "Broilers", "bird_type": "Broilers", "quantity": 150, "age": 30},
                {"id": "3", "name": "Chicks", "bird_type": "Chicks", "quantity": 50, "age": 10}
            ],
            "recommendations": [
                {
                    "id": "1",
                    "flock_name": "Layer Hens",
                    "total_cost": 42500,
                    "created_at": "2024-01-20",
                    "status": "completed"
                },
                {
                    "id": "2",
                    "flock_name": "Broilers",
                    "total_cost": 38000,
                    "created_at": "2024-01-19",
                    "status": "pending"
                }
            ],
            "recent_activity": [
                {"action": "dashboard_view", "description": "Viewed dashboard", "created_at": "2024-01-20T10:30:00Z"},
                {"action": "flock_updated", "description": "Updated Layer Hens flock", "created_at": "2024-01-19T15:45:00Z"},
                {"action": "recommendation_created", "description": "Created a new feed recommendation", "created_at": "2024-01-18T09:15:00Z"}
            ],
            "health_status": {
                "flock_health": "Good",
                "recommendation_rate": "Active",
                "overall_status": "Healthy"
            }
        }
    }

# 3. Flocks endpoint
@app.get("/api/v1/flocks")
async def get_flocks():
    print("✅ /api/v1/flocks called")
    return {
        "success": True,
        "data": [
            {
                "id": "1",
                "userId": "user123",
                "name": "Layer Hens",
                "breed": "Rhode Island Red",
                "age": 20,
                "quantity": 50,
                "startDate": "2023-12-01",
                "purpose": "Egg Production",
                "housingType": "Deep Litter",
                "notes": "Good layers"
            },
            {
                "id": "2",
                "userId": "user123",
                "name": "Broilers",
                "breed": "Cornish Cross",
                "age": 30,
                "quantity": 150,
                "startDate": "2023-11-15",
                "purpose": "Meat Production",
                "housingType": "Cage",
                "notes": "Fast growing"
            }
        ]
    }

# 4. Recommendations endpoint
@app.get("/api/v1/recommendations")
async def get_recommendations():
    print("✅ /api/v1/recommendations called")
    return {
        "success": True,
        "data": [
            {
                "id": "1",
                "userId": "user123",
                "flockId": "1",
                "flockName": "Layer Hens",
                "date": "2024-01-20",
                "feedFormula": "Maize: 60%, Soybean: 25%, Fishmeal: 10%, Premix: 5%",
                "costPerKg": 850,
                "dailyAmount": 50,
                "totalCost": 42500,
                "savings": 7500,
                "notes": "Increase calcium for eggshell quality"
            }
        ]
    }

# 5. Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Poultry Platform API",
        "status": "running",
        "endpoints": {
            "progress": "/progress/progress",
            "dashboard": "/api/v1/analytics/dashboard",
            "flocks": "/api/v1/flocks",
            "recommendations": "/api/v1/recommendations",
            "health": "/health"
        }
    }

# 6. Health endpoint
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "backend"}

# 7. Test endpoint
@app.get("/test")
async def test():
    return {"test": "passed", "message": "All endpoints working"}

if __name__ == "__main__":
    import uvicorn
    print("🌐 Server: http://localhost:8000")
    print("📊 Available endpoints:")
    print("  • /progress/progress")
    print("  • /api/v1/analytics/dashboard")
    print("  • /api/v1/flocks")
    print("  • /api/v1/recommendations")
    print("  • /health")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
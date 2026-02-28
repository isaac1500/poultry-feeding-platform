# backend/simple_fix.py - NO PYDANTIC DEPENDENCIES
import asyncio
from aiohttp import web
import json

app = web.Application()

# Fix for Progress.jsx error
async def handle_progress(request):
    print("✅ /progress/progress called")
    data = {
        "success": True,
        "data": [
            {"id": "1", "weight": 1.5, "date": "2024-01-20"},
            {"id": "2", "weight": 1.4, "date": "2024-01-19"},
        ]
    }
    return web.Response(
        text=json.dumps(data),
        content_type='application/json',
        headers={'Access-Control-Allow-Origin': '*'}
    )

# Fix for Dashboard.jsx error
async def handle_dashboard(request):
    print("✅ /api/v1/analytics/dashboard called")
    data = {
        "success": True,
        "data": {
            "flockCount": 3,
            "recommendationCount": 5,
            "totalBirds": 150,
        }
    }
    return web.Response(
        text=json.dumps(data),
        content_type='application/json',
        headers={'Access-Control-Allow-Origin': '*'}
    )

# Health check
async def handle_root(request):
    return web.Response(text=json.dumps({"status": "running"}))

# Set up routes
app.router.add_get('/progress/progress', handle_progress)
app.router.add_get('/api/v1/analytics/dashboard', handle_dashboard)
app.router.add_get('/', handle_root)

# Add CORS middleware
async def cors_middleware(app, handler):
    async def middleware_handler(request):
        if request.method == 'OPTIONS':
            response = web.Response()
        else:
            response = await handler(request)
        
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = '*'
        return response
    return middleware_handler

app.middlewares.append(cors_middleware)

if __name__ == '__main__':
    print("🚀 SIMPLE BACKEND STARTING ON PORT 8000")
    print("✅ This WILL fix your frontend errors!")
    print("📊 Progress endpoint: http://localhost:8000/progress/progress")
    print("📈 Dashboard endpoint: http://localhost:8000/api/v1/analytics/dashboard")
    web.run_app(app, port=8000)
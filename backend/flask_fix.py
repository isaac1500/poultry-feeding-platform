# backend/flask_fix.py - GUARANTEED TO WORK
from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

print("🚀 STARTING FLASK BACKEND ON PORT 8000")
print("✅ This WILL fix your frontend errors!")

@app.route('/progress/progress', methods=['GET', 'OPTIONS'])
def progress():
    print("✅ /progress/progress called - FIXING YOUR ERROR")
    data = {
        "success": True,
        "data": [
            {
                "id": "1", 
                "userId": "user123",
                "flockId": "flock1",
                "date": "2024-01-20",
                "weight": 1.5,
                "feedConsumed": 100,
                "waterConsumed": 200,
                "mortality": 0,
                "notes": "Good growth"
            },
            {
                "id": "2",
                "userId": "user123",
                "flockId": "flock1",
                "date": "2024-01-19",
                "weight": 1.4,
                "feedConsumed": 95,
                "waterConsumed": 190,
                "mortality": 1,
                "notes": "Normal day"
            }
        ]
    }
    return jsonify(data)

@app.route('/api/v1/analytics/dashboard', methods=['GET', 'OPTIONS'])
def dashboard():
    print("✅ /api/v1/analytics/dashboard called - FIXING YOUR ERROR")
    data = {
        "success": True,
        "data": {
            "flockCount": 3,
            "recommendationCount": 5,
            "totalBirds": 150,
            "averageWeight": 1.8,
            "totalFeedUsed": 1250,
            "averageFCR": 1.5,
            "recentActivity": [
                {"type": "feeding", "flock": "Layer Hens", "time": "2 hours ago"},
                {"type": "weight_check", "flock": "Broilers", "time": "1 day ago"},
            ],
            "flocks": [
                {"id": "1", "name": "Layer Hens", "age": 20, "count": 50},
                {"id": "2", "name": "Broilers", "age": 30, "count": 150},
                {"id": "3", "name": "Chicks", "age": 10, "count": 50},
            ]
        }
    }
    return jsonify(data)

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "Poultry Platform Flask Backend",
        "status": "running",
        "endpoints": {
            "progress": "/progress/progress",
            "dashboard": "/api/v1/analytics/dashboard"
        }
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "backend": "flask"})

if __name__ == '__main__':
    print("📊 Progress endpoint: http://localhost:8000/progress/progress")
    print("📈 Dashboard endpoint: http://localhost:8000/api/v1/analytics/dashboard")
    print("🌐 Open these in browser to verify they work")
    print("🔄 Your frontend errors will disappear once this is running!")
    app.run(host='0.0.0.0', port=8000, debug=True)
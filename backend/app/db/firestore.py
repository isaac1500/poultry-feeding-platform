# Firebase Realtime Database setup
import firebase_admin
from firebase_admin import credentials, db as firebase_db
from app.core.config import settings
import json
import os

def initialize_firebase():
    """Initialize Firebase Admin SDK for Realtime Database"""
    try:
        # Create credentials from environment variables
        cred_dict = {
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
            "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\\\n', '\\\\n'),
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "client_id": settings.FIREBASE_CLIENT_ID,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": settings.FIREBASE_CLIENT_X509_CERT_URL
        }
        
        cred = credentials.Certificate(cred_dict)
        
        # Initialize Firebase app if not already initialized
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred, {
                'databaseURL': f'https://{settings.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/'
            })
        
        return firebase_db
        
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        print("Running in development mode without Firebase")
        return None

# Initialize Firebase database reference
try:
    firebase_db_ref = initialize_firebase()
    if firebase_db_ref:
        db = firebase_db_ref.reference()  # Get database reference
        print("Firebase Realtime Database initialized successfully")
    else:
        db = None
        print("Using mock database for development")
except:
    db = None
    print("Failed to initialize Firebase, using mock database")

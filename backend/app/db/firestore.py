import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings
import json
import os

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # For development/testing, we can use a mock or skip initialization
        # In production, we'll use the actual service account
        
        # Check if we have required environment variables
        if not settings.FIREBASE_PRIVATE_KEY or settings.FIREBASE_PRIVATE_KEY.startswith("-----BEGIN"):
            # If we're in development with placeholder key, don't initialize Firebase
            # We'll use a mock or skip
            print("Development mode: Using placeholder Firebase credentials")
            return None
        
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
            firebase_admin.initialize_app(cred)
        
        return firestore.client()
    
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        print("Running in development mode without Firebase")
        return None

# Initialize Firestore client
try:
    db = initialize_firebase()
except:
    db = None  # For development without Firebase

import json
from pathlib import Path

def save_service_account_key(service_account_json: dict, output_path: str = "service-account.json"):
    """Save Firebase service account JSON to file"""
    with open(output_path, 'w') as f:
        json.dump(service_account_json, f, indent=2)
    return output_path

def load_service_account_key(file_path: str = "service-account.json"):
    """Load Firebase service account JSON from file"""
    with open(file_path, 'r') as f:
        return json.load(f)

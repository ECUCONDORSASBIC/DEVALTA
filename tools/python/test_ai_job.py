#!/usr/bin/env python
"""
Test script for AI Job creation and processing
This creates a job via the API and monitors its processing
"""

import requests
import json
import time
import os
from datetime import datetime

# API Configuration
# Try without /v1 first since the API might not use versioning
API_BASE_URL = "http://localhost:3008/api"
AI_JOBS_ENDPOINT = f"{API_BASE_URL}/ai/jobs"

def create_test_job():
    """Create a test AI job via the API"""
    
    # Test job payload
    job_data = {
        "type": "summarize_medical_record",
        "patientId": f"PATIENT_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "context": {
            "requestedBy": "test_script",
            "priority": "normal",
            "testMode": True
        }
    }
    
    print(f"\n[SEND] Creating AI Job...")
    print(f"   Endpoint: {AI_JOBS_ENDPOINT}")
    print(f"   Payload: {json.dumps(job_data, indent=2)}")
    
    try:
        response = requests.post(
            AI_JOBS_ENDPOINT,
            json=job_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 201:
            job = response.json()
            print(f"\n[SUCCESS] Job created successfully!")
            print(f"   Job ID: {job.get('id')}")
            print(f"   Status: {job.get('status')}")
            print(f"   Type: {job.get('type')}")
            print(f"   Patient ID: {job.get('patientId')}")
            return job
        else:
            print(f"\n[ERROR] Failed to create job")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print(f"\n[ERROR] Could not connect to API server at {AI_JOBS_ENDPOINT}")
        print("   Make sure the API server is running on port 3001")
        return None
    except Exception as e:
        print(f"\n[ERROR] Error creating job: {e}")
        return None

def check_firebase_credentials():
    """Check if Firebase credentials are configured"""
    cred_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if cred_path:
        if os.path.exists(cred_path):
            print(f"[OK] Firebase credentials found: {cred_path}")
            return True
        else:
            print(f"[ERROR] Firebase credentials file not found: {cred_path}")
            return False
    else:
        print("[ERROR] GOOGLE_APPLICATION_CREDENTIALS environment variable not set")
        print("   Set it to the path of your Firebase service account key file")
        return False

def main():
    """Main test function"""
    print("=" * 60)
    print("AI Job System Test")
    print("=" * 60)
    
    # Check Firebase credentials
    print("\n[1] Checking Firebase configuration...")
    if not check_firebase_credentials():
        print("\n[WARNING] Firebase credentials not properly configured")
        print("   The AI Worker may not be able to process jobs")
    
    # Create a test job
    print("\n[2] Creating test job via API...")
    job = create_test_job()
    
    if job:
        print("\n[3] Job created! Monitor the AI Worker terminal to see it being processed.")
        print("\n[INFO] Next steps:")
        print("   1. Make sure the AI Worker is running (start_ai_worker.bat)")
        print("   2. Watch the worker terminal for processing logs")
        print("   3. Check Firebase Firestore for the updated job document")
        print(f"\n[JOB ID] Job ID to monitor: {job.get('id')}")
    else:
        print("\n[WARNING] Could not create job. Please check:")
        print("   1. API server is running on port 3001")
        print("   2. The /api/v1/ai/jobs endpoint is properly configured")
        print("   3. Firebase Admin SDK is initialized in the API server")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
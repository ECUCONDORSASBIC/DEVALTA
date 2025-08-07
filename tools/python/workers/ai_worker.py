
import os
import time
import threading
from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials, firestore

# --- Firebase Initialization ---
# Important: The GOOGLE_APPLICATION_CREDENTIALS environment variable must be set
# to the path of your Firebase service account key file.
# You can also uncomment and set the path manually for local development.
# cred_path = "path/to/your/serviceAccountKey.json" 
# cred = credentials.Certificate(cred_path)
# firebase_admin.initialize_app(cred)

try:
    # Initialize without explicit credentials, relying on the environment variable
    firebase_admin.initialize_app()
    print("Firebase Admin SDK initialized successfully (using GOOGLE_APPLICATION_CREDENTIALS).")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    print("Please ensure the GOOGLE_APPLICATION_CREDENTIALS environment variable is set correctly.")
    exit(1)


db = firestore.client()
jobs_collection_ref = db.collection('ai_jobs')

# --- Job Processing Logic ---

def process_summarize_medical_record(job_data):
    """
    Placeholder for the actual AI logic to summarize a medical record.
    """
    print(f"Processing job {job_data['id']}: Summarize Medical Record for patient {job_data['patientId']}")
    # Simulate a long-running AI task
    time.sleep(15) 
    # In a real scenario, you would:
    # 1. Fetch patient data using job_data['patientId']
    # 2. Call an LLM (e.g., OpenAI, Gemini) with the data
    # 3. Process the LLM's response
    summary = f"This is a generated summary for patient {job_data['patientId']} based on their record. The analysis was completed at {time.ctime()}."
    return {"summary": summary}

def process_job(job_id, job_data):
    """
    Routes a job to the appropriate processing function based on its type.
    """
    job_type = job_data.get('type')
    print(f"Starting job {job_id} of type {job_type}...")

    try:
        result = None
        if job_type == 'summarize_medical_record':
            result = process_summarize_medical_record(job_data)
        # Add other job types here
        # elif job_type == 'another_ai_task':
        #     result = process_another_ai_task(job_data)
        else:
            raise ValueError(f"Unknown job type: {job_type}")

        # Update job status to 'completed'
        jobs_collection_ref.document(job_id).update({
            'status': 'completed',
            'result': result,
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'error': None
        })
        print(f"✅ Job {job_id} completed successfully.")

    except Exception as e:
        print(f"❌ Error processing job {job_id}: {e}")
        # Update job status to 'failed'
        jobs_collection_ref.document(job_id).update({
            'status': 'failed',
            'error': str(e),
            'updatedAt': firestore.SERVER_TIMESTAMP
        })

# --- Firestore Listener ---

# Callback function to handle snapshot changes
def on_snapshot(doc_snapshot, changes, read_time):
    for change in changes:
        if change.type.name == 'ADDED':
            job_id = change.document.id
            job_data = change.document.to_dict()
            
            # Process only newly queued jobs
            if job_data.get('status') == 'queued':
                print(f"New job detected: {job_id}")
                # Run the job processing in a separate thread to avoid blocking the listener
                thread = threading.Thread(target=process_job, args=(job_id, job_data))
                thread.start()

def main():
    """
    Main function to start the worker and listen for jobs.
    """
    print("🤖 AI Worker started. Listening for new jobs in Firestore...")
    
    # Create a query to listen for new documents in the 'ai_jobs' collection
    query = jobs_collection_ref.where('status', '==', 'queued')

    # Watch the query for changes
    query_watch = query.on_snapshot(on_snapshot)

    # Keep the main thread alive to continue listening
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down AI worker...")
        # The query_watch object doesn't have a direct 'unsubscribe' or 'close' method
        # in some versions of the library. The program will exit upon Ctrl+C.
        print("AI Worker stopped.")

if __name__ == '__main__':
    main()

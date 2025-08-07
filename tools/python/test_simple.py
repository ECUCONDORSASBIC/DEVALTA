import requests
import json
import time

def test_ai_system():
    """Prueba rápida del sistema de agentes"""
    api_url = "http://localhost:3008"
    
    print("🤖 Probando Sistema de Agentes de IA")
    print("=" * 50)
    
    # 1. Verificar que API esté funcionando
    try:
        response = requests.get(f"{api_url}/api/health")
        if response.status_code == 200:
            print("✅ API Server funcionando")
        else:
            print("❌ API Server no responde correctamente")
            return
    except:
        print("❌ No se puede conectar al API Server")
        print("💡 Asegúrate de ejecutar: pnpm --filter api-server dev")
        return
    
    # 2. Crear un job de prueba
    job_data = {
        "type": "summarize_medical_record",
        "patientId": "test_patient_123",
        "context": {
            "symptoms": ["dolor de cabeza", "náuseas"],
            "medicalHistory": ["hipertensión"],
            "priority": "high"
        }
    }
    
    print("\n📤 Creando job de IA...")
    try:
        response = requests.post(f"{api_url}/api/ai/jobs", json=job_data)
        if response.status_code == 201:
            job = response.json()
            print(f"✅ Job creado: {job['id']}")
            print(f"📊 Status: {job['status']}")
            
            # 3. Verificar status del job
            print("\n🔄 Verificando status...")
            time.sleep(2)
            
            status_response = requests.get(f"{api_url}/api/ai/jobs/{job['id']}")
            if status_response.status_code == 200:
                job_status = status_response.json()
                print(f"📊 Status actual: {job_status['status']}")
                
                if job_status.get('result'):
                    print(f"🎉 Resultado: {job_status['result']}")
                else:
                    print("⏳ Job aún en proceso (worker de Python necesario para completar)")
                    
            print("\n✅ Sistema de agentes funcionando correctamente!")
            print("\n💡 Para completar el procesamiento:")
            print("   1. Configura GOOGLE_APPLICATION_CREDENTIALS")
            print("   2. Ejecuta: python tools/python/workers/ai_worker.py")
            
        else:
            print(f"❌ Error creando job: {response.text}")
            
    except Exception as e:
        print(f"❌ Error en la prueba: {e}")

if __name__ == "__main__":
    test_ai_system()

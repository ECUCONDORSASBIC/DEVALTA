#!/usr/bin/env python3
"""
🤖 Test completo del sistema de agentes de IA de AltaMedica

Este script demuestra el flujo completo:
1. Crear un job de IA via API
2. Verificar que el worker lo procese
3. Mostrar los resultados

Prerequisitos:
- API Server corriendo en puerto 3002
- Python worker ejecutándose (opcional para ver el procesamiento)
- Variables de entorno de Firebase configuradas
"""

import requests
import time
import json
import sys
import os

# Configuración
API_BASE_URL = "http://localhost:3002/api/ai"
TEST_PATIENT_ID = "patient_test_123"

def print_header(title):
    print(f"\n{'='*60}")
    print(f"🔍 {title}")
    print(f"{'='*60}")

def print_step(step, description):
    print(f"\n📋 Paso {step}: {description}")
    print("-" * 40)

def test_ai_job_creation():
    """Prueba la creación de un job de IA"""
    print_header("SISTEMA DE AGENTES DE IA - ALTAMEDICA")
    
    print_step(1, "Creando job de análisis médico")
    
    # Payload para crear un job
    job_data = {
        "type": "summarize_medical_record",
        "patientId": TEST_PATIENT_ID,
        "context": {
            "medicalHistory": [
                "Diabetes tipo 2",
                "Hipertensión arterial",
                "Última consulta: dolor abdominal"
            ],
            "symptoms": ["dolor abdominal", "náuseas"],
            "priority": "high"
        }
    }
    
    try:
        print(f"📤 Enviando request a: {API_BASE_URL}/jobs")
        print(f"📦 Payload: {json.dumps(job_data, indent=2)}")
        
        response = requests.post(f"{API_BASE_URL}/jobs", json=job_data)
        
        print(f"🌐 Status Code: {response.status_code}")
        
        if response.status_code == 201:
            job = response.json()
            print(f"✅ Job creado exitosamente!")
            print(f"📄 Job ID: {job['id']}")
            print(f"🏷️  Tipo: {job['type']}")
            print(f"👤 Paciente: {job['patientId']}")
            print(f"📊 Status: {job['status']}")
            print(f"⏰ Creado: {job['createdAt']}")
            
            return job['id']
        else:
            print(f"❌ Error creando job: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al API server")
        print("💡 Asegúrate de que el API server esté corriendo en puerto 3002")
        return None
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return None

def monitor_job_progress(job_id, max_wait_minutes=3):
    """Monitorea el progreso de un job"""
    print_step(2, f"Monitoreando progreso del job {job_id}")
    
    max_iterations = max_wait_minutes * 12  # Check every 5 seconds
    
    for i in range(max_iterations):
        try:
            response = requests.get(f"{API_BASE_URL}/jobs/{job_id}")
            
            if response.status_code == 200:
                job = response.json()
                status = job['status']
                
                print(f"🔄 Iteración {i+1}: Status = '{status}'", end="")
                
                if status == 'queued':
                    print(" (esperando worker...)")
                elif status == 'processing':
                    print(" (procesando con IA...)")
                elif status == 'completed':
                    print(" ✅ ¡COMPLETADO!")
                    print(f"\n🎉 Resultado del análisis:")
                    print(f"📄 {json.dumps(job['result'], indent=2)}")
                    return job
                elif status == 'failed':
                    print(f" ❌ FALLÓ")
                    print(f"🚨 Error: {job.get('error', 'Error desconocido')}")
                    return job
                    
                time.sleep(5)
            else:
                print(f"❌ Error consultando job: {response.status_code}")
                break
                
        except Exception as e:
            print(f"❌ Error en monitoreo: {e}")
            break
    
    print(f"\n⏰ Timeout después de {max_wait_minutes} minutos")
    return None

def list_recent_jobs():
    """Lista los jobs recientes para el paciente de prueba"""
    print_step(3, "Listando jobs recientes")
    
    try:
        response = requests.get(f"{API_BASE_URL}/jobs", params={
            "patientId": TEST_PATIENT_ID
        })
        
        if response.status_code == 200:
            jobs = response.json()
            print(f"📋 Encontrados {len(jobs)} jobs para paciente {TEST_PATIENT_ID}")
            
            for job in jobs:
                print(f"\n🔹 Job {job['id']}")
                print(f"   Tipo: {job['type']}")
                print(f"   Status: {job['status']}")
                print(f"   Creado: {job['createdAt']}")
                if job.get('result'):
                    print(f"   Resultado: {job['result']}")
        else:
            print(f"❌ Error listando jobs: {response.text}")
            
    except Exception as e:
        print(f"❌ Error en consulta: {e}")

def show_agent_capabilities():
    """Muestra las capacidades disponibles de los agentes"""
    print_header("CAPACIDADES DE AGENTES DISPONIBLES")
    
    capabilities = {
        "summarize_medical_record": "📋 Resumir historial médico completo",
        "analyze_symptoms": "🔍 Analizar síntomas y sugerir diagnósticos",
        "generate_prescription": "💊 Generar recetas médicas",
        "analyze_lab_results": "🧪 Analizar resultados de laboratorio",
        "generate_treatment_plan": "📝 Generar plan de tratamiento",
        "medical_risk_assessment": "⚠️  Evaluación de riesgos médicos",
        "drug_interaction_check": "⚗️  Verificar interacciones medicamentosas",
        "diagnostic_assistance": "🩺 Asistencia en diagnóstico médico"
    }
    
    print("Los siguientes agentes están disponibles:")
    for agent_type, description in capabilities.items():
        print(f"  • {description}")
        print(f"    Tipo: '{agent_type}'")
    
    print(f"\n💡 Para usar un agente, crea un job con el 'type' correspondiente")

def check_prerequisites():
    """Verifica que los prerequisitos estén configurados"""
    print_step(0, "Verificando prerequisitos")
    
    # Verificar conexión al API
    try:
        response = requests.get("http://localhost:3002/api/health")
        if response.status_code == 200:
            print("✅ API Server conectado correctamente")
        else:
            print("❌ API Server responde pero con error")
            return False
    except:
        print("❌ API Server no está disponible en puerto 3002")
        print("💡 Ejecuta: pnpm --filter api-server dev")
        return False
    
    # Verificar variables de entorno (opcional)
    if os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
        print("✅ Credenciales de Firebase configuradas")
    else:
        print("⚠️  GOOGLE_APPLICATION_CREDENTIALS no configurado")
        print("💡 El worker de Python necesita estas credenciales")
    
    return True

def main():
    """Función principal de prueba"""
    
    if not check_prerequisites():
        sys.exit(1)
    
    show_agent_capabilities()
    
    # Crear job de prueba
    job_id = test_ai_job_creation()
    
    if job_id:
        # Monitorear progreso
        final_job = monitor_job_progress(job_id)
        
        # Listar jobs recientes
        list_recent_jobs()
        
        print_header("RESUMEN DE LA PRUEBA")
        
        if final_job and final_job['status'] == 'completed':
            print("🎉 ¡Prueba completada exitosamente!")
            print("✅ Sistema de agentes funcionando correctamente")
            print("🤖 El agente procesó el job y generó resultados")
        else:
            print("⚠️  Prueba parcialmente exitosa")
            print("✅ API endpoints funcionando")
            print("❓ Worker de Python puede no estar corriendo")
            print("💡 Para ver procesamiento completo, ejecuta el worker:")
            print("   python tools/python/workers/ai_worker.py")
    
    else:
        print_header("RESULTADO")
        print("❌ Prueba falló en la creación del job")

if __name__ == "__main__":
    main()

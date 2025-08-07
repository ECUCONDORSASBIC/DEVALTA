"""
AltaMedica Video Call Client Integration
Cliente Python para integrar con las apps de Next.js
"""

import requests
import json
import asyncio
import websockets
from datetime import datetime
from typing import Optional

class AltaMedicaVideoCallClient:
    """Cliente para interactuar con el sistema de videollamadas"""
    
    def __init__(self, server_url: str = "http://localhost:8888"):
        self.server_url = server_url
        self.ws_url = server_url.replace("http://", "ws://").replace("https://", "wss://")
    
    def create_video_call(self, doctor_id: str, patient_id: str) -> dict:
        """Crear una nueva videollamada"""
        try:
            response = requests.post(
                f"{self.server_url}/api/video-calls/create",
                json={
                    "doctor_id": doctor_id,
                    "patient_id": patient_id
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def get_call_status(self, room_id: str) -> dict:
        """Obtener estado de una videollamada"""
        try:
            response = requests.get(f"{self.server_url}/api/video-calls/{room_id}/status")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def get_active_calls(self) -> dict:
        """Obtener todas las videollamadas activas"""
        try:
            response = requests.get(f"{self.server_url}/api/video-calls/active")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def generate_join_urls(self, room_id: str, doctor_id: str, patient_id: str) -> dict:
        """Generar URLs para unirse a la videollamada"""
        return {
            "doctor_url": f"{self.server_url}/video-call/{room_id}?user_id={doctor_id}&user_type=doctor",
            "patient_url": f"{self.server_url}/video-call/{room_id}?user_id={patient_id}&user_type=patient"
        }

# Funciones de utilidad para integración con Next.js apps

def create_consultation_call(doctor_email: str, patient_email: str, consultation_id: str = None) -> dict:
    """
    Crear una videollamada para una consulta médica
    Retorna URLs que pueden ser usadas por las apps de Next.js
    """
    client = AltaMedicaVideoCallClient()
    
    # Usar emails como IDs únicos o generar IDs basados en consultation_id
    doctor_id = f"doctor_{doctor_email.replace('@', '_').replace('.', '_')}"
    patient_id = f"patient_{patient_email.replace('@', '_').replace('.', '_')}"
    
    if consultation_id:
        doctor_id = f"{doctor_id}_{consultation_id}"
        patient_id = f"{patient_id}_{consultation_id}"
    
    result = client.create_video_call(doctor_id, patient_id)
    
    if "room_id" in result:
        urls = client.generate_join_urls(result["room_id"], doctor_id, patient_id)
        result.update(urls)
    
    return result

def get_consultation_status(room_id: str) -> dict:
    """Obtener estado de una consulta de videollamada"""
    client = AltaMedicaVideoCallClient()
    return client.get_call_status(room_id)

def list_active_consultations() -> dict:
    """Listar todas las consultas activas"""
    client = AltaMedicaVideoCallClient()
    return client.get_active_calls()

# Ejemplo de uso
if __name__ == "__main__":
    print("🏥 AltaMedica Video Call Client - Ejemplo de uso")
    print("=" * 50)
    
    # Crear una videollamada de ejemplo
    doctor_email = "dr.martinez@altamedica.com"
    patient_email = "paciente.test@email.com"
    consultation_id = "consult_001"
    
    print(f"👨‍⚕️ Doctor: {doctor_email}")
    print(f"👨‍🦱 Paciente: {patient_email}")
    print(f"📋 Consulta ID: {consultation_id}")
    print()
    
    # Crear la videollamada
    result = create_consultation_call(doctor_email, patient_email, consultation_id)
    
    if "error" in result:
        print(f"❌ Error: {result['error']}")
    else:
        print("✅ Videollamada creada exitosamente!")
        print(f"🆔 Room ID: {result['room_id']}")
        print(f"👨‍⚕️ URL Doctor: {result['doctor_url']}")
        print(f"👨‍🦱 URL Paciente: {result['patient_url']}")
        print()
        
        # Obtener estado
        status = get_consultation_status(result['room_id'])
        print("📊 Estado de la consulta:")
        print(json.dumps(status, indent=2))
        print()
        
        # Listar consultas activas
        active = list_active_consultations()
        print("📋 Consultas activas:")
        print(json.dumps(active, indent=2))

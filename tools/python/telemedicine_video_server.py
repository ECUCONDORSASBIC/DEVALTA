"""
AltaMedica Telemedicine Video Call System
Sistema de videollamadas de telemedicina en tiempo real
Usando WebRTC, Socket.IO y FastAPI
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AltaMedica Telemedicine Video Calls")

# CORS para permitir conexiones desde las apps de Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # web-app
        "http://localhost:3001",  # api-server
        "http://localhost:3002",  # doctors
        "http://localhost:3003",  # patients
        "http://localhost:3004",  # companies
        "http://localhost:3005",  # admin
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Almacenamiento en memoria para salas de videollamadas
class VideoCallRoom:
    def __init__(self, room_id: str, doctor_id: str, patient_id: str):
        self.room_id = room_id
        self.doctor_id = doctor_id
        self.patient_id = patient_id
        self.created_at = datetime.now()
        self.doctor_socket: Optional[WebSocket] = None
        self.patient_socket: Optional[WebSocket] = None
        self.is_active = False
        self.call_started_at: Optional[datetime] = None
        self.call_ended_at: Optional[datetime] = None

# Almacenamiento global
active_rooms: Dict[str, VideoCallRoom] = {}
user_connections: Dict[str, WebSocket] = {}

class VideoCallManager:
    """Gestor de videollamadas de telemedicina"""
    
    @staticmethod
    def create_room(doctor_id: str, patient_id: str) -> str:
        """Crear una nueva sala de videollamada"""
        room_id = f"room_{uuid.uuid4().hex[:8]}"
        room = VideoCallRoom(room_id, doctor_id, patient_id)
        active_rooms[room_id] = room
        
        logger.info(f"🏥 Sala creada: {room_id} - Doctor: {doctor_id}, Paciente: {patient_id}")
        return room_id
    
    @staticmethod
    def join_room(room_id: str, user_id: str, user_type: str, websocket: WebSocket) -> bool:
        """Unirse a una sala de videollamada"""
        if room_id not in active_rooms:
            return False
        
        room = active_rooms[room_id]
        
        if user_type == "doctor" and user_id == room.doctor_id:
            room.doctor_socket = websocket
            user_connections[user_id] = websocket
            logger.info(f"👨‍⚕️ Doctor {user_id} se unió a la sala {room_id}")
            return True
        elif user_type == "patient" and user_id == room.patient_id:
            room.patient_socket = websocket
            user_connections[user_id] = websocket
            logger.info(f"👨‍🦱 Paciente {user_id} se unió a la sala {room_id}")
            return True
        
        return False
    
    @staticmethod
    def leave_room(room_id: str, user_id: str):
        """Salir de una sala de videollamada"""
        if room_id in active_rooms:
            room = active_rooms[room_id]
            
            if user_id == room.doctor_id:
                room.doctor_socket = None
            elif user_id == room.patient_id:
                room.patient_socket = None
            
            if user_id in user_connections:
                del user_connections[user_id]
            
            # Si ambos usuarios se fueron, marcar como inactiva
            if not room.doctor_socket and not room.patient_socket:
                room.is_active = False
                room.call_ended_at = datetime.now()
                logger.info(f"🔴 Llamada terminada en sala {room_id}")
    
    @staticmethod
    async def send_to_peer(room_id: str, sender_id: str, message: dict):
        """Enviar mensaje WebRTC al peer en la sala"""
        if room_id not in active_rooms:
            return
        
        room = active_rooms[room_id]
        target_socket = None
        
        if sender_id == room.doctor_id:
            target_socket = room.patient_socket
        elif sender_id == room.patient_id:
            target_socket = room.doctor_socket
        
        if target_socket:
            try:
                await target_socket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error enviando mensaje: {e}")

# Endpoints REST para gestión de videollamadas

@app.post("/api/video-calls/create")
async def create_video_call(data: dict):
    """Crear una nueva videollamada"""
    doctor_id = data.get("doctor_id")
    patient_id = data.get("patient_id")
    
    if not doctor_id or not patient_id:
        raise HTTPException(status_code=400, detail="doctor_id y patient_id son requeridos")
    
    room_id = VideoCallManager.create_room(doctor_id, patient_id)
    
    return {
        "success": True,
        "room_id": room_id,
        "join_url_doctor": f"http://localhost:8888/video-call/{room_id}?user_id={doctor_id}&user_type=doctor",
        "join_url_patient": f"http://localhost:8888/video-call/{room_id}?user_id={patient_id}&user_type=patient",
        "created_at": datetime.now().isoformat()
    }

@app.get("/api/video-calls/{room_id}/status")
async def get_call_status(room_id: str):
    """Obtener el estado de una videollamada"""
    if room_id not in active_rooms:
        raise HTTPException(status_code=404, detail="Sala no encontrada")
    
    room = active_rooms[room_id]
    
    return {
        "room_id": room_id,
        "doctor_connected": room.doctor_socket is not None,
        "patient_connected": room.patient_socket is not None,
        "is_active": room.is_active,
        "created_at": room.created_at.isoformat(),
        "call_started_at": room.call_started_at.isoformat() if room.call_started_at else None,
        "call_ended_at": room.call_ended_at.isoformat() if room.call_ended_at else None
    }

@app.get("/api/video-calls/active")
async def get_active_calls():
    """Obtener todas las videollamadas activas"""
    active_calls = []
    
    for room_id, room in active_rooms.items():
        if room.is_active or room.doctor_socket or room.patient_socket:
            active_calls.append({
                "room_id": room_id,
                "doctor_id": room.doctor_id,
                "patient_id": room.patient_id,
                "doctor_connected": room.doctor_socket is not None,
                "patient_connected": room.patient_socket is not None,
                "created_at": room.created_at.isoformat()
            })
    
    return {
        "active_calls": active_calls,
        "total_count": len(active_calls)
    }

# WebSocket para señalización WebRTC
@app.websocket("/ws/video-call/{room_id}")
async def websocket_video_call(websocket: WebSocket, room_id: str, user_id: str, user_type: str):
    """WebSocket para manejo de señalización WebRTC"""
    await websocket.accept()
    
    # Unirse a la sala
    if not VideoCallManager.join_room(room_id, user_id, user_type, websocket):
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "No se pudo unir a la sala"
        }))
        await websocket.close()
        return
    
    # Notificar que el usuario se unió
    await websocket.send_text(json.dumps({
        "type": "joined",
        "room_id": room_id,
        "user_id": user_id,
        "user_type": user_type
    }))
    
    # Marcar la llamada como activa si ambos están conectados
    room = active_rooms[room_id]
    if room.doctor_socket and room.patient_socket and not room.is_active:
        room.is_active = True
        room.call_started_at = datetime.now()
        
        # Notificar a ambos usuarios que la llamada está activa
        await room.doctor_socket.send_text(json.dumps({
            "type": "call_active",
            "message": "Llamada iniciada - ambos usuarios conectados"
        }))
        await room.patient_socket.send_text(json.dumps({
            "type": "call_active", 
            "message": "Llamada iniciada - ambos usuarios conectados"
        }))
    
    try:
        while True:
            # Recibir mensajes WebRTC (offer, answer, ice-candidate)
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Agregar información del remitente
            message["sender_id"] = user_id
            message["sender_type"] = user_type
            
            logger.info(f"📡 Mensaje WebRTC de {user_id}: {message.get('type', 'unknown')}")
            
            # Reenviar al peer
            await VideoCallManager.send_to_peer(room_id, user_id, message)
            
    except WebSocketDisconnect:
        logger.info(f"🔌 Usuario {user_id} desconectado de sala {room_id}")
        VideoCallManager.leave_room(room_id, user_id)
    except Exception as e:
        logger.error(f"Error en WebSocket: {e}")
        VideoCallManager.leave_room(room_id, user_id)

# Endpoint para servir la interfaz de videollamada
@app.get("/video-call/{room_id}")
async def video_call_page(room_id: str, user_id: str, user_type: str):
    """Página de interfaz de videollamada"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>AltaMedica - Videollamada</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f0f2f5;
            }}
            .video-container {{
                display: flex;
                gap: 20px;
                justify-content: center;
                margin-bottom: 20px;
            }}
            video {{
                width: 400px;
                height: 300px;
                background: #000;
                border-radius: 8px;
            }}
            .controls {{
                text-align: center;
                margin: 20px 0;
            }}
            button {{
                margin: 5px;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            }}
            .btn-primary {{ background: #007bff; color: white; }}
            .btn-danger {{ background: #dc3545; color: white; }}
            .btn-success {{ background: #28a745; color: white; }}
            .status {{
                text-align: center;
                padding: 10px;
                background: white;
                border-radius: 5px;
                margin: 10px 0;
            }}
            .header {{
                text-align: center;
                margin-bottom: 20px;
            }}
            .user-info {{
                background: #e9ecef;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏥 AltaMedica - Videollamada de Telemedicina</h1>
            <div class="user-info">
                <strong>Usuario:</strong> {user_id} | <strong>Tipo:</strong> {user_type.title()} | <strong>Sala:</strong> {room_id}
            </div>
        </div>
        
        <div class="status" id="status">
            Conectando...
        </div>
        
        <div class="video-container">
            <div>
                <h3>Tu Video</h3>
                <video id="localVideo" autoplay muted></video>
            </div>
            <div>
                <h3>{"Doctor" if user_type == "patient" else "Paciente"}</h3>
                <video id="remoteVideo" autoplay></video>
            </div>
        </div>
        
        <div class="controls">
            <button id="startCall" class="btn-success">Iniciar Llamada</button>
            <button id="endCall" class="btn-danger">Terminar Llamada</button>
            <button id="muteAudio" class="btn-primary">Silenciar Audio</button>
            <button id="muteVideo" class="btn-primary">Desactivar Video</button>
        </div>

        <script>
            // Configuración WebRTC
            const configuration = {{
                iceServers: [
                    {{ urls: 'stun:stun.l.google.com:19302' }}
                ]
            }};
            
            let localStream;
            let remoteStream;
            let peerConnection;
            let websocket;
            
            const localVideo = document.getElementById('localVideo');
            const remoteVideo = document.getElementById('remoteVideo');
            const status = document.getElementById('status');
            
            // Conectar WebSocket
            const wsUrl = `ws://localhost:8888/ws/video-call/{room_id}?user_id={user_id}&user_type={user_type}`;
            websocket = new WebSocket(wsUrl);
            
            websocket.onopen = function() {{
                status.textContent = 'Conectado al servidor';
                status.style.background = '#d4edda';
            }};
            
            websocket.onmessage = async function(event) {{
                const message = JSON.parse(event.data);
                
                switch(message.type) {{
                    case 'joined':
                        status.textContent = 'Unido a la sala exitosamente';
                        break;
                    case 'call_active':
                        status.textContent = 'Llamada activa - Ambos usuarios conectados';
                        status.style.background = '#d1ecf1';
                        break;
                    case 'offer':
                        await handleOffer(message.offer);
                        break;
                    case 'answer':
                        await handleAnswer(message.answer);
                        break;
                    case 'ice-candidate':
                        await handleIceCandidate(message.candidate);
                        break;
                }}
            }};
            
            // Inicializar medios
            async function initializeMedia() {{
                try {{
                    localStream = await navigator.mediaDevices.getUserMedia({{
                        video: true,
                        audio: true
                    }});
                    localVideo.srcObject = localStream;
                    status.textContent = 'Cámara y micrófono activados';
                }} catch (error) {{
                    console.error('Error accediendo a medios:', error);
                    status.textContent = 'Error: No se pudo acceder a cámara/micrófono';
                    status.style.background = '#f8d7da';
                }}
            }}
            
            // Crear peer connection
            function createPeerConnection() {{
                peerConnection = new RTCPeerConnection(configuration);
                
                // Agregar stream local
                localStream.getTracks().forEach(track => {{
                    peerConnection.addTrack(track, localStream);
                }});
                
                // Manejar stream remoto
                peerConnection.ontrack = function(event) {{
                    remoteStream = event.streams[0];
                    remoteVideo.srcObject = remoteStream;
                }};
                
                // Manejar ICE candidates
                peerConnection.onicecandidate = function(event) {{
                    if (event.candidate) {{
                        websocket.send(JSON.stringify({{
                            type: 'ice-candidate',
                            candidate: event.candidate
                        }}));
                    }}
                }};
            }}
            
            // Iniciar llamada
            async function startCall() {{
                await initializeMedia();
                createPeerConnection();
                
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                
                websocket.send(JSON.stringify({{
                    type: 'offer',
                    offer: offer
                }}));
                
                status.textContent = 'Llamada iniciada - Esperando respuesta';
            }}
            
            // Manejar offer
            async function handleOffer(offer) {{
                await initializeMedia();
                createPeerConnection();
                
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                
                websocket.send(JSON.stringify({{
                    type: 'answer',
                    answer: answer
                }}));
            }}
            
            // Manejar answer
            async function handleAnswer(answer) {{
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }}
            
            // Manejar ICE candidate
            async function handleIceCandidate(candidate) {{
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }}
            
            // Event listeners
            document.getElementById('startCall').onclick = startCall;
            document.getElementById('endCall').onclick = function() {{
                if (peerConnection) {{
                    peerConnection.close();
                }}
                if (localStream) {{
                    localStream.getTracks().forEach(track => track.stop());
                }}
                websocket.close();
                window.close();
            }};
            
            document.getElementById('muteAudio').onclick = function() {{
                if (localStream) {{
                    const audioTrack = localStream.getAudioTracks()[0];
                    audioTrack.enabled = !audioTrack.enabled;
                    this.textContent = audioTrack.enabled ? 'Silenciar Audio' : 'Activar Audio';
                }}
            }};
            
            document.getElementById('muteVideo').onclick = function() {{
                if (localStream) {{
                    const videoTrack = localStream.getVideoTracks()[0];
                    videoTrack.enabled = !videoTrack.enabled;
                    this.textContent = videoTrack.enabled ? 'Desactivar Video' : 'Activar Video';
                }}
            }};
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.get("/")
async def root():
    """Página principal del sistema de videollamadas"""
    return {
        "service": "AltaMedica Telemedicine Video Calls",
        "version": "1.0.0",
        "endpoints": {
            "create_call": "POST /api/video-calls/create",
            "call_status": "GET /api/video-calls/{room_id}/status",
            "active_calls": "GET /api/video-calls/active",
            "join_call": "GET /video-call/{room_id}?user_id={user_id}&user_type={user_type}",
            "websocket": "WS /ws/video-call/{room_id}?user_id={user_id}&user_type={user_type}"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🏥 Iniciando AltaMedica Telemedicine Video Call Server...")
    print("📍 Servidor disponible en: http://localhost:8888")
    print("🔗 Documentación API: http://localhost:8888/docs")
    uvicorn.run(app, host="0.0.0.0", port=8888)

"""
AltaMedica Telemedicine Video Call System - Simple Startup
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
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
    def __init__(self, room_id: str, doctor_email: str, patient_email: str):
        self.room_id = room_id
        self.doctor_email = doctor_email
        self.patient_email = patient_email
        self.created_at = datetime.now()
        self.doctor_socket: Optional[WebSocket] = None
        self.patient_socket: Optional[WebSocket] = None
        self.is_active = False
        self.call_started_at: Optional[datetime] = None
        self.call_ended_at: Optional[datetime] = None

# Almacenamiento global
active_rooms: Dict[str, VideoCallRoom] = {}
user_connections: Dict[str, WebSocket] = {}

@app.post("/api/video-calls/create")
async def create_video_call(data: dict):
    """Crear una nueva videollamada"""
    doctor_email = data.get("doctor_email")
    patient_email = data.get("patient_email")
    consultation_id = data.get("consultation_id", f"consult_{uuid.uuid4().hex[:8]}")
    
    if not doctor_email or not patient_email:
        raise HTTPException(status_code=400, detail="doctor_email y patient_email son requeridos")
    
    room_id = f"room_{uuid.uuid4().hex[:8]}"
    room = VideoCallRoom(room_id, doctor_email, patient_email)
    active_rooms[room_id] = room
    
    logger.info(f"Sala creada: {room_id} - Doctor: {doctor_email}, Paciente: {patient_email}")
    
    return {
        "success": True,
        "room_id": room_id,
        "doctor_url": f"http://localhost:3002/telemedicine/session/{consultation_id}",
        "patient_url": f"http://localhost:3003/telemedicine/room/{consultation_id}",
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "altamedica-video-server",
        "timestamp": datetime.now().isoformat(),
        "active_rooms": len(active_rooms),
        "connected_users": len(user_connections)
    }

@app.get("/video-call/{room_id}")
async def video_call_page(room_id: str, user_id: str, user_type: str):
    """Página HTML real de videollamada"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>AltaMedica - Videollamada {room_id}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background: #1a202c;
                color: white;
            }}
            .container {{
                display: flex;
                height: 100vh;
            }}
            .video-main {{
                flex: 1;
                display: flex;
                flex-direction: column;
                position: relative;
            }}
            .header {{
                background: rgba(0,0,0,0.8);
                padding: 15px;
                display: flex;
                justify-content: between;
                align-items: center;
            }}
            .user-info {{
                display: flex;
                align-items: center;
                gap: 10px;
            }}
            .user-avatar {{
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #4299e1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }}
            .status {{
                display: flex;
                align-items: center;
                gap: 10px;
            }}
            .status-dot {{
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #48bb78;
            }}
            .video-container {{
                flex: 1;
                display: grid;
                grid-template-columns: 1fr 300px;
                gap: 10px;
                padding: 10px;
            }}
            .video-main-feed {{
                background: #2d3748;
                border-radius: 10px;
                position: relative;
                overflow: hidden;
            }}
            .video-sidebar {{
                display: flex;
                flex-direction: column;
                gap: 10px;
            }}
            .video-small {{
                background: #2d3748;
                border-radius: 10px;
                height: 150px;
                position: relative;
                overflow: hidden;
            }}
            video {{
                width: 100%;
                height: 100%;
                object-fit: cover;
            }}
            .controls {{
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 15px;
                z-index: 10;
            }}
            .control-btn {{
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 20px;
            }}
            .control-btn.active {{
                background: #4299e1;
                color: white;
            }}
            .control-btn.muted {{
                background: #e53e3e;
                color: white;
            }}
            .control-btn.secondary {{
                background: #4a5568;
                color: white;
            }}
            .control-btn:hover {{
                transform: scale(1.1);
            }}
            .info-panel {{
                background: #2d3748;
                border-radius: 10px;
                padding: 15px;
                flex: 1;
            }}
            .no-video {{
                display: flex;
                align-items: center;
                justify-content: center;
                color: #a0aec0;
                flex-direction: column;
                gap: 10px;
            }}
            .connection-status {{
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(0,0,0,0.7);
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="video-main">
                <div class="header">
                    <div class="user-info">
                        <div class="user-avatar">
                            {user_type[0].upper()}
                        </div>
                        <div>
                            <div style="font-weight: bold;">{user_type.title()}</div>
                            <div style="font-size: 12px; opacity: 0.8;">Sala: {room_id}</div>
                        </div>
                    </div>
                    <div class="status">
                        <div class="status-dot" id="statusDot"></div>
                        <span id="statusText">Conectando...</span>
                    </div>
                </div>
                
                <div class="video-container">
                    <div class="video-main-feed">
                        <video id="remoteVideo" autoplay playsinline></video>
                        <div class="no-video" id="remoteNoVideo">
                            <div style="font-size: 48px;">👥</div>
                            <div>Esperando conexión remota...</div>
                        </div>
                        <div class="connection-status" id="connectionStatus">
                            Inicializando...
                        </div>
                    </div>
                    
                    <div class="video-sidebar">
                        <div class="video-small">
                            <video id="localVideo" autoplay muted playsinline></video>
                            <div class="no-video" id="localNoVideo" style="display: none;">
                                <div style="font-size: 24px;">📷</div>
                                <div style="font-size: 12px;">Tu video</div>
                            </div>
                        </div>
                        
                        <div class="info-panel">
                            <h4>Información de la Sesión</h4>
                            <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">
                                <div>Tipo: {user_type.title()}</div>
                                <div>Sala: {room_id}</div>
                                <div>Usuario: {user_id}</div>
                                <div id="sessionTime">Duración: 00:00</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="controls">
                    <button class="control-btn active" id="micBtn" onclick="toggleMic()" title="Micrófono">
                        🎤
                    </button>
                    <button class="control-btn active" id="camBtn" onclick="toggleCamera()" title="Cámara">
                        📹
                    </button>
                    <button class="control-btn secondary" id="endBtn" onclick="endCall()" title="Terminar llamada">
                        📞
                    </button>
                </div>
            </div>
        </div>

        <script>
            // Configuración WebRTC
            const configuration = {{
                iceServers: [
                    {{ urls: 'stun:stun.l.google.com:19302' }},
                    {{ urls: 'stun:stun1.l.google.com:19302' }}
                ]
            }};
            
            let localStream;
            let remoteStream;
            let peerConnection;
            let websocket;
            let sessionStartTime = new Date();
            
            const localVideo = document.getElementById('localVideo');
            const remoteVideo = document.getElementById('remoteVideo');
            const localNoVideo = document.getElementById('localNoVideo');
            const remoteNoVideo = document.getElementById('remoteNoVideo');
            const statusText = document.getElementById('statusText');
            const statusDot = document.getElementById('statusDot');
            const connectionStatus = document.getElementById('connectionStatus');
            
            // Inicializar cuando se carga la página
            window.onload = async function() {{
                await initializeMedia();
                connectWebSocket();
                startTimer();
            }};
            
            async function initializeMedia() {{
                try {{
                    localStream = await navigator.mediaDevices.getUserMedia({{
                        video: true,
                        audio: true
                    }});
                    
                    localVideo.srcObject = localStream;
                    localNoVideo.style.display = 'none';
                    
                    updateStatus('Medios inicializados', 'info');
                    
                }} catch (error) {{
                    console.error('Error accessing media devices:', error);
                    updateStatus('Error accediendo a cámara/micrófono', 'error');
                    localNoVideo.style.display = 'flex';
                }}
            }}
            
            function connectWebSocket() {{
                const wsUrl = `ws://localhost:8888/ws/video-call/{room_id}?user_id={user_id}&user_type={user_type}`;
                websocket = new WebSocket(wsUrl);
                
                websocket.onopen = function() {{
                    updateStatus('Conectado al servidor', 'success');
                    createPeerConnection();
                }};
                
                websocket.onmessage = async function(event) {{
                    const message = JSON.parse(event.data);
                    await handleWebSocketMessage(message);
                }};
                
                websocket.onclose = function() {{
                    updateStatus('Conexión cerrada', 'error');
                }};
                
                websocket.onerror = function(error) {{
                    updateStatus('Error de conexión', 'error');
                }};
            }}
            
            function createPeerConnection() {{
                peerConnection = new RTCPeerConnection(configuration);
                
                // Agregar tracks locales
                if (localStream) {{
                    localStream.getTracks().forEach(track => {{
                        peerConnection.addTrack(track, localStream);
                    }});
                }}
                
                // Manejar tracks remotos
                peerConnection.ontrack = function(event) {{
                    remoteStream = event.streams[0];
                    remoteVideo.srcObject = remoteStream;
                    remoteNoVideo.style.display = 'none';
                    updateStatus('Videollamada conectada', 'success');
                }};
                
                // Manejar ICE candidates
                peerConnection.onicecandidate = function(event) {{
                    if (event.candidate && websocket.readyState === WebSocket.OPEN) {{
                        websocket.send(JSON.stringify({{
                            type: 'ice-candidate',
                            candidate: event.candidate
                        }}));
                    }}
                }};
                
                // Estado de conexión
                peerConnection.onconnectionstatechange = function() {{
                    updateConnectionStatus(peerConnection.connectionState);
                }};
            }}
            
            async function handleWebSocketMessage(message) {{
                switch(message.type) {{
                    case 'joined':
                        updateStatus('Unido a la sala', 'success');
                        if ('{user_type}' === 'doctor') {{
                            // El doctor inicia la llamada
                            await createOffer();
                        }}
                        break;
                        
                    case 'call_active':
                        updateStatus('Llamada activa', 'success');
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
                        
                    case 'error':
                        updateStatus(message.message || 'Error desconocido', 'error');
                        break;
                }}
            }}
            
            async function createOffer() {{
                try {{
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);
                    
                    websocket.send(JSON.stringify({{
                        type: 'offer',
                        offer: offer
                    }}));
                    
                    updateStatus('Oferta enviada', 'info');
                }} catch (error) {{
                    console.error('Error creating offer:', error);
                }}
            }}
            
            async function handleOffer(offer) {{
                try {{
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                    
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    
                    websocket.send(JSON.stringify({{
                        type: 'answer',
                        answer: answer
                    }}));
                    
                    updateStatus('Respuesta enviada', 'info');
                }} catch (error) {{
                    console.error('Error handling offer:', error);
                }}
            }}
            
            async function handleAnswer(answer) {{
                try {{
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                    updateStatus('Conexión establecida', 'success');
                }} catch (error) {{
                    console.error('Error handling answer:', error);
                }}
            }}
            
            async function handleIceCandidate(candidate) {{
                try {{
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                }} catch (error) {{
                    console.error('Error adding ICE candidate:', error);
                }}
            }}
            
            function updateStatus(message, type) {{
                statusText.textContent = message;
                
                if (type === 'success') {{
                    statusDot.style.background = '#48bb78';
                }} else if (type === 'error') {{
                    statusDot.style.background = '#e53e3e';
                }} else {{
                    statusDot.style.background = '#ed8936';
                }}
            }}
            
            function updateConnectionStatus(state) {{
                connectionStatus.textContent = state;
                
                switch(state) {{
                    case 'connected':
                        connectionStatus.style.background = 'rgba(72, 187, 120, 0.8)';
                        break;
                    case 'connecting':
                        connectionStatus.style.background = 'rgba(237, 137, 54, 0.8)';
                        break;
                    case 'disconnected':
                    case 'failed':
                        connectionStatus.style.background = 'rgba(229, 62, 62, 0.8)';
                        break;
                    default:
                        connectionStatus.style.background = 'rgba(0,0,0,0.7)';
                }}
            }}
            
            function toggleMic() {{
                if (localStream) {{
                    const audioTrack = localStream.getAudioTracks()[0];
                    if (audioTrack) {{
                        audioTrack.enabled = !audioTrack.enabled;
                        const micBtn = document.getElementById('micBtn');
                        if (audioTrack.enabled) {{
                            micBtn.className = 'control-btn active';
                            micBtn.innerHTML = '🎤';
                        }} else {{
                            micBtn.className = 'control-btn muted';
                            micBtn.innerHTML = '🔇';
                        }}
                    }}
                }}
            }}
            
            function toggleCamera() {{
                if (localStream) {{
                    const videoTrack = localStream.getVideoTracks()[0];
                    if (videoTrack) {{
                        videoTrack.enabled = !videoTrack.enabled;
                        const camBtn = document.getElementById('camBtn');
                        if (videoTrack.enabled) {{
                            camBtn.className = 'control-btn active';
                            camBtn.innerHTML = '📹';
                            localNoVideo.style.display = 'none';
                        }} else {{
                            camBtn.className = 'control-btn muted';
                            camBtn.innerHTML = '📷';
                            localNoVideo.style.display = 'flex';
                        }}
                    }}
                }}
            }}
            
            function endCall() {{
                if (confirm('¿Terminar la videollamada?')) {{
                    if (peerConnection) {{
                        peerConnection.close();
                    }}
                    if (localStream) {{
                        localStream.getTracks().forEach(track => track.stop());
                    }}
                    if (websocket) {{
                        websocket.close();
                    }}
                    window.close();
                }}
            }}
            
            function startTimer() {{
                setInterval(() => {{
                    const now = new Date();
                    const elapsed = Math.floor((now - sessionStartTime) / 1000);
                    const minutes = Math.floor(elapsed / 60);
                    const seconds = elapsed % 60;
                    document.getElementById('sessionTime').textContent = 
                        `Duración: ${{minutes.toString().padStart(2, '0')}}:${{seconds.toString().padStart(2, '0')}}`;
                }}, 1000);
            }}
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.websocket("/ws/video-call/{room_id}")
async def websocket_video_call(websocket: WebSocket, room_id: str, user_id: str, user_type: str):
    """WebSocket endpoint para señalización WebRTC"""
    await websocket.accept()
    logger.info(f"Usuario {user_id} ({user_type}) conectado a sala {room_id}")
    
    # Añadir conexión a la sala
    if room_id not in active_rooms:
        logger.warning(f"Sala {room_id} no existe")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Sala no encontrada"
        }))
        return
    
    room = active_rooms[room_id]
    user_connections[f"{room_id}_{user_id}"] = websocket
    
    # Asignar socket según tipo de usuario
    if user_type == "doctor":
        room.doctor_socket = websocket
    elif user_type == "patient":
        room.patient_socket = websocket
    
    # Notificar que el usuario se unió
    await websocket.send_text(json.dumps({
        "type": "joined",
        "room_id": room_id,
        "user_type": user_type
    }))
    
    # Si ambos usuarios están conectados, activar la llamada
    if room.doctor_socket and room.patient_socket and not room.is_active:
        room.is_active = True
        room.call_started_at = datetime.now()
        
        # Notificar a ambos que la llamada está activa
        for socket in [room.doctor_socket, room.patient_socket]:
            if socket:
                try:
                    await socket.send_text(json.dumps({
                        "type": "call_active",
                        "message": "Ambos participantes conectados"
                    }))
                except:
                    pass
    
    try:
        while True:
            # Recibir mensajes del cliente
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Reenviar mensaje al otro participante
            target_socket = None
            if user_type == "doctor" and room.patient_socket:
                target_socket = room.patient_socket
            elif user_type == "patient" and room.doctor_socket:
                target_socket = room.doctor_socket
            
            if target_socket:
                try:
                    await target_socket.send_text(data)
                    logger.info(f"Mensaje reenviado de {user_type} en sala {room_id}: {message.get('type', 'unknown')}")
                except:
                    logger.error(f"Error enviando mensaje a {target_socket}")
                    
    except WebSocketDisconnect:
        logger.info(f"Usuario {user_id} ({user_type}) desconectado de sala {room_id}")
        
        # Limpiar conexiones
        user_connections.pop(f"{room_id}_{user_id}", None)
        
        if user_type == "doctor":
            room.doctor_socket = None
        elif user_type == "patient":
            room.patient_socket = None
        
        # Si no hay más usuarios, marcar llamada como terminada
        if not room.doctor_socket and not room.patient_socket and room.is_active:
            room.is_active = False
            room.call_ended_at = datetime.now()
            logger.info(f"Llamada en sala {room_id} terminada")

@app.get("/")
async def root():
    """Página principal del sistema de videollamadas"""
    return {
        "service": "AltaMedica Telemedicine Video Calls",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "create_call": "POST /api/video-calls/create",
            "call_status": "GET /api/video-calls/{room_id}/status",
            "health": "GET /health",
            "video_page": "GET /video-call/{room_id}?user_id={user}&user_type={type}",
            "websocket": "WS /ws/video-call/{room_id}?user_id={user}&user_type={type}"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("AltaMedica Telemedicine Video Call Server starting...")
    print("Server available at: http://localhost:8888")
    print("Health check: http://localhost:8888/health")
    uvicorn.run(app, host="127.0.0.1", port=8888)
import { NextRequest, NextResponse } from 'next/server';
// Usando versión mock temporal hasta que se instale mediasoup
import { MediaSoupServer } from '@/services/webrtc/mediasoup-server-mock';

let mediaSoupServer: MediaSoupServer | null = null;

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'ok',
      message: 'WebRTC Server está funcionando',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en WebRTC API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomId, data } = body;

    switch (action) {
      case 'create-room':
        if (!mediaSoupServer) {
          return NextResponse.json(
            { error: 'Servidor WebRTC no inicializado' },
            { status: 500 }
          );
        }
        
        const roomStats = mediaSoupServer.getRoomStats(roomId);
        return NextResponse.json({
          status: 'ok',
          roomId,
          exists: !!roomStats,
          stats: roomStats
        });

      case 'get-rooms':
        if (!mediaSoupServer) {
          return NextResponse.json(
            { error: 'Servidor WebRTC no inicializado' },
            { status: 500 }
          );
        }
        
        const rooms = mediaSoupServer.getAllRooms();
        return NextResponse.json({
          status: 'ok',
          rooms
        });

      case 'close-room':
        if (!mediaSoupServer) {
          return NextResponse.json(
            { error: 'Servidor WebRTC no inicializado' },
            { status: 500 }
          );
        }
        
        mediaSoupServer.closeRoom(roomId);
        return NextResponse.json({
          status: 'ok',
          message: `Sala ${roomId} cerrada`
        });

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en WebRTC API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para inicializar el servidor MediaSoup
export function initializeMediaSoupServer(server: any) {
  if (!mediaSoupServer) {
    mediaSoupServer = new MediaSoupServer(server);
    console.log('✅ Servidor MediaSoup inicializado');
  }
  return mediaSoupServer;
} 
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data para desarrollo
    const telemedicineSessions = [
      {
        id: 'session-001',
        patientId: '1',
        patientName: 'María González',
        doctorId: 'doc1',
        doctorName: 'Dr. García',
        status: 'waiting',
        scheduledTime: new Date().toISOString(),
        type: 'video'
      },
      {
        id: 'session-002',
        patientId: '2',
        patientName: 'Carlos Rodríguez',
        doctorId: 'doc2',
        doctorName: 'Dr. López',
        status: 'ready',
        scheduledTime: new Date(Date.now() + 300000).toISOString(),
        type: 'video'
      }
    ]

    return NextResponse.json(telemedicineSessions)
  } catch (error) {
    console.error('Error fetching telemedicine sessions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 
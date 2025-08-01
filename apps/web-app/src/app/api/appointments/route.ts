import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data para desarrollo
    const appointments = [
      {
        id: '1',
        patientId: '1',
        patientName: 'María González',
        doctorId: 'doc1',
        doctorName: 'Dr. García',
        date: new Date().toISOString(),
        status: 'scheduled',
        type: 'consultation'
      },
      {
        id: '2',
        patientId: '2',
        patientName: 'Carlos Rodríguez',
        doctorId: 'doc2',
        doctorName: 'Dr. López',
        date: new Date(Date.now() + 86400000).toISOString(),
        status: 'scheduled',
        type: 'follow-up'
      }
    ]

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 
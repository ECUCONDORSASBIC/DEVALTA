import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data para desarrollo
    const patients = [
      {
        id: '1',
        name: 'María González',
        email: 'maria@example.com',
        phone: '+1234567890',
        age: 45,
        status: 'active'
      },
      {
        id: '2',
        name: 'Carlos Rodríguez',
        email: 'carlos@example.com',
        phone: '+1234567891',
        age: 38,
        status: 'active'
      }
    ]

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data para desarrollo
    const marketplaceItems = [
      {
        id: '1',
        name: 'Consulta Médica General',
        description: 'Consulta médica general con especialista',
        price: 50,
        category: 'consultation',
        available: true
      },
      {
        id: '2',
        name: 'Examen de Laboratorio',
        description: 'Paquete básico de análisis de sangre',
        price: 80,
        category: 'laboratory',
        available: true
      }
    ]

    return NextResponse.json(marketplaceItems)
  } catch (error) {
    console.error('Error fetching marketplace items:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 
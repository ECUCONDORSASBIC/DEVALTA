import { NextRequest, NextResponse } from 'next/server'
import { getRateLimitStats } from '@/middleware/rateLimiter'

export async function GET() {
  try {
    const stats = getRateLimitStats()
    
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        rateLimitingActive: true
      },
      message: 'Rate limit stats retrieved successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get rate limit stats'
    }, { status: 500 })
  }
}

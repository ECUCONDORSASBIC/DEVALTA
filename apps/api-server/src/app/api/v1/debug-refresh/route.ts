/**
 * GET/POST /api/v1/debug-refresh  
 * Debug endpoint para diagnosticar problemas con refresh token
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Debug refresh endpoint working",
    timestamp: new Date().toISOString(),
    method: "GET"
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Headers:', Object.fromEntries(request.headers.entries()));
    
    const contentType = request.headers.get('content-type');
    console.log('🔍 Content-Type:', contentType);
    
    let body;
    let bodyText;
    
    try {
      bodyText = await request.text();
      console.log('🔍 Raw body:', bodyText);
      
      body = JSON.parse(bodyText);
      console.log('🔍 Parsed body:', body);
    } catch (parseError: unknown) {
      console.error('🔥 JSON Parse Error:', parseError);
      return NextResponse.json({
        success: false,
        error: "JSON parse error",
        details: parseError instanceof Error ? (parseError as any).message : 'Unknown parse error',
        rawBody: bodyText
      }, { status: 400 });
    }

    const { refreshToken } = body;
    console.log('🔍 Refresh token received:', refreshToken);

    return NextResponse.json({
      success: true,
      data: {
        receivedToken: refreshToken,
        tokenLength: refreshToken?.length || 0,
        timestamp: new Date().toISOString(),
        method: "POST"
      }
    });
  } catch (error: unknown) {
    console.error('🔥 Debug refresh error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint error',
      details: error instanceof Error ? (error as any).message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

// Empty endpoint to handle missing internal files and prevent 404s
export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // Handle Chrome DevTools JSON requests specifically
  if (url.pathname.includes('com.chrome.devtools.json')) {
    return NextResponse.json({}, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=31536000',
        'Content-Type': 'application/json',
      }
    });
  }
  
  // Handle other requests with empty response
  return new NextResponse(null, { 
    status: 204,
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    }
  });
}

export async function POST() {
  return new NextResponse(null, { status: 204 });
}

export async function PUT() {
  return new NextResponse(null, { status: 204 });
}

export async function DELETE() {
  return new NextResponse(null, { status: 204 });
}
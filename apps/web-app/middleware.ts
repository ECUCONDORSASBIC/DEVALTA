// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const proto = request.headers.get('x-forwarded-proto');
  if (proto && proto !== 'https') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: '/:path*' };
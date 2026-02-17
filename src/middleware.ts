// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add team ID from user context (in production, extract from JWT/session)
  const teamId = request.headers.get('x-team-id);
  
  if (teamId) {
    response.headers.set('x-team-id', teamId);
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};

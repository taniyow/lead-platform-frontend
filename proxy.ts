import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'token';

// Optimistic cookie-presence check only: real session verification happens in
// requireSession() (server-side /api/auth/me call) and in the Express auth middleware.
export function proxy(request: NextRequest) {
  const hasToken = request.cookies.get(AUTH_COOKIE) !== undefined;
  const { pathname } = request.nextUrl;

  if (pathname === '/login') {
    return hasToken
      ? NextResponse.redirect(new URL('/dashboard', request.nextUrl))
      : NextResponse.next();
  }

  return hasToken
    ? NextResponse.next()
    : NextResponse.redirect(new URL('/login', request.nextUrl));
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/brokers/:path*',
    '/form/:path*',
    '/distribution/:path*',
    '/leads/:path*',
  ],
};
